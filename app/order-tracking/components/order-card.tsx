"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StatusBadge from "@/components/admin/StatusBadge";
import { OrderChatModal } from "./order-chat-modal";
import { getOverallStatus } from "@/services/orders.service";
import { updateSellerOrderStatus } from "@/features/orders/actions";

interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    quantity: number;
    size: string;
    price: number;
    productId: string;
    sellerId: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string | Date;
    shippedAt: string | Date | null;
    deliveredAt: string | Date | null;
    items: OrderItem[];
    shippingAddress: any;
    total: number;
    userId?: string;
    user?: {
        id?: string;
        name: string;
        email: string;
    };
}

export function OrderCard({ order, isSeller }: { order: Order; isSeller: boolean }) {
    const router = useRouter();
    const [showChatModal, setShowChatModal] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [isApproving, setIsApproving] = useState(false);

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const handleChatClick = async () => {
        if (order.items.length === 1) {
            // Bypass modal, start chat directly for single item
            setIsStartingChat(true);
            const item = order.items[0];
            try {
                const res = await fetch("/api/chat/conversations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(
                        isSeller
                            ? { buyerId: order.user?.id || order.userId, productId: item.productId }
                            : { sellerId: item.sellerId, productId: item.productId }
                    ),
                });
                const data = await res.json();
                if (res.ok) {
                    router.push(`/chats?conversation=${data.id}`);
                } else {
                    toast.error(data.error || "Failed to start chat.");
                }
            } catch (error) {
                console.error(error);
                toast.error("Failed to start chat.");
            } finally {
                setIsStartingChat(false);
            }
        } else if (order.items.length > 1) {
            // Open selection modal for multiple items
            setShowChatModal(true);
        }
    };

    const handleApprove = async () => {
        setIsApproving(true);
        try {
            const res = await updateSellerOrderStatus(order.id, "PROCESSING");
            if (res.success) {
                toast.success("Order approved and moved to processing!");
                router.refresh();
            } else {
                toast.error(res.error || "Failed to approve order.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve order.");
        } finally {
            setIsApproving(false);
        }
    };

    return (
        <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow mb-4 last:mb-0">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-sm font-bold text-[#E87A3F]">
                        #{order.orderNumber}
                    </span>
                    <StatusBadge status={isSeller ? order.status : getOverallStatus(order as any)} type="order" />
                </div>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    {formatDate(order.createdAt)}
                </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {order.items.slice(0, 3).map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                            {item.productImage ? (
                                <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center bg-gray-100 text-xs text-gray-400">No Img</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {item.productName}
                            </p>
                        </div>
                        <span className="text-sm font-bold text-gray-900 mb-auto mt-1">
                            ${Number(item.price).toFixed(2)}
                        </span>
                    </div>
                ))}
                {order.items.length > 3 && (
                    <div className="text-center pt-1">
                        <span className="text-xs text-gray-400 font-medium">+{order.items.length - 3} more items</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                    <Link
                        href={`/track-orders?order=${order.orderNumber}`}
                        className="flex items-center justify-center h-8 px-3 rounded-lg bg-orange-50 text-[#E87A3F] text-xs font-bold hover:bg-[#E87A3F] hover:text-white transition-colors"
                    >
                        Track Order
                    </Link>
                    {isSeller && order.status === "PENDING" && (
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 text-xs font-bold shrink-0 bg-[#E87A3F] hover:bg-[#d66b35] text-white"
                            onClick={handleApprove}
                            disabled={isApproving}
                        >
                            {isApproving ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> ...</> : "Approve Order"}
                        </Button>
                    )}
                    {order.items.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs font-bold shrink-0 border-gray-200 text-gray-700"
                            onClick={handleChatClick}
                            disabled={isStartingChat}
                        >
                            {isStartingChat ? (
                                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> ...</>
                            ) : (
                                "Chat"
                            )}
                        </Button>
                    )}
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-[#E87A3F]">${order.total.toFixed(2)}</p>
                </div>
            </div>

            {/* Chat Selection Modal */}
            <OrderChatModal
                isOpen={showChatModal}
                onClose={() => setShowChatModal(false)}
                orderItems={order.items}
                orderNumber={order.orderNumber}
            />
        </div>
    );
}
