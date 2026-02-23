"use client";

import DataTable, { Column } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import { getOverallStatus } from "@/services/orders.service";
import { CopyButton } from "@/components/ui/copy-button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { deleteOrder } from "@/features/orders/actions";
import { toast } from "sonner";

interface OrdersClientProps {
    orders: any[];
    total: number;
    page: number;
    limit: number;
}

export default function OrdersClient({ orders, total, page, limit }: OrdersClientProps) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const displayOrders = orders.map((o) => {
        const items = o.items || [];
        const productNames = items.map((i: any) => i.product?.name || "Product Deleted");
        const productImages = items.map((i: any) => i.product?.images?.[0]?.url).filter(Boolean);

        return {
            id: o.id,
            orderNumber: o.orderNumber,
            customer: o.user?.name || o.user?.email || 'Guest',
            email: o.user?.email,
            date: new Date(o.createdAt).toLocaleDateString(),
            total: `$${Number(o.total).toFixed(2)}`,
            status: getOverallStatus(o as any),
            productNames,
            productImages,
            itemsCount: items.length
        };
    });

    const columns: Column<any>[] = [
        {
            key: 'product',
            header: 'Product',
            render: (order) => (
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-4 overflow-hidden p-1 shrink-0">
                        {order.productImages.slice(0, 2).map((img: string, idx: number) => (
                            <div
                                key={idx}
                                className="h-10 w-10 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm relative shrink-0 ring-2 ring-white"
                                style={{ zIndex: 10 - idx }}
                            >
                                <img src={img} className="object-cover w-full h-full" alt="" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="font-semibold text-gray-900 truncate max-w-[220px]">
                            {order.productNames[0]}
                        </div>
                        {order.productNames.length > 1 && (
                            <div className="text-[11px] text-gray-400 font-bold truncate max-w-[220px]">
                                {order.productNames[1]}
                            </div>
                        )}
                        {order.productNames.length > 2 && (
                            <span className="text-[9px] text-[#E87A3F] font-black uppercase tracking-tighter">
                                + {order.productNames.length - 2} More Items
                            </span>
                        )}
                        <div className="group/order-id flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-gray-300 font-medium uppercase tracking-widest">ORDER #{order.orderNumber}</span>
                            <CopyButton value={order.orderNumber} hoverOnly className="h-3 w-3 text-gray-300 hover:text-orange-500" />
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'customer',
            header: 'Customer',
            render: (o) => (
                <div className="flex flex-col">
                    <span className="text-gray-900 font-medium truncate max-w-[120px]">{o.customer}</span>
                    <div className="group/email flex items-center gap-1.5 max-w-[120px]">
                        <span className="text-gray-400 text-[11px] truncate">{o.email}</span>
                        <CopyButton value={o.email} hoverOnly className="h-3 w-3 text-gray-300 hover:text-orange-500 shrink-0" />
                    </div>
                </div>
            )
        },
        { key: 'date', header: 'Date', render: (o) => <span className="text-gray-500 font-medium">{o.date}</span> },
        { key: 'total', header: 'Total', render: (o) => <span className="font-bold text-gray-900">{o.total}</span> },
        {
            key: 'status',
            header: 'Status',
            render: (o) => (
                <StatusBadge status={o.status} type="order" />
            )
        },
    ];

    const getActions = (order: any) => [
        {
            label: "View Details",
            onClick: () => router.push(`/admin/orders/${order.id}`),
        },
        {
            label: "Delete Order",
            onClick: () => {
                setSelectedOrderId(order.id);
                setShowDeleteModal(true);
            },
            className: "text-red-600 hover:bg-red-50",
        }
    ];

    const handleDelete = async () => {
        if (!selectedOrderId) return;
        setIsDeleting(true);
        try {
            const res = await deleteOrder(selectedOrderId);
            if (res.success) {
                toast.success("Order deleted successfully");
                setShowDeleteModal(false);
                // Ideally we should refresh the data or remove from list, 
                // but router.refresh() or server action revalidatePath handles it.
                // Since this component receives props, we depend on parent refresh 
                // or router refresh which might not update props immediately without a server trip.
                // Assuming actions.ts calls revalidatePath.
            } else {
                toast.error(res.error || "Failed to delete order");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <>
            <DataTable
                data={displayOrders}
                columns={columns}
                pageSize={limit}
                rowCount={total}
                currentPage={page}
                manualPagination={true}
                searchable
                searchPlaceholder="Search order #, customer, or email..."
                onRowClick={(item) => router.push(`/admin/orders/${item.id}`)}
                actions={getActions}
                filterOptions={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Pending', value: 'PENDING' },
                            { label: 'Processing', value: 'PROCESSING' },
                            { label: 'Shipped', value: 'SHIPPED' },
                            { label: 'Delivered', value: 'DELIVERED' },
                            { label: 'Paid', value: 'PAID' },
                            { label: 'Canceled', value: 'CANCELED' },
                            { label: 'Refunded', value: 'REFUNDED' }
                        ]
                    }
                ]}
            />

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Order"
                message="Are you sure you want to delete this order? This action cannot be undone."
                confirmText="Delete Order"
                type="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
