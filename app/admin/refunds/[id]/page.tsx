"use client";

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import {
    ArrowLeft, CheckCircle, XCircle, AlertTriangle,
    Calendar, Tag, User, ShoppingBag, ExternalLink,
    Loader2, DollarSign, MessageSquare
} from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AccessDenied from '@/components/admin/AccessDenied';

const fetcher = (url: string) => fetch(url).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
});

export default function RefundDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const { isAuthChecking, hasPermission } = useAdminAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const { data: refund, error, isLoading } = useSWR(id ? `/api/refunds/${id}` : null, fetcher);

    if (isAuthChecking) {
        return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-orange-500" /></div>;
    }

    if (!hasPermission('refunds', 'view')) {
        return <AccessDenied message="You do not have permission to view refund details." />;
    }

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="h-10 w-10 animate-spin text-orange-500" /></div>;

    if (error || !refund) return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-50 text-gray-500">
            <AlertTriangle className="mb-4 h-16 w-16 text-yellow-500" />
            <h2 className="text-xl font-semibold text-gray-900">Refund request not found</h2>
            <Button variant="outline" className="mt-6" onClick={() => router.push('/admin/refunds')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Refunds
            </Button>
        </div>
    );

    const handleProcessRefund = async (status: 'PROCESSED' | 'REJECTED') => {
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/refunds/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update refund status');
            }

            toast.success(`Refund request ${status === 'PROCESSED' ? 'approved' : 'rejected'} successfully`);
            mutate(`/api/refunds/${id}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to process refund');
        } finally {
            setIsProcessing(false);
        }
    };

    const buyer = refund.order?.user;
    const vendor = refund.order?.vendor;
    const vendorUser = vendor?.user;
    const product = refund.orderItem?.product;

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 border-b bg-white/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full hover:bg-gray-100">
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900">Refund Request #{id.slice(0, 8).toUpperCase()}</h1>
                                <StatusBadge status={refund.status} type="transaction" />
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 font-mono">Order Number: #{refund.order?.orderNumber}</p>
                        </div>
                    </div>

                    {refund.status === 'PENDING' && hasPermission('refunds', 'edit') && (
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleProcessRefund('REJECTED')}
                                disabled={isProcessing}
                            >
                                <XCircle className="mr-2 h-4 w-4" /> Reject
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleProcessRefund('PROCESSED')}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                                Approve & Refund
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Refund Details */}
                        <Card className="border-none shadow-sm shadow-gray-200/50">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                    Request Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Refund Amount</p>
                                        <p className="text-2xl font-bold text-gray-900">${parseFloat(String(refund.amount)).toFixed(2)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Request Date</p>
                                        <p className="text-base font-medium text-gray-900">{new Date(refund.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {(() => {
                                        const reasonStr = refund.reason || '';
                                        // Simple parsing logic
                                        const reasonMatch = reasonStr.match(/\[(REFUND|RETURN)\]\s+([^\n\r]+)/);
                                        const descriptionMatch = reasonStr.match(/Description:\s+([^\n\r]+)/);
                                        const evidenceMatch = reasonStr.match(/Evidence:\s+([^\n\r]+)/);

                                        const type = reasonMatch ? reasonMatch[1] : null;
                                        const mainReason = reasonMatch ? reasonMatch[2] : reasonStr;
                                        const description = descriptionMatch ? descriptionMatch[1] : null;
                                        const evidenceUrls = evidenceMatch ? evidenceMatch[1].split(',').map((s: string) => s.trim()).filter(Boolean) : [];

                                        return (
                                            <>
                                                <div className="rounded-xl bg-orange-50 border border-orange-100 p-4">
                                                    <h4 className="text-sm font-bold text-orange-900 mb-1 flex items-center gap-2">
                                                        <Tag className="h-4 w-4" /> {type === 'RETURN' ? 'Return' : 'Refund'} Reason
                                                    </h4>
                                                    <p className="text-sm text-orange-800 font-bold">
                                                        {mainReason || 'No reason specified'}
                                                    </p>
                                                </div>

                                                {description && (
                                                    <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                                                        <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider flex items-center gap-2">
                                                            <MessageSquare className="h-3 w-3" /> Detailed Description
                                                        </h4>
                                                        <p className="text-sm text-gray-700 leading-relaxed italic">
                                                            "{description}"
                                                        </p>
                                                    </div>
                                                )}

                                                {evidenceUrls.length > 0 && (
                                                    <div className="space-y-3">
                                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                            <CheckCircle className="h-3 w-3" /> Customer Evidence
                                                        </h4>
                                                        <div className="flex flex-wrap gap-4">
                                                            {evidenceUrls.map((url: string, i: number) => (
                                                                <a
                                                                    key={i}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="h-32 w-32 rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:ring-2 hover:ring-orange-500 transition-all group relative"
                                                                >
                                                                    <img src={url} alt="Evidence" className="h-full w-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                                        <ExternalLink className="h-5 w-5 text-white" />
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        );
                                    })()}
                                </div>

                                {refund.metadata && Object.keys(refund.metadata as object).length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Additional Details</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {Object.entries(refund.metadata as object).map(([key, value]) => (
                                                <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase">{key}</p>
                                                    <p className="text-sm font-medium text-gray-700">{String(value)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Product & Order Info */}
                        <Card className="border-none shadow-sm shadow-gray-200/50 overflow-hidden">
                            <div className="bg-gray-50/80 px-6 py-4 border-b flex items-center justify-between">
                                <CardTitle className="text-lg font-bold">Affected Items</CardTitle>
                                <Link
                                    href={`/admin/orders?orderNumber=${refund.order?.orderNumber}`}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
                                >
                                    View Full Order <ExternalLink className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                </Link>
                            </div>
                            <CardContent className="p-0">
                                {product ? (
                                    <div className="p-6 flex gap-6">
                                        <div className="h-24 w-24 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden shrink-0 shadow-sm">
                                            {product.images?.[0] ? (
                                                <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center"><ShoppingBag className="h-8 w-8 text-gray-200" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {product.name}
                                                </h4>
                                                <Link href={`/admin/products/${product.id}`} className="text-gray-400 hover:text-blue-600">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Link>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-snug">{product.description}</p>
                                            <div className="flex gap-4 mt-2">
                                                <Badge variant="secondary" className="bg-gray-100 font-medium">{product.category}</Badge>
                                                <p className="text-sm font-bold text-gray-900">${product.price}</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-gray-500 italic">
                                        <p>This refund applies to the entire order.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Buyer Information */}
                        <Card className="border-none shadow-sm shadow-gray-200/50">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-bold text-gray-500 uppercase tracking-tight">Buyer Info</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-blue-50 flex items-center justify-center font-bold text-blue-600">
                                        {buyer?.image ? (
                                            <img src={buyer.image} alt={buyer.name || ''} className="h-full w-full object-cover" />
                                        ) : (
                                            buyer?.name?.charAt(0) || 'U'
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-900 truncate">{buyer?.name || 'Guest User'}</h4>
                                        <p className="text-xs text-gray-500 truncate">{buyer?.email}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full text-xs font-bold border-gray-200 text-gray-600 rounded-xl"
                                    onClick={() => router.push(`/admin/users/${buyer?.id}`)}
                                >
                                    View Buyer Profile
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Seller Information */}
                        <Card className="border-none shadow-sm shadow-gray-200/50">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-bold text-gray-500 uppercase tracking-tight">Seller Info (To Debit)</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-full border-2 border-white shadow-sm overflow-hidden bg-green-50 flex items-center justify-center font-bold text-green-600">
                                        {vendorUser?.image ? (
                                            <img src={vendorUser.image} alt={vendorUser.name || ''} className="h-full w-full object-cover" />
                                        ) : (
                                            vendorUser?.name?.charAt(0) || 'S'
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-900 truncate">{vendorUser?.name || 'Unknown Seller'}</h4>
                                        <p className="text-xs text-gray-500 truncate">{vendorUser?.email}</p>
                                    </div>
                                </div>
                                {vendor && (
                                    <Button
                                        variant="outline"
                                        className="w-full text-xs font-bold border-gray-200 text-gray-600 rounded-xl"
                                        onClick={() => router.push(`/admin/sellers/${vendor.userId}`)}
                                    >
                                        View Seller Profile
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Financial Impact */}
                        {refund.status === 'PENDING' && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100">
                                <h4 className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <DollarSign className="h-3 w-3" /> Financial Impact
                                </h4>
                                <ul className="text-[11px] text-red-800 space-y-1 ml-4 list-disc font-medium">
                                    <li>Wallet debit of **${parseFloat(String(refund.amount)).toFixed(2)}** from Seller.</li>
                                    <li>Restock **1 unit** of product to inventory.</li>
                                    <li>Automatic reversal via Stripe (if available).</li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
