"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
    Star,
    Heart,
    ShoppingCart,
    MessageCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    AlertCircle,
    Share2,
    Check,
    Package,
    ShieldCheck,
    Truck,
    Info,
    MapPin,
    X,
} from "lucide-react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductSkeleton } from "@/components/ui/skeletons";
import { useProduct } from "@/hooks/useProducts";
import { useReviews, useReviewAnalytics } from "@/hooks/useReviews";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import FooterSection from "@/components/footer-section";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/hooks/useProducts";
import ReviewsSection from "@/app/product/components/reviews-section";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { isAtLeastAdmin } from "@/lib/roles";

export default function ProductContent({ slug }: { slug?: string }) {
    const params = useParams();
    // params?.slug or slug prop will be the slug
    const productId = slug || params?.slug as string;
    const router = useRouter();

    const [selectedSize, setSelectedSize] = useState("Medium");

    const [activeTab, setActiveTab] = useState("Description");
    const [selectedImage, setSelectedImage] = useState(0); // Index for images, -1 means video is selected
    const [isVideoSelected, setIsVideoSelected] = useState(false); // Track if video is showing in main display
    const [isLightboxOpen, setIsLightboxOpen] = useState(false); // New state for lightbox
    const [zoomStyle, setZoomStyle] = useState({}); // New state for zoom effect
    const [isStartingChat, setIsStartingChat] = useState(false);
    const [isWishlist, setIsWishlist] = useState(false); // Placeholder for wishlist state

    const { addItem, isItemInCart } = useCart();

    const handleAddToCart = async (product: any) => {
        await addItem(product.id, 1);
        toast.success("Product added successfully");
    };

    // Fetch product data from backend
    const { data: product, isLoading, error } = useProduct(productId);

    // Fetch reviews
    const {
        reviews,
        isLoading: isLoadingReviews,
        averageRating,
        totalReviews,
        createReview,
    } = useReviews(productId);

    // NO LONGER NEEDED: Canonicalize URL to use Slug
    // Since we are already on [id] route, using the slug as the ID creates the correct URL automatically.
    // E.g. /product/slug-name. 
    // If the user visits /product/ID, we CAN redirect to /product/SLUG.

    useEffect(() => {
        if (product && (product as any).slug && productId !== (product as any).slug) {
            // Replace current URL with slug version
            router.replace(`/product/${(product as any).slug}`, { scroll: false });
        }
    }, [product, productId, router]);

    const { getRatingBreakdown } = useReviewAnalytics(productId);
    const { user } = useAuth();

    // Get vendor/seller info for recommendations
    const vendorUserId = (product as any)?.vendor?.userId;
    const productOccasion = (product as any)?.occasion;
    const productDress = (product as any)?.dress;
    const productBrand = (product as any)?.brand;
    const productLocation = (product as any)?.location;

    // Recommendations data - each section fetches its own data
    const { data: sellerProducts } = useProducts({
        params: vendorUserId ? { userId: vendorUserId, limit: 8 } : undefined
    });

    const { data: occasionProducts } = useProducts({
        params: productOccasion ? { occasion: productOccasion, limit: 8 } : undefined
    });

    const { data: dressProducts } = useProducts({
        params: productDress ? { dress: productDress, limit: 8 } : undefined
    });

    const { data: brandProducts } = useProducts({
        params: productBrand ? { brand: productBrand, limit: 8 } : undefined
    });

    const { data: locationProducts } = useProducts({
        params: productLocation ? { location: productLocation, limit: 8 } : undefined
    });

    // Use real product images from API, fallback to placeholder
    const productImages =
        (product as any)?.images?.length > 0
            ? (product as any).images.map((img: any) => img.url)
            : ["/images/placeholder.png"];


    // Get vendor info
    const vendor = (product as any)?.vendor;
    const sellerName = vendor?.businessName || vendor?.user?.name || "Seller";
    const sellerId = vendor?.userId;

    // Handle Message Seller
    const handleMessageSeller = async () => {
        if (!user) {
            router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
            return;
        }

        if (!sellerId) {
            // alert("Unable to contact seller.");
            return;
        }

        setIsStartingChat(true);
        try {
            const res = await fetch("/api/chat/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sellerId, productId }),
            });

            if (res.ok) {
                const conversation = await res.json();
                router.push(`/chats?conversation=${conversation.id}`);
            } else {
                const error = await res.json();
                alert(error.error || "Failed to start chat");
            }
        } catch (error) {
            alert("Failed to start chat");
        } finally {
            setIsStartingChat(false);
        }
    };

    // Hover zoom effect for product image
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;

        setZoomStyle({
            transformOrigin: `${xPercent}% ${yPercent}%`,
            transform: 'scale(2.5)',
            transition: 'transform 0.1s ease-out',
        });
    }, []);

    const handleMouseLeave = useCallback(() => {
        setZoomStyle({});
    }, []);

    // Placeholder for wishlist toggle
    const toggleWishlist = (id: string) => {
        setIsWishlist(prev => !prev);
        // Implement actual wishlist logic here
        alert(isWishlist ? "Removed from wishlist!" : "Added to wishlist!");
    };

    // Record Recently Viewed - MOVED TO PAGE LOAD
    // Increment View Count
    useEffect(() => {
        // Only increment if productId exists and is not empty
        if (productId) {
            // Record Local & API History
            if (product) { // Ensure product loaded before history
                // 1. LocalStorage
                const recentlyViewedStr = localStorage.getItem("recentlyViewed") || "[]";
                let recentlyViewed = JSON.parse(recentlyViewedStr);
                recentlyViewed = recentlyViewed.filter((id: string) => id !== productId);
                recentlyViewed.unshift(productId);
                localStorage.setItem("recentlyViewed", JSON.stringify(recentlyViewed.slice(0, 12)));

                // 2. API
                if (user) {
                    fetch("/api/recently-viewed", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId }),
                    }).catch(err => console.error("Failed to sync recently viewed:", err));
                }
            }

            // View count increment
            const timer = setTimeout(() => {
                fetch(`/api/products/${productId}/view`, { method: "POST" })
                    .catch(err => console.error("Failed to increment view count:", err));
            }, 1000);

            return () => clearTimeout(timer);
        }
    }, [productId, product, user]);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Removed - Handled by Wrapper */}

            {/* Main Content */}
            <main className="bg-white py-12">
                <div className="container mx-auto px-4">

                    {/* Pending Approval Banner */}
                    {(product as any)?.hasPendingStyle && (user && (sellerId === user.id || isAtLeastAdmin(user.role))) && (
                        <div className="mb-6 rounded-lg bg-yellow-50 p-4 text-yellow-800 border border-yellow-200 flex items-start gap-3">
                            <AlertCircle className="size-5 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-bold">Pending Approval</h3>
                                <p className="text-sm mt-1">
                                    This product is currently pending approval because its Dress Style is under review.
                                    It is not visible to the public until approved.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading State - Shimmer Skeleton */}
                    {isLoading && <ProductSkeleton />}

                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="flex h-96 items-center justify-center">
                            <div className="flex flex-col items-center gap-3 text-center">
                                <AlertCircle className="size-12 text-red-500" />
                                <div>
                                    <p className="font-semibold text-gray-900">
                                        Failed to load product
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {error.message || "Please try again later"}
                                    </p>
                                </div>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="bg-[#E87A3F] hover:bg-[#d96d34]"
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Product Content */}
                    {!isLoading && !error && product && (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                            {/* Product Images */}
                            <div className="space-y-4">
                                {/* Main Image/Video Display */}
                                <div
                                    className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 cursor-zoom-in"
                                    onMouseMove={!isVideoSelected ? handleMouseMove : undefined}
                                    onMouseLeave={!isVideoSelected ? handleMouseLeave : undefined}
                                    onClick={() => !isVideoSelected && setIsLightboxOpen(true)}
                                >
                                    {isVideoSelected && (product as any).video ? (
                                        // Video Display
                                        <video
                                            src={(product as any).video}
                                            controls
                                            autoPlay
                                            className="h-full w-full object-contain bg-gray-900"
                                        >
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        // Image Display
                                        <img
                                            src={product && (product as any).images && (product as any).images.length > 0
                                                ? (product as any).images[selectedImage]?.url
                                                : (product as any).image || "/images/placeholder.png"}
                                            alt={(product as any).name}
                                            className="h-full w-full object-contain bg-gray-50 transition-transform duration-200 ease-out"
                                            style={zoomStyle}
                                        />
                                    )}

                                    {/* Wishlist Button Overlay */}
                                    <div className="absolute right-4 top-4 z-10">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="size-11 rounded-full bg-white/90 shadow-md backdrop-blur-sm hover:bg-white hover:scale-110 transition-all border-none"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleWishlist(productId);
                                            }}
                                        >
                                            <Heart
                                                className={`size-6 ${isWishlist ? "fill-red-500 text-red-500" : "text-gray-400"
                                                    }`}
                                            />
                                        </Button>
                                    </div>

                                    {/* Lightbox Trigger Hint - Only for images */}
                                    {!isVideoSelected && (
                                        <div className="absolute bottom-4 right-4 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Click for Fullscreen</p>
                                        </div>
                                    )}

                                    {/* Navigation arrows - Only for images */}
                                    {!isVideoSelected && productImages.length > 1 && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
                                                }}
                                            >
                                                <ChevronLeft className="size-6 text-gray-900" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
                                                }}
                                            >
                                                <ChevronRight className="size-6 text-gray-900" />
                                            </Button>
                                        </>
                                    )}
                                </div>

                                {/* Lightbox Modal */}
                                {isLightboxOpen && (
                                    <div
                                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 transition-opacity cursor-zoom-out"
                                        onClick={() => setIsLightboxOpen(false)}
                                    >
                                        {/* Close Button */}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-6 top-6 size-12 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsLightboxOpen(false);
                                            }}
                                        >
                                            <X className="size-8" />
                                        </Button>

                                        {/* Left Arrow */}
                                        {productImages.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage((prev) => (prev > 0 ? prev - 1 : productImages.length - 1));
                                                }}
                                            >
                                                <ChevronLeft className="size-8" />
                                            </Button>
                                        )}

                                        {/* Right Arrow */}
                                        {productImages.length > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 size-12 sm:size-14 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedImage((prev) => (prev < productImages.length - 1 ? prev + 1 : 0));
                                                }}
                                            >
                                                <ChevronRight className="size-8" />
                                            </Button>
                                        )}

                                        {/* Image */}
                                        <img
                                            src={productImages[selectedImage]}
                                            alt={(product as any).name}
                                            className="max-h-[90vh] max-w-[90vw] object-contain"
                                            onClick={(e) => e.stopPropagation()}
                                        />

                                        {/* Image Counter */}
                                        {productImages.length > 1 && (
                                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm font-medium px-4 py-2 rounded-full">
                                                {selectedImage + 1} / {productImages.length}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Thumbnail Images + Video */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {/* Image Thumbnails */}
                                    {productImages.map((img: string, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => {
                                                setSelectedImage(index);
                                                setIsVideoSelected(false);
                                            }}
                                            className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${!isVideoSelected && index === selectedImage ? "border-[#E87A3F] scale-95 shadow-inner" : "border-transparent hover:border-gray-200"
                                                }`}
                                        >
                                            <img src={img} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                        </button>
                                    ))}

                                    {/* Video Thumbnail */}
                                    {(product as any).video && (
                                        <button
                                            onClick={() => {
                                                setIsVideoSelected(true);
                                            }}
                                            className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${isVideoSelected ? "border-[#E87A3F] scale-95 shadow-inner" : "border-transparent hover:border-gray-200"
                                                }`}
                                        >
                                            {/* Video thumbnail using first frame */}
                                            <video
                                                src={(product as any).video}
                                                className="h-full w-full object-cover"
                                                muted
                                                preload="metadata"
                                            />
                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <div className="flex size-8 items-center justify-center rounded-full bg-white/90 shadow-md">
                                                    <svg className="size-4 text-[#E87A3F] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>
                                    )}
                                </div>
                            </div>


                            {/* Product Details */}
                            <div className="space-y-6">


                                {/* Title & Price */}
                                <div className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                                                {(product as any).name}
                                            </h1>
                                            <Link
                                                href={`/category?name=${(product as any).category}`}
                                                className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                                            >
                                                {(product as any).category || "Premium Listing"}
                                            </Link>
                                        </div>
                                        {((product as any).comparePrice && (product as any).comparePrice > (product as any).price) && (
                                            <div className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                                                {Math.round(((product as any).comparePrice - (product as any).price) / (product as any).comparePrice * 100)}% OFF
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-baseline gap-4">
                                        <span className="text-4xl font-black text-[#E87A3F]">
                                            ${(product as any).price}
                                        </span>
                                        {(product as any).comparePrice && (
                                            <span className="text-xl text-gray-400 line-through decoration-red-400/50">
                                                ${(product as any).comparePrice}
                                            </span>
                                        )}
                                    </div>
                                    {/* Posted date */}
                                    {(product as any).createdAt && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {(() => {
                                                const created = new Date((product as any).createdAt);
                                                const now = new Date();
                                                const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                                                if (daysDiff === 0) return "Listed today";
                                                if (daysDiff === 1) return "Listed 1 day ago";
                                                if (daysDiff < 7) return `Listed ${daysDiff} days ago`;
                                                if (daysDiff < 30) return `Listed ${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''} ago`;
                                                return `Listed ${Math.floor(daysDiff / 30)} month${Math.floor(daysDiff / 30) > 1 ? 's' : ''} ago`;
                                            })()}
                                        </p>
                                    )}
                                </div>


                                {/* Product Attributes (Static) */}
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Size</span>
                                        <span className="text-lg font-medium text-gray-900">{(product as any).size || "Standard"}</span>
                                    </div>
                                    <div className="h-10 w-px bg-gray-100 mx-2" />
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Condition</span>
                                        <span className="text-lg font-medium text-gray-900">{(product as any).condition || "New"}</span>
                                    </div>
                                </div>

                                {/* Specifications Pills */}
                                <div className="flex flex-wrap gap-2 pt-2">
                                    {[
                                        { val: (product as any).brand, isLoc: false },
                                        { val: (product as any).fabric, isLoc: false },
                                        { val: (product as any).dress, isLoc: false },
                                        { val: (product as any).occasion, isLoc: false },
                                        { val: (product as any).gender, isLoc: false },
                                        { val: (product as any).location, isLoc: true },
                                    ].filter(s => s.val).map((spec, i) => (
                                        <div key={i} className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-medium text-gray-500 flex items-center gap-1">
                                            {spec.isLoc && <MapPin className="size-3" />}
                                            <span className="text-gray-900">{spec.val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Buttons - Moved up before description */}
                                <div className="flex flex-col gap-3 sm:flex-row pt-4">
                                    {user && sellerId === user.id ? (
                                        <Button
                                            className="w-full rounded-full bg-[#E87A3F] text-base font-semibold tracking-tight hover:bg-[#d96d34] h-12"
                                            onClick={() => router.push("/seller/manage-listings")}
                                        >
                                            Manage Product
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                className={`flex-1 rounded-full text-base font-semibold tracking-tight h-12 ${(product as any).status === 'SOLD'
                                                    ? "bg-gray-400 cursor-not-allowed"
                                                    : isItemInCart(productId)
                                                        ? "bg-[#e0622c]/40 cursor-default"
                                                        : "bg-[#E87A3F] hover:bg-[#d96d34]"
                                                    }`}
                                                disabled={(product as any).status === 'SOLD' || isItemInCart(productId)}
                                                onClick={() => handleAddToCart(product)}
                                            >
                                                <ShoppingCart className="mr-2 size-5" />
                                                {(product as any).status === 'SOLD' ? "Sold Out" : isItemInCart(productId) ? "In Cart" : "Add To Cart"}
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
                                        </>
                                    )}
                                </div>

                                {/* Description - Moved down */}
                                <div className="pt-4 border-t border-gray-100 mt-4">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                                    <p className="text-base leading-relaxed text-gray-600">
                                        {(product as any).description || "No description available."}
                                    </p>
                                </div>


                                {/* Share Link */}
                                <div className="flex items-center justify-center pt-4">
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Link copied to clipboard!");
                                        }}
                                        className="flex items-center gap-2 text-sm font-bold text-gray-400 transition-colors hover:text-[#E87A3F]"
                                    >
                                        <Share2 className="size-5" />
                                        <span>Share This Product</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Minimal Merchant Section */}
                    {!isLoading && !error && product && (
                        <div className="mt-16 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center space-x-4">
                                    {(vendor?.user?.profile?.avatar || vendor?.user?.image || vendor?.logo) ? (
                                        <img
                                            src={vendor.user?.profile?.avatar || vendor.user?.image || vendor.logo}
                                            alt={sellerName}
                                            className="size-12 sm:size-14 shrink-0 rounded-full object-cover ring-2 ring-gray-100"
                                        />
                                    ) : (
                                        <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#E87A3F] to-[#d96d34] font-black text-white text-lg sm:text-xl">
                                            {sellerName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate">{sellerName}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <div className="flex text-yellow-400">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`size-3 sm:size-3.5 ${star <= Math.round(vendor?.averageRating ?? vendor?.rating ?? 4.5) ? "fill-current" : "text-gray-200"}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-xs sm:text-sm font-bold text-gray-600">
                                                {vendor?.averageRating ? vendor.averageRating.toFixed(1) : (vendor?.rating || "4.8")}
                                                {vendor?.reviewCount ? ` (${vendor.reviewCount})` : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-8 rounded-full h-10 sm:h-12 text-sm sm:text-base" asChild>
                                    <Link href={`/sellerprofile?id=${sellerId}`}>View Profile</Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* REVIEWS SECTION */}
                    {!isLoading && !error && product && (
                        <ReviewsSection productId={productId} />
                    )}

                    {/* Horizontal Sections */}
                    {!isLoading && !error && product && (
                        <div className="mt-16 space-y-12">
                            {/* 1. More from this seller */}
                            {sellerProducts?.items && sellerProducts.items.filter((p: any) => p.id !== productId).length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                            More From This Seller
                                        </h2>
                                        <Button variant="link" className="text-[#E87A3F] font-bold text-sm" asChild>
                                            <Link href={`/products?userId=${vendorUserId}`}>View All</Link>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {sellerProducts.items
                                            .filter((p: any) => p.id !== productId)
                                            .slice(0, 6)
                                            .map((p: any) => (
                                                <ProductCard
                                                    key={p.id}
                                                    compact
                                                    product={{
                                                        id: p.id,
                                                        image: (p.images && p.images.length > 0) ? p.images[0].url : (p.image || "/images/placeholder.png"),
                                                        title: p.name || p.title,
                                                        category: p.category,
                                                        size: p.size,
                                                        price: `$${p.price}`,
                                                        originalPrice: p.comparePrice ? `$${p.comparePrice}` : "",
                                                        isWishlist: false,
                                                        vendorId: p.vendorId,
                                                        vendorUserId: p.vendor?.userId,
                                                        createdAt: p.createdAt,
                                                    }}
                                                    handleAddToCart={() => console.log("Added to cart", p.id)}
                                                    toggleWishlist={() => console.log("Toggle wishlist", p.id)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* 2. For this occasion */}
                            {occasionProducts?.items && productOccasion && occasionProducts.items.filter((p: any) => p.id !== productId).length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                            For {productOccasion}
                                        </h2>
                                        <Button variant="link" className="text-[#E87A3F] font-bold text-sm" asChild>
                                            <Link href={`/products?occasion=${productOccasion}`}>View All</Link>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {occasionProducts.items
                                            .filter((p: any) => p.id !== productId)
                                            .slice(0, 6)
                                            .map((p: any) => (
                                                <ProductCard
                                                    key={p.id}
                                                    compact
                                                    product={{
                                                        id: p.id,
                                                        image: (p.images && p.images.length > 0) ? p.images[0].url : (p.image || "/images/placeholder.png"),
                                                        title: p.name || p.title,
                                                        category: p.category,
                                                        size: p.size,
                                                        price: `$${p.price}`,
                                                        originalPrice: p.comparePrice ? `$${p.comparePrice}` : "",
                                                        isWishlist: false,
                                                        vendorId: p.vendorId,
                                                        vendorUserId: p.vendor?.userId,
                                                        createdAt: p.createdAt,
                                                    }}
                                                    handleAddToCart={() => console.log("Added to cart", p.id)}
                                                    toggleWishlist={() => console.log("Toggle wishlist", p.id)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* 3. For more Dress Type */}
                            {dressProducts?.items && productDress && dressProducts.items.filter((p: any) => p.id !== productId).length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                            For More {productDress}
                                        </h2>
                                        <Button variant="link" className="text-[#E87A3F] font-bold text-sm" asChild>
                                            <Link href={`/products?dress=${productDress}`}>View All</Link>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {dressProducts.items
                                            .filter((p: any) => p.id !== productId)
                                            .slice(0, 6)
                                            .map((p: any) => (
                                                <ProductCard
                                                    key={p.id}
                                                    compact
                                                    product={{
                                                        id: p.id,
                                                        image: (p.images && p.images.length > 0) ? p.images[0].url : (p.image || "/images/placeholder.png"),
                                                        title: p.name || p.title,
                                                        category: p.category,
                                                        size: p.size,
                                                        price: `$${p.price}`,
                                                        originalPrice: p.comparePrice ? `$${p.comparePrice}` : "",
                                                        isWishlist: false,
                                                        vendorId: p.vendorId,
                                                        vendorUserId: p.vendor?.userId,
                                                        createdAt: p.createdAt,
                                                    }}
                                                    handleAddToCart={() => console.log("Added to cart", p.id)}
                                                    toggleWishlist={() => console.log("Toggle wishlist", p.id)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* 4. More from Brand */}
                            {brandProducts?.items && productBrand && brandProducts.items.filter((p: any) => p.id !== productId).length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                            More From {productBrand}
                                        </h2>
                                        <Button variant="link" className="text-[#E87A3F] font-bold text-sm" asChild>
                                            <Link href={`/products?brand=${productBrand}`}>View All</Link>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {brandProducts.items
                                            .filter((p: any) => p.id !== productId)
                                            .slice(0, 6)
                                            .map((p: any) => (
                                                <ProductCard
                                                    key={p.id}
                                                    compact
                                                    product={{
                                                        id: p.id,
                                                        image: (p.images && p.images.length > 0) ? p.images[0].url : (p.image || "/images/placeholder.png"),
                                                        title: p.name || p.title,
                                                        category: p.category,
                                                        size: p.size,
                                                        price: `$${p.price}`,
                                                        originalPrice: p.comparePrice ? `$${p.comparePrice}` : "",
                                                        isWishlist: false,
                                                        vendorId: p.vendorId,
                                                        vendorUserId: p.vendor?.userId,
                                                        createdAt: p.createdAt,
                                                    }}
                                                    handleAddToCart={() => console.log("Added to cart", p.id)}
                                                    toggleWishlist={() => console.log("Toggle wishlist", p.id)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* 5. More from Location */}
                            {locationProducts?.items && productLocation && locationProducts.items.filter((p: any) => p.id !== productId).length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                                            More From {productLocation}
                                        </h2>
                                        <Button variant="link" className="text-[#E87A3F] font-bold text-sm" asChild>
                                            <Link href={`/products?location=${productLocation}`}>View All</Link>
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                                        {locationProducts.items
                                            .filter((p: any) => p.id !== productId)
                                            .slice(0, 6)
                                            .map((p: any) => (
                                                <ProductCard
                                                    key={p.id}
                                                    compact
                                                    product={{
                                                        id: p.id,
                                                        image: (p.images && p.images.length > 0) ? p.images[0].url : (p.image || "/images/placeholder.png"),
                                                        title: p.name || p.title,
                                                        category: p.category,
                                                        size: p.size,
                                                        price: `$${p.price}`,
                                                        originalPrice: p.comparePrice ? `$${p.comparePrice}` : "",
                                                        isWishlist: false,
                                                        vendorId: p.vendorId,
                                                        vendorUserId: p.vendor?.userId,
                                                        createdAt: p.createdAt,
                                                    }}
                                                    handleAddToCart={() => console.log("Added to cart", p.id)}
                                                    toggleWishlist={() => console.log("Toggle wishlist", p.id)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}

                </div>
            </main>
            <FooterSection />
        </div>
    );
}
