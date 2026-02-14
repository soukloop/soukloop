import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";

// Removed duplicate admin secret logic


export const dynamic = 'force-dynamic';


// Types for the response
interface MetricData {
    value: number;
    previousValue: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
}

interface AdminDashboardStatsResponse {
    totalUsers: MetricData;
    totalOrders: MetricData;
    revenueThisMonth: MetricData; // Total revenue
    activeSellers: MetricData;
    platformEarnings: MetricData;
    period: 'daily' | 'weekly';
    comparisonText: string;
    salesChart: { name: string; value: number }[];
    ordersChart: { name: string; value: number }[];
    pendingVendors: number;
    pendingReports: number;
    pendingPayouts: number;
    pendingRefunds: number;
    topSellingCategories: {
        category: string;
        styles: {
            name: string;
            value: number; // Sales amount
            count: number; // Items sold
            image?: string | null;
            percentage: number;
        }[];
    }[];
    topListedCategories: {
        category: string;
        styles: {
            name: string;
            count: number; // Active listings
            image?: string | null;
            percentage: number;
        }[];
    }[];
}

/**
 * Generate daily chart data for a specific month using SQL aggregation
 */
async function getMonthlyChartData(month: number, year: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(23, 59, 59, 999);

    // SQL Aggregation for time-series data
    // This fetches ALL days in one query instead of mapping/filtering in JS
    const chartStats = await prisma.$queryRaw<any[]>`
        SELECT 
            DATE_TRUNC('day', "createdAt") as "day",
            SUM(CASE WHEN "status" IN ('PAID', 'DELIVERED') THEN "total" ELSE 0 END) as "revenue",
            COUNT(id) as "orders"
        FROM "orders"
        WHERE "createdAt" >= ${startDate} AND "createdAt" <= ${endDate}
        GROUP BY 1
        ORDER BY 1 ASC
    `;

    const now = new Date();
    const salesChart = [];
    const ordersChart = [];

    // Map existing days to a lookup for gap filling
    const statsMap = new Map();
    chartStats.forEach(s => {
        statsMap.set(new Date(s.day).toDateString(), s);
    });

    // Fill gaps for days with no activity to ensure a smooth chart
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d > now) break;

        const dateStr = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const dayStats = statsMap.get(d.toDateString());

        salesChart.push({
            name: dateStr,
            value: Number(dayStats?.revenue || 0)
        });
        ordersChart.push({
            name: dateStr,
            value: Number(dayStats?.orders || 0)
        });
    }

    return { salesChart, ordersChart };
}

/**
 * Calculate percentage change
 */
