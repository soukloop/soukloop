"use client";

import { useState } from 'react';
import AdminChart from '@/components/admin/AdminChart';

interface DashboardChartSectionProps {
    salesChart: { name: string; value: number }[];
    ordersChart: { name: string; value: number }[];
}

export default function DashboardChartSection({
    salesChart,
    ordersChart
}: DashboardChartSectionProps) {
    const [activeChartTab, setActiveChartTab] = useState<'Sales' | 'Orders'>('Sales');
    const currentChartData = activeChartTab === 'Sales' ? salesChart : ordersChart;

    return (
        <div className="rounded-xl border bg-white p-6">
            {/* Chart Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Tabs */}
                <div className="flex gap-2">
                    {(['Sales', 'Orders'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveChartTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeChartTab === tab
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {tab} Details
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <AdminChart
                key={`${activeChartTab}-${currentChartData.length}`}
                chartData={currentChartData}
                chartType={activeChartTab}
            />
        </div>
    );
}
