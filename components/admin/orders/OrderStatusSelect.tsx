"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/features/orders/actions";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { OrderStatus } from "@prisma/client";

const statuses: OrderStatus[] = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "PAID",
    "CANCELED",
    "REFUNDED",
];

import TrackingInputModal from "./TrackingInputModal";

interface OrderStatusSelectProps {
    orderId: string;
    currentStatus: OrderStatus;
}

export default function OrderStatusSelect({ orderId, currentStatus }: OrderStatusSelectProps) {
    const router = useRouter();
    const [isUpdating, setIsUpdating] = useState(false);
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) return;

        if (newStatus === "SHIPPED") {
            setPendingStatus(newStatus);
            setShowTrackingModal(true);
            return;
        }

        await updateStatus(newStatus);
    };

    const updateStatus = async (status: string, trackingNumber?: string, carrier?: string) => {
        setIsUpdating(true);
        try {
            const result = await updateOrderStatus(orderId, status, trackingNumber, carrier);
            if (result.success) {
                toast.success(`Order status updated to ${status}`);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update status");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsUpdating(false);
            setShowTrackingModal(false);
            setPendingStatus(null);
        }
    };

    const handleTrackingConfirm = (trackingNumber: string, carrier: string) => {
        if (pendingStatus) {
            updateStatus(pendingStatus, trackingNumber, carrier);
        }
    };

    return (
        <div className="w-[180px]">
            <Select
                disabled={isUpdating}
                value={currentStatus}
                onValueChange={handleStatusChange}
            >
                <SelectTrigger className="h-9 w-full bg-white border-gray-200">
                    <div className="flex items-center gap-2">
                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-orange-500" />}
                        <SelectValue placeholder="Select status" />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                            {status.charAt(0) + status.slice(1).toLowerCase()}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <TrackingInputModal
                isOpen={showTrackingModal}
                onClose={() => {
                    setShowTrackingModal(false);
                    setPendingStatus(null);
                }}
                onConfirm={handleTrackingConfirm}
                isLoading={isUpdating}
            />
        </div>
    );
}
