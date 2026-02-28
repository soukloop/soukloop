import useSWR from 'swr';

// Types matching the API response
interface MetricData {
    value: number;
    previousValue: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'neutral';
}

export interface DashboardStatsResponse {
    totalVisitors: MetricData;
    totalOrders: MetricData;
    totalSales: MetricData; // value in cents
    netEarnings: MetricData;
    totalPending: MetricData;
    period: 'daily' | 'weekly';
    comparisonText: string;
    salesChart?: { name: string; value: number }[];
}

const fetcher = async (url: string): Promise<DashboardStatsResponse> => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch dashboard stats');
    }
    return res.json();
};

/**
 * Hook to fetch seller dashboard statistics
 * @param period - 'daily' or 'weekly' comparison period
 */
export function useDashboardStats(period: 'daily' | 'weekly' = 'daily') {
    const { data, error, isLoading, mutate } = useSWR<DashboardStatsResponse>(
        `/api/seller/dashboard-stats?period=${period}`,
        fetcher,
        {
            revalidateOnFocus: true,
            dedupingInterval: 5000, // Dedupe requests within 5 seconds
        }
    );

    return {
        stats: data,
        isLoading,
        error,
        refresh: mutate,
    };
}

export type { MetricData };
