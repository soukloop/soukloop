"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    sellerId: string;
    productId: string;
}

interface OrderChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderItems: OrderItem[];
    orderNumber: string;
}

export function OrderChatModal({ isOpen, onClose, orderItems, orderNumber }: OrderChatModalProps) {
    const router = useRouter();
    const [isStartingChat, setIsStartingChat] = useState<string | null>(null);

    const handleStartChat = async (item: OrderItem) => {
        setIsStartingChat(item.id);

        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sellerId: item.sellerId,
                    productId: item.productId,
                }),
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
            setIsStartingChat(null);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Select item from order #${orderNumber}`}
        >
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {orderItems.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No products found for this order.</p>
                ) : (
                    orderItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 border border-gray-100 rounded-lg hover:border-orange-200 transition-colors"
                        >
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-gray-100 border border-gray-200">
                                {item.productImage ? (
                                    <Image
                                        src={item.productImage}
                                        alt={item.productName}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex size-full items-center justify-center bg-gray-100 text-[10px] text-gray-400">
                                        No Img
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                    {item.productName}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 font-medium text-[#E87A3F] border-[#E87A3F] hover:bg-orange-50"
                                onClick={() => handleStartChat(item)}
                                disabled={isStartingChat === item.id}
                            >
                                {isStartingChat === item.id ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading...
                                    </>
                                ) : (
                                    "Chat"
                                )}
                            </Button>
                        </div>
                    ))
                )}
            </div>
        </Modal>
    );
}
