"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    getGroupedDressStyles,
    getLatestProductsByDressStyle,
    type GroupedDressStyles,
    type MegaMenuProduct
} from "@/actions/product-data";
import ProductCard from "@/components/product-card";
import { CardSkeleton } from "@/components/ui/skeletons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWishlist } from "@/hooks/use-wishlist";

const STALE_TIME = 30 * 60 * 1000; // 30 minutes

interface DesktopNavProps {
    initialDressStyles?: GroupedDressStyles;
}

export default function DesktopNav({ initialDressStyles }: DesktopNavProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { isWithlisted, toggleWishlist } = useWishlist();
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    // Core categories are ALWAYS present - hardcoded
    const CORE_CATEGORIES = ['women', 'men', 'kids'];

    // Dress styles state - start with initialDressStyles or empty
    const [dressStyles, setDressStyles] = useState<GroupedDressStyles>(
        initialDressStyles || { women: [], men: [], kids: [] }
    );

    const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);

    // React Query for Mega Menu Products
    const { data: qProducts, isLoading: isQLoading } = useQuery({
        queryKey: ['mega-menu-products', hoveredStyle],
        queryFn: async () => {
            if (!hoveredStyle) return [];
            const res = await fetch(`/api/products/mega-menu-previews?styleSlug=${hoveredStyle}`);
            if (!res.ok) throw new Error('Failed to fetch mega-menu products');
            return res.json();
        },
        enabled: !!hoveredStyle,
        staleTime: STALE_TIME,
        gcTime: STALE_TIME,
    });

    const previewProducts = qProducts || [];
    const isLoadingProducts = isQLoading && !!hoveredStyle;

    // Use refs for hover management
    const navRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Background fetch for dress styles (low priority, cached)
    // Only fetches if not already provided
    useEffect(() => {
        if (initialDressStyles) return;

        // Fetch in background without blocking UI
        getGroupedDressStyles()
            .then(setDressStyles)
            .catch(console.error);
    }, [initialDressStyles]);

    // INSTANT PREFETCH: Prefetch all dress styles and products on mount
    // This makes mega menu instant when user hovers
    useEffect(() => {
        // Prefetch products for all dress styles in all core categories
        const prefetchAllProducts = async () => {
            const allStyles = [
                ...(dressStyles.women || []),
                ...(dressStyles.men || []),
                ...(dressStyles.kids || [])
            ];

            // Prefetch products for each style using React Query
            for (const style of allStyles) {
                if (style.slug) {
                    queryClient.prefetchQuery({
                        queryKey: ['mega-menu-products', style.slug],
                        queryFn: async () => {
                            const res = await fetch(`/api/products/mega-menu-previews?styleSlug=${style.slug}`);
                            if (!res.ok) return [];
                            return res.json();
                        },
                        staleTime: STALE_TIME,
                    });
                }
            }
        };

        // Only prefetch once we have dress styles
        if (dressStyles.women?.length || dressStyles.men?.length || dressStyles.kids?.length) {
            prefetchAllProducts();
        }
    }, [dressStyles, queryClient]);


    // Initialize first style as hovered when category opens
    useEffect(() => {
        if (activeCategory && dressStyles[activeCategory as keyof GroupedDressStyles]?.length > 0) {
            // Default to the first style so the right side isn't empty
            setHoveredStyle(dressStyles[activeCategory as keyof GroupedDressStyles][0].slug);
        } else {
            setHoveredStyle(null);
        }
    }, [activeCategory, dressStyles]);

    const handleMouseEnter = (category: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveCategory(category);
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setActiveCategory(null);
            setHoveredStyle(null);
        }, 150); // Small grace period
    };

    // Get categories: always show core 3, plus any additional ones
    const additionalCategories = Object.keys(dressStyles).filter(
        cat => !CORE_CATEGORIES.includes(cat) && dressStyles[cat as keyof GroupedDressStyles]?.length > 0
    );
    const categoryTabs = [...CORE_CATEGORIES, ...additionalCategories];

    return (
        <div ref={navRef} className="hidden sm:flex items-center space-x-1" onMouseLeave={handleMouseLeave}>
            {/* Simple smooth transition for categories */}
            <div className="flex items-center space-x-2">
                {categoryTabs.map((cat) => (
                    <div key={cat} onMouseEnter={() => handleMouseEnter(cat)}>
                        <Button
                            variant="ghost"
                            className={`h-8 px-4 text-[13px] font-semibold capitalize transition-all duration-300 border border-gray-100 rounded-lg
                                ${activeCategory === cat
                                    ? "bg-[#E87A3F]/10 text-[#E87A3F] border-[#E87A3F]/20"
                                    : "text-gray-700 hover:text-[#E87A3F] hover:bg-white hover:border-[#E87A3F]/20 hover:shadow-sm"
                                }`}
                            onClick={() => router.push(`/products?category=${cat}`)}
                        >
                            {cat}
                        </Button>
                    </div>
                ))}
            </div>

            {/* Mega Menu Dropdown */}
            {activeCategory && (
                <div
                    className="absolute left-0 top-full w-full bg-white border-t border-gray-100 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                    onMouseLeave={handleMouseLeave}
                    style={{ minHeight: "400px" }}
                >
                    <div className="container mx-auto flex h-full">
                        {/* Left Column: Dress Styles */}
                        <div className="w-1/4 min-w-[250px] border-r border-gray-100 py-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
                                {activeCategory} Styles
                            </h3>

                            <ul className="space-y-1">
                                {dressStyles[activeCategory as keyof GroupedDressStyles]?.map((style) => (
                                    <li key={style.slug}>
                                        <button
                                            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between
                                                ${hoveredStyle === style.slug
                                                    ? "bg-[#E87A3F] text-white shadow-md transform scale-[1.02]"
                                                    : "text-gray-600 hover:bg-[#E87A3F]/10 hover:text-[#E87A3F]"
                                                }`}
                                            onMouseEnter={() => setHoveredStyle(style.slug)}
                                            onClick={() => router.push(`/products?category=${activeCategory}&query=${encodeURIComponent(style.name)}`)}
                                        >
                                            {style.name}
                                            {hoveredStyle === style.slug && <ChevronRight className="size-4" />}
                                        </button>
                                    </li>
                                ))}
                                {dressStyles[activeCategory as keyof GroupedDressStyles]?.length === 0 && (
                                    <li className="px-4 text-gray-400 italic text-sm">No styles found</li>
                                )}
                            </ul>
                        </div>

                        {/* Right Column: Product Preview */}
                        <div className="flex-1 py-8 px-8 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900 capitalize">
                                    {hoveredStyle ? dressStyles[activeCategory as keyof GroupedDressStyles]?.find(s => s.slug === hoveredStyle)?.name : `Top ${activeCategory} Picks`}
                                </h3>
                                <Link
                                    href={`/products?category=${activeCategory}${hoveredStyle ? `&query=${encodeURIComponent(dressStyles[activeCategory as keyof GroupedDressStyles]?.find(s => s.slug === hoveredStyle)?.name || '')}` : ''}`}
                                    className="text-[#E87A3F] font-medium text-sm hover:underline flex items-center"
                                >
                                    View All <ChevronRight className="size-4 ml-1" />
                                </Link>
                            </div>


                            <div className="grid grid-cols-3 gap-6">
                                {isLoadingProducts ? (
                                    // Skeleton Loading
                                    [1, 2, 3].map((i) => (
                                        <CardSkeleton key={i} />
                                    ))
                                ) : previewProducts.length > 0 ? (
                                    previewProducts.map((product: MegaMenuProduct) => (
                                        <ProductCard
                                            key={product.id}
                                            compact
                                            product={{
                                                id: product.id,
                                                title: product.name,
                                                image: product.image,
                                                price: `$${product.price ? product.price.toFixed(2) : "0.00"}`,
                                                originalPrice: product.comparePrice ? `$${product.comparePrice.toFixed(2)}` : "",
                                                slug: product.slug,
                                                isWishlist: isWithlisted(product.id),
                                                isActive: true,
                                                status: "APPROVED"
                                            }}
                                            handleAddToCart={(p) => {
                                                // Prevent default routing if wishlist is clicked? Handled inside ProductCard
                                                // handleAddToCart is still dummy here as per original
                                            }}
                                            toggleWishlist={toggleWishlist}
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-3 flex flex-col items-center justify-center h-[300px] text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                        <p>No products available for this style.</p>
                                        <Button
                                            variant="link"
                                            className="text-[#E87A3F]"
                                            onClick={() => router.push(`/products?category=${activeCategory}`)}
                                        >
                                            Browse all {activeCategory}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: #cbd5e1;
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: #94a3b8;
                }
            `}</style>
        </div>
    );
}

