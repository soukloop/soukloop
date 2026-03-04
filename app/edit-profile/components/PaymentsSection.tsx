"use client";

import React, { useState, useEffect, useTransition } from "react";
import BankAccountsSection from "./BankAccountsSection";
import { getWithdrawalData } from "@/src/features/withdrawals/actions";
import { getSubscriptionTransactions, createCustomerPortalSession } from "@/src/features/subscriptions/actions";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

import { PricingCards } from "@/components/subscription/PricingCards";

const TableSkeleton = () => (
    <div className="space-y-3 w-full animate-pulse mt-4">
        <div className="h-10 w-full rounded-lg bg-gray-200"></div>
        <div className="h-12 w-full rounded-lg bg-gray-100"></div>
        <div className="h-12 w-full rounded-lg bg-gray-100"></div>
    </div>
);

export default function PaymentsSection() {
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'payouts' | 'subscriptions'>('payouts');
    const [payouts, setPayouts] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [planTier, setPlanTier] = useState<string>('BASIC');
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (viewMode === 'payouts') {
                    const data = await getWithdrawalData();
                    setPayouts(data.recentPayouts || []);
                } else {
                    const data = await getSubscriptionTransactions();
                    setSubscriptions(data.transactions || []);
                    if (data.planTier) {
                        setPlanTier(data.planTier);
                    }
                }
            } catch (error: any) {
                toast.error(`Failed to load ${viewMode}: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, [viewMode]);

    const handleManageSubscription = () => {
        startTransition(() => {
            createCustomerPortalSession().catch((err) => {
                toast.error(err.message || "Failed to launch billing portal");
            });
        });
    };

    return (
        <div className="w-full space-y-6">
            {/* View Switcher toggle */}
            <div className="flex justify-center pt-2 pb-6">
                <div className="bg-gray-100 p-1 rounded-full flex relative w-[280px]">
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#E87A3F] rounded-full shadow-sm transition-all duration-300 ease-in-out ${viewMode === 'subscriptions' ? 'translate-x-[136px]' : 'translate-x-0'
                            }`}
                    />

                    <button
                        onClick={() => setViewMode('payouts')}
                        className={`flex-1 relative z-10 text-sm font-bold py-2 rounded-full transition-colors ${viewMode === 'payouts' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Payouts
                    </button>
                    <button
                        onClick={() => setViewMode('subscriptions')}
                        className={`flex-1 relative z-10 text-sm font-bold py-2 rounded-full transition-colors ${viewMode === 'subscriptions' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Subscriptions
                    </button>
                </div>
            </div>

            {viewMode === 'payouts' ? (
                <div className="space-y-12 animate-in fade-in zoom-in-95 duration-300">
                    <BankAccountsSection />

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Payout History</h3>
                        {isLoading ? (
                            <TableSkeleton />
                        ) : payouts.length === 0 ? (
                            <p className="text-gray-500 text-sm py-4">No recent payouts found.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-[#FEF3EC] text-[#E87A3F]">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Date</th>
                                            <th className="px-4 py-3 font-semibold">Amount</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Bank Account</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-gray-600">
                                        {payouts.map((payout) => (
                                            <tr key={payout.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {format(new Date(payout.createdAt), 'MMM dd, yyyy')}
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    ${Number(payout.amount).toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${payout.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                        payout.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-red-100 text-red-700'
                                                        }`}>
                                                        {payout.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {payout.bankAccount?.bankName} (***{payout.bankAccount?.accountNumber?.slice(-4) || '****'})
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
                    {isLoading ? (
                        <div className="pt-4"><TableSkeleton /></div>
                    ) : (planTier === 'STARTER' || planTier === 'PRO') ? (
                        <>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-100 gap-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                        {planTier === 'STARTER' ? 'Starter Plan' : 'Pro Plan'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Manage your active subscription & billing information</p>
                                </div>
                                <Button
                                    onClick={handleManageSubscription}
                                    disabled={isPending}
                                    className="bg-black hover:bg-gray-800 text-white rounded-xl shadow-sm"
                                >
                                    {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Manage Billing <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Billing History</h3>
                                {subscriptions.length === 0 ? (
                                    <p className="text-gray-500 text-sm py-4">No subscription invoices found.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-[#F0FDF4] text-green-700">
                                                <tr>
                                                    <th className="px-4 py-3 font-semibold">Date</th>
                                                    <th className="px-4 py-3 font-semibold">Amount</th>
                                                    <th className="px-4 py-3 font-semibold">Status</th>
                                                    <th className="px-4 py-3 font-semibold">Invoice ID</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 text-gray-600">
                                                {subscriptions.map((sub) => (
                                                    <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-4 py-3 whitespace-nowrap">
                                                            {format(new Date(sub.createdAt), 'MMM dd, yyyy')}
                                                        </td>
                                                        <td className="px-4 py-3 font-medium text-gray-900">
                                                            ${Number(sub.amount).toFixed(2)}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sub.status === 'succeeded' || sub.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                                'bg-red-100 text-red-700'
                                                                }`}>
                                                                Paid
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                                                            {sub.stripeInvoiceId || 'N/A'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="pt-2">
                                <PricingCards
                                    currentTier={planTier}
                                    onSelect={() => router.push('/pricing')}
                                />

                                <div className="text-center pt-10 pb-4">
                                    <Link
                                        href="/pricing"
                                        className="text-sm font-semibold text-gray-400 hover:text-orange-500 inline-flex items-center gap-2 transition-colors uppercase tracking-widest"
                                    >
                                        More plan options <ArrowRight className="size-4" />
                                    </Link>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
