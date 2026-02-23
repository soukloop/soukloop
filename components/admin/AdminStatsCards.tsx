"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { TrendingUp, TrendingDown, Users, Box, DollarSign, Cloud, Loader2 } from 'lucide-react';
import { DashboardMetrics } from '@/lib/admin/types';
import Image from 'next/image';

export default function AdminStatsCards({
    initialMetrics
}: {
    initialMetrics?: DashboardMetrics;
}) {
    const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');

    // Only fetch if period changes from the initial 'daily' state, or if we want to refresh 'daily' later
    const { data: metrics, isLoading, isValidating } = useSWR<DashboardMetrics>(
        `/api/admin/stats/metrics?period=${period}`,
        (url) => fetch(url).then(res => res.json()),
        {
            fallbackData: period === 'daily' ? initialMetrics : undefined,
            revalidateOnFocus: false // Prevent unnecessary refetches on tab switch unless needed
        }
    );

    const displayMetrics = metrics || initialMetrics;
    const comparisonText = period === 'weekly' ? 'from last week' : 'from yesterday';

    const statsCards = [
        {
            title: "Total Users",
            value: displayMetrics?.totalUsers?.value?.toLocaleString() || '0',
            change: `${Math.abs(displayMetrics?.totalUsers?.percentageChange || 0).toFixed(1)}% ${displayMetrics?.totalUsers?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: displayMetrics?.totalUsers?.trend || 'neutral',
            icon: Users,
            bgColor: "bg-purple-50",
        },
        {
            title: "Total Orders",
            value: displayMetrics?.totalOrders?.value?.toLocaleString() || '0',
            change: `${Math.abs(displayMetrics?.totalOrders?.percentageChange || 0).toFixed(1)}% ${displayMetrics?.totalOrders?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: displayMetrics?.totalOrders?.trend || 'neutral',
            icon: Box,
            bgColor: "bg-yellow-50",
        },
        {
            title: "Revenue (GMV)",
            value: `$${(displayMetrics?.revenueThisMonth?.value || 0).toLocaleString()}`,
            change: `${Math.abs(displayMetrics?.revenueThisMonth?.percentageChange || 0).toFixed(1)}% ${displayMetrics?.revenueThisMonth?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: displayMetrics?.revenueThisMonth?.trend || 'neutral',
            icon: TrendingUp,
            bgColor: "bg-green-50",
        },
        {
            title: "Platform Earnings",
            value: `$${(displayMetrics?.platformEarnings?.value || 0).toLocaleString()}`,
            change: `${Math.abs(displayMetrics?.platformEarnings?.percentageChange || 0).toFixed(1)}% ${displayMetrics?.platformEarnings?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: displayMetrics?.platformEarnings?.trend || 'neutral',
            icon: DollarSign,
            bgColor: "bg-blue-50",
        },
        {
            title: "Active Sellers",
            value: displayMetrics?.activeSellers?.value?.toLocaleString() || '0',
            change: `${Math.abs(displayMetrics?.activeSellers?.percentageChange || 0).toFixed(1)}% ${displayMetrics?.activeSellers?.trend === 'up' ? 'Up' : 'Down'} ${comparisonText}`,
            changeType: displayMetrics?.activeSellers?.trend || 'neutral',
            icon: Cloud,
            bgColor: "bg-pink-50",
        },
    ];

    if (isLoading && !displayMetrics) {
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
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    Key Metrics
                    {isValidating && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                </h2>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => setPeriod('daily')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'daily'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'weekly'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Weekly
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {statsCards.map((card, index) => (
                    <div
                        key={index}
                        className={`rounded-xl border bg-white p-4 transition-all hover:shadow-md ${isValidating ? 'opacity-70' : ''}`}
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
                                    <div className="h-6 w-6 relative">
                                        <Image src={card.icon as string} alt="" fill className="object-contain" sizes="24px" />
                                    </div>
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
        </div>
    );
}
