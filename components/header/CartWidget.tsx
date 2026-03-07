"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCart as useCartHook } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";

export default function CartWidget({
    initialCartCount = 0
}: {
    initialCartCount?: number
}) {
    const { cart, isLoading: isCartLoading, isSyncing, removeItem, getCartSubtotal } = useCartHook();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const cartRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();

    // ✅ Handle auth modal trigger - we need to emit event since AuthPopup is in parent
    const triggerAuth = () => {
        window.dispatchEvent(new CustomEvent('open-auth-modal'));
    };

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);

    // ✅ Only close if click target is OUTSIDE the cart popup
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                closeCart();
            }
        }

        if (isCartOpen) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isCartOpen]);

    // When cart data loads from Context, it will override the initial lightweight count
    const contextCartCount = cart?.items?.reduce((total: number, item: any) => total + (item.quantity || 1), 0) || 0;
    const cartCount = contextCartCount > 0 ? contextCartCount : initialCartCount;
    const subtotal = getCartSubtotal() / 100;

    return (
        <>
            {/* Desktop Cart Button */}
            <Button
                variant="outline"
                className="relative h-12 rounded-xl bg-white border border-gray-200 px-4 hover:bg-gray-50 hover:text-orange-500 transition-colors hidden sm:flex items-center gap-2"
                onClick={(e) => {
                    e.stopPropagation();
                    openCart();
                }}
            >
                <ShoppingCart className="size-5" />
                <span className="ml-1 hidden md:inline font-medium text-base">Cart</span>
                {cartCount > 0 && (
                    <span className="ml-1 flex size-6 items-center justify-center rounded-full bg-[#E87A3F] text-xs font-bold text-white">
                        {cartCount > 99 ? "99+" : cartCount}
                    </span>
                )}
            </Button>

            {/* Mobile Cart Button */}
            <button
                className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors sm:hidden"
                onClick={(e) => {
                    e.stopPropagation();
                    openCart();
                }}
            >
                <ShoppingCart className="size-5 text-gray-700" />
                {cartCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-[14px] h-[14px] items-center justify-center rounded-full bg-[#E87A3F] text-[9px] font-bold text-white px-0.5">
                        {cartCount > 99 ? "99+" : cartCount}
                    </span>
                )}
            </button>

            {/* Cart Modal */}
            {isCartOpen && (
                <div
                    className="absolute top-full right-0 z-[9999] mt-3 mr-2 sm:mr-0 w-[95vw] sm:w-[400px]"
                >
                    <div
                        ref={cartRef}
                        className="bg-white w-full max-h-[90vh] flex flex-col rounded-[24px] shadow-[0px_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-full bg-[#FEF3EC]">
                                    <ShoppingCart className="size-5 text-[#E87A3F]" />
                                </div>
                                <div>
                                    <h2 className="text-[17px] font-black text-gray-900 tracking-tight flex items-center gap-2">
                                        My Cart
                                        {/* Show spinner if background syncing */}
                                        {isSyncing && <Loader2 className="size-3 animate-spin text-gray-400" />}
                                    </h2>
                                    <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                                        {cart?.items?.length || 0} {(cart?.items?.length || 0) === 1 ? 'item' : 'items'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeCart();
                                }}
                                className="flex size-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-[#E87A3F]/10 hover:text-[#E87A3F] transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
                            {/* Only show full skeleton if absolutely NO data exists */}
                            {isCartLoading && !cart?.items ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-start gap-4 p-3 animate-pulse">
                                            <div className="w-20 h-20 rounded-xl bg-gray-200" />
                                            <div className="flex-1 space-y-2 py-1">
                                                <div className="h-4 bg-gray-200 rounded w-3/4" />
                                                <div className="h-4 bg-gray-200 rounded w-1/2" />
                                                <div className="h-4 bg-gray-200 rounded w-1/4" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (!cart?.items || cart.items.length === 0) ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex size-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                                        <ShoppingCart className="size-10 text-gray-300" />
                                    </div>
                                    <p className="font-semibold text-gray-900 mb-1">Your cart is empty</p>
                                    <p className="text-sm text-gray-500 mb-4">Add some products to get started</p>
                                    <Link href="/products">
                                        <Button
                                            className="h-[42px] px-6 bg-[#E87A3F] hover:bg-[#d96d34] text-white font-semibold rounded-xl shadow-[0px_4px_10px_0px_rgba(232,122,63,0.3)]"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                closeCart();
                                            }}
                                        >
                                            Browse Products
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                cart.items.map((item: any) => {
                                    const isSold = item.isSold || item.product?.status === 'SOLD';
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex items-start gap-4 p-3 rounded-2xl border border-transparent transition-all group ${isSold ? 'opacity-60 bg-gray-50' : 'hover:border-gray-100 hover:bg-gray-50/50'
                                                }`}
                                        >
                                            {/* Product Image Wrapper - Relative for badge positioning */}
                                            <div className="relative flex-shrink-0">
                                                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shadow-sm border border-gray-100">
                                                    <Image
                                                        src={item.product?.images?.[0]?.url || "/images/product-placeholder.png"}
                                                        alt={item.product?.name || "Product"}
                                                        width={80}
                                                        height={80}
                                                        className={`w-full h-full object-cover transition-transform duration-500 ${isSold ? 'grayscale' : 'group-hover:scale-110'}`}
                                                    />
                                                </div>
                                                {/* Quantity Badge - Only show if valid */}
                                                {!isSold && (
                                                    <div className="absolute -top-1.5 -right-1.5 min-w-[24px] h-[24px] flex items-center justify-center rounded-full bg-[#E87A3F] border-2 border-white text-white text-[11px] font-black px-1 shadow-sm z-10 transition-transform group-hover:scale-110">
                                                        {item.quantity}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product Details */}
                                            <div className="flex-1 min-w-0 py-0.5">
                                                <p className={`text-gray-900 text-[14px] font-bold leading-snug mb-1.5 line-clamp-2 ${isSold ? 'line-through text-gray-500' : ''}`}>
                                                    {item.product?.name || "Product"}
                                                </p>

                                                {isSold ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                        Sold Out
                                                    </span>
                                                ) : (
                                                    <p className="text-[#E87A3F] font-black text-[16px]">
                                                        ${((item.priceCents || 0) / 100).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    removeItem(item.id);
                                                }}
                                                className="flex size-8 items-center justify-center rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 md:opacity-0"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Subtotal */}
                        {cart?.items && cart.items.length > 0 && (
                            <>
                                <div className="mx-4 mb-4 px-4 py-4 bg-[#FAFAFA] rounded-xl">
                                    <div className="flex items-center justify-between">
                                        <span className="text-base font-medium text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="text-xl font-bold text-gray-900">
                                            ${subtotal.toFixed(2)}
                                            <span className="text-sm font-normal text-gray-500 ml-1">USD</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="px-4 pb-4 flex gap-3">
                                    <Link href="/cart" className="flex-1">
                                        <Button
                                            variant="outline"
                                            className="w-full h-[48px] bg-white text-[#E87A3F] border-[#E87A3F] hover:bg-[#E87A3F]/5 hover:text-[#E87A3F] font-semibold rounded-xl transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                closeCart();
                                            }}
                                        >
                                            View Cart
                                        </Button>
                                    </Link>
                                    {user ? (
                                        <Link href="/cart" className="flex-1">
                                            <Button
                                                className="w-full h-[48px] bg-[#E87A3F] hover:bg-[#d96d34] text-white font-semibold rounded-xl shadow-[0px_4px_10px_0px_rgba(232,122,63,0.3)] hover:shadow-[0px_6px_15px_0px_rgba(232,122,63,0.4)] transition-all"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    closeCart();
                                                }}
                                            >
                                                Checkout
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button
                                            className="flex-1 h-[48px] bg-[#E87A3F] hover:bg-[#d96d34] text-white font-semibold rounded-xl shadow-[0px_4px_10px_0px_rgba(232,122,63,0.3)] hover:shadow-[0px_6px_15px_0px_rgba(232,122,63,0.4)] transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                closeCart();
                                                triggerAuth();
                                            }}
                                        >
                                            Sign In
                                        </Button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
