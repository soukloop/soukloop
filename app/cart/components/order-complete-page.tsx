"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Package, Truck } from "lucide-react";
import Image from "next/image";
import useSWR from "swr";
import { getDeliveryStatusText } from "@/hooks/useOrders";
import { CopyButton } from "@/components/ui/copy-button";

interface OrderCompletePageProps {
  orderId?: string;
}

// Fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
};

export default function OrderCompletePage({ orderId }: OrderCompletePageProps) {
  const { clearCart } = useCart();

  // Get session_id from URL if present
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const sessionId = searchParams?.get("session_id");

  // Fetch the CustomerOrder by ID 
  const { data: order, isLoading, error } = useSWR(
    orderId ? `/api/orders/${orderId}${sessionId ? `?session_id=${sessionId}` : ''}` : null,
    fetcher
  );

  const clearedRef = useRef(false);

  // Flatten all items from all vendor orders for display & clearing
  const allItems = useMemo(() => {
    if (!order?.vendorOrders) return [];
    return order.vendorOrders.flatMap((vo: any) =>
      vo.items?.map((item: any) => ({
        ...item,
        vendorName: vo.vendor?.user?.name || 'Seller'
      })) || []
    );
  }, [order?.vendorOrders]);

  useEffect(() => {
    // Only clear cart once when order is loaded and if not already cleared
    if (order && !isLoading && !clearedRef.current) {
      const productIdsToClear = allItems.map((item: any) => item.productId || item.productId);
      if (productIdsToClear.length > 0) {
        clearCart(productIdsToClear);
      }
      clearedRef.current = true;
    }
  }, [order, isLoading, allItems, clearCart]);

  // Get delivery status
  const deliveryStatus = order?.vendorOrders ? getDeliveryStatusText(order) : '';



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Complete Header */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-center text-4xl font-bold">Complete!</h1>
        </div>
      </div>

      {/* Order Complete Content */}
      <div className="container mx-auto px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Card */}
          <div className="rounded-[20px] bg-white p-6 sm:p-10 text-center shadow-md border border-gray-100">
            <div className="mb-8">
              <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-orange-100 text-[#E87A3F]">
                <Package className="size-10" />
              </div>
              <p className="mb-2 text-xl font-medium text-gray-500">Thank you! 🎉</p>
              <h2 className="mb-10 text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Your order has been
                <br />
                successfully placed
              </h2>

              {/* Loading State Skeleton */}
              {isLoading && (
                <div className="space-y-10 animate-pulse">
                  <div className="flex flex-wrap justify-center gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-3">
                        <div className="size-20 sm:size-24 rounded-xl bg-gray-200" />
                        <div className="h-3 w-16 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                  <div className="mx-auto max-w-md h-40 bg-gray-100 rounded-2xl" />
                </div>
              )}

              {/* Order Items from all vendors */}
              {!isLoading && order && allItems.length > 0 && (
                <>
                  <div className="mb-10 flex flex-wrap justify-center gap-x-4 gap-y-8 sm:gap-x-6">
                    {allItems.slice(0, 6).map((item: any) => (
                      <div key={item.id} className="group relative flex flex-col items-center max-w-[80px] sm:max-w-[96px]">
                        <div className="relative size-20 sm:size-24 overflow-hidden rounded-xl bg-gray-50 ring-2 ring-white shadow-sm transition-transform group-hover:scale-105">
                          <Image
                            src={
                              item.product?.images?.[0]?.url ||
                              item.listing?.images?.[0]?.url ||
                              "/placeholder-product.png"
                            }
                            alt={item.product?.name || "Product Image"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <p className="mt-3 text-xs font-medium text-gray-700 text-center line-clamp-2 leading-tight">
                          {item.product?.name || item.listing?.title || "Product"}
                        </p>
                      </div>
                    ))}
                    {allItems.length > 6 && (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex size-20 sm:size-24 items-center justify-center rounded-xl bg-gray-50 border-2 border-dashed border-gray-200 text-gray-400 font-bold text-sm">
                          +{allItems.length - 6}
                        </div>
                        <span className="text-xs font-medium text-gray-400">More items</span>
                      </div>
                    )}
                  </div>

                  {/* Order Summary Details */}
                  <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/50 text-left">
                    <div className="bg-white/50 px-6 py-4 border-b border-gray-100">
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Order Summary</h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Order ID</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 font-mono">
                            {order.orderNumber || `#${order.id.slice(0, 8)}`}
                          </span>
                          <CopyButton
                            value={order.orderNumber || order.id}
                            className="p-0 h-auto text-gray-400 hover:text-[#E87A3F]"
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(order.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Total Paid</span>
                        <span className="text-xl font-bold text-[#E87A3F]">
                          ${order.totalAmount?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Multi-Vendor Shipments Breakdown */}
                  {order.vendorOrders?.length > 1 && (
                    <div className="mt-8 mx-auto max-w-md text-left">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 pl-1">
                        Split Shipments ({order.vendorOrders.length})
                      </p>
                      <div className="space-y-3">
                        {order.vendorOrders.map((vo: any, idx: number) => (
                          <div key={vo.id} className="group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#E87A3F]/30 transition-all">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-[#E87A3F]">
                              <Truck className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                Shipment {idx + 1}
                              </p>
                              <p className="text-xs text-gray-500">
                                {vo.vendor?.user?.name || 'Seller'}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${vo.status === 'PAID'
                                ? 'bg-green-50 text-green-600'
                                : vo.status === 'PROCESSING'
                                  ? 'bg-orange-50 text-[#E87A3F]'
                                  : 'bg-gray-50 text-gray-500'
                                }`}>
                                {vo.status === 'PAID' ? 'Confirmed' : vo.status.charAt(0).toUpperCase() + vo.status.slice(1).toLowerCase()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Error/Empty States */}
              {(error || (!isLoading && !order && orderId)) && (
                <div className="py-10 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-red-500 font-medium">
                    {error ? "Failed to load order details." : "Order details not found."}
                  </p>
                </div>
              )}

              {!orderId && !isLoading && (
                <div className="py-10 bg-gray-50 rounded-2xl border border-gray-100">
                  <p className="text-gray-500">Redirecting to history...</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href={order ? "/track-orders" : "/editprofile?section=my-orders"}
                  className="w-full sm:flex-1 max-w-[280px]"
                >
                  <Button className="w-full h-14 rounded-full bg-orange-50 text-[#E87A3F] border border-orange-100 text-base font-bold hover:bg-orange-100 hover:text-[#d96d34] transition-all">
                    Track Order
                  </Button>
                </Link>

                <Link href="/products" className="w-full sm:flex-1 max-w-[280px]">
                  <Button className="w-full h-14 rounded-full bg-[#E87A3F] text-white text-base font-bold shadow-lg shadow-orange-200 hover:bg-[#d96d34] hover:-translate-y-0.5 transition-all">
                    Shop More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
