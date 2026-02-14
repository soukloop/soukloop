import { Suspense } from 'react';
import { getDashboardStats } from '@/lib/admin/dashboard-service';
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
    const periodParam = resolvedParams?.period as string;
    const period = (periodParam === 'daily' || periodParam === 'weekly') ? periodParam : 'daily';

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthParam = resolvedParams?.month as string;
    const yearParam = resolvedParams?.year as string;

    const selectedMonth = monthParam ? parseInt(monthParam) : currentMonth;
    const selectedYear = yearParam ? parseInt(yearParam) : currentYear;

    // 2. Fetch Data (Server-Side)
    // unstable_cache in getDashboardStats handles deduplication & caching
    const stats = await getDashboardStats(period, selectedMonth, selectedYear);

    return (
        <div className="space-y-6">
            {/* Header with Filters (Client Component) */}
            <DashboardHeader
                period={period}
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
            />

            {/* Stats Cards */}
            <Suspense fallback={<div className="h-32 bg-gray-100 rounded-xl animate-pulse" />}>
                <AdminStatsCards
                    stats={stats}
                    period={period}
                />
            </Suspense>

            {/* Charts (Client Component Wrapper) */}
            <DashboardChartSection
                salesChart={stats.salesChart}
                ordersChart={stats.ordersChart}
            />

            {/* Bottom Section */}
            <div className="grid gap-6 lg:grid-cols-1">
                {/* Pending Actions */}
                <PendingActions
                    pendingVendors={stats.pendingVendors}
                    pendingReports={stats.pendingReports}
                    pendingPayouts={stats.pendingPayouts}
                    pendingRefunds={stats.pendingRefunds}
                />

                {/* Top Styles */}
                <TopDressStyles
                    topSelling={stats.topSellingStyles}
                    topListed={stats.topListedStyles}
                />
            </div>
        </div>
    );
}
