"use client";

import { useOptimistic, useTransition, useState, useMemo, useEffect } from "react";
import { OrderListTable, DisplayOrder } from "@/app/editprofile/components/my-orders";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { acceptOrderAction } from "@/src/features/seller/actions";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface DashboardOrdersProps {
    initialOrders: DisplayOrder[];
}

export function DashboardOrders({ initialOrders }: DashboardOrdersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Client-side state for the current status filter
    const [currentStatus, setCurrentStatus] = useState(searchParams?.get("status") || "ALL");

    const [optimisticOrders, setOptimisticOrders] = useOptimistic(
        initialOrders,
        (state, updatedOrder: { id: string; status: string }) =>
            state.map(o => o.id === updatedOrder.id ? { ...o, status: updatedOrder.status } : o)
    );

    // Filtered orders calculated locally for "instant" feel
    const filteredOrders = useMemo(() => {
        if (currentStatus === "ALL") return optimisticOrders;
        return optimisticOrders.filter(o => o.status.toUpperCase() === currentStatus.toUpperCase());
    }, [optimisticOrders, currentStatus]);

    const handleStatusFilterChange = (value: string) => {
        setCurrentStatus(value);
        // Sync URL without triggering a full page re-fetch (using window.history for instant feel)
        const params = new URLSearchParams(searchParams?.toString() || "");
        if (value === "ALL") {
            params.delete("status");
        } else {
            params.set("status", value);
        }
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState(null, '', newUrl);
    };

    const handleAcceptOrder = async (orderId: string) => {
        startTransition(async () => {
            setOptimisticOrders({ id: orderId, status: 'PROCESSING' });
            const result = await acceptOrderAction(orderId);
            if (!result.success) {
                toast.error(result.error || "Failed to accept order");
            } else {
                toast.success("Order accepted!");
            }
        });
    };

    return (
        <div className="rounded-[20px] border border-gray-100 bg-white p-4 sm:p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-base font-bold text-gray-900 sm:text-xl">
                    Recent Orders
                </h2>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter:</span>
                    <Select value={currentStatus} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-[160px] h-9 rounded-lg border-none bg-[#F9F9F9] px-4 text-sm font-medium text-gray-500 shadow-none hover:bg-gray-100 focus:ring-0 focus:ring-offset-0 transition-colors">
                            <SelectValue placeholder="All Orders" />
                        </SelectTrigger>
                        <SelectContent align="end" className="border-gray-100 bg-white shadow-xl">
                            <SelectItem value="ALL" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">All Orders</SelectItem>
                            <SelectItem value="PENDING" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">Pending Approval</SelectItem>
                            <SelectItem value="PROCESSING" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">In Processing</SelectItem>
                            <SelectItem value="SHIPPED" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">Shipped</SelectItem>
                            <SelectItem value="DELIVERED" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">Completed</SelectItem>
                            <SelectItem value="CANCELED" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">Canceled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <OrderListTable
                orders={filteredOrders}
                showAcceptColumn={true}
                isLoading={isPending}
                onAccept={handleAcceptOrder}
                onOrderAccepted={() => { }}
                sourceTab="dashboard"
            />
        </div>
    );
}
