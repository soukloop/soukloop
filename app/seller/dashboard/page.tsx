import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import BecomeSellerCTA from "@/components/become-seller-cta";
import { redirect } from "next/navigation";
import { unstable_cache } from "next/cache";
import { DashboardCharts } from "./dashboard-charts";
import { DashboardOrders } from "./dashboard-orders";
import { DashboardShell } from "./dashboard-shell";
import { SellerDashboardLock } from "./components/dashboard-lock";
// No Lucide imports needed here as icons are now mapped via strings in the Client Component

interface PageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper to calculate percentage change
function calculatePercentageChange(current: number, previous: number) {
    if (previous === 0) return { percentage: current === 0 ? 0 : 100, trend: current > 0 ? "up" : "neutral" };
    const change = ((current - previous) / previous) * 100;
    return {
        percentage: Math.abs(Math.round(change * 10) / 10),
        trend: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    };
}

export default async function SellerDashboard({ searchParams }: PageProps) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/signin");
    }

    const params = await searchParams;
    const period = (params.period as string) || "daily";
    const statusFilter = (params.status as string) || "ALL";

    // Role check and Vendor load
    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id }
    });

    if (!vendor) {
        return (
            <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
                <EcommerceHeader />
                <BecomeSellerCTA />
                <FooterSection />
            </div>
        );
    }

    if (vendor.planTier === 'BASIC') {
        return <SellerDashboardLock />;
    }

    // Date Logic
    const now = new Date();
    let currentStart: Date;
    let previousStart: Date;
    let previousEnd: Date;

    if (period === "weekly") {
        currentStart = new Date(now);
        currentStart.setDate(currentStart.getDate() - 7);
        currentStart.setHours(0, 0, 0, 0);

        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 7);

        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
    } else {
        // daily
        currentStart = new Date(now);
        currentStart.setHours(0, 0, 0, 0);

        previousStart = new Date(currentStart);
        previousStart.setDate(previousStart.getDate() - 1);

        previousEnd = new Date(currentStart);
        previousEnd.setMilliseconds(-1);
    }

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
                // Recent Orders Table (Fetch top 100 for client-side filtering)
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
                    take: 100
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
        [`dashboard-${vendor.id}-${period}`],
        { revalidate: 60, tags: [`dashboard-${vendor.id}`] }
    )();

    // Format Metrics
    const visitorStats = calculatePercentageChange(currentVisitors.length, previousVisitors.length);
    const orderStats = calculatePercentageChange(currentOrders, previousOrders);
    const earningsStats = calculatePercentageChange(currentEarningsAgg._sum.netPayout || 0, previousEarningsAgg._sum.netPayout || 0);
    const pendingStats = calculatePercentageChange(currentPending, previousPending);

    const comparisonText = period === "weekly" ? "from last week" : "from yesterday";

    const metrics = [
        { title: "Total Visitor", value: currentVisitors.length.toLocaleString(), stats: visitorStats, icon: "users", bgColor: "bg-[#F3E8FF]", iconColor: "text-[#8B5CF6]" },
        { title: "Total Order", value: currentOrders.toLocaleString(), stats: orderStats, icon: "package", bgColor: "bg-[#FFF7ED]", iconColor: "text-[#F97316]" },
        { title: "Net Earnings", value: `$${(currentEarningsAgg._sum.netPayout || 0).toLocaleString()}`, stats: earningsStats, icon: "bar-chart", bgColor: "bg-[#ECFDF5]", iconColor: "text-[#10B981]" },
        { title: "Total Pending", value: currentPending.toLocaleString(), stats: pendingStats, icon: "clock", bgColor: "bg-[#FFF1F2]", iconColor: "text-[#F43F5E]" },
    ];

    // Format Chart
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const dayTotal = chartOrders
            .filter(o => new Date(o.createdAt).toDateString() === date.toDateString())
            .reduce((sum, o) => sum + (o.netPayout || 0), 0);
        chartData.push({ name: dateStr, value: dayTotal });
    }

    const formattedOrders = filteredOrdersRaw.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber || order.id.slice(0, 8).toUpperCase(),
        createdAt: new Date(order.createdAt).toISOString(),
        status: order.status,
        total: order.total || 0,
        type: "seller" as const,
        productNames: order.items.map(i => i.product ? (i.product.name as string) : 'Product'),
        productImages: order.items.map(i => i.product?.images?.[0]?.url).filter(Boolean) as string[],
    }));

    return (
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
            <EcommerceHeader />
            <div className="flex flex-1 flex-col" style={{ backgroundColor: "#f9f9f9" }}>
                <DashboardShell
                    period={period}
                    metrics={metrics}
                    comparisonText={comparisonText}
                >
                    <div className="space-y-12">
                        <DashboardCharts initialChartData={chartData} />
                        <DashboardOrders initialOrders={formattedOrders} />
                    </div>
                </DashboardShell>
            </div>
            <FooterSection />
        </div>
    );
}
