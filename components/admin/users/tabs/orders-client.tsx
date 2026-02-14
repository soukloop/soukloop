"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Interface shared with my-orders.tsx, duplicated here to avoid tight coupling with protected user app
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
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'buying' | 'selling'>(initialViewMode);
    const [activeTab, setActiveTab] = useState("All Order");

    const handleViewModeChange = (mode: 'buying' | 'selling') => {
        setViewMode(mode);
        setActiveTab("All Order");
    };

    // Tabs
    const buyerTabs = ["All Order", "To Receive", "Delivered", "Reviews"];
    const sellerTabs = ["All Order", "To Ship", "Delivered", "Reviews"];

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
                case "Reviews":
                    return currentOrders.filter((order) => order.status.toUpperCase() === "DELIVERED"); // Simplified
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
            {/* View Switcher */}
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

            {/* Content */}
            <div className="p-0">
                <AdminOrderListTable orders={filteredOrders} viewMode={viewMode} />
            </div>
        </div>
    );
}

// Reused Table Component (Adapted for Admin)
function AdminOrderListTable({ orders, viewMode }: { orders: DisplayOrder[], viewMode: 'buying' | 'selling' }) {
    const router = useRouter();

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
        } catch (e) { return dateString; }
    };

    const getStatusColor = (status: string) => {
        switch (status.toUpperCase()) {
            case "PENDING": return "bg-amber-500";
            case "PAID": return "bg-emerald-500";
            case "PROCESSING": return "bg-[#E87A3F]";
            case "SHIPPED": return "bg-blue-500";
            case "DELIVERED": return "bg-green-600";
            case "CANCELED": return "bg-red-500";
            case "REFUNDED": return "bg-gray-500";
            default: return "bg-gray-400";
        }
    };

    // For Admin, we always link to Admin Order Details
    const navigateToDetails = (orderId: string) => {
        router.push(`/admin/orders/${orderId}`);
    };

    if (!orders || orders.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white">
                <div className="bg-slate-50 p-4 rounded-full mb-3">
                    <span className="text-3xl">📦</span>
                </div>
                <p className="text-gray-500 font-medium">No orders found in this category.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-[15%] py-3 px-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Order ID</th>
                        <th className="w-[25%] py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Products</th>
                        <th className="w-[15%] py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Date</th>
                        <th className="w-[15%] py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Status</th>
                        <th className="w-[10%] py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Price</th>
                        <th className="w-[10%] py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Track</th>
                        <th className="w-[10%] py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider md:px-6 md:py-4 md:text-sm">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {orders.map((order) => (
                        <tr
                            key={order.id}
                            onClick={() => navigateToDetails(order.id)}
                            className="cursor-pointer transition-colors hover:bg-gray-50"
                        >
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 md:px-6 md:py-4">
                                {order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500 md:px-6 md:py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3 overflow-hidden p-1 flex-shrink-0">
                                        {(order.productImages?.length || 0) > 0 ? (
                                            order.productImages.slice(0, 3).map((img, idx) => (
                                                <div key={idx} className="h-10 w-10 bg-white rounded-lg overflow-hidden border-2 border-white shadow-sm flex-shrink-0 relative">
                                                    <img src={img} className="object-cover w-full h-full" alt="" />
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100 flex-shrink-0">
                                                <Loader2 className="text-gray-300 h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="line-clamp-2 max-w-[200px]">
                                        {(order.productNames?.length || 0) > 0 ? order.productNames.join(', ') : 'Product'}
                                    </div>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500 md:px-6 md:py-4 whitespace-nowrap">
                                {formatDate(order.createdAt)}
                            </td>
                            <td className="py-3 px-4 md:px-6 md:py-4">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase text-white ${getStatusColor(order.status)}`}>
                                    {order.status}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-[#E87A3F] md:px-6 md:py-4">
                                ${order.total.toFixed(2)}
                            </td>
                            <td className="py-3 px-4 text-center md:px-6 md:py-4">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={(e) => {
                                    e.stopPropagation();
                                    // Add tracking logic here if needed
                                }}>
                                    <Eye className="h-4 w-4 text-gray-400" />
                                </Button>
                            </td>
                            <td className="py-3 px-4 text-center md:px-6 md:py-4">
                                <Button size="sm" variant="ghost" className="text-[#E87A3F] hover:text-[#d6692f] hover:bg-orange-50 p-0 h-auto">
                                    View
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
