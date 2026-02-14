"use client";

import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ReturnsDataTableProps {
    data: any[];
}

export default function ReturnsDataTable({ data }: ReturnsDataTableProps) {
    const columns = [
        {
            key: 'id',
            header: 'Refund ID',
            render: (row: any) => <span className="font-mono text-xs">{row.id.substring(0, 8)}...</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => <StatusBadge status={row.status} type="transaction" />
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (row: any) => <span className="font-medium">${row.amount.toFixed(2)}</span>
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.order.user.name}</span>
                    <span className="text-xs text-gray-500">{row.order.user.email}</span>
                </div>
            )
        },
        {
            key: 'reason',
            header: 'Reason',
            render: (row: any) => <span className="text-sm text-gray-600 truncate max-w-[200px]">{row.reason || 'N/A'}</span>
        },
        {
            key: 'createdAt',
            header: 'Requested At',
            render: (row: any) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
        },
        {
            key: 'action',
            header: 'Action',
            render: (row: any) => (
                <Link href={`/admin/refunds/${row.id}`}>
                    <Button variant="ghost" size="sm" className="text-blue-600">View Details</Button>
                </Link>
            )
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            emptyMessage="No return or refund requests found."
        />
    );
}
