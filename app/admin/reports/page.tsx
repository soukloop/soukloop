"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import { ActionItem } from '@/components/admin/ActionDropdown';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TableSkeleton from '@/components/admin/TableSkeleton';
import useSWR from 'swr';
import { toast } from 'sonner';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Report {
    id: string;
    reporterId: string;
    productId: string | null;
    reportedUserId: string | null;
    reason: string;
    status: string;
    createdAt: string;
    reporter: {
        id: string;
        name: string | null;
        email: string;
    };
    reportedUser: {
        id: string;
        name: string | null;
        email: string;
    } | null;
    product: {
        id: string;
        name: string;
        vendor: {
            user: {
                name: string | null;
            } | null;
        } | null;
    } | null;
}

interface FormattedReport {
    id: string;
    itemType: 'Product' | 'User' | 'Unknown';
    itemId: string;
    reportedBy: string;
    reason: string;
    reportedOn: string;
    status: string;
    itemName: string;
}

export default function ReportedItemsPage() {
    const router = useRouter();
    const { data: reportsData, error, isLoading, mutate } = useSWR('/api/admin?type=reports', fetcher);
    const [showActionModal, setShowActionModal] = useState(false);
    const [showDismissModal, setShowDismissModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState<FormattedReport | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Format reports data
    const reports: FormattedReport[] = (Array.isArray(reportsData) ? reportsData : []).map((r: Report) => ({
        id: r.id,
        itemType: r.productId ? 'Product' : r.reportedUserId ? 'User' : 'Unknown',
        itemId: r.productId || r.reportedUserId || 'N/A',
        reportedBy: r.reporter?.name || r.reporter?.email || 'Unknown',
        reason: r.reason,
        reportedOn: new Date(r.createdAt).toLocaleDateString(),
        status: r.status.charAt(0).toUpperCase() + r.status.slice(1),
        itemName: r.product?.name || r.reportedUser?.name || r.reportedUser?.email || 'Unknown'
    }));

    // Table columns
    const columns: Column<FormattedReport>[] = [
        {
            key: 'id',
            header: 'Report ID',
            render: (item) => <span className="font-medium text-blue-600">#{item.id.slice(0, 8)}</span>,
        },
        {
            key: 'itemType',
            header: 'Type',
            render: (item) => (
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.itemType === 'Product' ? 'bg-blue-100 text-blue-800' :
                    item.itemType === 'User' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {item.itemType}
                </span>
            ),
        },
        {
            key: 'itemName',
            header: 'Reported Item',
            render: (item) => <span className="text-gray-900">{item.itemName}</span>,
        },
        {
            key: 'reportedBy',
            header: 'Reported By',
            render: (item) => <span className="text-gray-600">{item.reportedBy}</span>,
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (item) => <span className="text-gray-600 line-clamp-2">{item.reason}</span>,
        },
        {
            key: 'reportedOn',
            header: 'Date',
            render: (item) => <span className="text-gray-600">{item.reportedOn}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (item) => (
                <StatusBadge
                    status={item.status}
                    type="seller"
                />
            ),
        },
    ];

    // Filter options
    const filterOptions: FilterOption<FormattedReport>[] = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Pending', value: 'Pending' },
                { label: 'Reviewed', value: 'Reviewed' },
                { label: 'Resolved', value: 'Resolved' },
            ]
        },
        {
            key: 'itemType',
            label: 'Type',
            options: [
                { label: 'Product', value: 'Product' },
                { label: 'User', value: 'User' },
            ]
        }
    ];

    // Row actions
    const getActions = (item: FormattedReport): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                label: 'View Details',
                onClick: () => {
                    if (item.itemType === 'Product') {
                        router.push(`/admin/products/${item.itemId}`);
                    } else if (item.itemType === 'User') {
                        toast.info('User profile view coming soon');
                    }
                },
            },
        ];

        if (item.status === 'Pending') {
            actions.push(
                {
                    label: 'Take Action',
                    onClick: () => {
                        setSelectedItem(item);
                        setShowActionModal(true);
                    },
                    className: 'text-orange-600',
                },
                {
                    label: 'Dismiss',
                    onClick: () => {
                        setSelectedItem(item);
                        setShowDismissModal(true);
                    },
                    className: 'text-green-600',
                }
            );
        }

        return actions;
    };

    const handleTakeAction = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'report',
                    reportId: selectedItem.id,
                    action: 'takeAction'
                })
            });

            if (!res.ok) throw new Error('Failed to update report');

            toast.success('Report marked as reviewed');
            mutate();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update report');
        } finally {
            setIsSubmitting(false);
            setShowActionModal(false);
            setSelectedItem(null);
        }
    };

    const handleDismiss = async () => {
        if (!selectedItem) return;
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'report',
                    reportId: selectedItem.id,
                    action: 'dismiss'
                })
            });

            if (!res.ok) throw new Error('Failed to dismiss report');

            toast.success('Report dismissed successfully');
            mutate();
        } catch (error) {
            console.error(error);
            toast.error('Failed to dismiss report');
        } finally {
            setIsSubmitting(false);
            setShowDismissModal(false);
            setSelectedItem(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Reported Items</h1>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {reports.length}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                        {reports.filter(i => i.status === 'Pending').length}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Under Review</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {reports.filter(i => i.status === 'Reviewed').length}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Resolved</p>
                    <p className="text-2xl font-bold text-green-600">
                        {reports.filter(i => i.status === 'Resolved').length}
                    </p>
                </div>
            </div>

            {/* Data Table */}
            {isLoading ? (
                <TableSkeleton rowCount={10} columnCount={7} />
            ) : (
                <DataTable
                    data={reports}
                    columns={columns}
                    pageSize={10}
                    searchable
                    searchPlaceholder="Search reports..."
                    searchKeys={['reportedBy', 'reason', 'itemType', 'itemName'] as (keyof FormattedReport)[]}
                    filterOptions={filterOptions}
                    actions={getActions}
                    onRowClick={(item) => router.push(`/admin/reports/${item.id}`)}
                />
            )}

            {/* Take Action Modal */}
            <ConfirmDialog
                isOpen={showActionModal}
                onClose={() => {
                    setShowActionModal(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleTakeAction}
                title="Take Action on Report"
                message={`Mark this ${selectedItem?.itemType?.toLowerCase()} report as reviewed? You should review the reported content and take appropriate action (block, remove, warn user, etc.) before marking as reviewed.`}
                confirmText="Mark as Reviewed"
                type="warning"
                isLoading={isSubmitting}
            />

            {/* Dismiss Modal */}
            <ConfirmDialog
                isOpen={showDismissModal}
                onClose={() => {
                    setShowDismissModal(false);
                    setSelectedItem(null);
                }}
                onConfirm={handleDismiss}
                title="Dismiss Report"
                message="Are you sure you want to dismiss this report? This means no action will be taken and the report will be marked as resolved."
                confirmText="Dismiss"
                type="success"
                isLoading={isSubmitting}
            />
        </div>
    );
}
