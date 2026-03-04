"use client";

import Link from "next/link";
import Image from "next/image";
import { MoreVertical, PenLine, Trash2, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import AuthPopup from "@/components/auth/auth-popup";
import { isAtLeastSeller, isAtLeastAdmin } from "@/lib/roles";
import WishlistButton from "@/components/ui/wishlist-button";
import { PremiumBadge } from "@/components/ui/premium-badge";

interface Product {
    id: string;
    image: string;
    images?: { url: string }[];
    title: string;
    description?: string;
    price: string;
    originalPrice?: string;
    daysAgo?: string;
    isWishlist: boolean;
    vendorId?: string;
    vendorUserId?: string;
    category?: string;
    size?: string;
    createdAt?: string;
    hasPendingStyle?: boolean;
    averageRating?: number;
    reviewCount?: number;
    isActive?: boolean;
    status?: string;
    quantity?: number;
    slug?: string;
    pendingOrderCount?: number;
    vendor?: {
        planTier?: string;
    };
}

interface ProductCardProps {
    product: Product;
    animatingId?: string | null;
    handleAddToCart: (product: Product) => void | Promise<void>;
    toggleWishlist?: (id: string) => void;
    compact?: boolean;
    priority?: boolean;
    // Manage Props
    onEdit?: (product: Product) => void;
    onDelete?: (id: string) => void;
    onDeactivate?: (id: string) => void;
    onMarkSold?: (id: string) => void;
}

// Helper to check if product is new (within 48 hours)
function isNewProduct(createdAt?: string): boolean {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursDiff <= 48;
}

export default function ProductCard({
    product,
    animatingId,
    handleAddToCart,
    toggleWishlist,
    compact = false,
    priority = false,
    onEdit,
    onDelete,
    onDeactivate,
    onMarkSold,
}: ProductCardProps) {
    const { user } = useAuth();
    const { isItemInCart } = useCart();
    const router = useRouter();

    // Correct Ownership Check:
    // 1. User must be logged in.
    // 2. User must be a Seller (and by implication active, as session validates activity).
    // 3. Product's vendor user ID must match logged-in user's ID.
    const isOwner = user && isAtLeastSeller(user.role) && product.vendorUserId === user.id;

    const isNew = isNewProduct(product.createdAt);
    const isManageMode = !!onEdit; // Infer manage mode

    // Get all images for auto-swipe
    const allImages = product.images && product.images.length > 0
        ? product.images.map(img => img.url)
        : [product.image || "/placeholder.svg"];

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovering, setIsHovering] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Manage Menu State
    const [activeMenu, setActiveMenu] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(false);
            }
        };

        if (activeMenu) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [activeMenu]);


    // Auto-swipe effect on hover
    useEffect(() => {
        if (!isHovering || allImages.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
        }, 1200); // Swipe every 1.2 seconds

        return () => clearInterval(interval);
    }, [isHovering, allImages.length]);

    // Reset to first image when not hovering
    useEffect(() => {
        if (!isHovering) {
            setCurrentImageIndex(0);
        }
    }, [isHovering]);

    const handleCardClick = () => {
        // In manage mode, maybe we don't want to navigate to product details on card click?
        // Or keep behavior consistent. Let's keep it consistent for now.
        router.push(`/product/${product.slug || product.id}`);
    };

    const isSold = (product as any).quantity === 0 || (product as any).status === 'SOLD';
    const isProcessing = (product as any).status === 'PROCESSING';
    const isOutOfStock = !isSold && !isProcessing && (product.quantity ?? 0) <= 0;
    const isDraft = (product as any).status === 'DRAFT';
    // Helper helper to check if product is new (within 48 hours)
    // Only show NEW if NOT sold and NOT draft
    const showNewBadge = isNew && !isManageMode && !isSold && !isDraft;

    return (
        <div
            className={`group flex w-full flex-col rounded-xl bg-white shadow-sm transition-all hover:shadow-md cursor-pointer ${compact ? "p-1.5 sm:p-2" : "p-2 sm:p-4"} ${product.hasPendingStyle ? "opacity-75 grayscale hover:grayscale-0 hover:opacity-100" : ""} ${isItemInCart(product.id) ? "ring-1 ring-[#e0622c]/20 bg-orange-50/10" : ""}`}
            onClick={handleCardClick}
        >
            {/* Image Section */}
            <div
                className="relative mb-2 aspect-square md:aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Manage Mode Overlay Buttons */}
                {isManageMode && (
                    <div className="absolute right-2 top-2 z-30 flex gap-1.5 sm:gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(product);
                            }}
                            className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95 border border-gray-100"
                        >
                            <PenLine className="size-3.5 sm:size-4 text-[#E87A3F]" />
                        </button>

                        <div className="relative" ref={menuRef}>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveMenu(!activeMenu);
                                }}
                                className="flex size-7 sm:size-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95 border border-gray-100"
                            >
                                <MoreVertical className="size-3.5 sm:size-4 text-[#E87A3F]" />
                            </button>

                            {/* Dropdown Menu */}
                            {activeMenu && (
                                <div className="absolute right-0 top-full mt-2 w-40 sm:w-44 origin-top-right rounded-xl border border-gray-100 bg-white p-1 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    {/* Mark as Sold - Only for ACTIVE products */}
                                    {product.status !== 'BLOCKED' && product.status !== 'INACTIVE' && product.status !== 'DRAFT' && product.isActive !== false && !product.hasPendingStyle && product.status !== 'SOLD' && (
                                        <button
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMarkSold?.(product.id);
                                                setActiveMenu(false);
                                            }}
                                        >
                                            <CheckCircle className="size-3.5" />
                                            Mark as Sold
                                        </button>
                                    )}
                                    {/* Activate - Only for user-deactivated (INACTIVE) products */}
                                    {(product.status === 'INACTIVE' || (product.isActive === false && product.status !== 'BLOCKED' && product.status !== 'DRAFT')) && !product.hasPendingStyle && (
                                        <button
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-green-700 hover:bg-green-50 hover:text-green-900 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeactivate?.(product.id);
                                                setActiveMenu(false);
                                            }}
                                        >
                                            <CheckCircle className="size-3.5" />
                                            Activate
                                        </button>
                                    )}
                                    {/* Deactivate - Only for ACTIVE products */}
                                    {product.status !== 'BLOCKED' && product.status !== 'INACTIVE' && product.status !== 'DRAFT' && product.isActive !== false && !product.hasPendingStyle && product.status !== 'SOLD' && (
                                        <button
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeactivate?.(product.id);
                                                setActiveMenu(false);
                                            }}
                                        >
                                            <EyeOff className="size-3.5" />
                                            Deactivate
                                        </button>
                                    )}
                                    {/* Delete Product - Always visible */}
                                    <button
                                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete?.(product.id);
                                            setActiveMenu(false);
                                        }}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete Product
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {product.hasPendingStyle && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 shadow-sm border border-amber-200">
                            Pending Approval
                        </span>
                    </div>
                )}

                {/* Blocked Overlay (Admin-initiated) - Only visible to Owner or Admin */}
                {product.status === 'BLOCKED' && !product.hasPendingStyle && (isOwner || isAtLeastAdmin(user?.role)) && (
                    <div className="absolute inset-0 z-20 flex flex-col gap-2 items-center justify-center bg-red-50/90">
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800 shadow-sm border border-red-200">
                            Blocked by Admin
                        </span>
                    </div>
                )}

                {/* Inactive Overlay (User-initiated) - Only visible to Owner or Admin */}
                {(product.status === 'INACTIVE' || (product.isActive === false && product.status !== 'BLOCKED')) && !product.hasPendingStyle && (isOwner || isAtLeastAdmin(user?.role)) && (
                    <div className="absolute inset-0 z-20 flex flex-col gap-2 items-center justify-center bg-gray-100/90">
                        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs font-bold text-gray-700 shadow-sm border border-gray-300">
                            Inactive
                        </span>
                    </div>
                )}

                {!isImageLoaded && (
                    <Skeleton className="absolute inset-0 h-full w-full bg-gray-200" />
                )}
                <Image
                    src={allImages[currentImageIndex]}
                    alt={product.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className={`object-cover transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'} ${isSold || isDraft ? "grayscale" : ""
                        }`}
                    onLoad={() => setIsImageLoaded(true)}
                />

                {/* BLOCKED Badge */}
                {product.status === 'BLOCKED' && !product.hasPendingStyle && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        BLOCKED
                    </div>
                )}

                {/* INACTIVE Badge (User-deactivated) */}
                {product.status === 'INACTIVE' && !product.hasPendingStyle && (
                    <div className="absolute top-2 left-2 bg-gray-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        INACTIVE
                    </div>
                )}

                {/* NEW Badge - Only for active products */}
                {showNewBadge && product.status !== 'BLOCKED' && product.status !== 'INACTIVE' && (
                    <div className="absolute top-2 left-2 bg-[#E87A3F] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        NEW
                    </div>
                )}

                {/* SOLD Badge (Replaces NEW if Sold) */}
                {isSold && !product.hasPendingStyle && !isProcessing && (
                    <div className="absolute top-2 left-2 bg-gray-900 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        SOLD
                    </div>
                )}

                {/* PROCESSING Badge */}
                {isProcessing && !product.hasPendingStyle && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        PROCESSING
                    </div>
                )}

                {/* DRAFT Badge */}
                {isDraft && !product.hasPendingStyle && (
                    <div className="absolute top-2 left-2 bg-gray-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                        DRAFT
                    </div>
                )}

                {/* Image indicator dots */}
                {allImages.length > 1 && isHovering && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {allImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`size-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className={`flex flex-1 flex-col ${compact ? "gap-0.5" : "gap-1"}`}>
                {/* Title */}
                <h3 className={`font-bold text-gray-900 line-clamp-1 flex items-center gap-1 ${compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>
                    {product.title}
                    {product.vendor?.planTier && (product.vendor.planTier === 'PRO' || product.vendor.planTier === 'STARTER') && (
                        <PremiumBadge tier={product.vendor.planTier} className="inline-flex" iconClassName="size-3.5" />
                    )}
                </h3>

                {/* Category.Size Row */}
                <p className={`text-gray-500 line-clamp-1 ${compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"}`}>
                    {product.category || "Fashion"}{product.size ? ` · ${product.size}` : ""}
                </p>

                {/* Rating */}
                {product.averageRating !== undefined && product.reviewCount !== undefined && product.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                        <svg className={`text-yellow-400 fill-yellow-400 ${compact ? "size-3" : "size-3.5"}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                        <span className={`font-medium text-gray-700 ${compact ? "text-[9px]" : "text-[10px]"}`}>
                            {product.averageRating.toFixed(1)} ({product.reviewCount})
                        </span>
                    </div>
                )}

                {/* Price Row with Wishlist */}
                <div className={`flex items-center justify-between ${compact ? "mb-1" : "mb-1 sm:mb-2"}`}>
                    <div className="flex items-baseline gap-1">
                        <span className={`font-black text-gray-900 ${compact ? "text-base sm:text-lg" : "text-lg sm:text-xl"}`}>
                            {product.price}
                        </span>
                        {product.originalPrice && (
                            <span className={`text-gray-400 line-through ${compact ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"}`}>
                                {product.originalPrice}
                            </span>
                        )}
                    </div>
                    {!isManageMode && !isOwner && (
                        <WishlistButton
                            isWishlisted={product.isWishlist}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (toggleWishlist) {
                                    toggleWishlist(product.id);
                                }
                            }}
                            className="hover:scale-110"
                            size={compact ? "sm" : "md"}
                        />
                    )}
                </div>

                {/* Buttons: Add to Cart OR Manage Buttons OR Sold Box */}
                <div className="mt-auto pt-1">
                    {/* Approve Orders Button for Sellers */}
                    {isManageMode && (product.pendingOrderCount || 0) > 0 && (
                        <div className="w-full mb-2">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // Navigate to orders page, filtered by this product's orders (ideally) 
                                    // or just to pending orders generally. 
                                    // Current Request: "redirect to the specific seller only" -> We can filter dashboard by status.
                                    // Ideally we'd filter by product ID too, but let's start with Status=PENDING|PAID
                                    router.push(`/trackorders?role=seller`); // Simplest for now, or dashboard
                                }}
                                className={`relative flex w-full items-center justify-center rounded-lg font-bold text-white shadow-md transition-all active:scale-95 ${compact ? "py-1.5 text-[10px] sm:text-xs" : "py-2 sm:py-3 text-xs sm:text-sm"} bg-[#00B69B] hover:bg-[#009b84] shadow-emerald-100 border border-[#00B69B]`}
                            >
                                <CheckCircle className={`mr-1.5 ${compact ? "size-3" : "size-4"}`} />
                                Approve ({product.pendingOrderCount})
                            </Button>
                        </div>
                    )}

                    {isManageMode ? (
                        <div className="w-full">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit?.(product);
                                }}
                                className={`relative flex w-full items-center justify-center rounded-lg font-bold text-white shadow-sm transition-all active:scale-95 ${compact ? "py-1.5 text-[10px] sm:text-xs" : "py-2 sm:py-3 text-xs sm:text-sm"} bg-gray-900 hover:bg-black`}
                            >
                                Manage
                            </Button>
                        </div>
                    ) : isDraft ? (
                        // Draft Box (Clickable via card wrapper)
                        <div
                            className={`flex w-full items-center justify-center rounded-lg border border-gray-500 bg-white font-bold text-gray-500 uppercase tracking-wide cursor-pointer hover:bg-gray-50 transition-colors ${compact ? "py-1.5 text-[10px] sm:text-xs" : "py-2 sm:py-3 text-xs sm:text-sm"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) (onEdit as any)(product);
                            }}
                        >
                            Publish Draft
                        </div>
                    ) : isSold ? (
                        // Sold Box (Non-clickable, Orange Border)
                        <div
                            className={`flex w-full items-center justify-center rounded-lg border border-[#E87A3F] bg-white font-bold text-[#E87A3F] uppercase tracking-wide cursor-default ${compact ? "py-1.5 text-[10px] sm:text-xs" : "py-2 sm:py-3 text-xs sm:text-sm"}`}
                            onClick={(e) => {
                                e.stopPropagation(); // prevent card click
                            }}
                        >
                            Sold
                        </div>
                    ) : isProcessing ? (
                        // Processing Box
                        <div
                            className={`flex w-full items-center justify-center rounded-lg border border-blue-600 bg-white font-bold text-blue-600 uppercase tracking-wide cursor-default ${compact ? "py-1.5 text-[10px] sm:text-xs" : "py-2 sm:py-3 text-xs sm:text-sm"}`}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            Processing
                        </div>
                    ) : (
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isOwner) {
                                    router.push(`/seller/post-new-product?edit=${product.id}`);
                                    return;
                                }
                                handleAddToCart(product);
                            }}
                            disabled={(!isOwner && animatingId === product.id) || (!isOwner && isItemInCart(product.id))}
                            className={`relative flex w-full items-center justify-center rounded-lg font-bold text-white shadow-sm transition-all active:scale-95 ${compact ? "py-1.5 text-[10px] sm:text-xs" : "py-2 sm:py-3 text-xs sm:text-sm"} ${isOwner
                                ? "bg-gray-900 hover:bg-black"
                                : isItemInCart(product.id)
                                    ? "bg-[#e0622c]/40 cursor-default"
                                    : "bg-[#e0622c] hover:bg-[#c55424]"
                                }`}
                        >
                            {isOwner ? (
                                "Manage"
                            ) : animatingId === product.id ? (
                                "Adding..."
                            ) : isItemInCart(product.id) ? (
                                "In Cart"
                            ) : (
                                "Add to cart"
                            )}
                            {!isOwner && animatingId === product.id && (
                                <motion.div
                                    initial={{ x: "-100%" }}
                                    animate={{ x: "100%" }}
                                    transition={{ duration: 1.2, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-white/30"
                                />
                            )}
                        </Button>
                    )}
                </div>
            </div>
            {showAuthModal && (
                <div onClick={(e) => e.stopPropagation()}>
                    <AuthPopup
                        isOpen={showAuthModal}
                        onClose={() => setShowAuthModal(false)}
                    />
                </div>
            )}
        </div>
    );
}
