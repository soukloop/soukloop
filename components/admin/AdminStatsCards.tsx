"use client";

import { TrendingUp, TrendingDown, Users, Box, DollarSign, Cloud } from 'lucide-react';
import { DashboardStats } from '@/lib/admin/types';
// import { useAdminStats } from '@/hooks/useAdminStats'; // REMOVED

export default function AdminStatsCards({
    stats,
    period = 'daily',
    isLoading
}: {
    stats?: DashboardStats;
    period?: 'daily' | 'weekly';
    isLoading?: boolean;
}) {
    // const { stats, isLoading } = useAdminStats(period, month, year); // REMOVED

    const comparisonText = period === 'weekly' ? 'from last week' : 'from yesterday';

    const statsCards = [
        {
            title: "Total Users",
            value: stats?.totalUsers?.value?.toLocaleString() || '0',
            change: `${Math.abs(stats?.totalUsers?.percentageChange || 0).toFixed(1)}% ${stats?.totalUsers?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: stats?.totalUsers?.trend || 'neutral',
            icon: Users,
            bgColor: "bg-purple-50",
        },
        {
            title: "Total Orders",
            value: stats?.totalOrders?.value?.toLocaleString() || '0',
            change: `${Math.abs(stats?.totalOrders?.percentageChange || 0).toFixed(1)}% ${stats?.totalOrders?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: stats?.totalOrders?.trend || 'neutral',
            icon: Box,
            bgColor: "bg-yellow-50",
        },
        {
            title: "Revenue (GMV)",
            value: `$${(stats?.revenueThisMonth?.value || 0).toLocaleString()}`,
            change: `${Math.abs(stats?.revenueThisMonth?.percentageChange || 0).toFixed(1)}% ${stats?.revenueThisMonth?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: stats?.revenueThisMonth?.trend || 'neutral',
            icon: TrendingUp,
            bgColor: "bg-green-50",
        },
        {
            title: "Platform Earnings",
            value: `$${(stats?.platformEarnings?.value || 0).toLocaleString()}`,
            change: `${Math.abs(stats?.platformEarnings?.percentageChange || 0).toFixed(1)}% ${stats?.platformEarnings?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: stats?.platformEarnings?.trend || 'neutral',
            icon: DollarSign,
            bgColor: "bg-blue-50",
        },
        {
            title: "Active Sellers",
            value: stats?.activeSellers?.value?.toLocaleString() || '0',
            change: `${Math.abs(stats?.activeSellers?.percentageChange || 0).toFixed(1)}% ${stats?.activeSellers?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: stats?.activeSellers?.trend || 'neutral',
            icon: Cloud,
            bgColor: "bg-pink-50",
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="rounded-xl border bg-white p-4 animate-pulse">
                        <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                        <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
                        <div className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {statsCards.map((card, index) => (
                <div
                    key={index}
                    className="rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 truncate" title={card.title}>{card.title}</p>
                            <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
                        </div>
                        <div className={`rounded-lg p-2 ${card.bgColor} shrink-0`}>
                            {/* Render Icon Component */}
                            {typeof card.icon === 'function' || typeof card.icon === 'object' ? (
                                (() => {
                                    const IconComponent = card.icon;
                                    return <IconComponent className="h-6 w-6 text-gray-700" />;
                                })()
                            ) : (
                                // Fallback for legacy string paths if any
                                <img src={card.icon} alt="" className="h-6 w-6" />
                            )}
                        </div>
                    </div>
                    <div className="mt-3 flex items-center gap-1">
                        {card.changeType === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-600 shrink-0" />
                        ) : card.changeType === 'down' ? (
                            <TrendingDown className="h-4 w-4 text-red-600 shrink-0" />
                        ) : null}
                        <span
                            className={`text-xs font-medium truncate ${card.changeType === 'up'
                                ? 'text-green-600'
                                : card.changeType === 'down'
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                                }`}
                        >
                            {card.change}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
