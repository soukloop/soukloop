'use client';

import React from 'react';
import { Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

export default function WishlistSection() {
    const { favorites, isLoading: isLoadingFavorites, toggleWishlist } = useWishlist();
    const { addItem } = useCart();

    const handleRemoveFavorite = async (productId: string) => {
        await toggleWishlist(productId);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddToCartFromWishlist = async (product: any) => {
        await addItem(product.id, 1, {
            id: product.id,
            name: product.name,
            price: product.price,
            images: product.images
        });
        toast.success("Added to cart");
    };

    return (
        <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-6xl">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
                    Wishlist
                </h2>

                <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    {/* Table Header - Hidden on mobile */}
                    <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 hidden md:block border-b border-gray-100">
                        <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-6">PRODUCTS</div>
                            <div className="col-span-2">PRICE</div>
                            <div className="col-span-2">STOCK STATUS</div>
                            <div className="col-span-2">ACTIONS</div>
                        </div>
                    </div>

                    {/* Wishlist Items */}
                    <div className="divide-y divide-gray-100">
                        {isLoadingFavorites ? (
                            // Skeleton Rows
                            [1, 2, 3].map((i) => (
                                <div key={i} className="px-4 md:px-6 py-4 animate-pulse">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                                        <div className="col-span-1 md:col-span-6 flex items-center space-x-3 md:space-x-4">
                                            <div className="w-16 h-16 md:w-[72px] md:h-[72px] bg-gray-100 rounded-lg flex-shrink-0" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-gray-100 rounded w-3/4" />
                                                <div className="h-3 bg-gray-100 rounded w-1/2 md:hidden" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : favorites.length === 0 ? (
                            // Empty State
                            <div className="flex flex-col items-center justify-center py-16 md:py-24 px-4 text-center">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Package className="w-8 h-8 md:w-12 md:h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                                <p className="text-sm md:text-base text-gray-500 max-w-sm mb-6">
                                    Save items you love and keep track of them here. Start exploring our collections!
                                </p>
                                <Link href="/" className="inline-flex items-center justify-center rounded-xl bg-[#E87A3F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d96d34] w-full md:w-auto">
                                    Browse Products
                                </Link>
                            </div>
                        ) : (
                            // Active Items
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            favorites.map((product: any) => (
                                <div key={product.id} className="px-4 md:px-6 py-4 md:py-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start md:items-center">
                                        {/* Product Info - Takes full width on mobile, 6 cols on desktop */}
                                        <div className="col-span-1 md:col-span-6 flex items-center space-x-4">
                                            {/* X Button for Mobile */}
                                            <button
                                                onClick={() => handleRemoveFavorite(product.id)}
                                                className="md:hidden p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                                                aria-label="Remove from wishlist"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>

                                            <Link href={`/product/${product.slug}`} className="relative w-[72px] h-[72px] md:w-20 md:h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100 group">
                                                <Image
                                                    src={product.images[0]?.url || '/placeholder.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </Link>

                                            <div className="flex flex-col min-w-0 flex-1 py-1">
                                                <Link href={`/product/${product.slug}`} className="text-sm md:text-base font-bold text-gray-900 hover:text-[#E87A3F] transition-colors line-clamp-2 leading-snug mb-1">
                                                    {product.name}
                                                </Link>
                                                {/* Mobile Price & Status inline */}
                                                <div className="md:hidden flex items-center space-x-2 mt-1">
                                                    <span className="text-sm font-black text-[#E87A3F]">${product.price.toFixed(2)}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                                                        {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Desktop View Fields */}
                                        <div className="hidden md:flex col-span-2 items-center">
                                            <span className="text-base font-black text-[#E87A3F]">${product.price.toFixed(2)}</span>
                                        </div>

                                        <div className="hidden md:flex col-span-2 items-center">
                                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 rounded-full">
                                                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </div>

                                        {/* Actions Group */}
                                        <div className="col-span-1 md:col-span-2 flex items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
                                            <Button
                                                onClick={() => handleAddToCartFromWishlist(product)}
                                                className="flex-1 md:flex-none h-10 md:h-9 bg-gray-900 text-white font-semibold text-sm hover:bg-gray-800 transition-colors rounded-xl md:rounded-lg"
                                            >
                                                Add to Cart
                                            </Button>
                                            {/* Desktop Remove Button */}
                                            <button
                                                onClick={() => handleRemoveFavorite(product.id)}
                                                className="hidden md:flex w-9 h-9 items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100 flex-shrink-0"
                                                title="Remove from wishlist"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
