"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Loader2, AlertCircle, ShoppingBag, Trash2, Tag, Gift, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import AuthPopup from "@/components/auth/auth-popup";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useProfile } from "@/hooks/useProfile";
import { CartItemSkeleton } from "./skeletons";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface CartPageProps {
  onNext: () => void;
  shippingMethodId: string;
  setShippingMethodId: (id: string) => void;
  shippingCost: number;
  initialCartData?: any;
  appliedPromo?: {
    code: string;
    couponId: string;
    vendorId: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number | null;
  } | null;
  setAppliedPromo?: (promo: any) => void;
  isRedeemingPoints?: boolean;
  setIsRedeemingPoints?: (redeeming: boolean) => void;
}

export default function CartPage({
  onNext,
  shippingMethodId,
  setShippingMethodId,
  shippingCost,
  initialCartData,
  appliedPromo,
  setAppliedPromo,
  isRedeemingPoints = false,
  setIsRedeemingPoints
}: CartPageProps) {
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

  const { profile } = useProfile({ skipAddresses: true });
  const userPoints = profile?.user?.rewardBalance?.currentBalance || 0;
  const pointValue = 0.01; // $0.01 per point
  const pointsDiscountDollars = isRedeemingPoints ? userPoints * pointValue : 0;
  const pointsDiscountCents = Math.round(pointsDiscountDollars * 100);

  // Prefer hook data (client fresh), fallback to initial (server snapshot)
  const cart = hookCart || initialCartData;


  // Sort items to keep order consistent
  const sortedItems = cart?.items ? [...cart.items].sort((a: any, b: any) => a.id.localeCompare(b.id)) : [];

  // Shipping state lifted to parent

  const subtotal = getTotalPrice();

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");

    try {
      // Calculate subtotals for all vendors in the selected items
      const vendorTotals = sortedItems.reduce((acc: Record<string, number>, item: any) => {
        if (selectedItems.has(item.id) && item.product?.status !== 'SOLD') {
          const vid = item.product?.vendor?.id;
          if (vid) {
            acc[vid] = (acc[vid] || 0) + item.priceCents / 100;
          }
        }
        return acc;
      }, {});

      if (Object.keys(vendorTotals).length === 0) throw new Error("Please select an item first.");

      const res = await fetch("/api/checkout/validate-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoInput.trim(),
          vendorTotals
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (setAppliedPromo) {
        setAppliedPromo({
          code: data.code,
          couponId: data.couponId,
          vendorId: data.vendorId,
          discountType: data.discountType,
          discountValue: data.discountValue,
          minOrderValue: data.minOrderValue,
        });
      }
      setPromoInput("");
      toast.success("Promo code applied!");
    } catch (error: any) {
      setPromoError(error.message);
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Dynamic Discount Calculation
  const calculateDynamicDiscount = () => {
    if (!appliedPromo || !sortedItems.length) return 0;

    // 1. Filter items specifically for the vendor who issued the promo
    const vendorItems = sortedItems.filter(item =>
      selectedItems.has(item.id) &&
      item.product?.vendor?.id === appliedPromo.vendorId &&
      item.product?.status !== 'SOLD'
    );

    if (vendorItems.length === 0) return 0;

    // 2. Calculate Vendor Subtotal
    const vendorSubtotalCents = vendorItems.reduce((sum, item) => sum + item.priceCents, 0);
    const vendorSubtotalDollars = vendorSubtotalCents / 100;

    // 3. Check Minimum Order Value (if user removed items, they might fall below)
    if (appliedPromo.minOrderValue !== null && vendorSubtotalDollars < appliedPromo.minOrderValue) {
      return 0; // Discount doesn't apply
    }

    // 4. Calculate Discount
    let discountDollars = 0;
    if (appliedPromo.discountType === "PERCENTAGE") {
      discountDollars = vendorSubtotalDollars * (appliedPromo.discountValue / 100);
    } else if (appliedPromo.discountType === "FIXED") {
      discountDollars = appliedPromo.discountValue;
      if (discountDollars > vendorSubtotalDollars) discountDollars = vendorSubtotalDollars;
    }

    return Math.round(discountDollars * 100); // Return in cents
  };

  const appliedDiscount = calculateDynamicDiscount();
  const total = Math.max(0, subtotal + shippingCost - appliedDiscount - pointsDiscountCents);

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
                          <a href={`/product/${item.product?.slug || item.product?.id}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 shadow-sm">
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
                              <a href={`/product/${item.product?.slug || item.product?.id}`}>
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

                {/* Promo Code Input */}
                <div className="pt-4 pb-2">
                  {appliedPromo ? (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
                        <Tag className="size-4" />
                        {appliedPromo.code}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-700 font-black">-${(appliedDiscount / 100).toFixed(2)}</span>
                        <button onClick={() => setAppliedPromo?.(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[13px] font-bold uppercase tracking-wider text-gray-400">Promo Code</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter code"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                          className="uppercase font-medium"
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
                        />
                        <Button
                          variant="secondary"
                          onClick={handleApplyPromo}
                          disabled={isApplyingPromo || !promoInput.trim()}
                        >
                          {isApplyingPromo ? <Loader2 className="size-4 animate-spin" /> : 'Apply'}
                        </Button>
                      </div>
                      {promoError && <p className="text-xs text-red-500 font-medium">{promoError}</p>}
                    </div>
                  )}
                </div>


                {/* Reward Points Redemption */}
                {user && (
                  <div className="pt-2 pb-4">
                    <div className={`p-4 rounded-xl border-2 transition-all ${isRedeemingPoints ? 'border-[#E87A3F] bg-orange-50/10' : 'border-gray-100 bg-white'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${isRedeemingPoints ? 'bg-[#E87A3F] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            <Gift className="size-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">Redeem Points</h4>
                            <p className="text-xs text-gray-500">Available: {userPoints} pts</p>
                          </div>
                        </div>
                        <Switch
                          checked={isRedeemingPoints}
                          onCheckedChange={(checked) => {
                            if (checked && userPoints < 100) {
                              toast.error("Minimum 100 points required to redeem");
                              return;
                            }
                            setIsRedeemingPoints?.(checked);
                            if (checked) toast.success(`Applied $${(userPoints * pointValue).toFixed(2)} discount!`);
                          }}
                          disabled={userPoints < 100}
                        />
                      </div>

                      <div className="space-y-2 border-t border-gray-100/50 pt-3 mt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Redemption Rate</span>
                          <span className="text-gray-900 font-medium">100 pts = $1.00</span>
                        </div>
                        {isRedeemingPoints ? (
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-500">You're saving</span>
                            <span className="text-[#E87A3F] font-bold">-${(userPoints * pointValue).toFixed(2)}</span>
                          </div>
                        ) : userPoints < 100 && (
                          <div className="flex items-center gap-1.5 text-[10px] text-orange-600 bg-orange-50 p-2 rounded-md">
                            <Info className="size-3" />
                            <span>You need 100 points to start redeeming.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}


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
      {
        showAuth && (
          <AuthPopup isOpen={showAuth} onClose={() => setShowAuth(false)} />
        )
      }
    </div >
  );
}

