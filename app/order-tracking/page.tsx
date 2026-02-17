import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Truck, MessageCircle, Package, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getMyOrders } from "@/features/orders/actions";
import { Pagination } from "@/components/ui/pagination";
import { isAtLeastAdmin } from "@/lib/roles";

// =============================================================================
// TYPES
// =============================================================================

interface OrderItem {
    id: string;
    productName: string;
    productImage: string;
    quantity: number;
    size: string;
    price: number;
    productId: string;
    sellerId: string;
}

interface Order {
    id: string;
    orderNumber: string;
    status: string;
    createdAt: string | Date;
    shippedAt: string | Date | null;
    deliveredAt: string | Date | null;
    items: OrderItem[];
    shippingAddress: any;
    total: number;
    user?: {
        name: string;
        email: string;
    };
}

// =============================================================================
// COMPONENTS
// =============================================================================

function FilterLink({ name, value, currentParams, children, className }: any) {
    // Construct new URLSearchParams
    const params = new URLSearchParams(currentParams);

    if (value === 'All') {
        params.delete(name);
    } else {
        params.set(name, value);
    }

    // Always reset page when changing filters
    if (name !== 'page') {
        params.delete('page');
    }

    return (
        <Link href={`?${params.toString()}`} className={className}>
            {children}
        </Link>
    );
}

