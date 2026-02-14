"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteOrder } from "@/features/orders/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function OrderActions({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await deleteOrder(orderId);
            if (result.success) {
                toast.success("Order deleted successfully");
                router.push("/admin/orders");
            } else {
                toast.error(result.error || "Failed to delete order");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    };

    return (
        <>
            <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                onClick={() => setShowDeleteModal(true)}
            >
                <Trash2 className="h-4 w-4" />
                Delete Order
            </Button>

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Order"
                message="Are you sure you want to permanently delete this order? This action cannot be undone."
                confirmText="Delete Order"
                type="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
