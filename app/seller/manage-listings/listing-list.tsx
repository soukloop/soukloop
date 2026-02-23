"use client";

import { useOptimistic, useTransition, useState } from "react";
import ProductCard from "@/components/product-card";
import { Pagination } from "@/components/ui/pagination";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { CopyButton } from "@/components/ui/copy-button";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteProductAction, updateProductStatusAction } from "@/src/features/seller/actions";

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    comparePrice: number | null;
    images: { url: string }[];
    status: string;
    createdAt: string;
    hasPendingStyle?: boolean;
    vendorId: string;
}

interface ListingListProps {
    products: Product[];
    totalPages: number;
    currentPage: number;
    userId: string;
}

type OptimisticAction =
    | { type: 'delete', id: string }
    | { type: 'updateStatus', id: string, status: string };

export default function ListingList({ products, totalPages, currentPage, userId }: ListingListProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    // Confirmation Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [optimisticProducts, setOptimisticProducts] = useOptimistic(
        products,
        (state, action: OptimisticAction) => {
            if (action.type === 'delete') {
                return state.filter(p => p.id !== action.id);
            }
            if (action.type === 'updateStatus') {
                return state.map(p => p.id === action.id ? { ...p, status: action.status } : p);
            }
            return state;
        }
    );

    const handleEdit = (product: any) => {
        router.push(`/seller/post-new-product?edit=${product.id}`);
    };

    const handleDeleteClick = (productId: string) => {
        setProductToDelete(productId);
        setShowDeleteModal(true);
    };

    const performDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);

        // Optimistic update happens immediately via startTransition
        startTransition(async () => {
            setOptimisticProducts({ type: 'delete', id: productToDelete });
            const result = await deleteProductAction(productToDelete);

            setIsDeleting(false);
            setShowDeleteModal(false);
            setProductToDelete(null);

            if (!result.success) {
                toast.error(result.error || "Failed to delete product");
                // Note: To rollback optimistic update, we would need a way to reload or undo.
                // React's useOptimistic doesn't support easy rollback unless we revert state trigger.
                // For now, we assume success or page refresh on error.
                router.refresh();
            } else {
                toast.success("Product deleted successfully");
            }
        });
    };

    const handleStatusUpdate = async (productId: string, status: string, label: string) => {
        startTransition(async () => {
            setOptimisticProducts({ type: 'updateStatus', id: productId, status });
            const result = await updateProductStatusAction(productId, status);
            if (!result.success) {
                toast.error(result.error || `Failed to ${label}`);
            } else {
                toast.success(`Product ${label}ed`);
            }
        });
    };

    const handlePageChange = (page: number) => {
        const url = new URL(window.location.href);
        url.searchParams.set('page', page.toString());
        router.push(url.pathname + url.search);
    };

    if (products.length === 0 && currentPage === 1) {
        return (
            <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl border border-gray-200 bg-white">
                <Package className="size-12 text-gray-300" />
                <p className="text-gray-500">No listings yet. Start by adding a new product.</p>
                <Button
                    onClick={() => router.push("/seller/post-new-product")}
                    className="rounded-full bg-[#E87A3F] px-6 text-white"
                >
                    Add Your First Product
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className={`grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-3 transition-opacity ${isPending ? 'opacity-70' : ''}`}>
                {optimisticProducts.map((item, index) => (
                    <ProductCard
                        key={item.id}
                        priority={index < 6}
                        product={{
                            id: item.id,
                            title: item.name,
                            price: `$${item.price}`,
                            originalPrice: item.comparePrice ? `$${item.comparePrice}` : undefined,
                            image: item.images?.[0]?.url || "/placeholder.svg",
                            daysAgo: undefined, // Handled inside card usually or skip for now
                            description: item.description || "",
                            isWishlist: false,
                            vendorId: item.vendorId,
                            vendorUserId: userId,
                            hasPendingStyle: item.hasPendingStyle,
                            status: item.status,
                            isActive: item.status !== 'INACTIVE' && item.status !== 'BLOCKED',
                            images: item.images,
                            createdAt: item.createdAt
                        } as any}
                        handleAddToCart={() => { }}
                        toggleWishlist={() => { }}
                        onEdit={() => handleEdit(item)}
                        onDelete={() => handleDeleteClick(item.id)}
                        onDeactivate={() => {
                            // Toggle: If currently inactive, activate; otherwise deactivate
                            if (item.status === 'INACTIVE') {
                                handleStatusUpdate(item.id, "ACTIVE", "activate");
                            } else {
                                handleStatusUpdate(item.id, "INACTIVE", "deactivate");
                            }
                        }}
                        onMarkSold={() => handleStatusUpdate(item.id, "SOLD", "mark as sold")}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center border-t border-gray-200 pt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setProductToDelete(null);
                }}
                onConfirm={performDelete}
                title="Delete Product"
                message="Are you sure you want to delete this product? This action cannot be undone."
                confirmText="Delete Product"
                type="danger"
                isLoading={isDeleting}
            />
        </>
    );
}