function OrderCard({ order, isSeller }: { order: Order; isSeller: boolean }) {
    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "Pending";
            case "PROCESSING": return "Processing";
            case "PAID": return "Paid";
            case "PARTIAL": return "Shipped";
            case "SHIPPED": return "Shipped";
            case "DELIVERED": return "Delivered";
            case "CANCELED": return "Cancelled";
            case "REFUNDED": return "Refunded";
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "PENDING": return "bg-amber-100 text-amber-700";
            case "PROCESSING":
            case "PAID": return "bg-blue-100 text-blue-700";
            case "PARTIAL":
            case "SHIPPED": return "bg-indigo-100 text-indigo-700";
            case "DELIVERED": return "bg-emerald-100 text-emerald-700";
            case "CANCELED":
            case "REFUNDED": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="group rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow mb-4 last:mb-0">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 pb-3 border-b border-gray-100">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <span className="text-sm font-bold text-[#E87A3F]">
                        #{order.orderNumber}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                    </span>
                </div>
                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                    {formatDate(order.createdAt)}
                </span>
            </div>

            {/* Items */}
            <div className="space-y-2">
                {order.items.slice(0, 3).map((item, idx) => (
                    <div key={`${item.id}-${idx}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                            {item.productImage ? (
                                <Image
                                    src={item.productImage}
                                    alt={item.productName}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex size-full items-center justify-center bg-gray-100 text-xs text-gray-400">No Img</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {item.productName}
                            </p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-sm font-bold text-gray-900 mb-auto mt-1">
                            ${Number(item.price).toFixed(2)}
                        </span>
                    </div>
                ))}
                {order.items.length > 3 && (
                    <div className="text-center pt-1">
                        <span className="text-xs text-gray-400 font-medium">+{order.items.length - 3} more items</span>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                    <Link
                        href={`/trackorders?order=${order.orderNumber}`}
                        className="flex items-center justify-center h-8 px-3 rounded-lg bg-orange-50 text-[#E87A3F] text-xs font-bold hover:bg-[#E87A3F] hover:text-white transition-colors"
                    >
                        Track Order
                    </Link>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="text-lg font-bold text-[#E87A3F]">${order.total.toFixed(2)}</p>
                </div>
            </div>
        </div>
    );
}

function FiltersLinkSection({ title, options, selected, paramKey, searchParams }: any) {
    return (
        <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
            <h3 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-gray-900">{title}</h3>
            <div className="space-y-2.5">
                {options.map((option: string) => {
                    const isSelected = selected === option || (selected === undefined && option === 'All');
                    return (
                        <FilterLink
                            key={option}
                            name={paramKey}
                            value={option}
                            currentParams={searchParams}
                            className="group flex cursor-pointer items-center gap-3"
                        >
                            <div className="relative flex items-center justify-center">
                                <div className={`size-4 rounded-full border transition-all ${isSelected ? "border-[#E87A3F] border-4" : "border-gray-300 group-hover:border-[#E87A3F]"}`} />
                            </div>
                            <span className={`text-[13px] transition-colors ${isSelected ? "font-bold text-gray-900" : "text-gray-500 group-hover:text-gray-700"}`}>
                                {option}
                            </span>
                        </FilterLink>
                    );
                })}
            </div>
        </div>
    );
}

// =============================================================================
// PAGE
// =============================================================================

export default async function OrderDetailsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/signin?callbackUrl=/order-details");
    }

    const role = (session.user as any).role;
    const isSeller = isAtLeastAdmin(role) || (session.user as any).isVendor;

    // Extract params
    const activeTab = typeof searchParams.tab === 'string' ? searchParams.tab : 'all';
    const statusParam = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    const dateParam = typeof searchParams.date === 'string' ? searchParams.date : undefined;
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;

    // Determine fetch role
    const fetchRole = (activeTab === 'to_ship' || (isSeller && activeTab === 'returns')) ? 'seller' : 'buyer';

    // Default to buyer unless strict seller tab specific or they are managing their store
    // actually mixed tabs might be confusing. 
    // Let's stick to the previous behavior where tabs defined the view.
    // However, if I am a seller, I want to see my sales.
    // If I am a buyer, I want to see my orders.
    // We might need a toggle "Switch to Selling / Switch to Buying"? 
    // For now, let's assume if 'to_ship' or 'returns' it's selling. 
    // If 'processing'/'shipped' it's buying? 
    // Actually simplicity: if isSeller, we show seller tabs. If not, buyer tabs.
    // The tabs define what is shown.

    const mode = isSeller ? 'seller' : 'buyer'; // Actually we should respect the previous logic: "isSeller" hook checked if user HAS vendor profile.

    // Wait, if I am a seller, I likely ALSO buy things. 
    // The previous code had `useSellerAuth` which returned `isSeller`. 
    // If `isSeller` was true, it showed SELLER tabs.
    // So logic:
    const effectiveRole = isSeller ? 'seller' : 'buyer';

    const result = await getMyOrders({
        role: effectiveRole,
        status: statusParam || (activeTab !== 'all' && activeTab !== 'to_ship' ? activeTab : undefined),
        dateRange: dateParam,
        page,
        limit: 20
    });

    if (!result.success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <EcommerceHeader />
                <div className="flex-1 flex items-center justify-center p-4">
                    <div className="text-center text-red-500 bg-white p-6 rounded-xl shadow-sm border border-red-100">
                        <p className="font-medium">Error loading orders</p>
                        <p className="text-sm mt-1 text-gray-500">{result.error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const { orders, total, counts, totalPages: totalPageCount } = result;

    const mappedOrders: Order[] = (orders || []).map((o: any) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status || 'PENDING',
        createdAt: o.createdAt,
        shippedAt: o.shippedAt || null,
        deliveredAt: o.deliveredAt || null,
        total: o.total || o.totalAmount || 0,
        shippingAddress: o.shippingAddress,
        items: (o.items || []).map((i: any) => ({
            id: i.id || 'N/A',
            productName: i.product?.name || 'Unknown Product',
            productImage: i.product?.images?.[0]?.url || '/placeholder.svg',
            quantity: i.quantity || 1,
            price: Number(i.price || 0),
            size: i.size || '',
            productId: i.product?.id,
            sellerId: i.product?.vendorId
        })),
        user: o.user
    }));

    return (
        <div className="flex min-h-screen flex-col bg-white">
            <EcommerceHeader />

            <main className="flex-1 bg-[#F9FAFB]">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                {effectiveRole === 'seller' ? 'Manage Orders' : 'My Orders'}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {effectiveRole === 'seller' ? 'View and manage customer orders' : 'Track and manage your purchases'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8 lg:flex-row">
                        {/* Filters Sidebar */}
                        <aside className="w-full lg:w-64 shrink-0 space-y-8">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                                <p className="text-xs font-medium text-gray-400 mb-6">Refine your results</p>

                                <FiltersLinkSection
                                    title="Date Range"
                                    options={["All", "Today", "Last 7 Days", "Last 30 Days", "Last 90 Days"]}
                                    selected={dateParam || 'All'}
                                    paramKey="date"
                                    searchParams={searchParams}
                                />

                                <FiltersLinkSection
                                    title="Status"
                                    options={["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"]}
                                    selected={statusParam || 'All'}
                                    paramKey="status"
                                    searchParams={searchParams}
                                />
                            </div>
                        </aside>

                        {/* Main Feed */}
                        <div className="flex-1">
                            {/* Tabs */}
                            <div className="mb-6 border-b border-gray-100">
                                <nav className="flex gap-6 overflow-x-auto pb-px custom-scrollbar">
                                    {(effectiveRole === 'seller'
                                        ? [
                                            { name: "All", key: "all" },
                                            { name: "To Ship", key: "to_ship" },
                                            { name: "Delivered", key: "delivered" },
                                            { name: "Returns", key: "returns" }
                                        ]
                                        : [
                                            { name: "All", key: "all" },
                                            { name: "Processing", key: "processing" },
                                            { name: "Shipped", key: "shipped" },
                                            { name: "Delivered", key: "delivered" },
                                        ]
                                    ).map((tab) => {
                                        const isActive = activeTab === tab.key;
                                        return (
                                            <FilterLink
                                                key={tab.key}
                                                name="tab"
                                                value={tab.key}
                                                currentParams={searchParams}
                                                className={`whitespace-nowrap border-b-2 pb-3 text-sm font-bold transition-colors ${isActive
                                                    ? "border-[#E87A3F] text-[#E87A3F]"
                                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                                    }`}
                                            >
                                                {tab.name}
                                                {/* Optional: Show counts if we had them per tab */}
                                            </FilterLink>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Order List */}
                            {mappedOrders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-24 rounded-xl border border-gray-100 bg-white text-center">
                                    <Package className="size-16 text-gray-200 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                                    <p className="text-gray-500 max-w-sm mt-2">
                                        We couldn't find any orders matching your current filters. Try adjusting them or check back later.
                                    </p>
                                    <Link href="/" className="mt-6">
                                        <Button variant="outline">Start Shopping</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {mappedOrders.map((order) => (
                                        <OrderCard key={order.id} order={order} isSeller={effectiveRole === 'seller'} />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPageCount > 1 && (
                                <div className="mt-8">
                                    <Pagination totalPages={totalPageCount} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}
