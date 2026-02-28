'use client'

import React, { useEffect, useState, useRef } from 'react'
import { Edit, Loader2, AlertCircle } from 'lucide-react'
import ProfileForm, { ProfileFormData } from '@/components/forms/ProfileForm'
import { useProfile } from '@/hooks/useProfile'
import SellerApplicationSection from './SellerApplicationSection'
import { toast } from 'sonner'

export default function EditProfileSection({ userId, hideSections }: { userId?: string, hideSections?: boolean }) {
    const {
        profile,
        profileLoading,
        profileError,
        updateProfile,
        addresses,
        addressesLoading,
        createAddress,
        updateAddress,
        defaultBillingAddress,
        userEmail,
        isAuthenticated,
    } = useProfile(userId)

    const [initialFormData, setInitialFormData] = useState<Partial<ProfileFormData> | undefined>(undefined)
    const [isUploading, setIsUploading] = useState(false)
    const [stagedAvatar, setStagedAvatar] = useState<string | null>(null)
    const [isImageDirty, setIsImageDirty] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Populate form with existing data
    useEffect(() => {
        if (profile || defaultBillingAddress) {
            setInitialFormData({
                firstName: profile?.firstName || '',
                lastName: profile?.lastName || '',
                email: userEmail || '',
                phone: profile?.phone || '',
                company: '', // Address type doesn't have company apparently
                address1: defaultBillingAddress?.address1 || '',
                city: defaultBillingAddress?.city || '',
                state: defaultBillingAddress?.state || '',
                postalCode: defaultBillingAddress?.postalCode || '',
                country: defaultBillingAddress?.country || 'United States',
            })
            if (profile?.avatar && !isImageDirty) {
                setStagedAvatar(profile.avatar)
            }
        }
    }, [profile, defaultBillingAddress, userEmail])

    // Handle image upload
    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                throw new Error('Image size should be less than 5MB')
            }

            // Upload to API
            const formData = new FormData()
            // We use the api/upload endpoint which expects x-filename and content-type headers for streaming
            // Actually, the api/upload/route.ts expects headers:
            // x-filename, content-type

            const res = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'x-filename': file.name,
                    'content-type': file.type,
                },
                body: file // Direct stream
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.error || 'Failed to upload image')
            }

            const result = await res.json()
            setStagedAvatar(result.url)
            setIsImageDirty(true)
            setIsUploading(false)
        } catch (err) {
            console.error('Upload error:', err)
            setIsUploading(false)
            toast.error(err instanceof Error ? err.message : 'Failed to upload image')
        }
    }

    // Handle save
    const handleSave = async (data: ProfileFormData) => {
        // 1. Update profile (firstName, lastName, phone, avatar)
        await updateProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            avatar: stagedAvatar || undefined
        })
        setIsImageDirty(false)

        // Address updates should now be handled in AddressBookSection
    }

    // Loading state
    if (profileLoading || addressesLoading) {
        return (
            <div className="flex justify-center px-4 sm:px-6">
                <div className="h-auto w-full max-w-6xl rounded-lg bg-white p-4 shadow-sm md:min-h-[400px]">
                    <div className="mb-6 flex justify-center md:mb-8">
                        <div className="size-24 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
                            <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
                        </div>
                        <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
                        <div className="h-12 w-full rounded-xl bg-slate-100 animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (profileError || !isAuthenticated) {
        return (
            <div className="flex justify-center px-4 sm:px-6">
                <div className="flex h-[400px] w-full max-w-6xl items-center justify-center rounded-lg bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <AlertCircle className="size-10 text-red-500" />
                        <div>
                            <p className="font-semibold text-gray-900">
                                {!isAuthenticated ? 'Please sign in to edit your profile' : 'Failed to load profile'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {profileError?.message || 'Please try again later'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* Profile Image */}
            <div className="mb-6 flex justify-center md:mb-8">
                <div className="relative">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/jpeg, image/png, image/webp"
                        className="hidden"
                    />
                    <div className="md:w-30 md:h-30 size-24 overflow-hidden rounded-full border-4 border-white shadow-sm ring-2 ring-[#F5F1ED] bg-gray-50 flex items-center justify-center">
                        {isUploading ? (
                            <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
                        ) : (
                            <img
                                src={stagedAvatar || '/profile-image.png'}
                                alt="Profile"
                                className="size-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = '/profile-image.png'; // Fallback
                                }}
                            />
                        )}
                    </div>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-[#E87A3F] text-white transition-all hover:scale-110 hover:bg-[#d96d34] disabled:opacity-50 md:size-8"
                    >
                        <Edit className="size-3 md:size-4" />
                    </button>
                </div>
            </div>

            {/* Billing Address Form + Seller Section Wrapper */}
            <div className="flex justify-center px-4 sm:px-6">
                <div className="h-auto w-full max-w-6xl rounded-lg bg-white p-4 shadow-sm md:min-h-[400px] md:p-6 lg:p-8">
                    <ProfileForm
                        initialData={initialFormData}
                        onSave={handleSave}
                        isLoading={profileLoading || addressesLoading || isUploading}
                        isExternalDirty={isImageDirty}
                        mode="profile"
                        showTitle={true}
                        title="Edit Profile"
                        submitButtonText="Save Changes"
                        showDiscardButton={true}
                        // Explicitly exclude address fields as we have a dedicated Address Book tab
                        excludeFields={['address1', 'city', 'state', 'postalCode', 'country', 'company']}
                    />



                    {/* Seller Onboarding Section */}
                    {!hideSections && (
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <SellerApplicationSection />
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
