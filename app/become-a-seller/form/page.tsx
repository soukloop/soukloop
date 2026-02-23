'use client'

import { useState, useEffect, useRef, useMemo, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    Upload,
    CheckCircle2,
    AlertCircle,
    Loader2,
    ChevronDown,
    MapPin,
    Plus,
    Check,
    User,
    Edit2
} from 'lucide-react'
import { useSellerVerification } from '@/hooks/useSellerVerification'
import { useProfile } from '@/hooks/useProfile'
import { toast } from 'sonner'
import { statesAndCities, usStates } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import EcommerceHeader from '@/components/ecommerce-header'
import FooterSection from '@/components/footer-section'
import BillingAddressForm from '@/components/forms/BillingAddressForm'
import { useSession } from 'next-auth/react'
import ApplicationStatusBox from '@/components/seller/ApplicationStatusBox'
import { StyledPhoneInput } from '@/components/ui/phone-input'
import { useSellerFormPersistence, SellerFormData } from '@/hooks/useSellerFormPersistence'

type OnboardingStep = 'identity' | 'address' | 'review'

interface SavedAddress {
    id: string
    address1: string
    city: string
    state: string
    postalCode: string
    country: string
    isSellerAddress?: boolean
    isShipping?: boolean
    isBilling?: boolean
    user?: {
        name?: string | null
        profile?: {
            firstName?: string | null
            lastName?: string | null
            phone?: string | null
        } | null
    }
}

interface UploadedFiles {
    govIdFront?: string
    govIdBack?: string
    selfie?: string
    addressProof?: string
}

function OnboardingFormContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { data: session, status } = useSession()

    // Strict Session Check
    useEffect(() => {
        if (status === 'loading') return // Wait for loading

        // 1. Unauthenticated -> Redirect to Sign In
        if (status === 'unauthenticated' || !session) {
            const callbackUrl = encodeURIComponent(window.location.pathname + window.location.search)
            router.push(`/signin?callbackUrl=${callbackUrl}`)
            return
        }

        // 2. Admin Leakage Protection -> Redirect to Admin Dashboard
        // REMOVED: Admins now have synced User accounts and can access this page. 
        // Logic handled by API to serve User Profile even for Admin Session.

        // 3. User Suspension Check (Optional)
        // if ((session?.user as any)?.isActive === false) { ... } 

    }, [session, status, router])

    const {
        verification,
        isLoading: isStatusLoading,
        isApproved,
        isSubmitted,
        isRejected,
        submitApplication: finalSubmit
    } = useSellerVerification()

    const [currentStep, setCurrentStep] = useState<OnboardingStep>('identity')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Form data
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>({})
    const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({})
    const [identityData, setIdentityData] = useState({
        taxIdType: 'SSN',
        taxId: '',
        govIdType: 'DRIVERS_LICENSE',
        govIdNumber: '',
    })
    const [addressData, setAddressData] = useState({
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'US'
    })

    const {
        addresses,
        addressesLoading,
        createAddress,
        setSellerAddress,
        profile,
        updateProfile
    } = useProfile()

    // Local state for profile fields (to prevent glitchy typing from API calls)
    const [profileData, setProfileData] = useState({
        firstName: '',
        lastName: '',
        phone: ''
    })

    // Initialize local profile data from fetched profile
    useEffect(() => {
        if (profile) {
            setProfileData({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                phone: profile.phone || ''
            })
        }
    }, [profile])

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
    const [isAddingNewAddress, setIsAddingNewAddress] = useState(false)
    const [isStateOpen, setIsStateOpen] = useState(false)
    const [isCityOpen, setIsCityOpen] = useState(false)
    const stateRef = useRef<HTMLDivElement>(null)
    const cityRef = useRef<HTMLDivElement>(null)

    const availableCities = useMemo(() => {
        return addressData.state ? statesAndCities[addressData.state] || [] : []
    }, [addressData.state])

    const [isTaxTypeOpen, setIsTaxTypeOpen] = useState(false)
    const [isGovIdTypeOpen, setIsGovIdTypeOpen] = useState(false)
    const taxTypeRef = useRef<HTMLDivElement>(null)
    const govIdTypeRef = useRef<HTMLDivElement>(null)

    // Track if IndexedDB data was loaded (to avoid DB overwriting user's input)
    const [hasLoadedFromIndexedDB, setHasLoadedFromIndexedDB] = useState(false)

    // ========== FORM PERSISTENCE (IndexedDB) ==========
    // Combines all form data for persistence
    const formDataForPersistence: SellerFormData = useMemo(() => ({
        profileData,
        identityData,
        addressData,
        uploadedFiles
    }), [profileData, identityData, addressData, uploadedFiles])

    // Persistence hook - auto-saves to IndexedDB on change
    const { isLoaded: isPersistenceLoaded, clearPersistence } = useSellerFormPersistence(
        session?.user?.id,
        formDataForPersistence,
        currentStep,
        (loadedData, loadedStep) => {
            // Restore form state from IndexedDB
            if (loadedData.profileData) setProfileData(loadedData.profileData)
            if (loadedData.identityData) setIdentityData(loadedData.identityData)
            if (loadedData.addressData) setAddressData(loadedData.addressData)
            if (loadedData.uploadedFiles) setUploadedFiles(loadedData.uploadedFiles)
            if (loadedStep) setCurrentStep(loadedStep as OnboardingStep)
            setHasLoadedFromIndexedDB(true)
            console.log('[SellerForm] Restored form state from IndexedDB')
        }
    )

    // Pre-fill form from DB verification record (ONLY if no IndexedDB data)
    // NOTE: taxId and govIdNumber are ENCRYPTED in DB - don't pre-fill these!
    useEffect(() => {
        if (!isPersistenceLoaded) return // Wait for IndexedDB to load first
        if (hasLoadedFromIndexedDB) return // IndexedDB has priority

        if (verification) {
            // Only pre-fill non-sensitive fields and types
            setIdentityData(prev => ({
                ...prev,
                taxIdType: verification.taxIdType || 'SSN',
                // taxId is ENCRYPTED - don't pre-fill
                govIdType: verification.govIdType || 'DRIVERS_LICENSE',
                // govIdNumber is ENCRYPTED - don't pre-fill
            }))
            setAddressData({
                addressLine1: verification.addressLine1 || '',
                addressLine2: verification.addressLine2 || '',
                city: verification.city || '',
                state: verification.state || '',
                postalCode: verification.postalCode || '',
                country: verification.country || 'US'
            })
            setUploadedFiles({
                govIdFront: verification.govIdFrontUrl || undefined,
                govIdBack: verification.govIdBackUrl || undefined,
                selfie: verification.selfieUrl || undefined,
                addressProof: verification.addressProofUrl || undefined
            })
        }
    }, [verification, isPersistenceLoaded, hasLoadedFromIndexedDB])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (taxTypeRef.current && !taxTypeRef.current.contains(event.target as Node)) setIsTaxTypeOpen(false)
            if (govIdTypeRef.current && !govIdTypeRef.current.contains(event.target as Node)) setIsGovIdTypeOpen(false)
            if (stateRef.current && !stateRef.current.contains(event.target as Node)) setIsStateOpen(false)
            if (cityRef.current && !cityRef.current.contains(event.target as Node)) setIsCityOpen(false)
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Input Formatters
    const formatSSN = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 9)
        if (digits.length >= 6) return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
        if (digits.length >= 4) return `${digits.slice(0, 3)}-${digits.slice(3)}`
        return digits
    }

    const formatEIN = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 9)
        if (digits.length >= 3) return `${digits.slice(0, 2)}-${digits.slice(2)}`
        return digits
    }

    const formatCNIC = (value: string) => {
        const digits = value.replace(/\D/g, '').slice(0, 13)
        if (digits.length >= 13) return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`
        if (digits.length >= 6) return `${digits.slice(0, 5)}-${digits.slice(5)}`
        return digits
    }

    // Gov ID formatters based on type
    const formatDriversLicense = (value: string) => {
        // Format: Letter + digits, max 15 chars (e.g., A1234567)
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15)
    }

    const formatPassport = (value: string) => {
        // Format: 1-2 letters + 6-9 digits (e.g., AB1234567)
        return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11)
    }

    const handleTaxIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        let formatted = val
        if (identityData.taxIdType === 'SSN') formatted = formatSSN(val)
        if (identityData.taxIdType === 'EIN') formatted = formatEIN(val)
        setIdentityData(prev => ({ ...prev, taxId: formatted }))
    }

    const handleGovIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        let formatted = val
        switch (identityData.govIdType) {
            case 'NATIONAL_ID':
                formatted = formatCNIC(val)
                break
            case 'DRIVERS_LICENSE':
                formatted = formatDriversLicense(val)
                break
            case 'PASSPORT':
                formatted = formatPassport(val)
                break
            default:
                formatted = val.toUpperCase().slice(0, 20)
        }
        setIdentityData(prev => ({ ...prev, govIdNumber: formatted }))
    }

    // Get placeholder based on Gov ID type
    const getGovIdPlaceholder = () => {
        switch (identityData.govIdType) {
            case 'DRIVERS_LICENSE': return 'e.g., A1234567'
            case 'PASSPORT': return 'e.g., AB1234567'
            case 'NATIONAL_ID': return 'e.g., 12345-1234567-1'
            default: return 'Enter ID number'
        }
    }

    // Validation helpers
    const getGovIdMinLength = () => {
        switch (identityData.govIdType) {
            case 'DRIVERS_LICENSE': return 5
            case 'PASSPORT': return 6
            case 'NATIONAL_ID': return 13 // CNIC exactly 13 digits
            default: return 5
        }
    }

    const getGovIdMaxLength = () => {
        switch (identityData.govIdType) {
            case 'DRIVERS_LICENSE': return 15
            case 'PASSPORT': return 9
            case 'NATIONAL_ID': return 13 // CNIC exactly 13 digits
            default: return 20
        }
    }

    const getGovIdRequirement = () => {
        switch (identityData.govIdType) {
            case 'DRIVERS_LICENSE': return '5-15 characters'
            case 'PASSPORT': return '6-9 characters'
            case 'NATIONAL_ID': return 'exactly 13 digits (XXXXX-XXXXXXX-X)'
            default: return '5+ characters'
        }
    }

    const getTaxIdRequirement = () => {
        return identityData.taxIdType === 'SSN' ? '9 digits (XXX-XX-XXXX)' : '9 digits (XX-XXXXXXX)'
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: keyof UploadedFiles) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploadingFiles(prev => ({ ...prev, [fileType]: true }))
        setError('')

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('fileType', fileType)

            const res = await fetch('/api/seller/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.error || data?.message || `Upload failed (${res.status})`)
            }
            const data = await res.json()
            setUploadedFiles(prev => ({ ...prev, [fileType]: data.fileUrl }))
        } catch (err: any) {
            console.error('[Upload Error]', err)
            setError(err.message || 'Failed to upload file')
        } finally {
            setUploadingFiles(prev => ({ ...prev, [fileType]: false }))
        }
    }

    const handleSaveIdentity = async () => {
        // Validate profile info
        if (!profileData.firstName || !profileData.lastName || !profileData.phone) {
            setError('Please complete your profile information (first name, last name, and phone)')
            return
        }

        // Validate Tax ID (must have exactly 9 digits for SSN/EIN)
        const cleanTaxId = identityData.taxId.replace(/[^0-9]/g, '')
        if (cleanTaxId.length !== 9) {
            setError(`${identityData.taxIdType} must have ${getTaxIdRequirement()}. You entered ${cleanTaxId.length} digits.`)
            return
        }

        // Validate Gov ID Number based on type
        const cleanGovId = identityData.govIdNumber.replace(/[^A-Z0-9]/gi, '')
        const minLen = getGovIdMinLength()
        const maxLen = getGovIdMaxLength()

        if (cleanGovId.length < minLen || cleanGovId.length > maxLen) {
            setError(`${identityData.govIdType.replace('_', ' ')} must have ${getGovIdRequirement()}. You entered ${cleanGovId.length} characters.`)
            return
        }

        if (!uploadedFiles.govIdFront || !uploadedFiles.govIdBack || !uploadedFiles.selfie) {
            setError('Please upload all required documents')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Save profile first
            await updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                phone: profileData.phone
            })

            // Then save identity
            const res = await fetch('/api/seller/onboarding/identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    govIdType: identityData.govIdType,
                    govIdNumber: identityData.govIdNumber,
                    govIdFrontUrl: uploadedFiles.govIdFront,
                    govIdBackUrl: uploadedFiles.govIdBack,
                    selfieUrl: uploadedFiles.selfie,
                    taxIdType: identityData.taxIdType,
                    taxId: identityData.taxId
                })
            })

            const data = await res.json()
            if (!res.ok) {
                // Show specific field errors from API
                if (data.details?.fieldErrors) {
                    const fieldErrors = data.details.fieldErrors
                    const errorMessages = Object.entries(fieldErrors)
                        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
                        .join('\n')
                    throw new Error(errorMessages || data.error || 'Validation failed')
                }
                throw new Error(data.error || 'Failed to save')
            }
            setCurrentStep('address')
        } catch (err: any) {
            setError(err.message || 'Failed to save identity information')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveAddress = async () => {
        // Client-side validation for address
        if (!addressData.addressLine1 || addressData.addressLine1.length < 5) {
            setError('Please enter a valid street address (at least 5 characters)')
            return
        }
        if (!addressData.city || addressData.city.length < 2) {
            setError('Please enter a valid city name')
            return
        }
        if (!addressData.state || addressData.state.length < 2) {
            setError('Please select a state')
            return
        }
        if (!addressData.postalCode) {
            setError('Please enter a ZIP code')
            return
        }
        // US-focused: ZIP must be 5 or 9 digits
        const cleanZip = addressData.postalCode.replace(/[^0-9]/g, '')
        if (cleanZip.length !== 5 && cleanZip.length !== 9) {
            setError(`ZIP code must be 5 digits (or 9 for ZIP+4). You entered ${cleanZip.length} digits.`)
            return
        }

        setLoading(true)
        setError('')

        const countryCode = addressData.country.length > 2
            ? ({ 'United States': 'US', 'Canada': 'CA', 'United Kingdom': 'GB', 'Pakistan': 'PK' }[addressData.country] || 'US')
            : addressData.country

        try {
            const res = await fetch('/api/seller/onboarding/address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...addressData,
                    country: countryCode
                })
            })

            const data = await res.json()
            if (!res.ok) {
                // Show specific field errors from API
                if (data.details?.fieldErrors) {
                    const fieldErrors = data.details.fieldErrors
                    const errorMessages = Object.entries(fieldErrors)
                        .map(([field, errors]) => `${field}: ${(errors as string[]).join(', ')}`)
                        .join('\n')
                    throw new Error(errorMessages || data.error || 'Validation failed')
                }
                throw new Error(data.error || 'Failed to save')
            }
            setCurrentStep('review')
        } catch (err: any) {
            setError(err.message || 'Failed to save address information')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmitApplication = async () => {
        setLoading(true)
        setError('')
        try {
            await finalSubmit()
            // Clear IndexedDB persistence on successful submit
            await clearPersistence()
            router.push('/editprofile?section=edit-profile&success=onboarding')
        } catch (err: any) {
            setError(err.message || 'Failed to submit application')
        } finally {
            setLoading(false)
        }
    }

    // Prevent Flicker & Strict Session Check
    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
            </div>
        )
    }

    // Redirect unauthenticated users
    if (status === 'unauthenticated' || !session) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
            </div>
        )
    }



    if (isStatusLoading || !isPersistenceLoaded) {
        // Show skeleton that matches the form layout
        return (
            <div className="max-w-3xl mx-auto py-12 px-4">
                {/* Header Skeleton */}
                <div className="mb-8">
                    <div className="h-9 w-64 bg-gray-200 rounded-lg animate-pulse mb-2" />
                    <div className="h-5 w-96 bg-gray-100 rounded animate-pulse" />
                </div>

                {/* Progress Steps Skeleton */}
                <div className="mb-8 flex items-center justify-around rounded-xl border border-gray-100 bg-white p-4">
                    {[1, 2, 3].map((step) => (
                        <div key={step} className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-gray-200 animate-pulse" />
                            <div className="hidden sm:block h-4 w-16 bg-gray-100 rounded animate-pulse" />
                            {step < 3 && <div className="h-px w-8 bg-gray-100" />}
                        </div>
                    ))}
                </div>

                {/* Form Content Skeleton - Step 1 (Identity) */}
                <div className="space-y-6">
                    {/* Profile Information Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6" />
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* First Name */}
                            <div>
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            {/* Last Name */}
                            <div>
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            {/* Phone */}
                            <div className="sm:col-span-2">
                                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            {/* Email */}
                            <div className="sm:col-span-2">
                                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-50 rounded-xl animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Identity Details Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="h-6 w-36 bg-gray-200 rounded animate-pulse mb-6" />
                        <div className="grid gap-6 sm:grid-cols-2">
                            {/* Tax ID Type */}
                            <div>
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            {/* Tax ID */}
                            <div>
                                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            {/* Gov ID Type */}
                            <div>
                                <div className="h-4 w-28 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                            {/* Gov ID Number */}
                            <div>
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse" />
                            </div>
                        </div>

                        {/* File Uploads Skeleton */}
                        <div className="grid gap-4 sm:grid-cols-2 mt-6">
                            <div>
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-32 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 animate-pulse" />
                            </div>
                            <div>
                                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse mb-2" />
                                <div className="h-32 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 animate-pulse" />
                            </div>
                        </div>

                        {/* Selfie Upload Skeleton */}
                        <div className="mt-6">
                            <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mb-2" />
                            <div className="h-32 w-full bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100 animate-pulse" />
                        </div>
                    </div>

                    {/* Button Skeleton */}
                    <div className="h-12 w-full bg-gray-200 rounded-xl animate-pulse" />
                </div>
            </div>
        )
    }

    const isExistingSeller = ['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role as string)

    // If already submitted or approved OR is an existing seller (Admin/SuperAdmin), show the status box
    if (isSubmitted || isApproved || isExistingSeller) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 space-y-8">
                <ApplicationStatusBox
                    status={isApproved ? 'approved' : 'submitted'}
                    rejectionReason={verification?.rejectionReason}
                    isExistingSeller={isExistingSeller}
                />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="mb-8 font-outfit">
                <h1 className="text-3xl font-bold text-gray-900">Seller Verification</h1>
                <p className="text-gray-600">Please complete the steps below to verify your identity.</p>
            </div>

            {/* Progress Steps */}
            <div className="mb-8 flex items-center justify-around rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                {['identity', 'address', 'review'].map((step, idx) => (
                    <div key={step} className="flex items-center gap-3">
                        <div className={`flex size-8 items-center justify-center rounded-full text-sm font-bold ${currentStep === step ? 'bg-[#E87A3F] text-white' :
                            ['identity', 'address'].indexOf(currentStep) > idx ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                            }`}>
                            {['identity', 'address'].indexOf(currentStep) > idx ? <CheckCircle2 className="size-4" /> : idx + 1}
                        </div>
                        <span className={`hidden text-sm font-medium capitalize sm:block ${currentStep === step ? 'text-[#E87A3F]' : 'text-gray-400'}`}>
                            {step}
                        </span>
                        {idx < 2 && <div className="h-px w-8 bg-gray-100" />}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 size-5 shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {currentStep === 'identity' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    {/* Profile Info Box */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-orange-50">
                                    <User className="size-5 text-[#E87A3F]" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Your Profile Info</h3>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            This information will be used for your seller account. Make sure it is accurate.
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">First Name *</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                                    placeholder="Enter first name"
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#E87A3F]"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Last Name *</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                                    placeholder="Enter last name"
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#E87A3F]"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Phone Number *</label>
                                <StyledPhoneInput
                                    value={profileData.phone}
                                    onChange={(value) => setProfileData(prev => ({ ...prev, phone: value || '' }))}
                                    placeholder="Enter phone number"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                                <input
                                    type="email"
                                    value={session?.user?.email || ''}
                                    disabled
                                    className="h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Identity Details */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Identity Details</h3>

                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Tax ID Type</label>
                                <div className="relative" ref={taxTypeRef}>
                                    <button
                                        onClick={() => setIsTaxTypeOpen(!isTaxTypeOpen)}
                                        className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 px-4 text-left outline-none transition-all focus:border-[#E87A3F]"
                                    >
                                        <span className="text-gray-900">{identityData.taxIdType}</span>
                                        <ChevronDown className="size-4 text-gray-400" />
                                    </button>
                                    {isTaxTypeOpen && (
                                        <div className="absolute top-full z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                                            {['SSN', 'EIN'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => { setIdentityData(p => ({ ...p, taxIdType: type, taxId: '' })); setIsTaxTypeOpen(false); }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50"
                                                >{type}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Tax ID</label>
                                <input
                                    type="text"
                                    value={identityData.taxId}
                                    onChange={handleTaxIdChange}
                                    placeholder={identityData.taxIdType === 'SSN' ? 'XXX-XX-XXXX' : 'XX-XXXXXXX'}
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#E87A3F]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 mt-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Gov ID Type</label>
                                <div className="relative" ref={govIdTypeRef}>
                                    <button
                                        onClick={() => setIsGovIdTypeOpen(!isGovIdTypeOpen)}
                                        className="flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 px-4 text-left outline-none transition-all focus:border-[#E87A3F]"
                                    >
                                        <span className="text-gray-900">{identityData.govIdType.replace('_', ' ')}</span>
                                        <ChevronDown className="size-4 text-gray-400" />
                                    </button>
                                    {isGovIdTypeOpen && (
                                        <div className="absolute top-full z-10 mt-1 w-full rounded-xl border border-gray-100 bg-white py-1 shadow-lg">
                                            {['DRIVERS_LICENSE', 'PASSPORT', 'NATIONAL_ID'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => { setIdentityData(p => ({ ...p, govIdType: type, govIdNumber: '' })); setIsGovIdTypeOpen(false); }}
                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50"
                                                >{type.replace('_', ' ')}</button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-gray-700">ID Number *</label>
                                <input
                                    type="text"
                                    value={identityData.govIdNumber}
                                    onChange={handleGovIdChange}
                                    placeholder={getGovIdPlaceholder()}
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 outline-none focus:border-[#E87A3F]"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 mt-6">
                            <FileUpload
                                label="Front of ID"
                                uploaded={!!uploadedFiles.govIdFront}
                                onChange={(e: any) => handleFileUpload(e, 'govIdFront')}
                                loading={uploadingFiles['govIdFront']}
                            />
                            <FileUpload
                                label="Back of ID"
                                uploaded={!!uploadedFiles.govIdBack}
                                onChange={(e: any) => handleFileUpload(e, 'govIdBack')}
                                loading={uploadingFiles['govIdBack']}
                            />
                        </div>
                        <div className="mt-4">
                            <FileUpload
                                label="Selfie with ID"
                                uploaded={!!uploadedFiles.selfie}
                                onChange={(e: any) => handleFileUpload(e, 'selfie')}
                                loading={uploadingFiles['selfie']}
                            />
                        </div>

                        <Button
                            onClick={handleSaveIdentity}
                            disabled={loading || !profileData.firstName || !profileData.lastName || !profileData.phone}
                            className="w-full h-12 bg-[#E87A3F] hover:bg-[#d96d34] rounded-xl font-bold transition-all mt-6"
                        >
                            {loading ? 'Saving...' : 'Continue to Address'}
                        </Button>
                        {(!profileData.firstName || !profileData.lastName || !profileData.phone) && (
                            <p className="text-sm text-orange-600 mt-2 text-center">Please complete your profile info above to continue.</p>
                        )}
                    </div>
                </div>
            )}

            {/* ADDRESS STEP */}
            {currentStep === 'address' && (
                <div className="space-y-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">Seller Address</h3>
                        {!isAddingNewAddress && (
                            <Button
                                onClick={() => setIsAddingNewAddress(true)}
                                className="h-12 px-6 rounded-xl bg-[#E87A3F] hover:bg-[#d96d34] text-white font-bold shadow-sm shadow-orange-100 transition-all hover:scale-[1.02]"
                            >
                                <Plus className="mr-2 size-5" /> Add New Address
                            </Button>
                        )}
                    </div>

                    {isAddingNewAddress ? (
                        <div className="rounded-2xl bg-gray-50/50 p-1 animate-in slide-in-from-top-4 duration-300">
                            <div className="flex items-center justify-between p-4 mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">Add New Seller Address</h4>
                                {addresses && addresses.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsAddingNewAddress(false)}
                                        className="text-gray-500 hover:text-gray-700 hover:bg-white"
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                <BillingAddressForm
                                    onSave={async (data) => {
                                        setLoading(true)
                                        try {
                                            // Sync with User's Address Book
                                            const countryCode = data.country.length > 2
                                                ? ({ 'United States': 'US', 'Canada': 'CA', 'United Kingdom': 'GB', 'Pakistan': 'PK' }[data.country] || 'US')
                                                : data.country

                                            const newAddress = await createAddress({
                                                address1: data.address1,
                                                city: data.city,
                                                state: data.state,
                                                postalCode: data.postalCode,
                                                country: countryCode,
                                                isDefault: false,
                                                isSellerAddress: false // Don't auto-set as seller address
                                            })

                                            setAddressData({
                                                addressLine1: data.address1,
                                                addressLine2: '',
                                                city: data.city,
                                                state: data.state,
                                                postalCode: data.postalCode,
                                                country: countryCode
                                            })

                                            if (newAddress?.id) {
                                                setSelectedAddressId(newAddress.id)
                                                // Set this new address as the ONLY seller address
                                                await setSellerAddress(newAddress.id)
                                            }

                                            setIsAddingNewAddress(false)
                                            toast.success('Address saved to your profile')
                                        } catch (err) {
                                            toast.error('Failed to save address to profile')
                                        } finally {
                                            setLoading(false)
                                        }
                                    }}
                                    mode="profile"
                                    showTitle={false}
                                    submitButtonText="Save and Use Address"
                                    showDiscardButton={false}
                                    excludeFields={['firstName', 'lastName', 'phone', 'email']}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {addressesLoading ? (
                                <div className="flex h-48 items-center justify-center">
                                    <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
                                </div>
                            ) : !addresses || addresses.length === 0 ? (
                                <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-12 text-center">
                                    <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-orange-50 mb-4">
                                        <MapPin className="size-8 text-[#E87A3F]" />
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900 mb-1">No Saved Addresses</h4>
                                    <p className="text-gray-500 mb-6 max-w-xs mx-auto">Please add a business address to continue your application.</p>
                                    <Button
                                        onClick={() => setIsAddingNewAddress(true)}
                                        className="bg-white border-2 border-gray-100 hover:border-[#E87A3F] hover:bg-orange-50 text-gray-700 font-bold px-8 rounded-xl h-12 transition-all"
                                    >
                                        Add Your First Address
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {addresses.map((addr: any) => (
                                        <div
                                            key={addr.id}
                                            onClick={async () => {
                                                setSelectedAddressId(addr.id)
                                                const countryCode = addr.country && addr.country.length > 2
                                                    ? ({ 'United States': 'US', 'Canada': 'CA', 'United Kingdom': 'GB', 'Pakistan': 'PK' } as any)[addr.country] || 'US'
                                                    : (addr.country || 'US')

                                                setAddressData({
                                                    addressLine1: addr.address1,
                                                    addressLine2: '',
                                                    city: addr.city,
                                                    state: addr.state,
                                                    postalCode: addr.postalCode,
                                                    country: countryCode
                                                })

                                                // Set this address as the ONLY seller address
                                                await setSellerAddress(addr.id)
                                            }}
                                            className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-md ${selectedAddressId === addr.id ? 'border-[#E87A3F] bg-orange-50/50 ring-1 ring-[#E87A3F]' : 'border-gray-50 bg-white hover:border-[#E87A3F]/30 hover:bg-orange-50/20'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className={`size-4 ${selectedAddressId === addr.id ? 'text-[#E87A3F]' : 'text-gray-400 opacity-50'}`} />
                                                        <p className="font-bold text-gray-900 text-sm">Seller Address</p>
                                                    </div>
                                                    <div className="text-sm text-gray-600 leading-relaxed">
                                                        <p className="font-semibold text-gray-800">
                                                            {addr.user?.profile?.firstName || addr.user?.name?.split(' ')[0] || profile?.firstName || 'Business'} {addr.user?.profile?.lastName || addr.user?.name?.split(' ').slice(1).join(' ') || profile?.lastName || 'Owner'}
                                                        </p>
                                                        <p>{addr.address1}</p>
                                                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                                        <p className="mt-1 font-medium text-gray-400">{addr.country === 'PK' ? 'Pakistan' : 'United States'}</p>
                                                    </div>
                                                </div>
                                                <div className={`flex size-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${selectedAddressId === addr.id ? 'border-[#E87A3F] bg-[#E87A3F] text-white scale-110 shadow-sm shadow-orange-200' : 'border-gray-200 bg-white opacity-40 group-hover:opacity-100'
                                                    }`}>
                                                    {selectedAddressId === addr.id && <Check className="size-3.5 stroke-[3]" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-4 pt-6 mt-8 border-t border-gray-50">
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep('identity')}
                                    className="h-12 flex-1 rounded-xl font-bold border-gray-200 hover:bg-gray-50 text-gray-600"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleSaveAddress}
                                    disabled={loading || !selectedAddressId}
                                    className="h-12 flex-1 bg-[#E87A3F] hover:bg-[#d96d34] rounded-xl font-bold shadow-lg shadow-orange-100 transition-all hover:scale-[1.01]"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="size-4 animate-spin" /> Saving...
                                        </span>
                                    ) : 'Continue to Review'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* REVIEW STEP */}
            {currentStep === 'review' && (
                <div className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                    <h3 className="text-lg font-bold text-gray-900">Review Application</h3>
                    <div className="space-y-4">
                        <ReviewItem label="Tax ID" value={`${identityData.taxIdType}: ${identityData.taxId}`} />
                        <ReviewItem label="Gov ID" value={`${identityData.govIdType.replace('_', ' ')}: ${identityData.govIdNumber}`} />
                        <ReviewItem label="Seller Address" value={`${addressData.addressLine1}, ${addressData.city}, ${addressData.state}`} />
                    </div>

                    <div className="rounded-xl bg-orange-50 p-4 text-sm text-orange-800 border border-orange-100">
                        <div className="flex gap-2">
                            <AlertCircle className="size-5 shrink-0" />
                            <p>By submitting, you agree to our Seller Terms. Our team will review your application within 24-48 hours. Your existing seller status will remain active if you are already approved.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button variant="outline" onClick={() => setCurrentStep('address')} className="flex-1 h-12 rounded-xl font-bold">Back</Button>
                        <Button onClick={handleSubmitApplication} disabled={loading} className="flex-1 h-12 bg-[#E87A3F] hover:bg-[#d96d34] rounded-xl font-bold">
                            {loading ? 'Submitting...' : 'Submit Application'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}

function ReviewItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between border-b border-gray-50 pb-3">
            <span className="text-sm text-gray-500 font-medium">{label}</span>
            <span className="text-sm font-bold text-gray-900">{value}</span>
        </div>
    )
}

function FileUpload({ label, uploaded, onChange, loading }: any) {
    return (
        <div className="flex-1">
            <label className="mb-2 block text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
            <div className="relative">
                <input type="file" onChange={onChange} disabled={loading} className="hidden" id={label} />
                <label
                    htmlFor={label}
                    className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all ${uploaded ? 'border-green-500 bg-green-50 shadow-inner' : 'border-gray-200 hover:border-[#E87A3F] hover:bg-orange-50/50'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? <Loader2 className="size-8 animate-spin text-[#E87A3F]" /> : (
                        <>
                            {uploaded ? (
                                <div className="flex flex-col items-center animate-in zoom-in-50 duration-300">
                                    <CheckCircle2 className="size-10 text-green-500 mb-2" />
                                    <span className="text-sm font-bold text-green-700">Document Uploaded</span>
                                </div>
                            ) : (
                                <>
                                    <Upload className="mb-3 size-8 text-gray-300 transition-transform group-hover:-translate-y-1" />
                                    <span className="text-sm font-bold text-gray-600">Click to upload</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (Max 5MB)</span>
                                </>
                            )}
                        </>
                    )}
                </label>
            </div>
        </div>
    )
}

export default function SellerOnboardingFormPage() {
    return (
        <main className="min-h-screen bg-gray-50">
            <EcommerceHeader />
            <div className="pt-16">
                <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>}>
                    <OnboardingFormContent />
                </Suspense>
            </div>
            <FooterSection />
        </main>
    )
}
