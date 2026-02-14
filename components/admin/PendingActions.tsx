"use client";

import Link from 'next/link';
import { AlertCircle, UserCheck, Package, List, CreditCard } from 'lucide-react';

interface PendingActionsProps {
    pendingVendors: number;
    pendingReports: number;
    pendingPayouts: number;
    pendingRefunds: number;
    isLoading?: boolean;
}

export default function PendingActions({
    pendingVendors = 0,
    pendingReports = 0,
    pendingPayouts = 0,
    pendingRefunds = 0,
    isLoading
}: PendingActionsProps) {
    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
                <div className="space-y-3">
                    <div className="h-16 bg-gray-100 rounded-lg" />
                    <div className="h-16 bg-gray-100 rounded-lg" />
                </div>
            </div>
        );
    }

    const actions = [
        {
            id: 'reports',
            title: "Reported Items",
            description: `${pendingReports} new report${pendingReports !== 1 ? 's' : ''} submitted`,
            count: pendingReports,
            action: "Review",
            actionColor: "bg-red-500 hover:bg-red-600",
            href: "/admin/reports",
            icon: AlertCircle
        },
        {
            id: 'withdrawals',
            title: "Withdraw Requests",
            description: `${pendingPayouts} withdraw request${pendingPayouts !== 1 ? 's' : ''} from sellers`,
            count: pendingPayouts,
            action: "Withdraw",
            actionColor: "bg-teal-600 hover:bg-teal-700",
            href: "/admin/transactions",
            icon: CreditCard
        },
        {
            id: 'refunds',
            title: "Return & Refund Requests",
            description: `${pendingRefunds} pending refund request${pendingRefunds !== 1 ? 's' : ''}`,
            count: pendingRefunds,
            action: "Refunds",
            actionColor: "bg-orange-500 hover:bg-orange-600",
            href: "/admin/orders?status=REFUNDED", // Assuming filtering by status
            icon: Package
        }
    ];

    return (
        <div className="rounded-xl border bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Pending Actions</h2>
            <div className="space-y-3">
                {actions.map((action) => (
                    <div
                        key={action.id}
                        className="flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${action.count > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                                <action.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{action.title}</p>
                                <p className="text-sm text-gray-500">{action.description}</p>
                            </div>
                        </div>
                        <Link
                            href={action.href}
                            className={`px-4 py-2 rounded-full text-sm font-medium text-white transition-colors ${action.count > 0 ? action.actionColor : 'bg-gray-300 cursor-not-allowed'}`}
                        >
                            {action.action}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
