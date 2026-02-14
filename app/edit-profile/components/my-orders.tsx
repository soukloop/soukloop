"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useOrders, useVendorOrders, getDeliveryStatusText, getOverallStatus } from "@/hooks/useOrders";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/StatefulButton";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import type { CustomerOrder, VendorOrder } from "@/types/api";
import ReturnRefundPopup from "@/components/order/return-refund-popup";
import { CheckCircle, Store } from "lucide-react";
import dynamic from 'next/dynamic';

const SellerReviewsSection = dynamic(() => import('./SellerReviewsSection'), {
  loading: () => <div className="h-96 w-full animate-pulse bg-gray-50 rounded-lg" />,
});

// For display in the table, we use a unified type
export interface DisplayOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;  // For vendor orders: direct status, for customer orders: computed
  total: number;
  type: "buyer" | "seller";
  productNames: string[];
  productImages: string[];
  deliveryText?: string;  // "1 of 2 Delivered" for customer orders
}

// Convert CustomerOrder to DisplayOrder for buyer view
function customerOrderToDisplay(order: CustomerOrder): DisplayOrder {
  // Collect all product names and images from all vendor orders
  const productNames: string[] = [];
  const productImages: string[] = [];

  order.vendorOrders?.forEach(vo => {
    vo.items?.forEach(item => {
      if (item.product?.name || item.product?.title) {
        productNames.push(item.product.name || item.product.title!);
      }
      const imgUrl = item.product?.images?.[0]?.url;
      if (imgUrl) {
        productImages.push(imgUrl);
      }
    });
  });

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: getOverallStatus(order),
    total: order.totalAmount,
    type: "buyer",
    productNames,
    productImages,
    deliveryText: getDeliveryStatusText(order)
  };
}

// Convert VendorOrder to DisplayOrder for seller view  
function vendorOrderToDisplay(order: VendorOrder): DisplayOrder {
  const productNames = order.items?.map(item => item.product?.name || item.product?.title || 'Product') || [];
  const productImages = order.items?.map(item => item.product?.images?.[0]?.url).filter(Boolean) as string[] || [];

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    status: order.status,
    total: order.total,
    type: "seller",
    productNames,
    productImages
  };
}

