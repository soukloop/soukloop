'use client'

import { useRouter } from 'next/navigation'
import {
    Loader2,
    Store,
    AlertCircle,
    CheckCircle2,
    ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ApplicationStatusBoxProps {
    status: 'incomplete' | 'submitted' | 'approved' | 'rejected'
    rejectionReason?: string | null
    isExistingSeller?: boolean
}
export default function ApplicationStatusBox({
    status,
    rejectionReason,
    isExistingSeller
}: ApplicationStatusBoxProps) {
    const router = useRouter()

    if (status === 'submitted' && !isExistingSeller) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-8 rounded-2xl bg-blue-50/50 border border-blue-100 shadow-sm">
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                            <Loader2 className="size-3 animate-spin" /> Application Under Review
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900 tracking-tight">We're Reviewing Your Documents</h2>
                        <p className="mb-4 text-gray-600 max-w-xl">
                            We've received your application! Our team typically reviews documents within 24-48 hours.
                            We'll notify you as soon as your account is ready.
                        </p>
                        <p className="text-sm font-semibold text-blue-700">Please wait for the verification...</p>
                    </div>
                    <div className="hidden md:flex size-24 items-center justify-center rounded-2xl bg-white text-blue-500 shadow-sm ring-1 ring-blue-100">
                        <Store className="size-12" />
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'rejected' && !isExistingSeller) {
        return (
            <div className="animate-in shake duration-500">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-8 rounded-2xl bg-red-50/50 border border-red-100 shadow-sm">
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-red-600 bg-red-100/50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                            <AlertCircle className="size-3" /> Verification Rejected
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900 tracking-tight">Action Required</h2>
                        <p className="mb-6 text-gray-600 max-w-xl">
                            {rejectionReason || "Common reasons include blurry documents or mismatched information. Please check your details and try again."}
                        </p>
                        <Button
                            onClick={() => router.push('/become-a-seller/form')}
                            className="h-12 w-full md:w-auto px-8 rounded-xl bg-red-600 font-bold text-white transition-all hover:bg-red-700"
                        >
                            Try Again
                        </Button>
                    </div>
                    <div className="hidden md:flex size-24 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm ring-1 ring-red-100">
                        <AlertCircle className="size-12" />
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'approved' || isExistingSeller) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-8 rounded-2xl bg-green-50/50 border border-green-100 shadow-sm">
                    <div className="flex-1 text-left">
                        <div className="inline-flex items-center gap-2 text-xs font-bold text-green-600 bg-green-100/50 px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
                            <CheckCircle2 className="size-3" /> Verified Seller
                        </div>
                        <h2 className="mb-2 text-2xl font-bold text-gray-900 tracking-tight">You're All Set!</h2>
                        <p className="mb-6 text-gray-600 max-w-xl">
                            {status === 'submitted'
                                ? "Your information update is under review, but you can continue selling with your existing profile."
                                : "Your account is fully verified. You can now post products and manage your store."
                            }
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button
                                onClick={() => router.push('/seller/dashboard')}
                                className="h-11 px-6 rounded-xl bg-[#E87A3F] font-bold text-white transition-all hover:bg-[#d96d34]"
                            >
                                Seller Dashboard
                            </Button>
                        </div>
                    </div>
                    <div className="hidden md:flex size-24 items-center justify-center rounded-2xl bg-white text-green-500 shadow-sm ring-1 ring-green-100">
                        <CheckCircle2 className="size-12" />
                    </div>
                </div>
            </div>
        )
    }

    // Incomplete / Not Applied
    return (
        <div className="animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row gap-8 items-center justify-between p-8 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="flex-1 text-left">
                    <h2 className="mb-2 text-2xl font-bold text-gray-900 tracking-tight">Seller Account</h2>
                    <p className="mb-6 text-gray-600 max-w-xl">
                        Get verified to start listing products and selling on our global marketplace.
                        It only takes a few minutes to get started!
                    </p>

                    <Button
                        onClick={() => router.push('/become-a-seller/form')}
                        className="h-12 w-full md:w-auto px-8 rounded-xl bg-[#E87A3F] font-bold text-white transition-all hover:bg-[#d96d34] flex items-center justify-center gap-2"
                    >
                        Start Seller Verification <ArrowRight className="size-4" />
                    </Button>
                </div>
                <div className="hidden md:flex size-24 items-center justify-center rounded-2xl bg-orange-100 text-[#E87A3F]">
                    <Store className="size-12" />
                </div>
            </div>
        </div>
    )
}
