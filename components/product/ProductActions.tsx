
"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart, MessageCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";
import { ProductWithRelations } from "@/types";

interface ProductActionsProps {
    product: ProductWithRelations;
    user: any; // Ideally typed from NextAuth session
}

export default function ProductActions({ product, user }: ProductActionsProps) {
    const router = useRouter();
    const [isStartingChat, setIsStartingChat] = useState(false);
    const sellerId = product.vendorId; // Assuming vendorId corresponds to userId or vendor entity needs mapping
    // Note: In the original code, sellerId was `product.vendor.userId`.
    // We should clarify if `vendorId` on product is the vendor table ID or user ID. 
    // Schema says: Product.vendorId -> Vendor.id. Vendor.userId -> User.id.
    const actualSellerUserId = product.vendor?.userId;

    const handleMessageSeller = async () => {
        if (!user) {
            toast.info("Please login to chat with the seller");
            router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
            return;
        }

        if (!actualSellerUserId) {
            toast.error("Unable to contact seller.");
            return;
        }

        setIsStartingChat(true);
        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId: actualSellerUserId, productId: product.id }),
            });

            if (res.ok) {
                const conversation = await res.json();
                router.push(`/chats?conversation=${conversation.id}`);
            } else {
                const error = await res.json();
                toast.error(error.error || "Failed to start chat");
            }
        } catch (error) {
            toast.error("Failed to start chat");
        } finally {
            setIsStartingChat(false);
        }
    };

    // Owner View
    if (user && actualSellerUserId === user.id) {
        return (
            <Button
                className="w-full rounded-full bg-[#E87A3F] text-base font-semibold tracking-tight hover:bg-[#d96d34] h-12"
                onClick={() => router.push("/seller/manage-listings")}
            >
                Manage Product
            </Button>
        );
    }

    // Buyer View
    return (
        <div className="flex flex-col gap-3 sm:flex-row pt-4">
            <Button className="flex-1 rounded-full bg-[#E87A3F] text-base font-semibold tracking-tight hover:bg-[#d96d34] h-12">
                <ShoppingCart className="mr-2 size-5" />
                Add To Cart
            </Button>
            <Button
                variant="outline"
                className="flex-1 rounded-full border-none bg-orange-50/50 text-base font-semibold text-[#E87A3F] hover:bg-orange-100/50 disabled:opacity-50 h-12"
                disabled={isStartingChat}
                onClick={handleMessageSeller}
            >
                {isStartingChat ? (
                    <Loader2 className="mr-2 size-5 animate-spin" />
                ) : (
                    <MessageCircle className="mr-2 size-5" />
                )}
                {isStartingChat ? "Starting..." : "Message Seller"}
            </Button>
        </div>
    );
}
