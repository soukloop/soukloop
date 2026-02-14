"use client";

import { Users, Package, BarChart3, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ICON_MAP: Record<string, any> = {
    users: Users,
    package: Package,
    "bar-chart": BarChart3,
    clock: Clock,
};

interface MetricData {
    title: string;
    value: string;
    stats: {
        percentage: number;
        trend: "up" | "down" | "neutral";
    };
    icon: string;
    bgColor: string;
    iconColor: string;
}

interface DashboardMetricsProps {
    metrics: MetricData[];
    comparisonText: string;
    isLoading?: boolean;
}

export function DashboardMetrics({ metrics, comparisonText, isLoading }: DashboardMetricsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="relative flex min-h-[140px] flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] sm:p-6">
                        <div className="flex items-start justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="size-10 rounded-[20px] sm:size-14" />
                        </div>
                        <div className="mt-auto">
                            <Skeleton className="mb-2 h-10 w-20 sm:mb-3 sm:h-12 sm:w-28" />
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-12" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            {metrics.map((metric, index) => {
                const IconComponent = ICON_MAP[metric.icon] || Users;
                return (
                    <div key={index} className="relative flex min-h-[140px] flex-col justify-between rounded-[20px] border border-gray-100 bg-white p-4 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] sm:p-6 transition-all duration-300">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-gray-500 sm:text-[16px] uppercase tracking-wider">{metric.title}</span>
                            <div className={`flex size-10 items-center justify-center rounded-[20px] sm:size-14 ${metric.bgColor}`}>
                                <IconComponent className={`size-5 sm:size-7 ${metric.iconColor}`} />
                            </div>
                        </div>
                        <div className="mt-auto">
                            <h3 className="mb-2 text-2xl font-bold text-gray-900 sm:mb-3 sm:text-4xl">{metric.value}</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    {metric.stats.trend === "up" ? (
                                        <TrendingUp className="size-3.5 text-[#00B69B] sm:size-4" />
                                    ) : (
                                        <TrendingDown className="size-3.5 text-[#F93C65] sm:size-4" />
                                    )}
                                    <span className={`text-xs font-bold sm:text-sm ${metric.stats.trend === "up" ? "text-[#00B69B]" : "text-[#F93C65]"}`}>
                                        {metric.stats.percentage}%
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-gray-400 sm:text-sm">{comparisonText}</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
