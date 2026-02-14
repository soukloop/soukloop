"use client";

import DataTable from '@/components/admin/DataTable';

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

interface PurchasesTabProps {
    orders: any[];
}

export const purchaseColumns = [
    { key: 'orderNumber', header: 'Order #', render: (o: any) => <span className="font-mono">{o.orderNumber}</span> },
    { key: 'totalAmount', header: 'Total', render: (o: any) => formatCurrency(o.totalAmount || o.total) },
    { key: 'status', header: 'Status', render: (o: any) => <span className={`px-2 py-1 rounded-full text-xs font-bold ${o.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{o.status}</span> },
    { key: 'createdAt', header: 'Date', render: (o: any) => new Date(o.createdAt).toLocaleDateString() }
];

export default function PurchasesTab({ orders }: PurchasesTabProps) {
    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-semibold text-gray-900">Purchase History</h3></div>
            <DataTable columns={purchaseColumns} data={orders} pageSize={10} searchable searchKeys={['orderNumber']} />
        </div>
    );
}
