import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";
import { SellerMetricsCards } from '@/app/seller/components/dashboard/seller-metrics-cards';
import { SellerSalesChart } from '@/app/seller/components/dashboard/seller-sales-chart';
import { OrderListTable } from '@/app/edit-profile/components/my-orders';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";

// Helper to calculate percentage change
function calculatePercentageChange(current: number, previous: number) {
    if (previous === 0) return { percentage: current === 0 ? 0 : 100, trend: current > 0 ? "up" : "neutral" };
    const change = ((current - previous) / previous) * 100;
    return {
        percentage: Math.abs(Math.round(change * 10) / 10),
        trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    };
}

export default async function DashboardTab({ userId }: { userId: string }) {
    // Role check and Vendor load
    const vendor = await prisma.vendor.findUnique({
        where: { userId: userId }
    });

    if (!vendor) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed text-center">
                <div className="p-3 bg-slate-50 rounded-full mb-4">
                    <MessageSquare className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Not a Vendor</h3>
                <p className="text-slate-500 max-w-sm mt-1">This user is not a vendor and has no dashboard data.</p>
            </div>
        );
    }

    // Default to "daily" view for admin snapshot
    const period = "daily";

    // Date Logic
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    // Daily logic matches Seller Dashboard default
    currentStart = new Date(now);
    currentStart.setHours(0, 0, 0, 0);

    previousStart = new Date(currentStart);
    previousStart.setDate(previousStart.getDate() - 1);

    previousEnd = new Date(currentStart);
    previousEnd.setMilliseconds(-1);

    // Cached fetching for maximum speed
    const [
        currentVisitors,
        previousVisitors,
        currentOrders,
        previousOrders,
        currentEarningsAgg,
        previousEarningsAgg,
        currentPending,
        previousPending,
        filteredOrdersRaw,
        chartOrders
    ] = await unstable_cache(
        async () => {
            return Promise.all([
                // Visitors
                prisma.analyticsView.groupBy({
                    by: ['viewerId'],
                    where: {
                        product: { vendorId: vendor.id },
                        viewedAt: { gte: currentStart },
                        viewerId: { not: null }
                    }
                }),
                prisma.analyticsView.groupBy({
                    by: ['viewerId'],
                    where: {
                        product: { vendorId: vendor.id },
                        viewedAt: { gte: previousStart, lte: previousEnd },
                        viewerId: { not: null }
                    }
                }),
                // Orders
                prisma.order.count({ where: { vendorId: vendor.id, createdAt: { gte: currentStart } } }),
                prisma.order.count({ where: { vendorId: vendor.id, createdAt: { gte: previousStart, lte: previousEnd } } }),
                // Earnings
                prisma.order.aggregate({
                    where: { vendorId: vendor.id, status: 'DELIVERED', createdAt: { gte: currentStart } },
                    _sum: { netPayout: true }
                }),
                prisma.order.aggregate({
                    where: { vendorId: vendor.id, status: 'DELIVERED', createdAt: { gte: previousStart, lte: previousEnd } },
                    _sum: { netPayout: true }
                }),
                // Pending
                prisma.order.count({ where: { vendorId: vendor.id, status: 'PENDING', createdAt: { gte: currentStart } } }),
                prisma.order.count({ where: { vendorId: vendor.id, status: 'PENDING', createdAt: { gte: previousStart, lte: previousEnd } } }),
                // Recent Orders Table (Fetch top 100)
                prisma.order.findMany({
                    where: {
                        vendorId: vendor.id
                    },
                    include: {
                        items: {
                            include: {
                                product: {
                                    include: { images: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20 // Limit to 20 for admin view
                }),
                // Chart Data (Last 7 days fixed for visualization)
                prisma.order.findMany({
                    where: {
                        vendorId: vendor.id,
                        status: 'DELIVERED',
                        createdAt: { gte: new Date(new Date().setDate(now.getDate() - 6)) }
                    },
                    select: { createdAt: true, netPayout: true }
                })
            ]);
        },
        [`admin-dashboard-${vendor.id}`], // Separate cache key to avoid conflicts with user's own dashboard if params differ
        { revalidate: 60, tags: [`dashboard-${vendor.id}`] }
    )();

    // Calculate stats changes
    const visitorStats = calculatePercentageChange(currentVisitors.length, previousVisitors.length);
    const orderStats = calculatePercentageChange(currentOrders, previousOrders);
    const earningsStats = calculatePercentageChange(Number(currentEarningsAgg._sum.netPayout) || 0, Number(previousEarningsAgg._sum.netPayout) || 0);
    const pendingStats = calculatePercentageChange(currentPending, previousPending);

    // Format Metrics with correct structure for SellerMetricsCards
    const dashboardStats = {
        totalVisitors: {
            value: currentVisitors.length,
            percentageChange: visitorStats.percentage,
            trend: visitorStats.trend
        },
        totalOrders: {
            value: currentOrders,
            percentageChange: orderStats.percentage,
            trend: orderStats.trend
        },
        netEarnings: {
            value: (Number(currentEarningsAgg._sum.netPayout) || 0) * 100, // Component divides by 100
            percentageChange: earningsStats.percentage,
            trend: earningsStats.trend
        },
        totalPending: {
            value: currentPending,
            percentageChange: pendingStats.percentage,
            trend: pendingStats.trend
        },
        comparisonText: "from yesterday"
    };

    // Format Chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const dayTotal = chartOrders
            .filter(o => new Date(o.createdAt).toDateString() === date.toDateString())
            .reduce((sum, o) => sum + (Number(o.netPayout) || 0), 0);
        chartData.push({ name: dateStr, value: dayTotal });
    }

    const formattedOrders = filteredOrdersRaw.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber || order.id.slice(0, 8).toUpperCase(),
        createdAt: new Date(order.createdAt).toISOString(),
        status: order.status,
        total: Number(order.total) || 0,
        type: "seller" as const,
        productNames: order.items.map(i => i.product ? (i.product.name as string) : 'Product'),
        productImages: order.items.map(i => i.product?.images?.[0]?.url).filter(Boolean) as string[],
    }));

    return (
        <div className="space-y-8">
            {/* Metrics Row */}
            <SellerMetricsCards stats={dashboardStats} isLoading={false} />

            {/* Sales Chart (Includes its own "Sales Details" box) */}
            <div className="w-full overflow-hidden">
                <SellerSalesChart data={chartData} />
            </div>

            {/* Recent Sales Table (Cleaned up wrapper) */}
            <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm w-full overflow-hidden">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Recent Transactions</h3>
                <div className="w-full">
                    <OrderListTable
                        orders={formattedOrders}
                        showAcceptColumn={false}
                        isLoading={false}
                        sourceTab="all"
                        detailPathPrefix="/admin/orders"
                    />
                </div>
            </div>
        </div>
    );
}
