'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import { useSocket } from '@/components/providers/socket-provider'
import { useEffect } from 'react'

// Types matching the UserVerification Prisma model
export interface SellerVerification {
    id: string
    userId: string
    status: 'incomplete' | 'submitted' | 'approved' | 'rejected'
    submittedAt: string | null
    reviewedAt: string | null
    rejectionReason: string | null

    // Identity Documents
    govIdType: string | null
    govIdNumber: string | null
    govIdFrontUrl: string | null
    govIdBackUrl: string | null
    selfieUrl: string | null

    // Address Information
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    state: string | null
    postalCode: string | null
    country: string | null
    addressProofUrl: string | null
    sellerAddressId: string | null

    // Tax Information
    taxIdType: string | null
    taxId: string | null

    createdAt: string
    updatedAt: string
}

// Fetcher
const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        if (res.status === 404) {
            return null // No verification record exists
        }
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch verification')
    }
    return res.json()
}

/**
 * Custom hook for seller verification status
 * Follows the same pattern as useProfile
 */
export function useSellerVerification() {
    const { status } = useSession()
    const isAuthenticated = status === 'authenticated'

    // Fetch verification status
    const {
        data: verification,
        error,
        isLoading,
        mutate,
    } = useSWR<SellerVerification | null>(
        isAuthenticated ? '/api/user/verification' : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        }
    )

    // Real-time updates
    const { subscribe, isConnected } = useSocket()
    const { data: sessionData, update } = useSession()

    useEffect(() => {
        if (!isConnected || !sessionData?.user?.id) return

        const channel = `personal:${sessionData.user.id}`

        const unsubscribe = subscribe(channel, (ctx) => {
            // Check for relevant event types
            const type = ctx.data?.type || ctx.data?.data?.type

            // events: VERIFICATION_APPROVED, VERIFICATION_REJECTED, SELLER_APPROVED, etc.
            if (
                type?.includes('VERIFICATION') ||
                type?.includes('SELLER') ||
                type?.includes('APPROVED') ||
                type?.includes('REJECTED')
            ) {
                console.log('[useSellerVerification] Received update event:', type)
                mutate()

                // Force session update to reflect new role (e.g. USER -> SELLER)
                if (type?.includes('APPROVED') || type?.includes('SELLER')) {
                    console.log('[useSellerVerification] Forcing session update for role change')
                    update()
                }
            }
        })

        return () => unsubscribe()
    }, [isConnected, sessionData?.user?.id, subscribe, mutate, update])

    // Start a new application
    const startApplication = async (): Promise<{ verificationId: string; status: string }> => {
        const res = await fetch('/api/seller/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to start application')
        }

        const result = await res.json()
        mutate() // Refresh the verification data
        return result
    }

    // Upload a document
    const uploadDocument = async (file: File, fileType: string): Promise<string> => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('fileType', fileType)

        const res = await fetch('/api/seller/upload', {
            method: 'POST',
            body: formData,
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to upload document')
        }

        const result = await res.json()
        return result.fileUrl
    }

    // Save identity information
    const saveIdentity = async (data: {
        govIdType: string
        govIdNumber: string
        govIdFrontUrl: string
        govIdBackUrl: string
        selfieUrl: string
    }): Promise<void> => {
        const res = await fetch('/api/seller/onboarding/identity', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to save identity')
        }

        mutate() // Refresh
    }

    // Save address information
    const saveAddress = async (data: {
        addressLine1: string
        addressLine2?: string
        city: string
        state: string
        postalCode: string
        country: string
        addressProofUrl: string
    }): Promise<void> => {
        const res = await fetch('/api/seller/onboarding/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to save address')
        }

        mutate() // Refresh
    }

    // Submit application for review
    const submitApplication = async (): Promise<void> => {
        const res = await fetch('/api/seller/onboarding/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to submit application')
        }

        mutate() // Refresh
    }

    // Computed properties
    const hasApplication = !!verification
    const isApproved = verification?.status === 'approved'
    const isSubmitted = verification?.status === 'submitted'
    const isRejected = verification?.status === 'rejected'
    const isIncomplete = verification?.status === 'incomplete' || !verification

    return {
        // Verification data
        verification,
        isLoading,
        error,
        mutate,

        // Status checks
        hasApplication,
        isApproved,
        isSubmitted,
        isRejected,
        isIncomplete,

        // Actions
        startApplication,
        uploadDocument,
        saveIdentity,
        saveAddress,
        submitApplication,

        // Auth state
        isAuthenticated,
    }
}
