'use client'

import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StatefulButton } from '@/components/ui/StatefulButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LocationSelector from '@/components/ui/LocationSelector'
import { Loader2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StyledPhoneInput } from '@/components/ui/phone-input'
import { Switch } from "@/components/ui/switch"

// Country mapping helper
const countryNameToCode: Record<string, string> = {
    'United States': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    'Pakistan': 'PK',
}

const countryCodeToName: Record<string, string> = {
    'US': 'United States',
    'CA': 'Canada',
    'GB': 'United Kingdom',
    'PK': 'Pakistan',
}

// Form data type
export interface BillingAddressFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    address1: string
    city: string
    state: string
    postalCode: string
    country: string
    isBusiness?: boolean
}

interface BillingAddressFormProps {
    initialData?: Partial<BillingAddressFormData>
    onSave: (data: BillingAddressFormData) => Promise<void>
    isLoading?: boolean
    mode?: 'profile' | 'checkout'
    showTitle?: boolean
    title?: string
    submitButtonText?: string
    showDiscardButton?: boolean
    onDiscard?: () => void
    isExternalDirty?: boolean
    excludeFields?: (keyof BillingAddressFormData)[]
    savedAddresses?: any[] // Accepts Address[] from Prisma
}

export default function BillingAddressForm({
    initialData,
    onSave,
    isLoading = false,
    mode = 'profile',
    showTitle = true,
    title = 'Billing Information',
    submitButtonText = 'Save Changes',
    showDiscardButton = true,
    onDiscard,
    isExternalDirty = false,
    excludeFields = [],
    savedAddresses = [],
}: BillingAddressFormProps) {
    // Store baseline values for manual dirty comparison
    const storedInitialValuesRef = useRef<BillingAddressFormData | null>(null)

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        control,
        formState: { isSubmitting },
    } = useForm<BillingAddressFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            address1: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'United States',
            isBusiness: false,
        },
    })

    const currentValues = watch()

    // Initialize/Reset baseline values
    useEffect(() => {
        if (initialData && !storedInitialValuesRef.current) {
            const hasData = initialData.firstName || initialData.lastName || initialData.address1
            if (hasData) {
                const initialValues: BillingAddressFormData = {
                    firstName: initialData.firstName || '',
                    lastName: initialData.lastName || '',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                    address1: initialData.address1 || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    postalCode: initialData.postalCode || '',
                    country: initialData.country && initialData.country.length === 2
                        ? (countryCodeToName[initialData.country] || initialData.country)
                        : (initialData.country || 'United States'),
                    isBusiness: initialData.isBusiness || false,
                }
                storedInitialValuesRef.current = initialValues
                reset(initialValues)
            }
        }
    }, [initialData, reset])

    const watchedState = watch('state')
    const watchedCountry = watch('country')

    const onSubmit = async (data: BillingAddressFormData) => {
        // Validate postal code based on country (US-focused)
        const cleanPostalCode = data.postalCode.replace(/[^0-9]/g, '')
        const countryCode = countryNameToCode[data.country] || data.country

        // US ZIP validation (5 or 9 digits)
        if (countryCode === 'US' && cleanPostalCode.length !== 5 && cleanPostalCode.length !== 9) {
            toast.error(`ZIP code must be 5 digits (or 9 for ZIP+4). You entered ${cleanPostalCode.length} digits.`)
            return
        }

        // Pakistan validation
        if (countryCode === 'PK' && cleanPostalCode.length !== 5) {
            toast.error(`Postal code must be exactly 5 digits. You entered ${cleanPostalCode.length} digits.`)
            return
        }

        // Map country name to code before saving
        const dataToSave = {
            ...data,
            country: countryCode
        }
        try {
            await onSave(dataToSave)
            storedInitialValuesRef.current = { ...data }
        } catch (err) {
            console.error('Save error:', err)
        }
    }

    const handleDiscard = () => {
        if (storedInitialValuesRef.current) {
            reset(storedInitialValuesRef.current)
        } else {
            reset()
        }
        onDiscard?.()
    }

    const handleSavedAddressSelect = (addressId: string) => {
        if (addressId === "new") {
            reset({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                address1: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'United States',
            })
            return;
        }

        const selected = savedAddresses?.find(a => a.id === addressId);
        if (selected) {
            // Mapping UserAddress to form data
            // Note: UserAddress doesn't have names/email/phone usually, but let's see what we can do.
            // If the user profile has data, we might want to blend it, but here we just map what we have.
            // The prompt said: "Auto-Fill the First Name, Last Name, Phone, Zip, City, and Street fields."
            // But UserAddress schema only has address parts.
            // We will assume the parent passed in ENRICHED addresses or we just map what matches.

            setValue('address1', selected.address1 || '');
            setValue('city', selected.city || '');
            setValue('state', selected.state || '');
            setValue('postalCode', selected.postalCode || '');

            // Map country code to name if needed
            const countryName = selected.country?.length === 2 ? countryCodeToName[selected.country] : selected.country;
            setValue('country', countryName || 'United States');

            // Force dirty state
            // We intentionally do not set names/phone if they aren't in the object, keeping user input or default
        }
    }

    // Validation
    const isFirstNameValid = excludeFields.includes('firstName') || Boolean(currentValues.firstName)
    const isLastNameValid = excludeFields.includes('lastName') || Boolean(currentValues.lastName)
    const isEmailValid = excludeFields.includes('email') || Boolean(currentValues.email)
    const isAddressValid = excludeFields.includes('address1') || Boolean(currentValues.address1)
    const isCityValid = excludeFields.includes('city') || Boolean(currentValues.city)
    const isStateValid = excludeFields.includes('state') || Boolean(currentValues.state)
    const isZipValid = excludeFields.includes('postalCode') || Boolean(currentValues.postalCode)
    const isCountryValid = excludeFields.includes('country') || Boolean(currentValues.country)

    const isFormValid = Boolean(
        isFirstNameValid && isLastNameValid && isEmailValid && isAddressValid &&
        isCityValid && isStateValid && isZipValid && isCountryValid
    )

    const isFormDirty = (() => {
        if (isExternalDirty) return true
        const stored = storedInitialValuesRef.current
        if (!stored) return Boolean(currentValues.address1 || currentValues.city) // Treat as dirty if new entry has data

        return Object.keys(currentValues).some(key => {
            const field = key as keyof BillingAddressFormData
            if (excludeFields.includes(field)) return false
            const currentVal = (currentValues[field] || '').toString().trim()
            const storedVal = (stored[field] || '').toString().trim()
            return currentVal !== storedVal
        })
    })()

    const isDisabled = isLoading || isSubmitting

    return (
        <div className="w-full">
            {showTitle && <h2 className="mb-4 text-lg font-semibold text-gray-900 md:mb-6 md:text-xl">{title}</h2>}





            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {!excludeFields.includes('firstName') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">First Name <span className="text-red-500">*</span></Label>
                            <Input placeholder="First Name" {...register('firstName')} disabled={isDisabled} className="h-11 rounded-xl" />
                        </div>
                    )}
                    {!excludeFields.includes('lastName') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Last Name <span className="text-red-500">*</span></Label>
                            <Input placeholder="Last Name" {...register('lastName')} disabled={isDisabled} className="h-11 rounded-xl" />
                        </div>
                    )}
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {!excludeFields.includes('email') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Email <span className="text-red-500">*</span></Label>
                            <Input type="email" placeholder="Email" {...register('email')} disabled={isDisabled} className="h-11 rounded-xl" />
                        </div>
                    )}
                    {!excludeFields.includes('phone') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Phone</Label>
                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <StyledPhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isDisabled}
                                    />
                                )}
                            />
                        </div>
                    )}
                </div>



                {/* Business Address Toggle */}
                {!excludeFields.includes('isBusiness') && (
                    <div className="flex items-center justify-between space-x-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <Label htmlFor="isBusiness" className="flex flex-col space-y-1 cursor-pointer">
                            <span className="text-sm font-medium text-gray-900">Business Address</span>
                            <span className="text-xs text-gray-500">Set this as your primary business address</span>
                        </Label>
                        <Controller
                            control={control}
                            name="isBusiness"
                            render={({ field }) => (
                                <Switch
                                    id="isBusiness"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isDisabled}
                                    className="data-[state=checked]:bg-[#E87A3F] data-[state=checked]:border-[#E87A3F]"
                                />
                            )}
                        />
                    </div>
                )}

                {!excludeFields.includes('address1') && (
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Street Address <span className="text-red-500">*</span></Label>
                        <Input placeholder="Street Address" {...register('address1')} disabled={isDisabled} className="h-11 rounded-xl" />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Country - Read Only */}
                    {!excludeFields.includes('country') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Country</Label>
                            <Input value="United States" disabled className="h-11 rounded-xl bg-gray-50" />
                        </div>
                    )}

                    {!excludeFields.includes('state') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">State <span className="text-red-500">*</span></Label>
                            <LocationSelector type="state" value={watchedState} onChange={(val) => { setValue('state', val, { shouldDirty: true }); setValue('city', '', { shouldDirty: true }); }} disabled={isDisabled} showCurrentLocation={true} />
                        </div>
                    )}
                    {!excludeFields.includes('city') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">City <span className="text-red-500">*</span></Label>
                            <LocationSelector type="city" value={currentValues.city} onChange={(val) => setValue('city', val, { shouldDirty: true })} disabled={isDisabled || !watchedState} selectedState={watchedState} />
                        </div>
                    )}
                    {!excludeFields.includes('postalCode') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Zip Code <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="Zip"
                                {...register('postalCode')}
                                disabled={isDisabled}
                                className="h-11 rounded-xl"
                                inputMode="numeric"
                                pattern="[0-9]*"
                            />
                        </div>
                    )}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                    {showDiscardButton && (
                        <Button type="button" variant="outline" onClick={handleDiscard} disabled={isDisabled} className="h-12 w-full sm:w-[150px] rounded-xl">Discard</Button>
                    )}
                    <StatefulButton
                        type="submit"
                        disabled={!isFormValid || isDisabled || !isFormDirty}
                        isLoading={isSubmitting}
                        loadingText="Saving..."
                        className={`h-12 w-full sm:w-[200px] rounded-xl text-white transition-all ${(!isFormValid || isDisabled || !isFormDirty) ? 'bg-gray-300' : 'bg-[#E87A3F] hover:bg-[#d96d34]'
                            }`}
                    >
                        {submitButtonText}
                    </StatefulButton>
                </div>
            </form>
        </div>
    )
}