function calculatePercentageChange(
    current: number,
    previous: number
): { percentage: number; trend: 'up' | 'down' | 'neutral' } {
    if (previous === 0) {
        if (current === 0) {
            return { percentage: 0, trend: 'neutral' };
        }
        return { percentage: 100, trend: 'up' };
    }

    const change = ((current - previous) / previous) * 100;
    const rounded = Math.abs(Math.round(change * 10) / 10);

    return {
        percentage: rounded,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
}

/**
 * Get date ranges for comparison
 */
function getDateRanges(period: 'daily' | 'weekly') {
    const now = new Date();

    if (period === 'daily') {
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);
        const yesterdayEnd = new Date(todayStart);
        yesterdayEnd.setMilliseconds(-1);

        return {
            current: { start: todayStart, end: now },
            previous: { start: yesterdayStart, end: yesterdayEnd },
        };
    } else {
        // Weekly - Last 7 Days (Rolling)
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);
        // Keep checking from the exact time 7 days ago, or start of day 7 days ago?
        // User said "total for the last 7 days". Usually start of day is cleaner for stats.
        thisWeekStart.setHours(0, 0, 0, 0);

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
        console.log("Admin Stats API Hit - Optimized with Aggregations");

        // Unified Admin Authorization
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const searchParams = request.nextUrl.searchParams;
        const period = (searchParams.get("period") as "daily" | "weekly") || "daily";

        // Parse month and year for charts
        const monthParam = searchParams.get("month");
        const yearParam = searchParams.get("year");

        const now = new Date();
        const selectedMonth = monthParam ? parseInt(monthParam) : now.getMonth();
        const selectedYear = yearParam ? parseInt(yearParam) : now.getFullYear();

        const dateRanges = getDateRanges(period);

        // ============ EFFICIENT AGGREGATED FETCHES ============
        const [
            totalUsersCount,
            currentUsers,
            previousUsers,
            totalOrdersCount,
            currentOrders,
            previousOrders,
            revenueAgg,
            earningsAgg,
            totalActiveSellers,
            currentActiveSellers,
            previousActiveSellers,
            pendingCountAgg,
            chartData
        ] = await Promise.all([
            // 1. Total Counts
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } } }),
            prisma.user.count({ where: { createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } } }),

            prisma.customerOrder.count(),
            prisma.customerOrder.count({ where: { createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } } }),
            prisma.customerOrder.count({ where: { createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } } }),

            // 2. Financial Aggregations
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { in: ['PAID', 'DELIVERED'] }, createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } }
            }),
            prisma.order.aggregate({
                _sum: { platformFee: true },
                where: { status: { in: ['PAID', 'DELIVERED'] }, createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } }
            }),

            // 3. Seller Metrics
            prisma.vendor.count({ where: { isActive: true } }),
            prisma.vendor.count({ where: { isActive: true, createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } } }),
            prisma.vendor.count({ where: { isActive: true, createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } } }),

            // 4. Pending Actions
            Promise.all([
                prisma.vendor.count({ where: { kycStatus: 'PENDING' } }),
                prisma.report.count({ where: { status: 'pending' } }),
                prisma.payout.count({ where: { status: 'pending' } }),
                prisma.refund.count({ where: { status: 'PENDING' } })
            ]),

            // 5. Chart Data (using current optimized month function for now)
            getMonthlyChartData(selectedMonth, selectedYear)
        ]);

        const userChange = calculatePercentageChange(currentUsers, previousUsers);
        const orderChange = calculatePercentageChange(currentOrders, previousOrders);

        // Previous period sums for trend calculation
        const [previousRevenueAgg, previousEarningsAgg] = await Promise.all([
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { in: ['PAID', 'DELIVERED'] }, createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } }
            }),
            prisma.order.aggregate({
                _sum: { platformFee: true },
                where: { status: { in: ['PAID', 'DELIVERED'] }, createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } }
            })
        ]);

        const revenueChange = calculatePercentageChange(revenueAgg._sum.total || 0, previousRevenueAgg._sum.total || 0);
        const earningsChange = calculatePercentageChange(earningsAgg._sum.platformFee || 0, previousEarningsAgg._sum.platformFee || 0);
        const sellerChange = calculatePercentageChange(currentActiveSellers, previousActiveSellers);

        // ============ TOP SELLING CATEGORIES (Professional SQL Aggregation) ============
        // Use raw SQL for complex grouping to avoid N+1 and memory issues
        const topSellingRaw = await prisma.$queryRaw<any[]>`
            SELECT 
                ds."category_type" as "category",
                ds.name as "styleName",
                SUM(oi.price * oi.quantity) as "totalValue",
                SUM(oi.quantity) as "totalCount",
                (SELECT url FROM "product_images" WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1) as "imageUrl"
            FROM "order_items" oi
            JOIN "orders" o ON oi."orderId" = o.id
            JOIN "products" p ON oi."productId" = p.id
            JOIN "dress_styles" ds ON p."dress_style_id" = ds.id
            WHERE o."status" IN ('PAID', 'DELIVERED')
            GROUP BY ds."category_type", ds.name, p.id
            ORDER BY "totalValue" DESC
            LIMIT 20
        `;

        // Process RAW results into expected format
        const categoryMap: Record<string, any[]> = {};
        topSellingRaw.forEach(row => {
            if (!categoryMap[row.category]) categoryMap[row.category] = [];
            categoryMap[row.category].push({
                name: row.styleName,
                value: Number(row.totalValue),
                count: Number(row.totalCount),
                image: row.imageUrl,
                percentage: 0
            });
        });

        const topSellingCategories = Object.entries(categoryMap).map(([category, styles]) => {
            const totalVal = styles.reduce((sum, s) => sum + s.value, 0);
            return {
                category,
                styles: styles.map(s => ({ ...s, percentage: totalVal > 0 ? Math.round((s.value / totalVal) * 100) : 0 }))
            };
        }).slice(0, 4);

        // ============ TOP LISTED CATEGORIES (Professional SQL Aggregation) ============
        const topListedRaw = await prisma.$queryRaw<any[]>`
            SELECT 
                ds."category_type" as "category",
                ds.name as "styleName",
                COUNT(p.id) as "totalCount",
                (SELECT url FROM "product_images" WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1) as "imageUrl"
            FROM "products" p
            JOIN "dress_styles" ds ON p."dress_style_id" = ds.id
            WHERE p."isActive" = true
            GROUP BY ds."category_type", ds.name, p.id
            ORDER BY "totalCount" DESC
            LIMIT 20
        `;

        const listedCategoryMap: Record<string, any[]> = {};
        topListedRaw.forEach(row => {
            if (!listedCategoryMap[row.category]) listedCategoryMap[row.category] = [];
            listedCategoryMap[row.category].push({
                name: row.styleName,
                count: Number(row.totalCount),
                image: row.imageUrl
            });
        });

        const topListedCategories = Object.entries(listedCategoryMap).map(([category, styles]) => ({
            category,
            styles
        })).slice(0, 4);

        const response: AdminDashboardStatsResponse = {
            totalUsers: {
                value: currentUsers, // User requested "daily new count"
                previousValue: previousUsers,
                percentageChange: userChange.percentage,
                trend: userChange.trend
            },
            totalOrders: {
                value: currentOrders, // User requested period count
                previousValue: previousOrders,
                percentageChange: orderChange.percentage,
                trend: orderChange.trend
            },
            revenueThisMonth: {
                value: revenueAgg._sum.total || 0,
                previousValue: previousRevenueAgg._sum.total || 0,
                percentageChange: revenueChange.percentage,
                trend: revenueChange.trend
            },
            platformEarnings: {
                value: earningsAgg._sum.platformFee || 0,
                previousValue: previousEarningsAgg._sum.platformFee || 0,
                percentageChange: earningsChange.percentage,
                trend: earningsChange.trend
            },
            activeSellers: {
                value: currentActiveSellers, // New Active Sellers in period
                previousValue: previousActiveSellers,
                percentageChange: sellerChange.percentage,
                trend: sellerChange.trend
            },
            period,
            comparisonText: period === 'daily' ? 'from yesterday' : 'from last week',
            salesChart: chartData.salesChart,
            ordersChart: chartData.ordersChart,
            pendingVendors: pendingCountAgg[0],
            pendingReports: pendingCountAgg[1],
            pendingPayouts: pendingCountAgg[2],
            pendingRefunds: pendingCountAgg[3],
            topSellingCategories,
            topListedCategories
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error("Admin Stats API Error Details:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
