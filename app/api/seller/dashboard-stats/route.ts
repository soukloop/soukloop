import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from '@/lib/prisma';

// Types for the response
interface MetricData {
    value: number;
    previousValue: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
}

interface DashboardStatsResponse {
    totalVisitors: MetricData;
    totalOrders: MetricData;
    totalSales: MetricData; // value in cents (GMV)
    netEarnings: MetricData; // value in cents (Subtotal - Commission + Tax + Shipping)
    totalPending: MetricData;
    period: 'daily' | 'weekly';
    comparisonText: string;
    salesChart: { name: string; value: number }[]; // Net Earnings Chart
}

/**
 * Generate chart data for last 7 days
 */
async function getSalesChartData(vendorId: string) {
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
        where: {
            vendorId,
            status: 'DELIVERED',
            createdAt: { gte: startDate }
        },
        select: { createdAt: true, netPayout: true }
    });

    const chartData = [];
    for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const dayTotal = orders
            .filter(o => new Date(o.createdAt).toDateString() === d.toDateString())
            .reduce((sum, o) => sum + (o.netPayout || 0), 0);

        chartData.push({ name: dateStr, value: dayTotal });
    }
    return chartData;
}

/**
 * Calculate percentage change between current and previous period
 * Handles edge cases like division by zero
 */
function calculatePercentageChange(
    current: number,
    previous: number
): { percentage: number; trend: 'up' | 'down' | 'neutral' } {
    if (previous === 0) {
        if (current === 0) {
            return { percentage: 0, trend: 'neutral' };
        }
        // Infinite growth capped at 100%
        return { percentage: 100, trend: 'up' };
    }

    const change = ((current - previous) / previous) * 100;
    const rounded = Math.abs(Math.round(change * 10) / 10); // Round to 1 decimal

    return {
        percentage: rounded,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
}

/**
 * Get date ranges for comparison based on period type
 */
function getDateRanges(period: 'daily' | 'weekly') {
    const now = new Date();

    if (period === 'daily') {
        // Today: from midnight to now
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        // Yesterday: full day
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(todayStart);
        yesterdayEnd.setMilliseconds(-1); // End of yesterday

        return {
            current: { start: todayStart, end: now },
            previous: { start: yesterdayStart, end: yesterdayEnd },
        };
    } else {
        // Weekly comparison
        // This week: Monday to now
        const dayOfWeek = now.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - daysFromMonday);
        thisWeekStart.setHours(0, 0, 0, 0);

        // Last week: Monday to Sunday
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);
        lastWeekEnd.setMilliseconds(-1);

        return {
            current: { start: thisWeekStart, end: now },
            previous: { start: lastWeekStart, end: lastWeekEnd },
        };
    }
}

