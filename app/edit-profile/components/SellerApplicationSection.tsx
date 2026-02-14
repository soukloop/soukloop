import { useRouter } from 'next/navigation'
import {
    Loader2,
    ShieldCheck,
    FileType,
    MapPin,
    Edit3
} from 'lucide-react'
import { useSellerVerification } from '@/hooks/useSellerVerification'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'
import ApplicationStatusBox from '@/components/seller/ApplicationStatusBox'

export default function SellerApplicationSection() {
    const router = useRouter()
    const { data: session } = useSession()
    const {
        verification,
        isLoading: isStatusLoading,
        isApproved,
        isSubmitted,
        isRejected,
        isIncomplete
    } = useSellerVerification()

    const isExistingSeller = session?.user?.role === 'SELLER'
    const status = isApproved ? 'approved' : isSubmitted ? 'submitted' : isRejected ? 'rejected' : 'incomplete'

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
            />

            {/* Approved Summary View - Keep as a professional card below the status box if approved */}
            {(isApproved || (isExistingSeller && isSubmitted)) && (
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
                                onClick={() => router.push('/become-seller/form')}
                                className="text-[#E87A3F] hover:bg-orange-50 font-semibold"
                            >
                                <Edit3 className="size-4 mr-1" /> Edit
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <SummaryField label="Tax ID Type" value={verification?.taxIdType || 'N/A'} />
                            <SummaryField label="Tax ID" value={verification?.taxId || 'Not provided'} />
                            <SummaryField label="Gov ID Type" value={verification?.govIdType?.replace('_', ' ') || 'N/A'} />
                            <SummaryField label="ID Number" value={verification?.govIdNumber || 'Not provided'} />
                        </div>
                    </div>

                    {/* Address Summary */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="size-4 text-[#E87A3F]" /> Business Address
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/become-seller/form')}
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
