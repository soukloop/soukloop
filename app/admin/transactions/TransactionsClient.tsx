"use client";

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataTable, { Column } from '@/components/admin/DataTable';
import DataTable, { Column } from '@/components/admin/DataTable';
import StatusBadge from "@/components/admin/StatusBadge";
import { CopyButton } from "@/components/ui/copy-button";

interface TransactionsClientProps {
    data: any[];
    stats: any;
    totalCount: number;
    page: number;
    limit: number;
    activeTab: 'transactions' | 'payouts';
}

export default function TransactionsClient({
    data,
    stats,
    totalCount,
    page,
    limit,
    activeTab
}: TransactionsClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleTabChange = (tab: 'transactions' | 'payouts') => {
        if (tab === activeTab) return;

        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set('type', tab);
            params.set('page', '1');
            // Keep search if exists, or clear it? Usually better to clear search when switching contexts drastically
            params.delete('search');
            router.push(`?${params.toString()}`);
        });
    };

    // Transaction columns
    const transactionColumns: Column<any>[] = [
        {
            key: 'providerTransactionId',
            header: 'Transaction ID',
            key: 'providerTransactionId',
            header: 'Transaction ID',
            render: (t) => (
                <div className="group/tx-id flex items-center gap-1.5">
                    <span className="font-medium text-blue-600">#{t.providerTransactionId || t.id.slice(0, 8).toUpperCase()}</span>
                    <CopyButton value={t.providerTransactionId || t.id} hoverOnly className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                </div>
            )
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (t) => <span className="text-gray-900">{t.user?.name || t.user?.email || 'Unknown'}</span>
        },
        {
            key: 'orderNumber',
            header: 'Order',
            render: (t) => <span className="text-gray-600">{t.order?.orderNumber || 'N/A'}</span>
        },
        {
            key: 'provider',
            header: 'Method',
            render: (t) => <span className="text-gray-600 capitalize">{t.provider || 'Unknown'}</span>
        },
        {
            key: 'createdAt',
            header: 'Date',
            render: (t) => <span className="text-gray-600">{new Date(t.createdAt).toLocaleDateString()}</span>
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (t) => <span className="font-medium text-gray-900">${parseFloat(String(t.amount)).toFixed(2)}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (t) => (
                <StatusBadge status={t.status || 'unknown'} type="transaction" />
            )
        },
    ];

    // Payout columns
    const payoutColumns: Column<any>[] = [
        {
            key: 'id',
            header: 'Payout ID',
            key: 'id',
            header: 'Payout ID',
            render: (p) => (
                <div className="group/payout-id flex items-center gap-1.5">
                    <span className="font-medium text-blue-600">#{p.id.slice(0, 8).toUpperCase()}</span>
                    <CopyButton value={p.id} hoverOnly className="h-3 w-3 text-gray-400 hover:text-blue-600" />
                </div>
            )
        },
        {
            key: 'seller',
            header: 'Seller',
            render: (p) => <span className="text-gray-900">{p.vendor?.user?.name || p.vendor?.user?.email || 'Unknown'}</span>
        },
        {
            key: 'method',
            header: 'Method',
            render: (p) => <span className="text-gray-600 capitalize">{p.method.replace('_', ' ')}</span>
        },
        {
            key: 'createdAt',
            header: 'Date',
            render: (p) => <span className="text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</span>
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (p) => <span className="font-medium text-gray-900">${parseFloat(String(p.amount)).toFixed(2)}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (p) => (
                <StatusBadge status={p.status} type="transaction" />
            )
        },
    ];

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => handleTabChange('transactions')}
                        disabled={isPending}
                        className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${activeTab === 'transactions'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Customer Transactions
                    </button>
                    <button
                        onClick={() => handleTabChange('payouts')}
                        disabled={isPending}
                        className={`whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium transition-colors ${activeTab === 'payouts'
                            ? 'border-orange-500 text-orange-600'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                            } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Seller Payouts
                    </button>
                </nav>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-4">
                {activeTab === 'transactions' ? (
                    <>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Transactions</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Revenue</p>
                            <p className="text-2xl font-bold text-green-600">${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Failed</p>
                            <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Payouts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                            <p className="text-2xl font-bold text-green-600">${stats.completed.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                        </div>
                        <div className="rounded-xl border bg-white p-4 shadow-sm">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Processing</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                        </div>
                    </>
                )}
            </div>

            {/* Data Table */}
            <DataTable
                data={data}
                columns={activeTab === 'transactions' ? transactionColumns : payoutColumns}
                pageSize={limit}
                rowCount={totalCount}
                currentPage={page}
                manualPagination={true}
                isLoading={isPending}
                searchable
                searchPlaceholder={activeTab === 'transactions' ? "Search transactions..." : "Search payouts..."}
                filterOptions={activeTab === 'transactions' ? [
                    { key: 'status', label: 'Status', options: [{ label: 'Completed', value: 'completed' }, { label: 'Pending', value: 'pending' }, { label: 'Failed', value: 'failed' }, { label: 'Refunded', value: 'refunded' }] },
                    { key: 'method', label: 'Payment Method', options: [{ label: 'Stripe', value: 'stripe' }, { label: 'Wallet', value: 'wallet' }, { label: 'Refund', value: 'refund' }] }
                ] : [
                    { key: 'status', label: 'Status', options: [{ label: 'Completed', value: 'completed' }, { label: 'Pending', value: 'pending' }, { label: 'Processing', value: 'processing' }] },
                    { key: 'method', label: 'Payout Method', options: [{ label: 'Stripe Connect', value: 'stripe_connect' }, { label: 'Bank Transfer', value: 'BANK_TRANSFER' }] }
                ]}
            />
        </div>
    );
}
