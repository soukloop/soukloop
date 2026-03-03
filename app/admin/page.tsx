import { Suspense } from 'react';
import { getMetricCards, getCachedDashboardBaseStats, getPaginatedTopStyles } from '@/lib/admin/dashboard-service';
import type { PaginatedTopStyles, PaginatedListedStyles } from '@/lib/admin/types';
import AdminStatsCards from '@/components/admin/AdminStatsCards';
import PendingActions from '@/components/admin/PendingActions';
import TopDressStyles from '@/components/admin/TopDressStyles';
import DashboardHeader from '@/components/admin/DashboardHeader';
import DashboardChartSection from '@/components/admin/DashboardChartSection';

// Skeleton for loading state
function DashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="h-10 w-32 bg-gray-200 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-gray-200 rounded-xl" />)}
            </div>
            <div className="h-[400px] bg-gray-200 rounded-xl" />
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-64 bg-gray-200 rounded-xl" />
                <div className="h-64 bg-gray-200 rounded-xl" />
            </div>
        </div>
    );
}

export default async function AdminDashboard({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Parse Search Params
    const resolvedParams = await searchParams;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthParam = resolvedParams?.month as string;
    const yearParam = resolvedParams?.year as string;

    const selectedMonth = monthParam ? parseInt(monthParam) : currentMonth;
    const selectedYear = yearParam ? parseInt(yearParam) : currentYear;

    // 2. Fetch Granular Data
    const baseStats = await getCachedDashboardBaseStats(selectedMonth, selectedYear);
    const initialMetrics = await getMetricCards('daily');
    const initialSellingStyles = await getPaginatedTopStyles('selling', 1, 10) as PaginatedTopStyles;
    const initialListedStyles = await getPaginatedTopStyles('listed', 1, 10) as PaginatedListedStyles;

    return (
        <div className="space-y-6">
            {/* Header with Filters (Client Component) */}
            <DashboardHeader
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
            />

            {/* Stats Cards with own period state */}
            <Suspense fallback={<div className="h-32 bg-gray-100 rounded-xl animate-pulse" />}>
                <AdminStatsCards
                    initialMetrics={initialMetrics}
                />
            </Suspense>

            {/* Charts (Client Component Wrapper) */}
            <DashboardChartSection
                salesChart={baseStats.chartData.salesChart}
                ordersChart={baseStats.chartData.ordersChart}
            />

            {/* Bottom Section */}
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Pending Actions */}
                <PendingActions
                    pendingVendors={baseStats.pendingActions.pendingVendors}
                    pendingReports={baseStats.pendingActions.pendingReports}
                    pendingPayouts={baseStats.pendingActions.pendingPayouts}
                    pendingRefunds={baseStats.pendingActions.pendingRefunds}
                />

                {/* Top Styles (Paginated) */}
                <TopDressStyles
                    initialSelling={initialSellingStyles}
                    initialListed={initialListedStyles}
                />
            </div>
        </div>
    );
}
