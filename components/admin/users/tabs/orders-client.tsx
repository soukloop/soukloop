"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getOrderStatusColor } from "@/lib/utils";

import { OrderListTable } from "@/app/edit-profile/components/my-orders";

// Interface shared with my-orders.tsx
export interface DisplayOrder {
    id: string;
    orderNumber: string;
    createdAt: string;
    status: string;
    total: number;
    type: "buyer" | "seller";
    productNames: string[];
    productImages: string[];
    deliveryText?: string;
}

interface OrdersClientProps {
    buyerOrders: DisplayOrder[];
    sellerOrders: DisplayOrder[];
    initialViewMode?: 'buying' | 'selling';
}

export default function OrdersClient({ buyerOrders, sellerOrders, initialViewMode = 'buying' }: OrdersClientProps) {
    const [viewMode, setViewMode] = useState<'buying' | 'selling'>(initialViewMode);
    const [activeTab, setActiveTab] = useState("All Order");

    const handleViewModeChange = (mode: 'buying' | 'selling') => {
        setViewMode(mode);
        setActiveTab("All Order");
    };

    const hasSellerOrders = sellerOrders && sellerOrders.length > 0;

    // Tabs - Removed 'Reviews' for Admin View as requested
    const buyerTabs = ["All Order", "To Receive", "Delivered"];
    const sellerTabs = ["All Order", "To Ship", "Delivered"];

    const currentTabs = viewMode === 'buying' ? buyerTabs : sellerTabs;

    // Filter Logic
    const currentOrders = viewMode === 'buying' ? buyerOrders : sellerOrders;

    const getFilteredOrders = () => {
        if (viewMode === 'buying') {
            switch (activeTab) {
                case "To Receive":
                    return currentOrders.filter((order) =>
                        ["PENDING", "PARTIAL", "PROCESSING", "SHIPPED", "Processing", "Shipped"].includes(order.status.toUpperCase())
                    );
                case "Delivered":
                    return currentOrders.filter((order) => order.status.toUpperCase() === "DELIVERED");
                default:
                    return currentOrders;
            }
        } else {
            switch (activeTab) {
                case "To Ship":
                    return currentOrders.filter((order) =>
                        ["PENDING", "PAID", "PROCESSING"].includes(order.status.toUpperCase())
                    );
                case "Delivered":
                    return currentOrders.filter((order) => ["DELIVERED"].includes(order.status.toUpperCase()));
                default:
                    return currentOrders;
            }
        }
    };

    const filteredOrders = getFilteredOrders();

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* View Switcher - Only visible if the user is a seller */}
            {hasSellerOrders && (
                <div className="flex justify-center pt-6 pb-2 bg-white">
                    <div className="bg-gray-100 p-1 rounded-full flex relative w-[240px]">
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
            )}

            {/* Tabs */}
            <div className="border-b border-gray-100">
                <nav className="flex justify-evenly px-4 md:px-0">
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

            {/* Content using REUSED OrderListTable with Admin-only path prefixes */}
            <div className="p-4 md:p-6 bg-white">
                <OrderListTable
                    orders={filteredOrders}
                    viewMode={viewMode}
                    detailPathPrefix="/admin/orders"
                    showAcceptColumn={false}
                    showReviewColumn={false}
                    isAdmin={true}
                />
            </div>
        </div>
    );
}
