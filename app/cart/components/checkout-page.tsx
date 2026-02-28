"use client"

import { Button } from "@/components/ui/button"
import { StatefulButton } from "@/components/ui/StatefulButton"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Minus, X, Check, MapPin, Loader2, ArrowLeft, Phone, Gift, Info, Tag, Trash2 } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useCart } from "@/hooks/useCart"
import { useEffect, useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import BillingAddressForm, { BillingAddressFormData } from '@/components/forms/BillingAddressForm'
import { CheckoutSkeleton } from "@/components/ui/skeletons"
import { Skeleton } from "@/components/ui/skeleton"
import { createCheckoutSession } from "@/actions/stripe/create-checkout"
import { StyledPhoneInput } from "@/components/ui/phone-input"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

interface CheckoutPageProps {
  onNext: () => void
  onBack: () => void
  onOrderComplete?: (orderId: string) => void
  shippingCost: number
  shippingMethodId: string
  savedAddresses?: any[] // Accepting Address[]
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

interface SavedAddress {
  id: string
  type: string
  firstName: string
  lastName: string
  address1: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault?: boolean
}

export default function CheckoutPage({
  onNext,
  onBack,
  onOrderComplete,
  shippingCost,
  shippingMethodId,
  savedAddresses = [],
  appliedPromo,
  setAppliedPromo,
  isRedeemingPoints = false,
  setIsRedeemingPoints
}: CheckoutPageProps) {
  const { profile, addresses, createAddress, isLoading: isProfileLoading, userName, userEmail, updateProfile } = useProfile();
  const { cart, getTotalPrice, removeItem, updateItem, clearCart, selectedItems, stockUpdates, removeItems } = useCart();
  const searchParams = useSearchParams();
  const hasShowCanceled = useRef(false);

  useEffect(() => {
    if (searchParams?.get("canceled") === "true" && !hasShowCanceled.current) {
      toast.error("Payment was canceled. You can try again whenever you're ready.");
      hasShowCanceled.current = true;
    }
  }, [searchParams]);

  // Phone editing state
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || "");
  const [isSavingPhone, setIsSavingPhone] = useState(false);

  // Sync phone from profile when it loads
  useEffect(() => {
    if (profile?.phone && !phoneNumber) {
      setPhoneNumber(profile.phone);
    }
  }, [profile?.phone]);

  const handleSavePhone = async () => {
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    setIsSavingPhone(true);
    try {
      await updateProfile({ phone: phoneNumber });
      toast.success("Phone number saved to profile");
    } catch (err) {
      console.error("Failed to save phone number:", err);
      toast.error("Failed to save phone number");
    } finally {
      setIsSavingPhone(false);
    }
  };

  // Filter items for checkout
  const checkoutItems = cart?.items?.filter((item: any) => {
    // Must be selected
    if (!selectedItems.has(item.id)) return false;
    // Must have stock
    // Must have stock
    if (stockUpdates.has(item.productId)) {
      return stockUpdates.get(item.productId)! > 0;
    }
    // Fallback to product status
    return item.product?.status !== 'SOLD';
  }) || [];

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const pointValue = 0.01; // $0.01 per point
  const userPoints = profile?.user?.rewardBalance?.currentBalance || 0;
  const discountAmount = isRedeemingPoints ? userPoints * pointValue : 0;

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");

    try {
      const vendorTotals = checkoutItems.reduce((acc: Record<string, number>, item: any) => {
        const vid = item.product?.vendor?.id || item.vendorId || item.product?.vendorId;
        if (vid) {
          const priceCents = item.priceCents || item.price || Math.round((item.product?.price || 0) * 100);
          acc[vid] = (acc[vid] || 0) + priceCents / 100;
        }
        return acc;
      }, {});

      if (Object.keys(vendorTotals).length === 0) throw new Error("No eligible items for promo.");

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

  // Auto-select default address
  useEffect(() => {
    if (addresses?.length && !selectedAddressId) {
      const defaultAddr = addresses.find((a: any) => a.isDefault) || addresses[0];
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses, selectedAddressId]);



  // Update handlePlaceOrder to include redemption data
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.error("Please select a shipping address");
      return;
    }

    if (!checkoutItems.length) {
      toast.error("Your cart is empty");
      return;
    }

    if (!profile?.phone) {
      toast.error("Please add and save a phone number to place your order");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // Sync phone to profile if it changed or was empty
      if (phoneNumber && phoneNumber !== profile?.phone) {
        try {
          await updateProfile({ phone: phoneNumber });
          toast.success("Phone number updated on profile");
        } catch (err) {
          console.error("Failed to sync phone number:", err);
        }
      }

      const address = addresses?.find((a: any) => a.id === selectedAddressId);
      const items = checkoutItems.map((i: any) => ({
        productId: i.productId,
        quantity: i.quantity
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingAddress: address,
          notes: orderNotes,
          shippingMethodId, // Send ID for server validation
          tax: 0,
          redeemedPoints: isRedeemingPoints ? userPoints : 0,
          paymentMethod: 'card', // Force card payment method
          couponId: appliedPromo?.couponId || undefined,
          discountAmount: promoDiscountDollars // Inform the server of the intended discount for tracking
        })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to place order");

      const orderId = data.customerOrder?.id;

      if (!orderId) {
        throw new Error("Order created but no ID returned from server");
      }

      toast.loading("Initiating payment...");
      try {
        const { url } = await createCheckoutSession(orderId, data.redeemedPoints || 0);
        if (url) {
          window.location.href = url;
          return; // Exit here for card redirect
        } else {
          throw new Error("Failed to generate payment link");
        }
      } catch (err: any) {
        console.error("Stripe Redirect Error:", err);
        toast.error(err.message || "Failed to redirect to payment");
        setIsPlacingOrder(false);
        return;
      }

    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
      setIsPlacingOrder(false);
    }
  };

  const handleCreateAddress = async (data: BillingAddressFormData) => {
    try {
      await createAddress({
        address1: data.address1,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        // Default flags for new address in checkout
        isShipping: true,
        isBilling: true
      });
      setShowAddAddress(false);
      toast.success("Address added successfully");
    } catch (error) {
      console.error("Address creation error:", error);
      toast.error("Failed to create address. Please try again.");
    }
  };

  const totalPrice = getTotalPrice(); // Returns cents? CartContext says Math.round(price * 100).
  // Need to verify if logic handles cents or dollars.
  // CartContext Step 140: `return sum + Math.round(price * 100) * i.quantity;`
  // That implies the result is CENTS.
  // But line 18 in ProductDetails interface says `price: number`. Usually dollars.
  // I will check usage visually. Assuming CENTS for calculation.
  // Dynamic Promo Calculation
  const calculateDynamicDiscount = () => {
    if (!appliedPromo || !checkoutItems.length) return 0;

    // Filter items specifically for the vendor who issued the promo
    const vendorItems = checkoutItems.filter((item: any) =>
      item.product?.vendorId === appliedPromo.vendorId ||
      item.vendorId === appliedPromo.vendorId ||
      item.product?.vendor?.id === appliedPromo.vendorId
    );

    if (vendorItems.length === 0) return 0;

    const vendorSubtotalCents = vendorItems.reduce((sum: number, item: any) => {
      // Use priceCents if available (from CartContext), fallback to item.price (from checkout mapping if different)
      const priceCents = item.priceCents || item.price || Math.round((item.product?.price || 0) * 100);
      return sum + priceCents * (item.quantity || 1);
    }, 0);

    const vendorSubtotalDollars = vendorSubtotalCents / 100;

    // Check Minimum Order Value
    if (appliedPromo.minOrderValue !== null && vendorSubtotalDollars < appliedPromo.minOrderValue) {
      return 0;
    }

    let discountDollars = 0;
    if (appliedPromo.discountType === "PERCENTAGE") {
      discountDollars = vendorSubtotalDollars * (appliedPromo.discountValue / 100);
    } else if (appliedPromo.discountType === "FIXED") {
      discountDollars = appliedPromo.discountValue;
      if (discountDollars > vendorSubtotalDollars) discountDollars = vendorSubtotalDollars;
    }

    return discountDollars;
  };

  const promoDiscountDollars = calculateDynamicDiscount();
  const totalPriceDollars = totalPrice / 100;
  const shippingDollars = shippingCost / 100;

  const rawTotal = totalPriceDollars + shippingDollars - promoDiscountDollars;
  const grandTotal = Math.max(0, rawTotal - discountAmount); // discountAmount here is from points

  if (isProfileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Placeholder */}
        <div className="bg-white py-8 mb-8">
          <div className="container mx-auto px-4"><Skeleton className="h-10 w-48 mx-auto" /></div>
        </div>
        <CheckoutSkeleton />
      </div>
    )
  }

  const OrderSummaryContent = (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

      <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto">
        {checkoutItems.map((item: any) => (
          <a
            key={item.id}
            href={`/product/${item.product.slug || item.product.id}`}
            target="_blank"
            className="flex items-start space-x-3 py-3 border-b border-gray-50 last:border-0 group hover:bg-gray-50 transition-colors rounded-lg px-2"
          >
            <div className="shrink-0 relative">
              <img
                src={item.product?.images?.[0]?.url || "/placeholder.png"}
                alt={item.product?.name || "Product"}
                className="w-16 h-16 object-cover rounded-lg border border-gray-100 group-hover:opacity-90 transition-opacity"
              />
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="font-medium text-sm text-gray-900 truncate group-hover:text-[#E87A3F] transition-colors">
                {item.product?.name}
              </p>
              <p className="text-[#E87A3F] text-sm font-medium">
                ${item.product?.price?.toLocaleString() || '0.00'}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Points Earned Prediction (Future) */}
      <div className="mb-4 flex justify-between text-xs text-[#E87A3F] bg-orange-50/30 p-2.5 rounded-lg border border-orange-100/50">
        <span className="font-medium flex items-center gap-1.5">
          <Gift className="size-3.5" /> Points from this order
        </span>
        <span className="font-bold">
          +{Math.floor(grandTotal)} pts
        </span>
      </div>

      {/* Reward Points Redemption - Improved UI */}
      <div className="py-5 border-t border-gray-100">
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
                <span>You need 100 points to start redeeming. Keep shopping!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discount / Subtotal */}
      <div className="space-y-3 mb-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>${totalPriceDollars.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span className={shippingCost === 0 ? "text-green-600 font-medium" : "font-medium"}>
            {shippingCost === 0 ? 'Free' : `$${(shippingCost / 100).toFixed(2)}`}
          </span>
        </div>

        {appliedPromo ? (
          <div className="flex justify-between items-center bg-green-50 border border-green-100 rounded-lg p-3 mt-2">
            <div className="flex items-center gap-2 text-green-700 text-sm font-bold">
              <Tag className="size-4" />
              {appliedPromo.code}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-700 font-black">-${promoDiscountDollars.toFixed(2)}</span>
              <button onClick={() => setAppliedPromo?.(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2 mt-2">
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

        {isRedeemingPoints && (
          <div className="flex justify-between text-sm text-[#E87A3F]">
            <span>Points Discount</span>
            <span>-${(userPoints * pointValue).toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Total */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
        <span className="text-base font-semibold text-gray-900">Total</span>
        <div className="text-right">
          <span className="text-xl font-bold text-[#E87A3F]">
            ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#E87A3F]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-4xl font-bold text-center mb-8">Check Out</h1>
      </div>


      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Info & Address */}
          <div className="lg:col-span-2 space-y-8">

            {/* Account Info (Read Only) */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Name</span>
                  <span className="font-medium text-gray-900">
                    {profile?.firstName && profile?.lastName ? `${profile.firstName} ${profile.lastName}` : userName || "Guest"}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Email</span>
                  <span className="font-medium text-gray-900">{userEmail || "N/A"}</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 md:col-span-2">
                  <span className="block text-gray-400 text-xs uppercase tracking-wider mb-1">Phone</span>
                  {profile?.phone ? (
                    <div className="flex items-center gap-2">
                      <Phone className="size-3.5 text-gray-400" />
                      <span className="font-medium text-gray-900">{profile.phone}</span>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <StyledPhoneInput
                            value={phoneNumber}
                            onChange={(val) => setPhoneNumber(val || "")}
                          />
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleSavePhone}
                          disabled={isSavingPhone || !phoneNumber}
                          className="h-10 px-4 bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-xl shadow-sm"
                        >
                          {isSavingPhone ? <Loader2 className="size-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                      <p className="text-[10px] text-red-500 italic font-medium">Please add a phone number to successfully order.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                {!showAddAddress && (
                  <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add New
                  </Button>
                )}
              </div>

              {showAddAddress ? (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">New Address</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowAddAddress(false)}><X className="w-4 h-4" /></Button>
                  </div>
                  <BillingAddressForm
                    onSave={handleCreateAddress}
                    isLoading={false}
                    mode="profile"
                    submitButtonText="Save Address"
                    showDiscardButton
                    onDiscard={() => setShowAddAddress(false)}
                    savedAddresses={savedAddresses}
                    excludeFields={['firstName', 'lastName', 'phone', 'email', 'company']}
                    showTitle={false}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses?.map((addr: any) => (
                    <div
                      key={addr.id}
                      className={`
                                relative p-4 rounded-xl border-2 cursor-pointer transition-all
                                ${selectedAddressId === addr.id ? 'border-[#E87A3F] bg-orange-50' : 'border-gray-100 hover:border-gray-200'}
                            `}
                      onClick={() => setSelectedAddressId(addr.id)}
                    >
                      {selectedAddressId === addr.id && (
                        <div className="absolute top-2 right-2 text-[#E87A3F]"><Check className="w-5 h-5" /></div>
                      )}
                      <div className="flex items-start gap-3">
                        <MapPin className={`w-5 h-5 mt-0.5 ${selectedAddressId === addr.id ? 'text-[#E87A3F]' : 'text-gray-400'}`} />
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">{addr.firstName} {addr.lastName}</p>
                          <p className="text-gray-600 mt-1">{addr.address1}</p>
                          <p className="text-gray-600">{addr.city}, {addr.state} {addr.postalCode}</p>
                          <p className="text-gray-600">{addr.country}</p>
                          {/* Company not in Address model */}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!addresses?.length && (
                    <div className="col-span-full py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                      No addresses found. Please add one.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Order Summary (Between Address and Payment) */}
            <div className="lg:hidden">
              {OrderSummaryContent}
            </div>

            {/* Payment Option */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">Payment Method</h2>

              <div className="space-y-4">
                {/* Credit/Debit Card (Stripe) */}
                <div
                  className="border rounded-lg p-4 transition-all duration-200 border-[#E87A3F] bg-orange-50 ring-1 ring-[#E87A3F]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full border flex items-center justify-center border-[#E87A3F]">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#E87A3F]" />
                      </div>
                      <div className="font-medium text-gray-900">Debit / Credit Card</div>
                    </div>
                    <div className="flex gap-2">
                      <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CreditCard-FeshH2qIe5tLE2CuWZEnJfnkU4FIs7.png" alt="Card" className="h-6 w-auto" />
                    </div>
                  </div>

                  {/* Expanded Content */}
                  <div className="mt-4 pl-8 text-sm text-gray-600 animate-in slide-in-from-top-2 fade-in duration-200">
                    <p className="mb-2">Pay securely with Credit/Debit Card, Google Pay, or Apple Pay via Stripe.</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Check className="w-3 h-3 text-green-500" /> Secure SSL Connection
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <label htmlFor="notes" className="text-lg font-semibold mb-4 block">Order Notes</label>
              <Textarea
                id="notes"
                placeholder="Special instructions for delivery..."
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>

            {/* Place Order - Mobile/Desktop */}
            <StatefulButton
              onClick={handlePlaceOrder}
              disabled={!selectedAddressId || !profile?.phone}
              isLoading={isPlacingOrder}
              loadingText="Processing..."
              className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-lg font-medium rounded-full w-full h-[56px] shadow-lg shadow-orange-200"
            >
              Place Order - ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </StatefulButton>
          </div>

          {/* Right Column: Order Summary (Desktop) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              {OrderSummaryContent}
            </div>
          </div>
        </div>
      </div>
    </div >
  )
}
