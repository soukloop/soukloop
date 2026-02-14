'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react'

export default function SellerStatus() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { status } = useSession()
    const [loading, setLoading] = useState(true)
    const [application, setApplication] = useState<any>(null)

    useEffect(() => {
        if (status === 'authenticated') {
            fetchStatus()
        }
    }, [status])

    const fetchStatus = async () => {
        // In a real implementation, you'd fetch the verification status
        // For now, just showing success from query param
        setLoading(false)
        if (searchParams?.get('success')) {
            setApplication({ status: 'submitted' })
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    {application?.status === 'submitted' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Application Submitted!
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Thank you for applying to become a seller on Soukloop. Our team will review your application within 24-48 hours.
                            </p>
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-orange-800">
                                    You'll receive an email notification once your application is reviewed.
                                </p>
                            </div>
                            <button
                                onClick={() => router.push('/')}
                                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600"
                            >
                                Return to Homepage
                            </button>
                        </>
                    )}

                    {application?.status === 'approved' && (
                        <>
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Congratulations!
                            </h1>
                            <p className="text-gray-600 mb-8">
                                Your seller application has been approved. You can now start listing products.
                            </p>
                            <button
                                onClick={() => router.push('/seller/dashboard')}
                                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600"
                            >
                                Go to Seller Dashboard
                            </button>
                        </>
                    )}

                    {application?.status === 'rejected' && (
                        <>
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Application Rejected
                            </h1>
                            <p className="text-gray-600 mb-4">
                                Unfortunately, your application was not approved.
                            </p>
                            {application.rejectionReason && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-red-800">{application.rejectionReason}</p>
                                </div>
                            )}
                            <button
                                onClick={() => router.push('/seller/onboarding')}
                                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600"
                            >
                                Reapply
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
