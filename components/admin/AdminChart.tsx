"use client";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Brush,
} from 'recharts';
// import { useAdminStats } from '@/hooks/useAdminStats';

interface AdminChartProps {
    period?: 'daily' | 'weekly';
    month?: number;
    year?: number;
    chartType?: 'Sales' | 'Orders';
}

// Custom Chart Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-md border border-gray-200 bg-white p-2 shadow-md min-w-[120px]">
                <p className="text-sm font-bold text-gray-900">
                    {payload[0].value.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">{label}</p>
            </div>
        );
    }
    return null;
};

// Helper to get evenly distributed ticks
const getTicks = (data: any[], count: number) => {
    if (!data || data.length === 0) return [];
    if (data.length <= count) return data.map(d => d.name);

    const ticks = [];
    const interval = (data.length - 1) / (count - 1);

    for (let i = 0; i < count; i++) {
        const index = Math.round(i * interval);
        if (data[index]) {
            ticks.push(data[index].name);
        }
    }
    return ticks;
};

export default function AdminChart({
    chartData = [],
    chartType = 'Sales'
}: {
    chartData?: { name: string; value: number }[];
    chartType?: 'Sales' | 'Orders';
}) {
    // const { stats, isLoading } = useAdminStats(period, month, year); // REMOVED

    if (!chartData || chartData.length === 0) {
        return (
            <div className="flex h-[350px] w-full items-center justify-center rounded-xl border bg-gray-50">
                <p className="text-gray-500">No chart data available</p>
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#E87A3F" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#E87A3F" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        vertical={false}
                        stroke="#f0f0f0"
                        strokeDasharray="3 3"
                    />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        minTickGap={40}
                        padding={{ left: 10, right: 10 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280', fontSize: 12 }}
                        tickFormatter={(value) => chartType === 'Sales' ? `$${(value / 1000).toFixed(0)}k` : `${value}`}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#E87A3F"
                        strokeWidth={2}
                        fill="url(#colorValue)"
                        animationDuration={1500}
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#E87A3F' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
