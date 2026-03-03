import { prisma } from "@/lib/prisma";
import { unstable_cache } from "next/cache";

import { DashboardStats, MetricData, DashboardMetrics, PendingActionsCount, TopStyleData, ListedStyleData } from "@/lib/admin/types";

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
 * Fetch metric cards (Need-based fetching)
 */
export async function fetchMetricCardsInsecure(period: 'daily' | 'weekly'): Promise<DashboardMetrics> {
    console.log(`[DashboardService] Fetching metrics for period=${period}`);
    const dateRanges = getDateRanges(period);

    try {
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
            previousActiveSellers
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
        ]);

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

        return {
            totalUsers: { value: totalUsersCount, previousValue: totalUsersCount - (currentUsers - previousUsers), percentageChange: userChange.percentage, trend: userChange.trend },
            totalOrders: { value: totalOrdersCount, previousValue: totalOrdersCount - (currentOrders - previousOrders), percentageChange: orderChange.percentage, trend: orderChange.trend },
            revenueThisMonth: { value: revenueAgg._sum.total || 0, previousValue: previousRevenueAgg._sum.total || 0, percentageChange: revenueChange.percentage, trend: revenueChange.trend },
            platformEarnings: { value: earningsAgg._sum.platformFee || 0, previousValue: previousEarningsAgg._sum.platformFee || 0, percentageChange: earningsChange.percentage, trend: earningsChange.trend },
            activeSellers: { value: totalActiveSellers, previousValue: totalActiveSellers - (currentActiveSellers - previousActiveSellers), percentageChange: sellerChange.percentage, trend: sellerChange.trend },
            period,
            comparisonText: period === 'daily' ? 'from yesterday' : 'from last week'
        };
    } catch (error) {
        console.error("[DashboardService] Failed to fetch metrics:", error);
        throw new Error("Failed to load dashboard metrics.");
    }
}

export const getMetricCards = unstable_cache(
    async (period: 'daily' | 'weekly') => fetchMetricCardsInsecure(period),
    ['admin-dashboard-metrics'],
    { revalidate: 300, tags: ['admin-dashboard'] }
);

/**
 * Fetch pending actions
 */
export async function getPendingActionsCount(): Promise<PendingActionsCount> {
    const [pendingVendors, pendingReports, pendingPayouts, pendingRefunds] = await Promise.all([
        prisma.vendor.count({ where: { kycStatus: 'PENDING' } }),
        prisma.report.count({ where: { status: 'pending' } }),
        prisma.payout.count({ where: { status: 'pending' } }),
        prisma.refund.count({ where: { status: 'PENDING' } })
    ]);
    return { pendingVendors, pendingReports, pendingPayouts, pendingRefunds };
}

/**
 * Fetch base stats (Charts, Actions)
 */
export async function getDashboardBaseStats(month: number, year: number) {
    const [chartData, pendingActions] = await Promise.all([
        getMonthlyChartData(month, year),
        getPendingActionsCount()
    ]);
    return { chartData, pendingActions };
}

export const getCachedDashboardBaseStats = unstable_cache(
    async (month: number, year: number) => getDashboardBaseStats(month, year),
    ['admin-dashboard-base'],
    { revalidate: 300, tags: ['admin-dashboard'] }
);

/**
 * Fetch paginated top styles
 */
export async function getPaginatedTopStyles(type: 'selling' | 'listed', page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    if (type === 'selling') {
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
            LIMIT ${limit} OFFSET ${offset}
        `;

        const totalRaw = await prisma.$queryRaw<any[]>`
            SELECT COUNT(DISTINCT ds.id) as count
            FROM "order_items" oi
            JOIN "orders" o ON oi."orderId" = o.id
            JOIN "products" p ON oi."productId" = p.id
            JOIN "dress_styles" ds ON p."dress_style_id" = ds.id
            WHERE o."status" IN ('PAID', 'DELIVERED')
        `;
        const total = Number(totalRaw[0]?.count || 0);

        const styles: TopStyleData[] = topSellingRaw.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category || 'Uncategorized',
            value: Number(row.totalValue),
            count: Number(row.totalCount),
            image: row.imageUrl,
            percentage: 0
        }));

        return { styles, total, page, totalPages: Math.ceil(total / limit) };
    } else {
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
            LIMIT ${limit} OFFSET ${offset}
        `;

        const totalRaw = await prisma.$queryRaw<any[]>`
            SELECT COUNT(DISTINCT ds.id) as count
            FROM "products" p
            JOIN "dress_styles" ds ON p."dress_style_id" = ds.id
            WHERE p."isActive" = true
        `;
        const total = Number(totalRaw[0]?.count || 0);

        const styles: ListedStyleData[] = topListedRaw.map(row => ({
            id: row.id,
            name: row.name,
            category: row.category || 'Uncategorized',
            count: Number(row.totalCount),
            image: row.imageUrl
        }));

        return { styles, total, page, totalPages: Math.ceil(total / limit) };
    }
}

/**
 * Fetch paginated recent orders
 */
export async function getPaginatedRecentOrders(page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;

    const [orders, total] = await Promise.all([
        prisma.order.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                items: {
                    take: 1, // Only need one item to show an image
                    include: {
                        product: {
                            include: {
                                images: {
                                    where: { isPrimary: true },
                                    take: 1
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: offset,
            take: limit
        }),
        prisma.order.count()
    ]);

    return { orders, total, page, totalPages: Math.ceil(total / limit) };
}
