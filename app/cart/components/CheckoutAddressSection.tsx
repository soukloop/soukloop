'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import BillingAddressForm, { BillingAddressFormData } from '@/components/forms/BillingAddressForm'
import { useProfile } from '@/hooks/useProfile'

interface CheckoutAddressSectionProps {
    onAddressReady?: (data: BillingAddressFormData) => void
}

export default function CheckoutAddressSection({ onAddressReady }: CheckoutAddressSectionProps) {
    const {
        profile,
        profileLoading,
        profileError,
        updateProfile,
        addresses,
        addressesLoading,
        createAddress,
        updateAddress,
        defaultShippingAddress,
        userEmail,
        isAuthenticated,
    } = useProfile()

    const [initialFormData, setInitialFormData] = useState<Partial<BillingAddressFormData> | undefined>(undefined)

    // Populate form with existing data
    useEffect(() => {
        if (profile || defaultShippingAddress) {
            const data = {
                firstName: profile?.firstName || defaultShippingAddress?.firstName || '',
                lastName: profile?.lastName || defaultShippingAddress?.lastName || '',
                email: userEmail || '',
                phone: profile?.phone || defaultShippingAddress?.phone || '',
                company: defaultShippingAddress?.company || '',
                address1: defaultShippingAddress?.address1 || '',
                city: defaultShippingAddress?.city || '',
                state: defaultShippingAddress?.state || '',
                postalCode: defaultShippingAddress?.postalCode || '',
                country: defaultShippingAddress?.country || 'United States',
            }
            setInitialFormData(data)

            // If address is already complete, notify parent
            if (data.firstName && data.lastName && data.address1 && data.city && data.state && data.postalCode) {
                onAddressReady?.(data as BillingAddressFormData)
            }
        }
    }, [profile, defaultShippingAddress, userEmail, onAddressReady])

    // Handle save
    const handleSave = async (data: BillingAddressFormData) => {
        // 1. Update profile (firstName, lastName, phone)
        await updateProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
        })

        // 2. Create or update shipping address
        const addressData = {
            type: 'shipping' as const,
            firstName: data.firstName,
            lastName: data.lastName,
            company: data.company,
            address1: data.address1,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
            isDefault: true,
        }

        if (defaultShippingAddress) {
            await updateAddress(defaultShippingAddress.id, addressData)
        } else {
            await createAddress(addressData)
        }

        // Notify parent that address is ready
        onAddressReady?.(data)
    }

    // Loading state
    if (profileLoading || addressesLoading) {
        return (
            <div className="rounded-lg bg-white p-6">
                <div className="flex h-[300px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
                        <p className="text-gray-600">Loading shipping information...</p>
                    </div>
                </div>
            </div>
        )
    }

    // Error state
    if (profileError || !isAuthenticated) {
        return (
            <div className="rounded-lg bg-white p-6">
                <div className="flex h-[200px] items-center justify-center">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <AlertCircle className="size-8 text-red-500" />
                        <div>
                            <p className="font-semibold text-gray-900">
                                {!isAuthenticated ? 'Please sign in to checkout' : 'Failed to load shipping information'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {profileError?.message || 'Please try again'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="rounded-lg bg-white p-6">
            <BillingAddressForm
                initialData={initialFormData}
                onSave={handleSave}
                isLoading={profileLoading || addressesLoading}
                mode="checkout"
                showTitle={true}
                title="Shipping Information"
                submitButtonText="Save & Continue"
                showDiscardButton={false}
            />
        </div>
    )
}