// Reusable Order Table Component
export function OrderListTable({
  orders,
  showReviewColumn = false,
  showAcceptColumn = false,
  isLoading = false,
  onOrderAccepted,
  onAccept,
  onReturnRefund,
  detailPathPrefix,
  sourceTab,
  viewMode,
}: {
  orders: DisplayOrder[];
  showReviewColumn?: boolean;
  showAcceptColumn?: boolean;
  isLoading?: boolean;
  onOrderAccepted?: () => void;
  onAccept?: (orderId: string) => Promise<void>;
  onReturnRefund?: (orderId: string) => void;
  detailPathPrefix?: string;
  sourceTab?: string;
  viewMode?: 'buying' | 'selling';
}) {
  const router = useRouter();
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);

  const hasActionColumn = showAcceptColumn || viewMode === 'buying' || (orders && orders.some(o => o.type === "buyer"));

  const handleAcceptOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); // Prevent row click
    setAcceptingOrderId(orderId);
    try {
      if (onAccept) {
        await onAccept(orderId);
      } else {
        const res = await fetch(`/api/orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'PROCESSING' })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to accept order');
        }
        toast.success('Order accepted!');
      }
      onOrderAccepted?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept order');
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return "bg-amber-500";
      case "PAID":
        return "bg-emerald-500";
      case "PROCESSING":
        return "bg-[#E87A3F]";
      case "SHIPPED":
        return "bg-blue-500";
      case "DELIVERED":
        return "bg-green-600";
      case "PARTIAL":
        return "bg-sky-500";
      case "CANCELED":
        return "bg-red-500";
      case "REFUNDED":
        return "bg-gray-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusLabel = (order: DisplayOrder) => {
    // For buyer orders, use the computed deliveryText
    if (order.type === "buyer" && order.deliveryText) {
      return order.deliveryText;
    }

    // For seller orders, use direct status
    switch (order.status.toUpperCase()) {
      case "PENDING":
        return "Pending";
      case "PAID":
        return "Paid";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "DELIVERED":
        return "Delivered";
      case "CANCELED":
        return "Cancelled";
      case "REFUNDED":
        return "Refunded";
      default:
        return order.status;
    }
  };

  const navigateToDetails = (orderId: string) => {
    if (detailPathPrefix) {
      router.push(`${detailPathPrefix}/${orderId}`);
      return;
    }
    router.push(`/order-details?id=${orderId}${sourceTab ? `&tab=${sourceTab}` : ''}`);
  };

  const handleTrackOrder = (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation();
    router.push(`/trackorders?order=${orderId}`);
  };

  // ... (inside OrderListTable)
  // Removed early return if (isLoading) ...

  return (
    <>
      {/* Mobile View - Cards Layout */}
      <div className="md:hidden space-y-4">
        {isLoading ? (
          // Mobile Skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="h-14 w-14 rounded-lg flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-50">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
          ))
        ) : (!orders || orders.length === 0) ? (
          <div className="py-8 text-center text-gray-500 border border-dashed rounded-lg">
            No orders found.
          </div>
        ) : (
          orders.map((order) => (
            // ... (existing card render code)
            <div
              key={`${order.id}-${order.type}-mobile`}
              onClick={() => navigateToDetails(order.id)}
              className="group relative flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all active:scale-[0.99] active:bg-gray-50"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <span className="text-xs font-bold text-gray-500">
                  #{order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow-sm ${getStatusColor(order.status || '')}`}
                >
                  {getStatusLabel(order)}
                </span>
              </div>

              {/* Body */}
              <div className="flex gap-3">
                <div className="flex -space-x-4 overflow-hidden p-1 flex-shrink-0">
                  {(order.productImages?.length || 0) > 0 ? (
                    order.productImages?.slice(0, 3).map((img, idx) => (
                      <div key={idx} className="h-14 w-14 bg-white rounded-xl overflow-hidden border-2 border-white shadow-sm flex-shrink-0 relative">
                        <img src={img} className="object-cover w-full h-full" alt="" />
                      </div>
                    ))
                  ) : (
                    <div className="h-14 w-14 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 flex-shrink-0">
                      <Loader2 className="text-gray-300 h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 mb-1">
                    {order.productNames.length > 0 ? order.productNames.join(', ') : 'Product'}
                  </h3>
                  <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-2 flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-base font-bold text-[#E87A3F]">
                  ${order.total.toFixed(2)}
                </span>
                <div className="flex items-center gap-3">
                  {order.type === "buyer" && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (order.status.toUpperCase() === "DELIVERED") {
                          onReturnRefund?.(order.id);
                        } else {
                          handleTrackOrder(e, order.orderNumber || order.id);
                        }
                      }}
                      className="h-8 rounded-full bg-[#E87A3F] px-4 text-xs font-bold text-white hover:bg-[#d6692f]"
                    >
                      {order.status.toUpperCase() === "DELIVERED" ? "Return / Refund" : "Track"}
                    </Button>
                  )}
                  {showAcceptColumn && order.status === "PENDING" && (
                    <Button
                      size="sm"
                      onClick={(e) => handleAcceptOrder(e, order.id)}
                      disabled={acceptingOrderId === order.id}
                      className="h-8 rounded-full bg-[#00B69B] px-4 text-xs font-bold text-white hover:bg-[#009b84]"
                    >
                      {acceptingOrderId === order.id ? <Loader2 className="size-3 animate-spin" /> : "Accept"}
                    </Button>
                  )}
                  {showReviewColumn && (
                    <button className="flex items-center text-xs font-bold text-[#E87A3F]">
                      View Details
                      <svg
                        className="ml-1 size-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  {!showAcceptColumn && !showReviewColumn && !((order.type === "buyer" && order.status !== "PENDING")) && (
                    <span className="text-xs font-medium text-gray-400">Tap to view</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block overflow-x-auto border border-gray-100 rounded-lg">
        <table className="w-full border-collapse table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-[15%] py-3 px-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Order ID</th>
              <th className="w-[30%] py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Products</th>
              <th className="w-[15%] py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Date</th>
              <th className="w-[15%] py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Status</th>
              <th className="w-[10%] py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">{showReviewColumn ? "Review" : "Price"}</th>
              {hasActionColumn && (
                <th className="w-[15%] py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">{showAcceptColumn ? "Action" : "Track"}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {isLoading ? (
              // Desktop Skeletons
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="py-3 px-4 md:px-6 md:py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3 px-4 md:px-6 md:py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 md:px-6 md:py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="py-3 px-4 md:px-6 md:py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                  <td className="py-3 px-4 md:px-6 md:py-4 text-right"><Skeleton className="h-5 w-16 ml-auto" /></td>
                  {hasActionColumn && <td className="py-3 px-4 md:px-6 md:py-4"><Skeleton className="h-8 w-20 rounded-full mx-auto" /></td>}
                </tr>
              ))
            ) : (!orders || orders.length === 0) ? (
              <tr>
                <td colSpan={hasActionColumn ? 6 : 5} className="py-8 text-center text-gray-500">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                // ... (Existing Desktop Row)
                <tr
                  key={`${order.id}-${order.type}`}
                  onClick={() => navigateToDetails(order.id)}
                  className="cursor-pointer transition-colors hover:bg-gray-50"
                >
                  <td className="w-[15%] whitespace-nowrap py-3 px-4 text-sm font-medium text-gray-900 md:px-6 md:py-4">
                    {order.orderNumber || order.id?.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="w-[30%] py-3 px-4 text-sm text-gray-500 md:px-6 md:py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3 overflow-hidden p-1 flex-shrink-0">
                        {(order.productImages?.length || 0) > 0 ? (
                          order.productImages?.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="h-12 w-12 bg-white rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0 relative">
                              <img src={img} className="object-cover w-full h-full" alt="" />
                            </div>
                          ))
                        ) : (
                          <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                            <Loader2 className="text-gray-300 h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="line-clamp-2">
                        {(order.productNames?.length || 0) > 0 ? order.productNames?.join(', ') : 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="w-[15%] whitespace-nowrap py-3 px-4 text-sm text-gray-500 md:px-6 md:py-4">
                    {formatDate(order.createdAt || '')}
                  </td>
                  <td className="w-[15%] whitespace-nowrap py-3 px-4 md:px-6 md:py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase text-white ${getStatusColor(order.status || '')}`}>
                      {getStatusLabel(order)}
                    </span>
                  </td>
                  <td className="w-[10%] whitespace-nowrap py-3 px-4 text-right text-sm md:px-6 md:py-4">
                    {showReviewColumn ? (
                      <button className="inline-flex items-center font-bold text-[#E87A3F] hover:text-[#d6692f]">
                        View
                        <svg className="ml-1 size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <span className="font-bold text-[#E87A3F]">${order.total.toFixed(2)}</span>
                    )}
                  </td>
                  {(showAcceptColumn || order.type === "buyer") && (
                    <td className="w-[13%] whitespace-nowrap py-3 px-4 text-center md:px-6 md:py-4">
                      {order.type === "seller" ? (
                        order.status === "PENDING" ? (
                          <StatefulButton
                            onClick={(e) => handleAcceptOrder(e, order.id)}
                            isLoading={acceptingOrderId === order.id}
                            loadingText="Accepting..."
                            className="bg-[#00B69B] hover:bg-[#00927d] text-white text-xs px-4 py-2 h-9 rounded-full font-bold shadow-sm shadow-emerald-100 border-none transition-all active:scale-95"
                          >
                            <Check className="size-4 mr-1.5" /> Approve Order
                          </StatefulButton>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )
                      ) : (
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (order.status.toUpperCase() === "DELIVERED") {
                              onReturnRefund?.(order.id);
                            } else {
                              handleTrackOrder(e, order.orderNumber || order.id);
                            }
                          }}
                          className="h-8 rounded-full bg-[#E87A3F] px-2 md:px-4 text-[10px] md:text-xs font-bold text-white hover:bg-[#d6692F]"
                        >
                          {order.status.toUpperCase() === "DELIVERED" ? "Return / Refund" : "Track Order"}
                        </Button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { isSeller } = useSellerAuth();

  // View Mode: 'buying' or 'selling'. Default to buying.
  // Unless user is seller, then we might want to default to selling or persist choice? 
  // For now, default to buying, consistent with "My Orders".
  const [viewMode, setViewMode] = useState<'buying' | 'selling'>('buying');
  const [activeTab, setActiveTab] = useState("All Order");

  // Reset tab when switching view modes
  const handleViewModeChange = (mode: 'buying' | 'selling') => {
    setViewMode(mode);
    setActiveTab("All Order");
  };

  // CONDITIONAL FETCHING: Only fetch what is needed for the current view
  // If viewMode is 'buying' -> Fetch buyer orders, disable seller orders
  // If viewMode is 'selling' -> Fetch seller orders, disable buyer orders
  const {
    data: buyerOrders,
    isLoading: isLoadingBuyer,
    mutate: mutateBuyer
  } = useOrders(viewMode === 'buying'); // Only fetch if in buying mode

  // Only fetch vendor orders if user IS a seller AND in selling mode
  const {
    data: sellerOrders,
    isLoading: isLoadingSeller,
    mutate: mutateSeller
  } = useVendorOrders(isSeller && viewMode === 'selling');

  // Convert to display format
  const buyerDisplayOrders: DisplayOrder[] = Array.isArray(buyerOrders)
    ? buyerOrders.map(customerOrderToDisplay)
    : [];

  const sellerDisplayOrders: DisplayOrder[] = Array.isArray(sellerOrders)
    ? sellerOrders.map(vendorOrderToDisplay)
    : [];

  const isLoading = viewMode === 'buying' ? isLoadingBuyer : isLoadingSeller;

  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<CustomerOrder | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Tabs based on View Mode
  const buyerTabs = ["All Order", "To Receive", "Delivered", "Reviews"];
  const sellerTabs = ["All Order", "To Ship", "Delivered", "Reviews"]; // Removed "To Receive" from seller tabs as it is confusing

  const currentTabs = viewMode === 'buying' ? buyerTabs : sellerTabs;

  const getFilteredOrders = (): DisplayOrder[] => {
    // If we are in buying mode, filter buyerDisplayOrders
    if (viewMode === 'buying') {
      switch (activeTab) {
        case "To Receive":
          return buyerDisplayOrders.filter((order) =>
            order.status === "PENDING" || order.status === "PARTIAL" || order.status === "Processing" || order.status === "Shipped"
          );
        case "Delivered":
          return buyerDisplayOrders.filter((order) => order.status === "DELIVERED");
        case "Reviews":
          return buyerDisplayOrders.filter((order) => order.status === "DELIVERED");
        default:
          return buyerDisplayOrders;
      }
    }
    // If we are in selling mode, filter sellerDisplayOrders
    else {
      switch (activeTab) {
        case "To Ship":
          return sellerDisplayOrders.filter((order) =>
            order.status === "PENDING" || order.status === "PAID" || order.status === "PROCESSING"
          );
        case "Delivered":
          return sellerDisplayOrders.filter((order) => order.status === "DELIVERED" || order.status === "Delivered");
        default:
          return sellerDisplayOrders;
      }
    }
  };

  const filteredOrders = getFilteredOrders();

  const targetTab = viewMode === 'selling'
    ? (activeTab === "To Ship" ? "to_ship" : activeTab === "Delivered" ? "delivered" : "all")
    : (activeTab === "To Receive" ? "shipped" : activeTab === "Delivered" ? "delivered" : "all");

  return (
    <div className="w-full bg-white">
      {/* View Switcher (Visible to All Users) */}
      <div className="flex justify-center pt-6 pb-2">
        <div className="bg-gray-100 p-1 rounded-full flex relative w-[240px]">
          {/* Sliding Background */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#E87A3F] rounded-full shadow-sm transition-all duration-300 ease-in-out ${viewMode === 'selling' ? 'translate-x-[116px]' : 'translate-x-0'
              }`}
          />

          <button
            onClick={() => handleViewModeChange('buying')}
            className={`flex-1 relative z-10 text-sm font-bold py-1.5 rounded-full transition-colors ${viewMode === 'buying' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Buying
          </button>
          <button
            onClick={() => handleViewModeChange('selling')}
            className={`flex-1 relative z-10 text-sm font-bold py-1.5 rounded-full transition-colors ${viewMode === 'selling' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            Selling
          </button>
        </div>
      </div>

      {/* Order Tabs */}
      <div className="border-b border-gray-100">
        <nav className="flex justify-evenly px-4 md:px-0 border-b border-gray-100">
          {currentTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap border-b-2 py-3 px-2 text-sm font-bold transition-colors md:py-4 md:text-base
                ${activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders Table or Seller CTA */}
      <div className="p-4 md:p-6">
        {viewMode === 'selling' && !isSeller ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="bg-orange-50 p-4 rounded-full">
              <Store className="w-12 h-12 text-[#E87A3F]" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Start Selling on Soukloop</h3>
            <p className="text-gray-500 max-w-md">
              You haven't set up a seller account yet. Join our marketplace to start selling your products to thousands of customers.
            </p>
            <Button
              onClick={() => router.push('/become-a-seller')}
              className="mt-4 rounded-full bg-[#E87A3F] px-8 font-bold text-white hover:bg-[#d6692f]"
            >
              Become a Seller
            </Button>
          </div>
        ) : activeTab === 'Reviews' ? (
          <div className="p-4 sm:p-6">
            <SellerReviewsSection />
          </div>
        ) : (
          <OrderListTable
            orders={filteredOrders}
            showReviewColumn={false}
            showAcceptColumn={false}
            isLoading={isLoading}
            viewMode={viewMode}
            onOrderAccepted={() => {
              mutateBuyer();
              mutateSeller();
            }}
            onReturnRefund={(orderId) => {
              const order = buyerOrders?.find((o: any) => o.id === orderId);
              if (order) setSelectedOrderForReturn(order);
            }}
            sourceTab={targetTab}
          />
        )}
      </div>

      {/* Return/Refund Popup */}
      {
        selectedOrderForReturn && (
          <ReturnRefundPopup
            order={selectedOrderForReturn}
            onClose={() => setSelectedOrderForReturn(null)}
            onSuccess={() => {
              setSelectedOrderForReturn(null);
              setShowSuccessPopup(true);
            }}
          />
        )
      }

      {/* Success Popup */}
      {
        showSuccessPopup && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white p-8 rounded-[32px] text-center max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black mb-2">Request Submitted</h3>
              <p className="text-gray-500 mb-8">We have received your request and will get back to you shortly via email.</p>
              <Button
                onClick={() => setShowSuccessPopup(false)}
                className="w-full rounded-full bg-[#E87A3F] hover:bg-[#d96d34] h-14 font-bold text-white shadow-lg shadow-orange-100"
              >
                Close
              </Button>
            </div>
          </div>
        )
      }
    </div >
  );
}
