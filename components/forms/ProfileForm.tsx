'use client'

import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { StatefulButton } from '@/components/ui/StatefulButton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import LocationSelector from '@/components/ui/LocationSelector'
import { Loader2 } from 'lucide-react'
import { statesAndCities } from '@/lib/constants'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StyledPhoneInput } from '@/components/ui/phone-input'
import { toast } from 'sonner'
import { ZipInput } from '@/components/ui/ZipInput'

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
export interface ProfileFormData {
    firstName: string
    lastName: string
    email: string
    phone: string
    company?: string
    address1: string
    city: string
    state: string
    postalCode: string
    country: string
}

interface ProfileFormProps {
    initialData?: Partial<ProfileFormData>
    onSave: (data: ProfileFormData) => Promise<void>
    isLoading?: boolean
    mode?: 'profile' | 'checkout'
    showTitle?: boolean
    title?: string
    submitButtonText?: string
    showDiscardButton?: boolean
    onDiscard?: () => void
    isExternalDirty?: boolean
    excludeFields?: (keyof ProfileFormData)[]
    savedAddresses?: any[] // Accepts Address[] from Prisma
}

export default function ProfileForm({
    initialData,
    onSave,
    isLoading = false,
    mode = 'profile',
    showTitle = true,
    title = 'Profile Information',
    submitButtonText = 'Save Changes',
    showDiscardButton = true,
    onDiscard,
    isExternalDirty = false,
    excludeFields = [],
    savedAddresses = [],
}: ProfileFormProps) {
    // Store baseline values for manual dirty comparison
    const storedInitialValuesRef = useRef<ProfileFormData | null>(null)

    // React Hook Form setup
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        control,
        formState: { isSubmitting },
    } = useForm<ProfileFormData>({
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            company: '',
            address1: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'United States',
        },
    })

    const currentValues = watch()

    // Initialize/Reset baseline values
    useEffect(() => {
        if (initialData && !storedInitialValuesRef.current) {
            const hasData = initialData.firstName || initialData.lastName || initialData.address1
            if (hasData) {
                const initialValues: ProfileFormData = {
                    firstName: initialData.firstName || '',
                    lastName: initialData.lastName || '',
                    email: initialData.email || '',
                    phone: initialData.phone || '',
                    company: initialData.company || '',
                    address1: initialData.address1 || '',
                    city: initialData.city || '',
                    state: initialData.state || '',
                    postalCode: initialData.postalCode || '',
                    country: initialData.country && initialData.country.length === 2
                        ? (countryCodeToName[initialData.country] || initialData.country)
                        : (initialData.country || 'United States'),
                }
                storedInitialValuesRef.current = initialValues
                reset(initialValues)
            }
        }
    }, [initialData, reset])

    const watchedState = watch('state')
    const watchedCountry = watch('country')

    const onSubmit = async (data: ProfileFormData) => {
        // Validate postal code (US-focused: 5 or 9 digits)
        if (!excludeFields.includes('postalCode') && data.postalCode) {
            const cleanZip = data.postalCode.replace(/[^0-9]/g, '')
            if (cleanZip.length !== 5 && cleanZip.length !== 9) {
                toast.error(`ZIP code must be 5 digits (or 9 for ZIP+4). You entered ${cleanZip.length} digits.`)
                return
            }
        }

        // Map country name to code before saving
        const dataToSave = {
            ...data,
            country: countryNameToCode[data.country] || data.country
        }
        try {
            await onSave(dataToSave)
            storedInitialValuesRef.current = { ...data }
        } catch (err) {
            console.error('Save error:', err)
            toast.error(err instanceof Error ? err.message : 'Failed to save')
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
                company: '',
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

    // Validation - only validate fields that are NOT excluded
    const isFirstNameValid = excludeFields.includes('firstName') || Boolean(currentValues.firstName)
    const isLastNameValid = excludeFields.includes('lastName') || Boolean(currentValues.lastName)
    const isEmailValid = excludeFields.includes('email') || Boolean(currentValues.email)
    const isPhoneValid = excludeFields.includes('phone') || true // Phone is optional
    const isAddressValid = excludeFields.includes('address1') || Boolean(currentValues.address1)
    const isCityValid = excludeFields.includes('city') || Boolean(currentValues.city)
    const isStateValid = excludeFields.includes('state') || Boolean(currentValues.state)
    const isZipValid = excludeFields.includes('postalCode') || (
        Boolean(currentValues.postalCode) &&
        (() => {
            const clean = currentValues.postalCode.replace(/[^0-9]/g, '');
            return clean.length === 5 || clean.length === 9;
        })()
    )
    const isCountryValid = excludeFields.includes('country') || Boolean(currentValues.country)

    // Form is valid if all NON-EXCLUDED required fields are filled
    const isFormValid = Boolean(
        isFirstNameValid && isLastNameValid && isEmailValid && isPhoneValid &&
        isAddressValid && isCityValid && isStateValid && isZipValid && isCountryValid
    )

    const isFormDirty = (() => {
        if (isExternalDirty) return true
        const stored = storedInitialValuesRef.current
        // If no initial data, check if any non-excluded field has data
        if (!stored) {
            return Object.keys(currentValues).some(key => {
                const field = key as keyof ProfileFormData
                if (excludeFields.includes(field)) return false
                return Boolean(currentValues[field])
            })
        }

        return Object.keys(currentValues).some(key => {
            const field = key as keyof ProfileFormData
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
                            <Input
                                type="email"
                                placeholder="Email"
                                {...register('email')}
                                disabled={true}
                                className="h-11 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            />
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

                {/* Company (Optional) */}
                {!excludeFields.includes('company') && (
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Company (Optional)</Label>
                        <Input placeholder="Company" {...register('company')} disabled={isDisabled} className="h-11 rounded-xl" />
                    </div>
                )}

                {!excludeFields.includes('address1') && (
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-gray-700">Street Address <span className="text-red-500">*</span></Label>
                        <Input placeholder="Street Address" {...register('address1')} disabled={isDisabled} className="h-11 rounded-xl" />
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {!excludeFields.includes('country') && (
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-gray-700">Country <span className="text-red-500">*</span></Label>
                            <Select
                                value={watchedCountry}
                                onValueChange={(val) => setValue('country', val, { shouldDirty: true })}
                                disabled={isDisabled}
                            >
                                <SelectTrigger className="h-11 rounded-xl">
                                    <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(countryNameToCode).map((country) => (
                                        <SelectItem key={country} value={country}>
                                            {country}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        <ZipInput
                            label="Zip Code"
                            required
                            placeholder="Zip"
                            {...register('postalCode')}
                            disabled={isDisabled}
                            containerClassName="lg:col-span-1"
                        />
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

