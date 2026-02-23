import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import { getMyOrders } from "@/features/orders/actions";
import { isAtLeastAdmin } from "@/lib/roles";
import dynamic from "next/dynamic";
import { OrderTrackingPagination } from "./components/pagination-client";
import { OrderCard } from "./components/order-card";

const SellerReviewsSection = dynamic(() => import('@/app/edit-profile/components/SellerReviewsSection'), {
    loading: () => <div className="h-96 w-full animate-pulse bg-gray-50 rounded-lg" />,
});

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
    userId?: string;
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
    const viewMode = typeof searchParams.mode === 'string' ? searchParams.mode : 'buying';

    // The tabs define what is shown.
    // If user clicked a row while in "Selling" view, it passes &mode=selling
    // Default to 'buyer' unless `mode` is 'selling' and the user is actually a seller
    const effectiveRole = (isSeller && viewMode === 'selling') ? 'seller' : 'buyer';

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
        user: o.user,
        userId: o.userId // Specifically attached to find the buyer for seller chat queries
    }));

    return (
        <div className="flex min-h-screen flex-col bg-white sm:mt-[-9rem] mt-[-6.2rem]">
            <EcommerceHeader />

            <main className="flex-1 bg-[#F9FAFB]">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                    {/* Header Inline with Toggle */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                                {effectiveRole === 'seller' ? 'Manage Orders' : 'My Orders'}
                            </h1>
                            <p className="mt-1 text-sm text-gray-500">
                                {effectiveRole === 'seller' ? 'View and manage customer orders' : 'Track and manage your purchases'}
                            </p>
                        </div>

                        {/* View Switcher (Visible only to actual Sellers) */}
                        {isSeller && (
                            <div className="bg-gray-100 p-1 rounded-full flex relative w-[240px] shrink-0 self-start md:self-auto">
                                {/* Sliding Background */}
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#E87A3F] rounded-full shadow-sm transition-all duration-300 ease-in-out ${effectiveRole === 'seller' ? 'translate-x-[116px]' : 'translate-x-[0px]'
                                        }`}
                                />

                                <Link
                                    href="?mode=buying"
                                    className={`flex-1 relative z-10 text-sm font-bold py-1.5 rounded-full transition-colors text-center ${effectiveRole === 'buyer' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Buying
                                </Link>
                                <Link
                                    href="?mode=selling"
                                    className={`flex-1 relative z-10 text-sm font-bold py-1.5 rounded-full transition-colors text-center ${effectiveRole === 'seller' ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Selling
                                </Link>
                            </div>
                        )}
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
                                    options={["All", "Pending", "Paid", "Processing", "Shipped", "Delivered", "Canceled", "Refunded"]}
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
                                            { name: "Reviews", key: "reviews" }
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

                            {/* Order List / Content */}
                            {activeTab === 'reviews' && effectiveRole === 'seller' ? (
                                <div className="p-4 sm:p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <SellerReviewsSection />
                                </div>
                            ) : mappedOrders.length === 0 ? (
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
                            {totalPageCount && totalPageCount > 1 && (
                                <div className="mt-8">
                                    <OrderTrackingPagination totalPages={totalPageCount || 1} currentPage={page} />
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
