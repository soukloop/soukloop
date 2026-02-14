"use client";

import Image from "next/image";
import { Heart, MoreVertical, PenLine, Trash2, EyeOff, CheckCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface Product {
    id: number;
    image: string;
    title: string;
    description: string;
    price: string | number;
    originalPrice: string | number;
    daysAgo: string | number;
    isWishlist?: boolean;
    hasPendingStyle?: boolean;
}

interface ManageListingCardProps {
    product: Product;
    toggleWishlist?: (id: number) => void;
    onEdit?: (product: Product) => void;
    onDelete?: (id: number) => void;
    onDeactivate?: (id: number) => void;
    onMarkSold?: (id: number) => void;
    onViewInsights?: (product: Product) => void;
    onUpgradeAd?: (product: Product) => void;
}

export default function ManageListingCard({
    product,
    toggleWishlist,
    onEdit,
    onDelete,
    onDeactivate,
    onMarkSold,
    onViewInsights,
    onUpgradeAd,
}: ManageListingCardProps) {
    const [activeMenu, setActiveMenu] = useState(false);
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

    const formattedPrice = typeof product.price === 'number' ? `$${product.price}` : product.price;
    const formattedOriginalPrice = typeof product.originalPrice === 'number' ? `$${product.originalPrice}` : product.originalPrice;
    const formattedDaysAgo = typeof product.daysAgo === 'number' ? `${product.daysAgo} days ago` : String(product.daysAgo).includes('ago') ? product.daysAgo : `${product.daysAgo} days ago`;


    return (
        <div className="group relative flex w-full min-w-0 flex-col rounded-2xl bg-white p-2.5 sm:p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0px_8px_30px_0px_rgba(0,0,0,0.1)]">
            <div className="relative mb-2 sm:mb-3 aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-50">
                <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                />

                {/* Floating Action Buttons */}
                <div className="absolute right-2 top-2 sm:right-3 sm:top-3 z-20 flex gap-1.5 sm:gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(product);
                        }}
                        className="flex size-7 sm:size-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
                    >
                        <PenLine className="size-3.5 sm:size-4 text-[#E87A3F]" />
                    </button>

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenu(!activeMenu);
                            }}
                            className="flex size-7 sm:size-9 items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105 hover:bg-gray-50 active:scale-95"
                        >
                            <MoreVertical className="size-3.5 sm:size-4 text-[#E87A3F]" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 sm:w-48 origin-top-right rounded-xl border border-gray-100 bg-white p-1 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    className="flex w-full items-center gap-1.5 sm:gap-2 rounded-lg bg-[#FFF5F2] px-2 py-2 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-semibold text-[#E87A3F] hover:bg-[#ffece6] transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onMarkSold?.(product.id);
                                        setActiveMenu(false);
                                    }}
                                >
                                    <CheckCircle className="size-3 sm:size-4" />
                                    Mark as Sold
                                </button>
                                <button
                                    className="flex w-full items-center gap-1.5 sm:gap-2 rounded-lg px-2 py-2 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete?.(product.id);
                                        setActiveMenu(false);
                                    }}
                                >
                                    <Trash2 className="size-3 sm:size-4" />
                                    Delete Product
                                </button>
                                <button
                                    className="flex w-full items-center gap-1.5 sm:gap-2 rounded-lg px-2 py-2 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs md:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeactivate?.(product.id);
                                        setActiveMenu(false);
                                    }}
                                >
                                    <EyeOff className="size-3 sm:size-4" />
                                    Deactivate Product
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex flex-1 flex-col">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-1 mb-1.5 sm:mb-2">
                    {/* Pending Style Badge */}
                    {product.hasPendingStyle && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200">
                            <Clock className="size-3 text-amber-600" />
                            <span className="text-[10px] sm:text-xs font-medium text-amber-700">Pending Approval</span>
                        </div>
                    )}

                    {/* Suspended / Inactive Badge */}
                    {(product as any).status === 'INACTIVE' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
                            <EyeOff className="size-3 text-red-600" />
                            <span className="text-[10px] sm:text-xs font-medium text-red-700">Suspended</span>
                        </div>
                    )}

                    {/* Sold Badge */}
                    {(product as any).status === 'SOLD' && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
                            <CheckCircle className="size-3 text-gray-500" />
                            <span className="text-[10px] sm:text-xs font-medium text-gray-600">Sold Out</span>
                        </div>
                    )}
                </div>

                {/* Date */}
                <span className="mb-0.5 sm:mb-1 text-[10px] sm:text-xs text-gray-400">{formattedDaysAgo}</span>

                {/* Price & Heart Row */}
                <div className="mb-1.5 sm:mb-2 flex items-center justify-between">
                    <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-xl font-black text-gray-900">
                            {formattedPrice}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            {formattedOriginalPrice}
                        </span>
                    </div>
                    {toggleWishlist && (
                        <Heart
                            onClick={() => toggleWishlist(product.id)}
                            className={cn(
                                "size-5 sm:size-6 cursor-pointer transition-transform hover:scale-110",
                                product.isWishlist ? "fill-[#E87A3F] text-[#E87A3F]" : "text-gray-400"
                            )}
                        />
                    )}
                </div>

                {/* Title */}
                <h3 className="mb-0.5 sm:mb-1 text-sm sm:text-base font-semibold text-gray-900 line-clamp-1">
                    {product.title}
                </h3>

                {/* Description */}
                <p className="mb-3 sm:mb-4 text-[10px] sm:text-sm text-gray-500 line-clamp-1">
                    {product.description}
                </p>

                {/* Actions */}
                <div className="mt-auto flex flex-col sm:grid sm:grid-cols-2 gap-2 sm:gap-3">
                    <Button
                        onClick={() => onViewInsights?.(product)}
                        variant="outline"
                        className="h-8 sm:h-[42px] border-[#FFE1D6] bg-transparent text-[10px] sm:text-sm font-bold text-[#E87A3F] hover:bg-[#FFF5F2] hover:text-[#E87A3F] hover:border-[#E87A3F] px-2"
                    >
                        View Insights
                    </Button>
                    <Button
                        onClick={() => onUpgradeAd?.(product)}
                        className="h-8 sm:h-[42px] bg-[#E87A3F] text-[10px] sm:text-sm font-bold text-white shadow-[0px_4px_10px_0px_rgba(229,90,60,0.25)] hover:bg-[#d14b2f] hover:shadow-[0px_6px_15px_0px_rgba(229,90,60,0.3)] px-2"
                    >
                        Upgrade Ad
                    </Button>
                </div>
            </div>
        </div>
    );
}
