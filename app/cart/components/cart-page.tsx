"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import AuthPopup from "@/components/auth/auth-popup";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { CartItemSkeleton } from "./skeletons";

interface CartPageProps {
  onNext: () => void;
  shippingMethodId: string;
  setShippingMethodId: (id: string) => void;
  shippingCost: number;
  initialCartData?: any; // Add this prop
}

export default function CartPage({ onNext, shippingMethodId, setShippingMethodId, shippingCost, initialCartData }: CartPageProps) {
  // ... (rest of imports/setup)

  // ... inside main return ...

  // ✅ Auth state
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Use hybrid cart system instead of local state
  const {
    cart: hookCart, // Rename to avoid conflict
    isLoading, // Only true if NO data exists
    isSyncing, // True if checking for updates in background
    isError,
    error,
    updateItem,
    removeItem,
    getTotalPrice,
    selectedItems,
    toggleSelection,
    selectAll,
    deselectAll,
    stockUpdates,
    selectableItemsCount,
    isAllSelected
  } = useCart();

  // Prefer hook data (client fresh), fallback to initial (server snapshot)
  const cart = hookCart || initialCartData;


  // Sort items to keep order consistent
  const sortedItems = cart?.items ? [...cart.items].sort((a: any, b: any) => a.id.localeCompare(b.id)) : [];

  // Shipping state lifted to parent

  const subtotal = getTotalPrice();
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-bold flex items-center justify-center gap-3">
            Cart
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* === CART ITEMS SECTION === */}
          <div className="lg:col-span-2">
            <div className="rounded-lg bg-white p-6">
              {/* This loading state only appears if we have absolutely NO data (fresh session, no cache) */}
              {isLoading && !cart?.items ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-10 animate-spin text-[#E87A3F]" />
                    <p className="text-gray-600">Loading cart...</p>
                  </div>
                </div>
              ) : null}

              {/* Error */}
              {isError && !isLoading && (
                <div className="flex h-64 items-center justify-center">
                  {/* ... Existing Error UI ... */}
                  <div className="flex flex-col items-center gap-3 text-center">
                    <AlertCircle className="size-10 text-red-500" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Failed to load cart
                      </p>
                      <p className="text-sm text-gray-600">
                        {error?.message || "Please try again later"}
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

              {/* Empty */}
              {!isLoading && !isError && (!cart?.items || cart.items.length === 0) && (
                /* ... Existing Empty UI ... */
                <div className="flex h-64 items-center justify-center">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <ShoppingBag className="size-16 text-gray-300" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Your cart is empty
                      </p>
                      <p className="text-sm text-gray-600">
                        Add some products to get started
                      </p>
                    </div>
                    <Button
                      onClick={() => (window.location.href = "/products")}
                      className="bg-[#E87A3F] hover:bg-[#d96d34]"
                    >
                      Browse Products
                    </Button>
                  </div>
                </div>
              )}

              {/* Items */}
              {/* Show items even if loading in background (isSyncing) */}
              {!isError && cart?.items && cart.items.length > 0 && (
                <div className="space-y-6">
                  {/* Header: Select All */}
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <Checkbox
                      id="select-all"
                      checked={isAllSelected}
                      onCheckedChange={(checked) => {
                        if (checked) selectAll();
                        else deselectAll();
                      }}
                    />
                    <Label htmlFor="select-all" className="font-semibold cursor-pointer">
                      Select All ({selectableItemsCount} items)
                    </Label>
                  </div>

                  {/* Cart Items */}
                  <div className="space-y-4 md:space-y-6">
                    {sortedItems.map((item: any) => {
                      const sub = item.priceCents; // Quantity is always 1
                      const isSold = item.isSold || item.product?.status === 'SOLD';
                      const isOutOfStock = isSold;
                      const isSelected = selectedItems.has(item.id);

                      return (
                        <div
                          key={item.id}
                          className={`group relative flex flex-col sm:flex-row gap-4 rounded-2xl border p-4 transition-all 
                                ${isOutOfStock ? "bg-gray-100 border-gray-200 opacity-60" : "bg-white border-gray-100 hover:bg-gray-50/50"}
                            `}
                        >
                          {/* Checkbox */}
                          <div className="flex items-center self-center sm:self-start mt-0 sm:mt-10 mr-2">
                            <Checkbox
                              id={`select-${item.id}`}
                              checked={isSelected}
                              disabled={isOutOfStock}
                              onCheckedChange={() => toggleSelection(item.id)}
                            // Make sure clicking checkbox doesn't trigger row click if we had row click logic
                            />
                          </div>

                          {/* Product Image */}
                          <a href={`/product/${item.product?.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 shadow-sm">
                            <Image
                              src={item.product?.images?.[0]?.url || "/premium-brown-leather-bag.png"}
                              alt={item.product?.name || "Product"}
                              fill
                              className={`object-cover transition-transform duration-500 ${!isOutOfStock && "group-hover:scale-110"} ${isOutOfStock ? "grayscale" : ""}`}
                            />
                            {isOutOfStock && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <span className="bg-black/70 text-white text-[10px] font-bold px-2 py-1 rounded">
                                  {isSold ? 'SOLD OUT' : 'OUT OF STOCK'}
                                </span>
                              </div>
                            )}
                          </a>

                          {/* Info & Actions */}
                          <div className="flex flex-1 flex-col justify-between min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <a href={`/product/${item.product?.slug}`}>
                                <h3 className={`block font-bold text-base md:text-lg transition-colors truncate ${isOutOfStock ? "text-gray-500 line-through" : "text-gray-900 group-hover:text-[#E87A3F]"}`}>
                                  {item.product?.name || "Product"}
                                </h3>
                                <p className="mt-1 text-sm font-medium text-gray-500">
                                  {item.product?.vendor?.user?.name || "Seller"}
                                </p>

                              </a>
                              <div className="text-right">
                                <p className={`text-lg font-black ${isOutOfStock ? "text-gray-400" : "text-[#E87A3F]"}`}>
                                  ${(item.priceCents / 100).toFixed(2)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between mt-4 sm:mt-0">
                              {/* Future Quantity controls could go here */}
                              <div />

                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  removeItem(item.id);
                                }}
                                className="z-10 text-sm font-medium text-red-500 hover:text-red-600 hover:underline flex items-center gap-1.5 transition-all p-1 rounded-md hover:bg-red-50"
                              >
                                <Trash2 className="size-4" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ... Cart Summary Section ... */}
          {/* (Rest of the file remains similar but uses getSelectedTotalPrice inside the hook already) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 rounded-[24px] bg-white p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Cart Summary</h2>

              {/* ... Shipping RadioGroup ... */}
              <div className="space-y-4">
                <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400">Shipping Method</p>
                <RadioGroup
                  value={shippingMethodId}
                  onValueChange={setShippingMethodId}
                  className="grid gap-3"
                >
                  {[
                    { id: "free", label: "Free shipping", price: 0 },
                    { id: "express", label: "Express shipping", price: 1500 },
                    { id: "pickup", label: "Store Pick Up", price: 2100 },
                  ].map((method) => {
                    const isSelected = shippingMethodId === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setShippingMethodId(method.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all hover:border-[#E87A3F]/30 ${isSelected ? "border-[#E87A3F] bg-[#FEF3EC]/30" : "border-gray-100 bg-white"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value={method.id} id={method.id} className="text-[#E87A3F]" />
                          <Label htmlFor={method.id} className="cursor-pointer text-sm font-bold text-gray-700">
                            {method.label}
                          </Label>
                        </div>
                        <span className={`text-sm font-black ${isSelected ? "text-[#E87A3F]" : "text-gray-900"}`}>
                          ${(method.price / 100).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="space-y-3 border-t border-gray-50 pt-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Subtotal ({selectedItems.size} items)</span>
                  <span className="text-gray-900 font-bold">
                    $
                    {(subtotal / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-gray-900 font-bold">
                    $
                    {(shippingCost / 100).toFixed(2)}
                  </span>
                </div>
                <div className="my-2 h-px bg-gray-100" />
                <div className="flex justify-between items-center text-xl font-black">
                  <span className="text-gray-900">Total</span>
                  <div className="text-right text-[#E87A3F]">
                    <span className="text-xs font-bold text-gray-400 mr-1.5 uppercase">USD</span>
                    $
                    {(total / 100).toFixed(2)}
                  </div>
                </div>
              </div>

              <Button
                onClick={user ? onNext : () => setShowAuth(true)}
                disabled={(!cart?.items || cart.items.length === 0 || selectedItems.size === 0) || isLoading}
                className="h-14 w-full rounded-2xl bg-[#E87A3F] text-base font-black text-white shadow-lg transition-all hover:bg-[#d96d34] hover:shadow-[#E87A3F]/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {user ? `Checkout (${selectedItems.size})` : "Sign In to Continue"}
              </Button>

              <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Secure checkout • 100% Satisfaction
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Popup */}
      {showAuth && (
        <AuthPopup isOpen={showAuth} onClose={() => setShowAuth(false)} />
      )}
    </div>
  );
}

