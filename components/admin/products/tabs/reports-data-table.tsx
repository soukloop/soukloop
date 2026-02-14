"use client";

import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { useRouter } from "next/navigation";

interface ReportsDataTableProps {
    data: any[];
}

export default function ReportsDataTable({ data }: ReportsDataTableProps) {
    const router = useRouter();
    const columns = [
        {
            key: 'reason',
            header: 'Reason',
            render: (row: any) => <span className="font-medium text-gray-900">{row.reason}</span>
        },
        {
            key: 'reporter',
            header: 'Reporter',
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{row.reporter?.name || 'Anonymous'}</span>
                    <span className="text-xs text-gray-500">{row.reporter?.email}</span>
                </div>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => <StatusBadge status={row.status} type="report" />
        },
        {
            key: 'createdAt',
            header: 'Reported At',
            render: (row: any) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString()}</span>
        }
    ];

    return (
        <DataTable
            columns={columns}
            data={data}
            pageSize={10}
            emptyMessage="No reports found for this product."
            onRowClick={(row) => router.push(`/admin/reports/${row.id}`)}
        />
    );
}
