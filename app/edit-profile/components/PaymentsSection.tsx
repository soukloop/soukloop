"use client";

import React, { useState, useEffect, useTransition } from "react";
import BankAccountsSection from "./BankAccountsSection";
import { getWithdrawalData } from "@/src/features/withdrawals/actions";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";


const TableSkeleton = () => (
    <div className="space-y-3 w-full animate-pulse mt-4">
        <div className="h-10 w-full rounded-lg bg-gray-200"></div>
        <div className="h-12 w-full rounded-lg bg-gray-100"></div>
        <div className="h-12 w-full rounded-lg bg-gray-100"></div>
    </div>
);

export default function PaymentsSection() {
    const router = useRouter();
    const [payouts, setPayouts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const data = await getWithdrawalData();
                setPayouts(data.recentPayouts || []);
            } catch (error: any) {
                toast.error(`Failed to load payout history: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <div className="w-full space-y-6">
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
        </div>
    );
}
