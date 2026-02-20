'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'

// Types
export interface UserProfile {
    id: string
    userId: string
    firstName: string | null
    lastName: string | null
    phone: string | null
    bio: string | null
    avatar: string | null
    createdAt: string
    updatedAt: string
    user: {
        id: string
        email: string
        name: string | null
        image: string | null
        role: string
        rewardBalance?: {
            currentBalance: number
        } | null
        createdAt: string
    }
}

export interface Address {
    id: string
    userId: string
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
    isSellerAddress?: boolean
    isShipping?: boolean
    isBilling?: boolean
    createdAt: string
    updatedAt: string
    // User profile for name/phone
    user?: {
        name?: string | null
        email: string
        profile?: {
            firstName?: string | null
            lastName?: string | null
            phone?: string | null
        } | null
    }
}

export interface ProfileUpdateData {
    firstName?: string
    lastName?: string
    phone?: string
    bio?: string
    avatar?: string
}

export interface AddressCreateData {
    address1: string
    address2?: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault?: boolean
    isSellerAddress?: boolean
    isShipping?: boolean
    isBilling?: boolean
}

// Fetcher
const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to fetch')
    }
    return res.json()
}

// Main hook
export function useProfile(userId?: string) {
    const { data: session, status } = useSession()
    // If userId is provided, we assume the caller has permission (admin) to view it.
    // Otherwise, we check if the user is authenticated.
    const isAuthenticated = !!userId || status === 'authenticated'

    // Construct the correct API endpoints
    // If userId is present, we use the ADMIN API structure (which we need to create/verify)
    // For now, let's assume we pass userId as query param to existing or new endpoints, or use specific admin routes.
    // Based on plan: "Fetch /api/admin/users/[id]/profile"

    const profileEndpoint = userId
        ? `/api/admin/users/${userId}/profile`
        : (isAuthenticated ? '/api/profile' : null)

    const addressesEndpoint = userId
        ? `/api/admin/users/${userId}/addresses`
        : (isAuthenticated ? '/api/addresses' : null)

    // Fetch profile
    const {
        data: profile,
        error: profileError,
        isLoading: profileLoading,
        mutate: mutateProfile,
    } = useSWR<UserProfile>(
        profileEndpoint,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
            shouldRetryOnError: false,
            onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
                // Never retry on 401/403
                if (error.message.includes('401') || error.message.includes('403')) return
                if (retryCount >= 3) return
                setTimeout(() => revalidate({ retryCount }), 5000)
            }
        }
    )

    // Fetch addresses
    const {
        data: addresses,
        error: addressesError,
        isLoading: addressesLoading,
        mutate: mutateAddresses,
    } = useSWR<Address[]>(
        addressesEndpoint,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 30000,
        }
    )

    // Update profile
    const updateProfile = async (data: ProfileUpdateData): Promise<UserProfile> => {
        const endpoint = userId ? `/api/admin/users/${userId}/profile` : '/api/profile'
        const method = userId ? 'PATCH' : 'PUT' // Admin might use PATCH, user uses PUT. Let's standardize or handle both. 
        // NOTE: The implementation plan says "Use ... endpoint". 
        // Taking a safer bet: use the same method if possible, or adapt. 
        // Existing user API uses PUT for profile. Admin typically uses PATCH. 
        // Let's stick to the endpoint logic.

        const res = await fetch(endpoint, {
            method: method === 'PATCH' ? 'PATCH' : 'PUT', // Assuming admin endpoint supports PATCH
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to update profile')
        }

        const updated = await res.json()
        mutateProfile(updated, false)
        return updated
    }

    // Create address
    const createAddress = async (data: AddressCreateData): Promise<Address> => {
        const endpoint = userId ? `/api/admin/users/${userId}/addresses` : '/api/addresses'

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to create address')
        }

        const created = await res.json()
        mutateAddresses()
        return created
    }

    // Update address
    const updateAddress = async (id: string, data: Partial<AddressCreateData>): Promise<Address> => {
        const endpoint = userId
            ? `/api/admin/users/${userId}/addresses/${id}`
            : `/api/addresses/${id}`

        const res = await fetch(endpoint, {
            method: 'PUT', // Standardizing on PUT/PATCH? Existing is PUT.
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to update address')
        }

        const updated = await res.json()
        mutateAddresses()
        return updated
    }

    // Delete address
    const deleteAddress = async (id: string): Promise<void> => {
        const endpoint = userId
            ? `/api/admin/users/${userId}/addresses/${id}`
            : `/api/addresses/${id}`

        const res = await fetch(endpoint, {
            method: 'DELETE',
        })

        if (!res.ok) {
            const error = await res.json()
            throw new Error(error.error || 'Failed to delete address')
        }

        mutateAddresses()
    }

    // Set seller address (ensures only ONE address has isSellerAddress = true)
    const setSellerAddress = async (id: string): Promise<void> => {
        // Find current seller addresses and remove their flag
        const currentSellerAddresses = addresses?.filter(a => a.isSellerAddress && a.id !== id) || []

        // Remove isSellerAddress from all other addresses first
        for (const addr of currentSellerAddresses) {
            await updateAddress(addr.id, { isSellerAddress: false })
        }

        // Set the selected address as seller address
        await updateAddress(id, { isSellerAddress: true })
    }

    // Get default addresses (using boolean flags)
    const defaultShippingAddress = addresses?.find(a => a.isShipping && a.isDefault) || addresses?.find(a => a.isShipping)
    const defaultBillingAddress = addresses?.find(a => a.isBilling && a.isDefault) || addresses?.find(a => a.isBilling)
    const sellerAddress = addresses?.find(a => a.isSellerAddress)

    return {
        // Profile
        profile,
        profileLoading,
        profileError,
        updateProfile,
        mutateProfile,

        // Addresses
        addresses: addresses || [],
        addressesLoading,
        addressesError,
        createAddress,
        updateAddress,
        deleteAddress,
        mutateAddresses,

        // Convenience
        defaultShippingAddress,
        defaultBillingAddress,
        sellerAddress,
        setSellerAddress,
        isAuthenticated,
        isLoading: profileLoading || addressesLoading,

        // User info from session or profile
        userEmail: session?.user?.email || profile?.user?.email || '',
        userName: session?.user?.name || profile?.user?.name || '',
    }
}
