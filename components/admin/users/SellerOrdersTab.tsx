"use client";

import { OrderListTable, DisplayOrder } from '@/app/edit-profile/components/my-orders';

interface SellerOrdersTabProps {
    orders: DisplayOrder[];
}

export default function SellerOrdersTab({ orders }: SellerOrdersTabProps) {
    return (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b"><h3 className="font-semibold text-gray-900">Sales Orders</h3></div>
            <OrderListTable orders={orders} showAcceptColumn={false} isLoading={false} sourceTab="all" />
        </div>
    );
}
