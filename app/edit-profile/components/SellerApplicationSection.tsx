'use client'

import { useState } from 'react'
import {
    FileType,
    MapPin,
    Edit3,
    Loader2
} from 'lucide-react'
import { useSellerVerification } from '@/hooks/useSellerVerification'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import ApplicationStatusBox from '@/components/seller/ApplicationStatusBox'
import { EditUserModal } from '@/components/admin/users/modals/edit-user-modal'

export default function SellerApplicationSection() {
    const { data: session } = useSession()
    const {
        verification,
        isLoading: isStatusLoading,
        isApproved,
        isSubmitted,
        isRejected,
        mutate: refreshVerification
    } = useSellerVerification()

    const isExistingSeller = ['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role as string)
    const status = isApproved ? 'approved' : isSubmitted ? 'submitted' : isRejected ? 'rejected' : 'incomplete'

    // State for vendor identity modal
    const [vendorModalOpen, setVendorModalOpen] = useState(false)
    const [vendorInitialData, setVendorInitialData] = useState<{
        taxIdType?: string;
        taxId?: string;
        govIdType?: string;
        govIdNumber?: string;
        govIdFrontUrl?: string;
        govIdBackUrl?: string;
        selfieUrl?: string;
    } | null>(null)

    // State for address modal
    const [addressModalOpen, setAddressModalOpen] = useState(false)

    const handleOpenIdentityModal = () => {
        // Set non-sensitive data immediately — EditVendorForm will lazily
        // decrypt taxId and govIdNumber on mount (with shimmer skeleton)
        setVendorInitialData({
            taxIdType: verification?.taxIdType || '',
            govIdType: verification?.govIdType || '',
            govIdFrontUrl: verification?.govIdFrontUrl || '',
            govIdBackUrl: verification?.govIdBackUrl || '',
            selfieUrl: verification?.selfieUrl || '',
        })
        setVendorModalOpen(true)
    }

    if (isStatusLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
            </div>
        )
    }

    return (
        <div className="mt-12 space-y-8" id="become-seller-section">
            <div className="h-px bg-gray-200 w-full" />

            <ApplicationStatusBox
                status={status}
                rejectionReason={verification?.rejectionReason}
                isExistingSeller={isExistingSeller}
                planTier={session?.user?.planTier}
            />

            {/* Approved Summary View */}
            {(isApproved || isExistingSeller) && (
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-700">
                    {/* Identity Summary */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <FileType className="size-4 text-[#E87A3F]" /> Identity Details
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleOpenIdentityModal}
                                className="text-[#E87A3F] hover:bg-orange-50 font-semibold"
                            >
                                <Edit3 className="size-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <SummaryField label="Tax ID Type" value={verification?.taxIdType || 'N/A'} />
                            <SummaryField label="Tax ID" value={verification?.taxId ? '••••••••' : 'Not provided'} />
                            <SummaryField label="Gov ID Type" value={verification?.govIdType?.replace('_', ' ') || 'N/A'} />
                            <SummaryField label="ID Number" value={verification?.govIdNumber ? '••••••••' : 'Not provided'} />
                        </div>
                    </div>

                    {/* Address Summary */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="size-4 text-[#E87A3F]" /> Seller Address
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddressModalOpen(true)}
                                className="text-[#E87A3F] hover:bg-orange-50 font-semibold"
                            >
                                <Edit3 className="size-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
                            <p className="font-bold text-gray-900 mb-1">{session?.user?.name || 'Seller'}</p>
                            <p className="text-sm text-gray-600">{verification?.addressLine1}</p>
                            {verification?.addressLine2 && <p className="text-sm text-gray-600">{verification?.addressLine2}</p>}
                            <p className="text-sm text-gray-600">{verification?.city}, {verification?.state} {verification?.postalCode}</p>
                            <p className="text-sm text-gray-600 font-medium mt-1">{verification?.country === 'PK' ? 'Pakistan' : 'United States'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Identity Edit Modal */}
            {vendorInitialData && session?.user?.id && (
                <EditUserModal
                    userId={session.user.id}
                    mode="vendor"
                    hideSlug={true}
                    open={vendorModalOpen}
                    onOpenChange={(open) => {
                        setVendorModalOpen(open)
                        if (!open) refreshVerification()
                    }}
                    vendorInitialData={vendorInitialData}
                />
            )}

            {/* Address Edit Modal */}
            {session?.user?.id && (
                <EditUserModal
                    userId={session.user.id}
                    mode="address"
                    open={addressModalOpen}
                    onOpenChange={(open) => {
                        setAddressModalOpen(open)
                        if (!open) refreshVerification()
                    }}
                />
            )}
        </div>
    )
}

function SummaryField({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
            <span className="text-sm font-bold text-gray-900 mt-0.5">{value}</span>
        </div>
    )
}