export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if user is a seller
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (user?.role !== 'SELLER') {
            return NextResponse.json({ error: 'Not a seller' }, { status: 403 });
        }

        // Get period from query params (default: daily)
        const searchParams = request.nextUrl.searchParams;
        const period = (searchParams.get('period') as 'daily' | 'weekly') || 'daily';

        const dateRanges = getDateRanges(period);

        // Get vendor info for the seller
        const vendor = await prisma.vendor.findUnique({
            where: { userId },
            select: { id: true },
        });

        if (!vendor) {
            // Return zeros if no vendor profile
            const emptyMetric: MetricData = {
                value: 0,
                previousValue: 0,
                percentageChange: 0,
                trend: 'neutral',
            };

            return NextResponse.json({
                totalVisitors: emptyMetric,
                totalOrders: emptyMetric,
                totalSales: emptyMetric,
                netEarnings: emptyMetric,
                totalPending: emptyMetric,
                period,
                comparisonText: period === 'daily' ? 'from yesterday' : 'from last week',
                salesChart: [],
            } satisfies DashboardStatsResponse);
        }

        // Get seller's product IDs for visitor tracking
        const sellerProducts = await prisma.product.findMany({
            where: { vendorId: vendor.id },
            select: { id: true },
        });
        const productIds = sellerProducts.map((p) => p.id);

        // ============ TOTAL VISITORS ============
        // Count unique viewers of seller's products
        const [currentVisitors, previousVisitors] = await Promise.all([
            prisma.analyticsView.groupBy({
                by: ['viewerId'],
                where: {
                    productId: { in: productIds },
                    viewedAt: {
                        gte: dateRanges.current.start,
                        lte: dateRanges.current.end,
                    },
                    viewerId: { not: null },
                },
            }),
            prisma.analyticsView.groupBy({
                by: ['viewerId'],
                where: {
                    productId: { in: productIds },
                    viewedAt: {
                        gte: dateRanges.previous.start,
                        lte: dateRanges.previous.end,
                    },
                    viewerId: { not: null },
                },
            }),
        ]);

        const visitorChange = calculatePercentageChange(
            currentVisitors.length,
            previousVisitors.length
        );

        // ============ TOTAL ORDERS ============
        const [currentOrders, previousOrders] = await Promise.all([
            prisma.order.count({
                where: {
                    vendorId: vendor.id,
                    createdAt: {
                        gte: dateRanges.current.start,
                        lte: dateRanges.current.end,
                    },
                },
            }),
            prisma.order.count({
                where: {
                    vendorId: vendor.id,
                    createdAt: {
                        gte: dateRanges.previous.start,
                        lte: dateRanges.previous.end,
                    },
                },
            }),
        ]);

        const orderChange = calculatePercentageChange(currentOrders, previousOrders);

        // ============ TOTAL SALES (Fulfilled orders only) ============
        const [currentSalesAgg, previousSalesAgg] = await Promise.all([
            prisma.order.aggregate({
                where: {
                    vendorId: vendor.id,
                    status: 'DELIVERED',
                    createdAt: {
                        gte: dateRanges.current.start,
                        lte: dateRanges.current.end,
                    },
                },
                _sum: { total: true },
            }),
            prisma.order.aggregate({
                where: {
                    vendorId: vendor.id,
                    status: 'DELIVERED',
                    createdAt: {
                        gte: dateRanges.previous.start,
                        lte: dateRanges.previous.end,
                    },
                },
                _sum: { total: true },
            }),
        ]);

        const currentSales = Math.round((currentSalesAgg._sum.total || 0) * 100); // Convert to cents
        const previousSales = Math.round((previousSalesAgg._sum.total || 0) * 100);
        const salesChange = calculatePercentageChange(currentSales, previousSales);

        // ============ NET EARNINGS (Fulfilled) ============
        const [currentEarningsAgg, previousEarningsAgg] = await Promise.all([
            prisma.order.aggregate({
                where: {
                    vendorId: vendor.id,
                    status: 'DELIVERED',
                    createdAt: {
                        gte: dateRanges.current.start,
                        lte: dateRanges.current.end,
                    },
                },
                _sum: { netPayout: true },
            }),
            prisma.order.aggregate({
                where: {
                    vendorId: vendor.id,
                    status: 'DELIVERED',
                    createdAt: {
                        gte: dateRanges.previous.start,
                        lte: dateRanges.previous.end,
                    },
                },
                _sum: { netPayout: true },
            }),
        ]);

        const currentEarnings = Math.round((currentEarningsAgg._sum.netPayout || 0) * 100);
        const previousEarnings = Math.round((previousEarningsAgg._sum.netPayout || 0) * 100);
        const earningsChange = calculatePercentageChange(currentEarnings, previousEarnings);

        // ============ TOTAL PENDING ============
        const [currentPending, previousPending] = await Promise.all([
            prisma.order.count({
                where: {
                    vendorId: vendor.id,
                    status: 'PENDING',
                    createdAt: {
                        gte: dateRanges.current.start,
                        lte: dateRanges.current.end,
                    },
                },
            }),
            prisma.order.count({
                where: {
                    vendorId: vendor.id,
                    status: 'PENDING',
                    createdAt: {
                        gte: dateRanges.previous.start,
                        lte: dateRanges.previous.end,
                    },
                },
            }),
        ]);

        const pendingChange = calculatePercentageChange(currentPending, previousPending);

        // ============ CHART DATA ============
        const salesChart = await getSalesChartData(vendor.id);

        // Build response
        const response: DashboardStatsResponse = {
            totalVisitors: {
                value: currentVisitors.length,
                previousValue: previousVisitors.length,
                percentageChange: visitorChange.percentage,
                trend: visitorChange.trend,
            },
            totalOrders: {
                value: currentOrders,
                previousValue: previousOrders,
                percentageChange: orderChange.percentage,
                trend: orderChange.trend,
            },
            totalSales: {
                value: currentSales,
                previousValue: previousSales,
                percentageChange: salesChange.percentage,
                trend: salesChange.trend,
            },
            netEarnings: {
                value: currentEarnings,
                previousValue: previousEarnings,
                percentageChange: earningsChange.percentage,
                trend: earningsChange.trend,
            },
            totalPending: {
                value: currentPending,
                previousValue: previousPending,
                percentageChange: pendingChange.percentage,
                trend: pendingChange.trend,
            },
            period,
            comparisonText: period === 'daily' ? 'from yesterday' : 'from last week',
            salesChart,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch dashboard stats' },
            { status: 500 }
        );
    }
}
