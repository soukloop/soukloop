'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import { CopyButton } from "@/components/ui/copy-button";
import { ActionItem } from '@/components/admin/ActionDropdown';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { adminProductsKeys } from '@/hooks/queries/admin/use-admin-products';

// Define Product Type for the Table
type Product = {
    id: string;
    thumbnail: string;
    productName: string;
    sellerName: string;
    sellerId: string;
    category: string;
    dressStyle: string;
    dressStyleId?: string;
    dressStyleStatus: string;
    hasPendingStyle: boolean;
    submittedOn: string;
    status: string;
    isActive: boolean;
    price: number;
    description: string;
};

type ProductsTableProps = {
    initialProducts: Product[];
    totalRecords: number;
    initialPage: number;
    pageSize?: number;
    categories: string[];
    dressStyles: string[];
};

export default function ProductsTable({
    initialProducts,
    totalRecords,
    initialPage,
    pageSize = 10,
    categories,
    dressStyles
}: ProductsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    // Client-side state for modal actions
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Actions Logic ---

    const handleBlockToggle = async () => {
        if (!selectedProduct) return;
        setIsSubmitting(true);

        try {
            const action = selectedProduct.status === 'Active' ? 'reject' : 'approve';
            const res = await fetch('/api/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'product',
                    productId: selectedProduct.id,
                    action
                })
            });

            if (!res.ok) throw new Error('Failed to update product status');

            toast.success(`Product ${action === 'reject' ? 'blocked' : 'unblocked'} successfully`);

            // Refresh server data
            router.refresh();

            // Invalidate query if used elsewhere (though we are moving to server params)
            queryClient.invalidateQueries({ queryKey: adminProductsKeys.all });

        } catch (error) {
            console.error(error);
            toast.error('Failed to update product status');
        } finally {
            setIsSubmitting(false);
            setShowBlockModal(false);
            setSelectedProduct(null);
        }
    };

    const handleDelete = async () => {
        if (!selectedProduct) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete product');
            }

            toast.success('Product deleted successfully');
            router.refresh();
            queryClient.invalidateQueries({ queryKey: adminProductsKeys.all });

        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to delete product');
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false);
            setSelectedProduct(null);
        }
    };

    // --- Table Config ---

    const columns: Column<Product>[] = [
        {
            key: 'thumbnail',
            header: 'Product',
            render: (product) => (
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => router.push(`/admin/products/${product.id}`)}
                >
                    <img
                        src={product.thumbnail}
                        alt={product.productName}
                        className="h-12 w-12 rounded-lg object-cover ring-1 ring-gray-200 group-hover:ring-[#E87A3F] transition-all flex-shrink-0"
                    />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900 group-hover:text-[#E87A3F] transition-colors truncate max-w-[140px] sm:max-w-xs" title={product.productName}>
                                {product.productName}
                            </p>
                            <CopyButton value={product.id} hoverOnly className="h-3 w-3 text-gray-400 hover:text-[#E87A3F]" />
                        </div>
                        <p className="text-xs text-gray-500">${product.price}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'sellerName',
            header: 'Seller',
            className: 'hidden sm:table-cell',
            render: (product) => (
                <span
                    className="text-gray-600 hover:text-[#E87A3F] hover:underline cursor-pointer truncate max-w-[150px] inline-block align-middle"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (product.sellerId) {
                            router.push(`/admin/sellers/${product.sellerId}`);
                        }
                    }}
                >
                    {product.sellerName}
                </span>
                {
            product.sellerId && (
                <CopyButton value={product.sellerId} hoverOnly className="h-3 w-3 text-gray-400 hover:text-[#E87A3F] ml-1" />
            )
        }
            ),
},
{
    key: 'category',
        header: 'Category',
            className: 'hidden md:table-cell',
                render: (product) => (
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                        {product.category}
                    </span>
                ),
        },
{
    key: 'dressStyle',
        header: 'Dress Style',
            className: 'hidden lg:table-cell',
                render: (product) => (
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${product.dressStyleStatus === 'pending' || product.hasPendingStyle
                        ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                        : 'bg-purple-50 text-purple-700 ring-purple-700/10'
                        }`}>
                        {product.dressStyle}
                        {(product.dressStyleStatus === 'pending' || product.hasPendingStyle) && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        )}
                    </span>
                ),
        },
{
    key: 'submittedOn',
        header: 'Listed On',
            className: 'hidden xl:table-cell',
                render: (product) => <span className="text-gray-600">{product.submittedOn}</span>,
        },
{
    key: 'status',
        header: 'Status',
            render: (product) => {
                if (product.status === 'Pending Style') {
                    return (
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                            Inactive (Pending Style)
                        </span>
                    );
                }
                return <StatusBadge status={product.status} type="product" />;
            }
},
    ];

const filterOptions: FilterOption<Product>[] = [
    {
        key: 'status',
        label: 'Status',
        options: [
            { label: 'Active', value: 'Active' },
            { label: 'Blocked', value: 'Blocked' },
            { label: 'Pending Style', value: 'Pending Style' },
        ]
    },
    {
        key: 'category',
        label: 'Category',
        options: categories.map(cat => ({ label: cat, value: cat }))
    },
    {
        key: 'dressStyle',
        label: 'Dress Style',
        options: dressStyles.map(ds => ({ label: ds, value: ds }))
    }
];

const getActions = (product: Product): ActionItem[] => {
    const actions: ActionItem[] = [
        {
            label: 'View Details',
            onClick: () => router.push(`/admin/products/${product.id}`),
        },
        // Permission checks handled by API, UI just shows buttons. 
    ];

    // Specific logic for Pending Dress Style
    if (product.dressStyleStatus === 'pending' && product.dressStyleId) {
        actions.push({
            label: 'Approve Dress Style',
            onClick: () => router.push(`/admin/dress-styles/${product.dressStyleId}`),
            className: 'text-blue-600 font-medium'
        });
    }

    // Only show Block/Unblock if NOT pending approval for dress style
    if (product.dressStyleStatus !== 'pending') {
        if (product.isActive) {
            actions.push({
                label: 'Block Product',
                onClick: () => {
                    setSelectedProduct(product);
                    setShowBlockModal(true);
                },
                className: 'text-orange-600',
            });
        } else {
            actions.push({
                label: 'Unblock Product',
                onClick: () => {
                    setSelectedProduct(product);
                    setShowBlockModal(true);
                },
                className: 'text-green-600',
            });
        }
    }

    actions.push({
        label: 'Delete',
        onClick: () => {
            setSelectedProduct(product);
            setShowDeleteModal(true);
        },
        className: 'text-red-600',
    });

    return actions;
};

return (
    <>
        <DataTable
            data={initialProducts}
            columns={columns}
            rowCount={totalRecords}
            currentPage={initialPage}
            pageSize={pageSize}
            searchable
            searchPlaceholder="Search products or sellers..."
            searchKeys={['productName', 'sellerName', 'category']} // Handled by server search
            filterOptions={filterOptions}
            actions={getActions}
            onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
            manualPagination={true} // Enable server-side mode
        />

        {/* Block/Unblock Modal */}
        {/* Block/Unblock Modal */}
        <ConfirmDialog
            isOpen={showBlockModal}
            onClose={() => {
                setShowBlockModal(false);
                setSelectedProduct(null);
            }}
            onConfirm={handleBlockToggle}
            title={selectedProduct?.status === 'Active' ? 'Block Product' : 'Unblock Product'}
            message={
                selectedProduct?.status === 'Active'
                    ? `Are you sure you want to block "${selectedProduct?.productName}"? It will no longer be visible to customers.`
                    : `Are you sure you want to unblock "${selectedProduct?.productName}"? It will be visible to customers again.`
            }
            confirmText={selectedProduct?.status === 'Active' ? 'Block' : 'Unblock'}
            type={selectedProduct?.status === 'Active' ? 'danger' : 'success'}
            isLoading={isSubmitting}
        />

        {/* Delete Modal */}
        <ConfirmDialog
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            title="Delete Product"
            message={`Are you sure you want to delete "${selectedProduct?.productName}"? This action cannot be undone.`}
            type="danger"
            isLoading={isSubmitting}
        />
    </>
);
}
