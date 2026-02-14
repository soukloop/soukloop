"use client";

import {
    Users,
    Package,
    BarChart3,
    Clock,
    TrendingUp,
    TrendingDown,
} from "lucide-react";

interface MetricItem {
    title: string;
    value: string | number;
    percentage: string;
    trend: 'up' | 'down' | 'neutral';
    trendText: string;
    icon: any;
    bgColor: string;
    iconColor: string;
}

interface SellerMetricsCardsProps {
    stats?: any; // The full stats object from hook or manually constructed
    isLoading?: boolean;
}

export function SellerMetricsCards({ stats, isLoading }: SellerMetricsCardsProps) {
    // Dynamic metrics based on backend data
    const metrics: MetricItem[] = [
        {
            title: "Total Visitor",
            value: isLoading ? "..." : stats?.totalVisitors?.value?.toLocaleString() || "0",
            percentage: isLoading ? "..." : `${stats?.totalVisitors?.percentageChange}%` || "0%",
            trend: stats?.totalVisitors?.trend || "neutral",
            trendText: isLoading ? "..." : (stats?.comparisonText ? ` ${stats.comparisonText}` : "Up from yesterday"),
            icon: Users,
            bgColor: "bg-[#F3E8FF]",
            iconColor: "text-[#8B5CF6]",
        },
        {
            title: "Total Order",
            value: isLoading ? "..." : stats?.totalOrders?.value?.toLocaleString() || "0",
            percentage: isLoading ? "..." : `${stats?.totalOrders?.percentageChange}%` || "0%",
            trend: stats?.totalOrders?.trend || "neutral",
            trendText: isLoading ? "..." : (stats?.comparisonText ? ` ${stats.comparisonText}` : "Up from past week"),
            icon: Package,
            bgColor: "bg-[#FFF7ED]",
            iconColor: "text-[#F97316]",
        },
        {
            title: "Net Earnings",
            value: isLoading
                ? "..."
                : `$${((stats?.netEarnings?.value || 0) / 100).toLocaleString()}`,
            percentage: isLoading ? "..." : `${stats?.netEarnings?.percentageChange}%` || "0%",
            trend: stats?.netEarnings?.trend || "neutral",
            trendText: isLoading ? "..." : (stats?.comparisonText ? ` ${stats.comparisonText}` : "Down from yesterday"),
            icon: BarChart3,
            bgColor: "bg-[#ECFDF5]",
            iconColor: "text-[#10B981]",
        },
        {
            title: "Total Pending",
            value: isLoading ? "..." : stats?.totalPending?.value?.toLocaleString() || "0",
            percentage: isLoading ? "..." : `${stats?.totalPending?.percentageChange}%` || "0%",
            trend: stats?.totalPending?.trend || "neutral",
            trendText: isLoading ? "..." : (stats?.comparisonText ? ` ${stats.comparisonText}` : "Up from yesterday"),
            icon: Clock,
            bgColor: "bg-[#FFF1F2]",
            iconColor: "text-[#F43F5E]",
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {metrics.map((metric, index) => (
                <div
                    key={index}
                    className="relative flex min-h-[140px] flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] sm:p-6"
                >
                    {/* Title and Icon Row */}
                    <div className="flex items-start justify-between">
                        <span className="text-xs font-bold text-gray-500 sm:text-[16px] uppercase tracking-wider">
                            {metric.title}
                        </span>
                        <div
                            className={`flex size-10 items-center justify-center rounded-[20px] sm:size-14 ${metric.bgColor}`}
                        >
                            <metric.icon className={`size-5 sm:size-7 ${metric.iconColor}`} />
                        </div>
                    </div>

                    {/* Value and Trend Rows (Stacked) */}
                    <div className="mt-auto">
                        <h3 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-4xl">
                            {metric.value}
                        </h3>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                {metric.trend === "up" ? (
                                    <TrendingUp className="size-3.5 text-[#00B69B] sm:size-4" />
                                ) : (
                                    <TrendingDown className="size-3.5 text-[#F93C65] sm:size-4" />
                                )}
                                <span
                                    className={`text-xs font-bold sm:text-sm ${metric.trend === "up" ? "text-[#00B69B]" : "text-[#F93C65]"}`}
                                >
                                    {metric.percentage}
                                </span>
                            </div>
                            <span className="text-xs font-medium text-gray-400 sm:text-sm">
                                {metric.trendText}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
