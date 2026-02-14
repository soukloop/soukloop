"use client";

import DataTable from '@/components/admin/DataTable';
import { useRouter } from 'next/navigation';

const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
};

interface SellerProductsTabProps {
    products: any[];
}

export const productColumns = [
    { key: 'name', header: 'Name', render: (p: any) => <span className="font-medium">{p.name}</span> },
    { key: 'price', header: 'Price', render: (p: any) => formatCurrency(p.price) },
    { key: 'quantity', header: 'Stock' },
    {
        key: 'isActive',
        header: 'Status',
        render: (p: any) => {
            if (p.hasPendingStyle) {
                return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Pending Style</span>;
            }
            return <span className={`px-2 py-1 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{p.isActive ? 'Active' : 'Inactive'}</span>;
        }
    }
];

export default function SellerProductsTab({ products }: SellerProductsTabProps) {
    const router = useRouter();

    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-semibold text-gray-900">Product Inventory</h3></div>
            <DataTable
                columns={productColumns}
                data={products}
                pageSize={10}
                searchable
                searchKeys={['name']}
                onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
            />
        </div>
    );
}
