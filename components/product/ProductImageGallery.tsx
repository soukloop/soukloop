
"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { ProductWithRelations } from "@/types";
import WishlistButton from "@/components/ui/wishlist-button";

interface ProductImageGalleryProps {
    product: ProductWithRelations;
    isWishlist: boolean;
    toggleWishlist: (id: string) => void;
}

export default function ProductImageGallery({
    product,
    isWishlist,
    toggleWishlist,
}: ProductImageGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isVideoSelected, setIsVideoSelected] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({});

    // Fallback if images array is empty
    const productImages = product.images?.length > 0
        ? product.images.map((img) => img.url)
        : ["/images/placeholder.png"];

    // Hover zoom effect
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

    return (
        <div className="space-y-4">
            {/* Main Display */}
            <div
                className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 cursor-zoom-in"
                onMouseMove={!isVideoSelected ? handleMouseMove : undefined}
                onMouseLeave={!isVideoSelected ? handleMouseLeave : undefined}
                onClick={() => !isVideoSelected && setIsLightboxOpen(true)}
            >
                {isVideoSelected && product.video ? (
                    <video
                        src={product.video}
                        controls
                        autoPlay
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-contain bg-gray-900"
                        poster={productImages[0]}
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="relative h-full w-full bg-gray-50 transition-transform duration-200 ease-out" style={zoomStyle}>
                        <Image
                            src={productImages[selectedImage]}
                            alt={product.name}
                            fill
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-contain"
                        />
                    </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute right-4 top-4 z-10">
                    <WishlistButton
                        isWishlisted={isWishlist}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                        size="lg"
                        className="size-11 bg-white/90 shadow-md hover:bg-white"
                    />
                </div>

                {/* Navigation Arrows (Images only) */}
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
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-6 top-6 size-12 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
                        onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
                    >
                        <X className="size-8" />
                    </Button>

                    <div className="relative h-full w-full">
                        <Image
                            src={productImages[selectedImage]}
                            alt={product.name}
                            fill
                            sizes="90vw"
                            className="object-contain"
                        />
                    </div>
                </div>
            )}

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {productImages.map((img, index) => (
                    <button
                        key={index}
                        onClick={() => { setSelectedImage(index); setIsVideoSelected(false); }}
                        className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${!isVideoSelected && index === selectedImage ? "border-[#E87A3F] scale-95 shadow-inner" : "border-transparent hover:border-gray-200"
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    </button>
                ))}

                {product.video && (
                    <button
                        onClick={() => setIsVideoSelected(true)}
                        className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${isVideoSelected ? "border-[#E87A3F] scale-95 shadow-inner" : "border-transparent hover:border-gray-200"
                            }`}
                    >
                        <video src={product.video} className="h-full w-full object-cover" muted preload="metadata" />
                    </button>
                )}
            </div>
        </div>
    );
}
