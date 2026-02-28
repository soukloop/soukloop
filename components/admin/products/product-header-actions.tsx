"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Ban, CheckCircle, Edit, Globe, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { toast } from "sonner";
import { mutate } from "swr";
import { EditProductModal } from "./edit-product-modal"; // We will create this
import { Product } from "@prisma/client"; // Or specific type

interface ProductHeaderActionsProps {
    product: any; // Use proper type
}

export default function ProductHeaderActions({ product }: ProductHeaderActionsProps) {
    const router = useRouter();
    const { hasPermission } = useAdminAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleStatusChange = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'product', productId: product.id, action: product.isActive ? 'block' : 'activate' })
            });

            if (!res.ok) throw new Error('Failed to update status');
            toast.success(`Product ${product.isActive ? 'blocked' : 'activated'} successfully`);

            // Refund/Refresh logic - Since we are moving to Server Components, we might need router.refresh()
            // But for hybrid, router.refresh() is best.
            router.refresh();
            setShowBlockDialog(false);
        } catch (err) {
            console.error(err);
            toast.error('Failed to update product status');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setSubmitting(true);
        try {
            const res = await fetch(`/api/admin/products/${product.id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Product deleted successfully');
            router.push('/admin/products');
        } catch (err) {
            toast.error('Failed to delete product');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex border-gray-200 text-gray-600"
                onClick={() => window.open(`/product/${product.slug || product.id}`, '_blank')}
            >
                <Globe className="mr-2 h-4 w-4" /> Live Page
            </Button>
            <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>

            {hasPermission('products', 'edit') && (
                <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => setShowEditModal(true)}
                >
                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                </Button>
            )}

            {hasPermission('products', 'block') && (
                <Button
                    variant="outline"
                    size="sm"
                    className={product.isActive ? "text-red-600 border-red-200 hover:bg-red-50" : "text-green-600 border-green-200 hover:bg-green-50"}
                    onClick={() => setShowBlockDialog(true)}
                >
                    {product.isActive ? <Ban className="mr-2 h-4 w-4" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                    {product.isActive ? 'Block' : 'Activate'}
                </Button>
            )}

            {hasPermission('products', 'delete') && (
                <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
            )}

            {/* Dialogs */}
            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={handleDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                isLoading={submitting}
            />

            <ConfirmDialog
                isOpen={showBlockDialog}
                onClose={() => setShowBlockDialog(false)}
                onConfirm={handleStatusChange}
                title={product.isActive ? "Block Product" : "Activate Product"}
                message={`Are you sure you want to ${product.isActive ? 'block' : 'activate'} this product?`}
                confirmText={product.isActive ? "Block" : "Activate"}
                cancelText="Cancel"
                type={product.isActive ? "danger" : "success"}
                isLoading={submitting}
            />

            <EditProductModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                product={product}
                onSuccess={() => router.refresh()}
            />
        </div>
    );
}
