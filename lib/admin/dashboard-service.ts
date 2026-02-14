import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

import { DashboardStats, MetricData } from "@/lib/admin/types";

/**
 * Generate daily chart data for a specific month using SQL aggregation
 */
async function getMonthlyChartData(month: number, year: number) {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    endDate.setHours(23, 59, 59, 999);

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
    const statsMap = new Map();

    chartStats.forEach(s => {
        statsMap.set(new Date(s.day).toDateString(), s);
    });

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

function calculatePercentageChange(current: number, previous: number): { percentage: number; trend: 'up' | 'down' | 'neutral' } {
    if (previous === 0) {
        if (current === 0) return { percentage: 0, trend: 'neutral' };
        return { percentage: 100, trend: 'up' };
    }

    const change = ((current - previous) / previous) * 100;
    const rounded = Math.abs(Math.round(change * 10) / 10);

    return {
        percentage: rounded,
        trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
}

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
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(thisWeekStart.getDate() - 7);
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

/**
 * Core data fetching function (uncached)
 */
async function fetchDashboardStatsInsecure(period: 'daily' | 'weekly', month: number, year: number) {
    console.log(`[DashboardService] Fetching fresh stats for period=${period}`);

    const dateRanges = getDateRanges(period);

    try {
        const [
            // 1. Total Counts (Absolute totals for the cards)
            totalUsersCount,
            currentUsers,
            previousUsers,
            totalOrdersCount,
            currentOrders,
            previousOrders,
            // 2. Financials
            revenueAgg,
            earningsAgg,
            // 3. Sellers
            totalActiveSellers,
            currentActiveSellers,
            previousActiveSellers,
            // 4. Pending Actions
            pendingCountAgg,
            // 5. Chart Data
            chartData
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({ where: { createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } } }),
            prisma.user.count({ where: { createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } } }),

            prisma.customerOrder.count(),
            prisma.customerOrder.count({ where: { createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } } }),
            prisma.customerOrder.count({ where: { createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } } }),

            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { in: ['PAID', 'DELIVERED'] }, createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } }
            }),
            prisma.order.aggregate({
                _sum: { platformFee: true },
                where: { status: { in: ['PAID', 'DELIVERED'] }, createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } }
            }),

            prisma.vendor.count({ where: { isActive: true } }),
            prisma.vendor.count({ where: { isActive: true, createdAt: { gte: dateRanges.current.start, lte: dateRanges.current.end } } }),
            prisma.vendor.count({ where: { isActive: true, createdAt: { gte: dateRanges.previous.start, lte: dateRanges.previous.end } } }),

            Promise.all([
                prisma.vendor.count({ where: { kycStatus: 'PENDING' } }),
                prisma.report.count({ where: { status: 'pending' } }),
                prisma.payout.count({ where: { status: 'pending' } }),
                prisma.refund.count({ where: { status: 'PENDING' } })
            ]),

            getMonthlyChartData(month, year)
        ]);

        // Trend Calculations
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

        const userChange = calculatePercentageChange(currentUsers, previousUsers);
        const orderChange = calculatePercentageChange(currentOrders, previousOrders);
        const revenueChange = calculatePercentageChange(revenueAgg._sum.total || 0, previousRevenueAgg._sum.total || 0);
        const earningsChange = calculatePercentageChange(earningsAgg._sum.platformFee || 0, previousEarningsAgg._sum.platformFee || 0);
        const sellerChange = calculatePercentageChange(currentActiveSellers, previousActiveSellers);

        // Top Selling Dress Styles
        const topSellingRaw = await prisma.$queryRaw<any[]>`
            SELECT 
                ds.id as "id",
                ds.name as "name",
                c.name as "category",
                SUM(oi.price * oi.quantity) as "totalValue",
                SUM(oi.quantity) as "totalCount",
                (SELECT url FROM "product_images" WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1) as "imageUrl"
            FROM "order_items" oi
            JOIN "orders" o ON oi."orderId" = o.id
            JOIN "products" p ON oi."productId" = p.id
            JOIN "dress_styles" ds ON p."dress_style_id" = ds.id
            LEFT JOIN "categories" c ON ds."category_id" = c.id
            WHERE o."status" IN ('PAID', 'DELIVERED')
            GROUP BY ds.id, ds.name, c.name, p.id
            ORDER BY "totalValue" DESC
            LIMIT 10
        `;

        const topSellingStyles = topSellingRaw.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category || 'Uncategorized',
            value: Number(row.totalValue),
            count: Number(row.totalCount),
            image: row.imageUrl,
            percentage: 0 // Will need inventory context for a true % sold, setting 0 for now
        }));

        // Top Listed Dress Styles
        const topListedRaw = await prisma.$queryRaw<any[]>`
            SELECT 
                ds.id as "id",
                ds.name as "name",
                c.name as "category",
                COUNT(p.id) as "totalCount",
                (SELECT url FROM "product_images" WHERE "productId" = p.id AND "isPrimary" = true LIMIT 1) as "imageUrl"
            FROM "products" p
            JOIN "dress_styles" ds ON p."dress_style_id" = ds.id
            LEFT JOIN "categories" c ON ds."category_id" = c.id
            WHERE p."isActive" = true
            GROUP BY ds.id, ds.name, c.name, p.id
            ORDER BY "totalCount" DESC
            LIMIT 10
        `;

        const topListedStyles = topListedRaw.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category || 'Uncategorized',
            count: Number(row.totalCount),
            image: row.imageUrl
        }));

        return {
            totalUsers: { value: totalUsersCount, previousValue: totalUsersCount - (currentUsers - previousUsers), percentageChange: userChange.percentage, trend: userChange.trend },
            totalOrders: { value: totalOrdersCount, previousValue: totalOrdersCount - (currentOrders - previousOrders), percentageChange: orderChange.percentage, trend: orderChange.trend },
            revenueThisMonth: { value: revenueAgg._sum.total || 0, previousValue: previousRevenueAgg._sum.total || 0, percentageChange: revenueChange.percentage, trend: revenueChange.trend },
            platformEarnings: { value: earningsAgg._sum.platformFee || 0, previousValue: previousEarningsAgg._sum.platformFee || 0, percentageChange: earningsChange.percentage, trend: earningsChange.trend },
            activeSellers: { value: totalActiveSellers, previousValue: totalActiveSellers - (currentActiveSellers - previousActiveSellers), percentageChange: sellerChange.percentage, trend: sellerChange.trend },
            salesChart: chartData.salesChart,
            ordersChart: chartData.ordersChart,
            pendingVendors: pendingCountAgg[0],
            pendingReports: pendingCountAgg[1],
            pendingPayouts: pendingCountAgg[2],
            pendingRefunds: pendingCountAgg[3],
            topSellingStyles,
            topListedStyles,
            period,
            comparisonText: period === 'daily' ? 'from yesterday' : 'from last week'
        };
    } catch (error) {
        console.error("[DashboardService] Failed to fetch stats:", error);
        throw new Error("Failed to load dashboard statistics. Database might be unreachable.");
    }
}

/**
 * Cached version of getDashboardStats
 * Revalidates every 5 minutes (300 seconds)
 * Tag 'admin-dashboard' enables manual invalidation on major events
 */
export const getDashboardStats = unstable_cache(
    async (period: 'daily' | 'weekly', month: number, year: number) => {
        return fetchDashboardStatsInsecure(period, month, year);
    },
    ['admin-dashboard-stats'], // This key should ideally include params, but unstable_cache handles it if they are passed to the wrapper
    {
        revalidate: 300,
        tags: ['admin-dashboard']
    }
);
