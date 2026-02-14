"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardPeriodSelect } from "./dashboard-period-select";
import { DashboardMetrics } from "./dashboard-metrics";

interface DashboardShellProps {
    children: React.ReactNode;
    period: string;
    metrics: any[];
    comparisonText: string;
}

export function DashboardShell({ children, period, metrics, comparisonText }: DashboardShellProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handlePeriodChange = (value: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.set("period", value);
            router.push(`?${params.toString()}`, { scroll: false });
        });
    };

    return (
        <div className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500">Track your store's performance in real-time</p>
                </div>
                <div className="flex items-center gap-3">
                    <DashboardPeriodSelect
                        period={period}
                        onPeriodChange={handlePeriodChange}
                        isDisabled={isPending}
                    />
                </div>
            </div>

            {/* Metrics Grid with Shimmer support */}
            <DashboardMetrics
                metrics={metrics}
                comparisonText={comparisonText}
                isLoading={isPending}
            />

            {/* Charts and Orders */}
            <div className={isPending ? "opacity-60 pointer-events-none transition-opacity duration-300" : "transition-opacity duration-300"}>
                {children}
            </div>
        </div>
    );
}
