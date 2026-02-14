"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/features/orders/actions";
import { toast } from "sonner";
import { ChevronDown, Loader2 } from "lucide-react";

const statuses = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "PAID",
    "CANCELED",
    "REFUNDED",
];

export default function OrderStatusActions({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        setIsUpdating(true);
        try {
            const result = await updateOrderStatus(orderId, newStatus);
            if (result.success) {
                toast.success(`Order status updated to ${newStatus}`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <select
                disabled={isUpdating}
                value={currentStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="appearance-none block w-full bg-white border border-gray-200 text-gray-700 py-2 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-300"
            >
                {statuses.map((status) => (
                    <option key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                {isUpdating ? (
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : (
                    <ChevronDown className="h-4 w-4" />
                )}
            </div>
        </div>
    );
}
