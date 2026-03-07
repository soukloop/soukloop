'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, XCircle, FileText, MapPin, User, Loader2, User2, ShoppingCart, CreditCard, Eye, EyeOff, AlertCircle, Building2 } from 'lucide-react'
import useSWR from 'swr'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { UserAvatar } from '@/components/shared/user-avatar'

const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || `Error ${res.status}: ${res.statusText}`)
    }
    return res.json()
}

export default function KYCReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const { data, isLoading, error, mutate } = useSWR(`/api/admin/kyc/${id}`, fetcher)
    const [submitting, setSubmitting] = useState(false)
    const [rejectionReason, setRejectionReason] = useState('')
    const [showRejectModal, setShowRejectModal] = useState(false)
    const [showSensitiveInfo, setShowSensitiveInfo] = useState(false)
    const [viewingPending, setViewingPending] = useState(false)
    const [showApproveDialog, setShowApproveDialog] = useState(false)

    const verification = data?.verification
    const hasPendingEdit = data?.hasPendingEdit
    const pendingVerification = data?.pendingVerification

    // Determine which verification to display
    const displayedVerification = viewingPending && pendingVerification ? pendingVerification : verification

    const handleApprove = async () => {
        setSubmitting(true)
        setShowApproveDialog(false)

        try {
            const res = await fetch(`/api/admin/kyc/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve' })
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                throw new Error(errData.error || 'Failed to approve')
            }

            toast.success('Application approved successfully! 🎉', {
                description: 'Seller has been notified and can now start listing products.'
            })
            router.push('/admin/sellers')
        } catch (error: any) {
            toast.error('Failed to approve application', {
                description: error.message || 'Please try again'
            })
        } finally {
            setSubmitting(false)
        }
    }

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a rejection reason')
            return
        }

        setSubmitting(true)
        try {
            const res = await fetch(`/api/admin/kyc/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject', reason: rejectionReason })
            })

            if (!res.ok) throw new Error('Failed to reject')

            toast.success('Application rejected')
            router.push('/admin/kyc')
        } catch (error) {
            toast.error('Failed to reject application')
        } finally {
            setSubmitting(false)
            setShowRejectModal(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600 font-bold mb-2">Error Loading Application</div>
                <div className="text-gray-600">{error.message}</div>
                <button
                    onClick={() => router.push('/admin/kyc')}
                    className="mt-4 text-orange-500 hover:underline"
                >
                    Back to List
                </button>
            </div>
        )
    }

    if (!verification || !verification.user) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Application or user data not found</p>
                <button
                    onClick={() => router.push('/admin/kyc')}
                    className="mt-4 text-orange-500 hover:underline"
                >
                    Back to List
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Pending Edit Banner */}
            {hasPendingEdit && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-yellow-800">Pending Edit Detected</h3>
                            <p className="text-sm text-yellow-700 mt-1">
                                This user has submitted updated verification information. You can review both versions below.
                            </p>
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => setViewingPending(false)}
                                    className={`px-3 py-1 text-sm rounded ${!viewingPending ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-700 border border-yellow-300'}`}
                                >
                                    Current (Active)
                                </button>
                                <button
                                    onClick={() => setViewingPending(true)}
                                    className={`px-3 py-1 text-sm rounded ${viewingPending ? 'bg-yellow-600 text-white' : 'bg-white text-yellow-700 border border-yellow-300'}`}
                                >
                                    Pending Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Review Application</h1>
                    <p className="text-gray-600 mt-1">{verification.user.name} • {verification.user.email}</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        {showSensitiveInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showSensitiveInfo ? 'Hide' : 'Show'} Sensitive Info
                    </button>
                    <button
                        onClick={() => setShowRejectModal(true)}
                        disabled={submitting}
                        className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                        <XCircle className="w-4 h-4 inline mr-2" />
                        Reject
                    </button>
                    <button
                        onClick={() => setShowApproveDialog(true)}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                        <CheckCircle2 className="w-4 h-4 inline mr-2" />
                        Approve
                    </button>
                </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User2 className="w-5 h-5 text-orange-500" />
                    Profile Information
                </h2>
                <div className="flex gap-6">
                    {/* Profile Photo */}
                    <div className="flex-shrink-0">
                        <UserAvatar
                            src={verification.user.profile?.avatar || verification.user.image}
                            name={verification.user.name || verification.user.profile?.firstName || "User"}
                            fallbackType="initials"
                            className="size-24 border-2 border-gray-200"
                        />
                    </div>

                    {/* Profile Details */}
                    <div className="flex-1 grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Full Name</p>
                            <p className="text-gray-900">
                                {verification.user.profile?.firstName} {verification.user.profile?.lastName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Email</p>
                            <p className="text-gray-900">{verification.user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Phone</p>
                            <p className="text-gray-900">{verification.user.profile?.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Member Since</p>
                            <p className="text-gray-900">{new Date(verification.user.createdAt).toLocaleDateString()}</p>
                        </div>
                        {verification.user.profile?.bio && (
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-gray-700 mb-2">Bio</p>
                                <p className="text-gray-900">{verification.user.profile.bio}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-orange-500" />
                    Order History (as Buyer)
                </h2>
                {verification.user.orders && verification.user.orders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {verification.user.orders.map((order: any) => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900">{order.orderNumber}</td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-sm text-gray-900">${order.total.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm">No previous orders found</p>
                )}
            </div>

            {/* Identity Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    Identity Documents
                </h2>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">ID Type</p>
                        <p className="text-gray-900">{displayedVerification?.govIdType || 'Not provided'}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">ID Number</p>
                        <p className="text-gray-900 font-mono">
                            {showSensitiveInfo ? displayedVerification?.govIdNumber : '••••••••'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                    <DocumentPreview url={displayedVerification?.govIdFrontUrl} label="ID Front" />
                    <DocumentPreview url={displayedVerification?.govIdBackUrl} label="ID Back" />
                    <DocumentPreview url={displayedVerification?.selfieUrl} label="Selfie" />
                </div>

                {/* Tax Information */}
                {(displayedVerification?.taxIdType || displayedVerification?.taxId) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-orange-500" />
                            Tax Information
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            {displayedVerification?.taxIdType && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Tax ID Type</p>
                                    <p className="text-gray-900">{displayedVerification.taxIdType}</p>
                                </div>
                            )}
                            {displayedVerification?.taxId && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Tax ID Number</p>
                                    <p className="text-gray-900 font-mono">
                                        {showSensitiveInfo ? displayedVerification.taxId : '••••••••'}
                                    </p>
                                </div>
                            )}
                            {displayedVerification?.businessType && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">Business Type</p>
                                    <p className="text-gray-900">{displayedVerification.businessType}</p>
                                </div>
                            )}
                        </div>
                        {displayedVerification?.businessLicenseUrl && (
                            <div className="mt-4">
                                <DocumentPreview url={displayedVerification.businessLicenseUrl} label="Business License" />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Address Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-500" />
                    Address Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-gray-900">{displayedVerification?.addressLine1}</p>
                        {displayedVerification?.addressLine2 && <p className="text-gray-900">{displayedVerification.addressLine2}</p>}
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">City / State</p>
                        <p className="text-gray-900">{displayedVerification?.city}, {displayedVerification?.state}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Postal Code</p>
                        <p className="text-gray-900">{displayedVerification?.postalCode}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-700">Country</p>
                        <p className="text-gray-900">{displayedVerification?.country}</p>
                    </div>
                </div>

                <div className="mt-6">
                    <DocumentPreview url={displayedVerification?.addressProofUrl} label="Address Proof" />
                </div>
            </div>

            {/* Approve Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showApproveDialog}
                onClose={() => setShowApproveDialog(false)}
                onConfirm={handleApprove}
                title="Approve Seller Application"
                message="Are you sure you want to approve this seller application? The user will be granted seller privileges and can start listing products."
                confirmText="Approve"
                cancelText="Cancel"
                type="success"
                isLoading={submitting}
            />

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Reject Application</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Please provide a reason for rejection. This will be sent to the applicant.
                        </p>
                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Reason for rejection..."
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        />
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={submitting || !rejectionReason.trim()}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {submitting ? 'Rejecting...' : 'Reject'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function DocumentPreview({ url, label }: { url: string; label: string }) {
    if (!url) return null

    return (
        <div>
            <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border-2 border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-colors"
            >
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-center text-gray-600">View Document</p>
            </a>
        </div>
    )
}
