"use client";

import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check, Package, Truck, Info, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import ReportIssueModal from "@/components/order/report-issue-modal";
import { CopyButton } from "@/components/ui/copy-button";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { toast } from "sonner";
import useSWR from "swr";
import { trackOrderPublic } from "@/features/orders/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toUpperCase() || "PENDING";
  let colors = "bg-gray-100 text-gray-600";

  if (s === "DELIVERED") colors = "bg-green-100 text-green-700";
  else if (s === "SHIPPED") colors = "bg-blue-100 text-blue-700";
  else if (s === "PAID") colors = "bg-emerald-100 text-emerald-700";
  else if (s === "PROCESSING") colors = "bg-orange-100 text-orange-700";
  else if (s === "CANCELLED" || s === "CANCELED") colors = "bg-red-100 text-red-700";
  else if (s === "PENDING") colors = "bg-amber-100 text-amber-700";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${colors}`}>
      {s === "PAID" ? "PAID" : s}
    </span>
  );
};

export default function TrackOrderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const { isSeller } = useSellerAuth();

  // Navigation & View State
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [roleView, setRoleView] = useState<"buyer" | "seller">("buyer");

  // Popups State
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [showReportPopup, setShowReportPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Rating State
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedback, setFeedback] = useState("");

  // Report State
  const [activeShipment, setActiveShipment] = useState<any>(null);

  // Guest Tracking State
  const [guestIdentifier, setGuestIdentifier] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  // ------------------------------------------------------------------
  // 1. SWR Hook for List View (Lightweight Mode)
  // ------------------------------------------------------------------
  const { data: listData, error: listError, isLoading: listLoading, mutate } = useSWR(
    session?.user ? `/api/orders?page=1&limit=20&role=${roleView}&mode=lite` : null,
    fetcher,
    {
      revalidateOnFocus: true,
      keepPreviousData: true // smooth transition between tabs
    }
  );

  const myOrders = listData?.items || [];

  // Detail View State (Manual fetch is fine for detail as typical flow is list -> detail)
  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  // Handle URL changes to switch views
  useEffect(() => {
    const orderId = searchParams?.get("order");
    if (orderId) {
      setViewMode("detail");
      fetchOrderDetail(orderId);
    } else {
      setViewMode("list");
      setFetchedOrder(null);
    }
  }, [searchParams]);

  // Fetch Detail (Full Mode)
  const fetchOrderDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailError("");
    try {
      // NOTE: Detail fetch still returns full heavy object
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error("Order not found");
      const data = await res.json();
      setFetchedOrder(data);
    } catch (err) {
      setDetailError("Could not load order details.");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOrderClick = (orderId: string) => {
    // Optimistic / Instant Navigation could go here if we cached detail data
    // But for now, URL push triggers the fetch
    const params = new URLSearchParams(searchParams?.toString());
    params.set("order", orderId);
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleBackToList = () => {
    const params = new URLSearchParams(searchParams?.toString());
    params.delete("order");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleApproveOrder = async () => {
    if (!fetchedOrder) return;
    const toastId = toast.loading("Approving order...");
    try {
      const res = await fetch(`/api/orders/${fetchedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PROCESSING' })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to approve");
      }

      toast.dismiss(toastId);
      toast.success("Order approved successfully!");

      // Refresh data
      fetchOrderDetail(fetchedOrder.id);
      mutate(); // Revalidate list
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  const handleOpenReport = (shipment: any = null) => {
    const target = shipment || (fetchedOrder?.vendorOrders ? fetchedOrder.vendorOrders[0] : fetchedOrder);
    setActiveShipment(target);
    setShowReportPopup(true);
  };

  // Helpers
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getItemsCount = () => {
    if (!fetchedOrder) return 0;
    if (fetchedOrder.vendorOrders) {
      return fetchedOrder.vendorOrders.reduce((acc: number, vo: any) => acc + vo.items.length, 0);
    }
    return fetchedOrder.items?.length || 0;
  };

  const getProgressStore = (status: string) => {
    const s = status?.toUpperCase() || "";
    if (s === "DELIVERED") return 100;
    if (s === "SHIPPED") return 75;
    if (s === "PROCESSING" || s === "PAID") return 40;
    return 15;
  };

  // Render List View
  const renderListView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {roleView === 'seller' ? 'Sold Orders' : 'My Purchases'}
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            {roleView === 'seller' ? 'Manage orders for your products' : 'Track and manage your recent purchases'}
          </p>
        </div>

        {/* Helper Switch for Seller */}
        {isSeller && (
          <div className="flex bg-white p-1.5 rounded-[20px] shadow-sm border border-gray-100 shrink-0 self-start md:self-auto">
            {(['buyer', 'seller'] as const).map((role) => (
              <button
                key={role}
                onClick={() => setRoleView(role)}
                className={`px-6 py-2.5 rounded-[16px] text-sm font-bold transition-all capitalize ${roleView === role ? "bg-[#E87A3F] text-white shadow-lg shadow-orange-100" : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                {role === 'buyer' ? 'Buying' : 'Selling'}
              </button>
            ))}
          </div>
        )}

        {!session && (
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 max-w-lg mx-auto w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Track your order</h2>
            <p className="text-gray-500 mb-6 text-sm">Enter your order details to track the status.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!guestIdentifier || !guestEmail) {
                toast.error("Please fill in all fields");
                return;
              }

              setIsTracking(true);
              try {
                const result = await trackOrderPublic(guestIdentifier, guestEmail);
                if (result.success && result.order) {
                  // Manually format the order to match the structure expected by the detail view
                  const formattedOrder = result.order;
                  // If vendorOrders are not populated as expected by the view, adjust accordingly.
                  // The action returns 'vendor' object but not 'vendorOrders' array if it's a vendorOrder itself.
                  // Let's wrap it if needed or component handles it.
                  // renderDetailView handles fetchedOrder.vendorOrders OR [fetchedOrder]

                  setFetchedOrder(formattedOrder);
                  setViewMode("detail");
                  toast.success("Order found!");
                } else {
                  toast.error(result.error || "Order not found");
                }
              } catch (error) {
                toast.error("Failed to track order");
              } finally {
                setIsTracking(false);
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderIdentifier">Order ID or Tracking Number</Label>
                <Input
                  id="orderIdentifier"
                  placeholder="e.g. #12345 or 1Z999..."
                  value={guestIdentifier}
                  onChange={(e) => setGuestIdentifier(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guestEmail">Email Address</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  placeholder="Enter the email used for checkout"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="rounded-xl h-12"
                />
              </div>
              <Button
                type="submit"
                disabled={isTracking}
                className="w-full h-12 rounded-full bg-[#E87A3F] hover:bg-[#d96d34] font-bold text-lg shadow-lg shadow-orange-100 text-white"
              >
                {isTracking ? <Loader2 className="animate-spin" /> : "Track Order"}
              </Button>
            </form>
          </div>
        )}
      </div>

      {listLoading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-[24px] animate-pulse" />)}
        </div>
      ) : myOrders.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-[32px] border border-dashed border-gray-200">
          <Package className="mx-auto h-16 w-16 text-gray-300 mb-6" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't {roleView === 'seller' ? 'sold' : 'placed'} any orders yet.
          </p>
          {roleView === 'buyer' && (
            <Button
              className="bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full px-10 h-12 font-bold shadow-lg shadow-orange-100 transition-all hover:scale-105"
              onClick={() => router.push('/products')}
            >
              Start Shopping
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {myOrders.map((order: any) => {
            // Flexible Data Structure Handling (CustomerOrder vs VendorOrder)
            // LITE MODE NOTE: Structure is slightly flatter in lite mode
            const allItems = order.vendorOrders?.flatMap((vo: any) => vo.items || []) || order.items || [];
            const firstItem = allItems[0];
            const otherItemsCount = Math.max(0, allItems.length - 1);

            // Lite mode might return a condensed status inside vendorOrders check
            const displayStatus = order.vendorOrders?.[0]?.status || order.status || "PROCESSING";

            return (
              <div
                key={order.id}
                onClick={() => handleOrderClick(order.id || order.orderNumber)}
                className="group bg-white border border-gray-100 rounded-[24px] p-6 hover:shadow-xl hover:shadow-orange-500/5 hover:border-orange-100 transition-all cursor-pointer flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between relative overflow-hidden"
              >
                {/* Left: Info */}
                <div className="flex items-center gap-6 w-full sm:w-auto">

                  {/* Image Stack */}
                  <div className="flex -space-x-4 overflow-hidden p-2 pl-0">
                    {allItems.length > 0 ? (
                      allItems.slice(0, 3).map((item: any, idx: number) => (
                        <div key={idx} className="h-20 w-20 bg-white rounded-2xl overflow-hidden flex-shrink-0 relative border-4 border-white shadow-sm ring-1 ring-gray-100">
                          <img
                            src={item.product?.images?.[0]?.url || "/placeholder.png"}
                            className="object-cover w-full h-full"
                            alt=""
                          />
                        </div>
                      ))
                    ) : (
                      <div className="h-20 w-20 bg-orange-50 rounded-2xl flex items-center justify-center border border-gray-100">
                        <Package className="text-[#E87A3F] h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2">
                      <div className="flex items-center gap-3 mb-1">
                        <StatusBadge status={displayStatus} />
                        <span className="text-xs text-gray-400 font-medium">{formatDate(order.createdAt)}</span>
                      </div>
                      <span className="font-black text-gray-900 block truncate text-lg">
                        {firstItem?.product?.name || `Order #${order.orderNumber}`}
                        {otherItemsCount > 0 && <span className="text-gray-400 font-medium ml-1"> +{otherItemsCount} more</span>}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span className="font-medium text-gray-400">ID:</span>
                      <CopyButton
                        value={order.orderNumber}
                        displayText={`#${order.orderNumber}`}
                        className="hover:text-[#E87A3F] font-bold cursor-pointer transition-colors p-0 h-auto"
                        variant="ghost"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Total & Arrow */}
                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end pl-2 sm:pl-0 border-t sm:border-t-0 border-gray-50 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Total</p>
                    <p className="text-xl font-black text-[#E87A3F]">${(order.totalAmount || order.total || 0).toFixed(2)}</p>
                  </div>

                  {isSeller && roleView === 'seller' && (displayStatus === 'PENDING' || displayStatus === 'PAID') && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        // We need to set fetchedOrder to this order to use the same handler, 
                        // OR refactor handler. Let's create a list-specific handler or just set state.
                        // Quickest:
                        setFetchedOrder(order); // Might trigger detail view...
                        // Actually, better to just call API directly here.

                        const approve = async () => {
                          const toastId = toast.loading("Approving order...");
                          try {
                            const res = await fetch(`/api/orders/${order.id}`, {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'PROCESSING' })
                            });
                            if (!res.ok) throw new Error("Failed");
                            toast.dismiss(toastId);
                            toast.success("Order approved");
                            mutate();
                          } catch (e) {
                            toast.dismiss(toastId);
                            toast.error("Failed to approve");
                          }
                        };
                        approve();
                      }}
                      className="h-10 px-4 bg-[#00B69B] hover:bg-[#009b84] text-white font-bold rounded-full shadow-sm shadow-emerald-100"
                    >
                      Approve
                    </Button>
                  )}

                  <div className="h-12 w-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#E87A3F] group-hover:text-white transition-all transform group-hover:scale-110 group-hover:rotate-[-45deg] duration-300 shadow-sm">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Render Detail View
  const renderDetailView = () => (
    <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500">
      <div className="mb-8">
        <button
          onClick={handleBackToList}
          className="flex items-center text-sm font-bold text-gray-400 hover:text-[#E87A3F] transition-colors group"
        >
          <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center mr-3 group-hover:border-[#E87A3F] group-hover:bg-[#E87A3F] group-hover:text-white transition-all">
            <ArrowLeft className="h-4 w-4" />
          </div>
          BACK TO ORDERS
        </button>
      </div>

      {detailLoading && (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-[#E87A3F] animate-spin" />
            <p className="text-gray-500 font-medium animate-pulse">Retrieving order details...</p>
          </div>
        </div>
      )}

      {detailError && (
        <div className="text-center py-20 bg-red-50 rounded-[32px] text-red-600 border border-red-100">
          <p className="font-bold text-lg mb-2">Something went wrong</p>
          <p className="mb-6 opacity-80">{detailError}</p>
          <Button onClick={() => window.location.reload()} variant="outline" className="border-red-200 hover:bg-red-100">Retry</Button>
        </div>
      )}

      {fetchedOrder && !detailLoading && (
        <div className="space-y-8">
          {/* Order Header */}
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm relative overflow-hidden">

            <div className="relative">
              <div className="flex items-center gap-4 mb-3">
                <StatusBadge status={fetchedOrder.status || fetchedOrder.vendorOrders?.[0]?.status || "PROCESSING"} />
                <span className="text-gray-400 text-sm font-medium">Placed {formatDate(fetchedOrder.createdAt)}</span>
              </div>
              <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                Order
                <CopyButton
                  value={fetchedOrder.orderNumber}
                  displayText={`#${fetchedOrder.orderNumber}`}
                  className="hover:text-[#E87A3F] transition-colors cursor-pointer text-[#E87A3F] p-0 h-auto text-4xl font-black"
                  variant="ghost"
                />
              </h1>
              <p className="text-gray-500 mt-2 font-medium">
                {getItemsCount()} {getItemsCount() === 1 ? 'Item' : 'Items'} in this order
              </p>
            </div>

            <div className="flex flex-col items-end gap-3 z-10 relative">
              <div className="text-left md:text-right bg-gray-50/80 px-6 py-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-4xl font-black text-gray-900">${(fetchedOrder.totalAmount || fetchedOrder.total || 0).toFixed(2)}</p>
              </div>

              {/* Seller Approval Button */}
              {isSeller && roleView === 'seller' && (fetchedOrder.status === 'PAID' || fetchedOrder.status === 'PENDING') && (
                <Button
                  onClick={handleApproveOrder}
                  className="bg-[#00B69B] hover:bg-[#009b84] text-white font-bold rounded-full px-8 h-12 shadow-lg shadow-emerald-100 transition-all hover:scale-105"
                >
                  <Check className="mr-2 h-5 w-5" />
                  Approve Order
                </Button>
              )}
            </div>
          </div>

          {/* Shipments Loop - Handle Both Structures */}
          <div className="space-y-6">
            {(fetchedOrder.vendorOrders?.length > 0 ? fetchedOrder.vendorOrders : [fetchedOrder]).map((shipment: any, index: number) => {
              const currentProgress = getProgressStore(shipment.status || "PROCESSING");
              return (
                <div key={shipment.id || index} className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-gray-50 pb-8 mb-8">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                        <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-[#E87A3F]" />
                        </div>
                        {roleView === 'seller' ? 'Order Details' : `Shipment ${index + 1}`}
                      </h3>
                      <div className="ml-14 flex flex-col gap-1">
                        {shipment.vendor?.user?.name && <span className="text-gray-500 text-sm font-medium">Sold by {shipment.vendor.user.name}</span>}
                        {shipment.trackingNumber && <p className="text-sm font-mono bg-gray-100 self-start px-2 py-1 rounded text-gray-600 mt-1">Ref: {shipment.trackingNumber}</p>}
                      </div>
                    </div>

                    {/* Only show actions for Buyers */}
                    {roleView === 'buyer' && (
                      <div className="flex gap-2">
                        {/* Individual shipment actions if needed */}
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {shipment.items?.map((item: any, i: number) => (
                      <div key={i} className="flex gap-4 p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300">
                        <div className="h-20 w-20 bg-white rounded-xl flex-shrink-0 relative overflow-hidden border border-gray-100">
                          <img src={item.product?.images?.[0]?.url || "/placeholder.png"} className="object-cover w-full h-full" alt="" />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-center">
                          <p className="font-bold text-gray-900 line-clamp-2 leading-tight">{item.product?.name || "Product"}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="font-bold text-gray-900">${(item.price || item.product?.price).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="relative bg-gray-50 p-6 rounded-2xl">
                    <div className="overflow-hidden h-3 mb-8 text-xs flex rounded-full bg-gray-200 w-full relative">
                      <div className="absolute top-0 left-0 h-full w-full bg-gray-200"></div>
                      <div style={{ width: `${currentProgress}%` }} className="shadow-lg shadow-orange-500/30 flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#E87A3F] transition-all duration-1000 relative z-10 rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-xs sm:text-sm font-bold text-gray-400 relative">
                      {/* Status Checkpoints */}
                      <div className="text-gray-900 flex flex-col items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-[#E87A3F]"></div>
                        Placed
                      </div>
                      <div className={`flex flex-col items-center gap-2 transition-colors ${currentProgress >= 40 ? "text-gray-900" : ""}`}>
                        <div className={`h-3 w-3 rounded-full transition-colors ${currentProgress >= 40 ? "bg-[#E87A3F]" : "bg-gray-300"}`}></div>
                        Processing
                      </div>
                      <div className={`flex flex-col items-center gap-2 transition-colors ${currentProgress >= 75 ? "text-gray-900" : ""}`}>
                        <div className={`h-3 w-3 rounded-full transition-colors ${currentProgress >= 75 ? "bg-[#E87A3F]" : "bg-gray-300"}`}></div>
                        Shipped
                      </div>
                      <div className={`flex flex-col items-center gap-2 transition-colors ${currentProgress >= 100 ? "text-gray-900" : ""}`}>
                        <div className={`h-3 w-3 rounded-full transition-colors ${currentProgress >= 100 ? "bg-[#E87A3F]" : "bg-green-500"}`}></div>
                        Delivered
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Actions Footer - Only for Buyers */}
          {roleView === 'buyer' && (
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-100">
              <div className="flex-1 text-sm text-gray-500 bg-orange-50/50 p-5 rounded-2xl flex items-center gap-3 border border-orange-100/50">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Info className="h-4 w-4 text-[#E87A3F]" />
                </div>
                <p className="font-medium text-gray-600">Return and review options are available once your order is fully delivered.</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleOpenReport()}
                  disabled={!fetchedOrder.vendorOrders?.every((vo: any) => vo.status?.toUpperCase() === "DELIVERED")}
                  variant="outline"
                  className="h-14 px-8 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-full disabled:opacity-50 text-base"
                >
                  Report Issue
                </Button>
                <Button
                  onClick={() => setShowRatingPopup(true)}
                  disabled={!fetchedOrder.vendorOrders?.every((vo: any) => vo.status?.toUpperCase() === "DELIVERED")}
                  className="h-14 px-10 bg-[#E87A3F] hover:bg-[#d96d34] text-white font-bold rounded-full shadow-xl shadow-orange-200 disabled:opacity-50 text-base disabled:shadow-none"
                >
                  Leave Review
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] sm:mt-[-9rem] mt-[-6.2rem]">
      <EcommerceHeader />
      <main className="container mx-auto px-4 py-10 sm:px-6 sm:py-16 lg:px-8 max-w-[1248px]">
        {viewMode === "list" ? renderListView() : renderDetailView()}
      </main>

      {/* Report Modal */}
      <ReportIssueModal
        order={activeShipment || fetchedOrder}
        isOpen={showReportPopup}
        onClose={() => setShowReportPopup(false)}
        onSuccess={() => {
          setShowReportPopup(false);
          setShowSuccessPopup(true);
        }}
      />

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-[40px] text-center max-w-sm w-full animate-in zoom-in-95 shadow-2xl">
            <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-3xl font-black mb-3 text-gray-900 tracking-tight">Success!</h3>
            <p className="text-gray-500 mb-8 font-medium text-lg leading-relaxed">Your request has been submitted successfully.</p>
            <Button onClick={() => setShowSuccessPopup(false)} className="w-full rounded-full bg-[#E87A3F] font-bold h-14 text-lg hover:bg-[#d96d34] shadow-lg shadow-orange-200">Great, thanks!</Button>
          </div>
        </div>
      )}

      {/* Rating Popup (Can be extracted similarly later) */}
      {showRatingPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 animate-in fade-in duration-200 backdrop-blur-sm">
          <div className="bg-white p-10 rounded-[40px] w-full max-w-lg animate-in zoom-in-95 shadow-2xl">
            <h3 className="text-3xl font-black mb-3 text-center tracking-tight">Rate your experience</h3>
            <p className="text-gray-500 mb-8 text-center font-medium">How was your order?</p>
            <div className="flex gap-3 mb-8 justify-center">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  className={`h-14 w-14 text-4xl transition-all hover:scale-110 active:scale-95 ${selectedRating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className="w-full h-32 bg-gray-50 rounded-2xl p-5 mb-8 focus:ring-2 focus:ring-[#E87A3F] border-none text-base font-medium resize-none"
              placeholder="Tell us what you liked..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-4">
              <Button variant="ghost" className="flex-1 rounded-full font-bold h-14 text-lg" onClick={() => setShowRatingPopup(false)}>Cancel</Button>
              <Button className="flex-1 rounded-full bg-[#E87A3F] h-14 font-bold text-lg hover:bg-[#d96d34] shadow-lg shadow-orange-200" onClick={() => { setShowRatingPopup(false); setShowSuccessPopup(true); }}>Submit Review</Button>
            </div>
          </div>
        </div>
      )}

      <FooterSection />
    </div>
  );
}
