"use client";

import { useState } from "react";
import {
    XAxis,
    YAxis,
    ResponsiveContainer,
    CartesianGrid,
    Tooltip,
    AreaChart,
    Area,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, TrendingUp, TrendingDown } from "lucide-react";

// Get current month name
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const getCurrentMonth = () => MONTHS[new Date().getMonth()];

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-3 shadow-[0_4px_20px_0px_rgba(0,0,0,0.08)]">
                <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#E87A3F]"></span>
                    <p className="text-base font-bold text-gray-900">
                        ${payload[0].value.toLocaleString()}
                    </p>
                </div>
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

interface SellerSalesChartProps {
    data: { name: string; value: number }[];
    isMobile?: boolean; // Can be passed or detected
}

export function SellerSalesChart({ data, isMobile = false }: SellerSalesChartProps) {
    const [salesMonth, setSalesMonth] = useState(getCurrentMonth());

    // Default data if empty
    const chartData = data && data.length > 0 ? data : [
        { name: "Mon", value: 0 },
        { name: "Tue", value: 0 },
        { name: "Wed", value: 0 },
        { name: "Thu", value: 0 },
        { name: "Fri", value: 0 },
        { name: "Sat", value: 0 },
        { name: "Sun", value: 0 },
    ];

    return (
        <div className="rounded-[20px] border border-gray-100 bg-white p-4 sm:p-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]">
            <div className="mb-4 sm:mb-6 flex flex-row items-center justify-between gap-2">
                <h2 className="text-base font-bold text-gray-900 sm:text-xl">
                    Sales Details
                </h2>
                <Select value={salesMonth} onValueChange={setSalesMonth}>
                    <SelectTrigger className="w-[140px] rounded-lg border-none bg-[#F9F9F9] px-4 text-sm font-medium text-gray-500 shadow-none hover:bg-gray-100 focus:ring-0 focus:ring-offset-0">
                        <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="border-gray-100 bg-white">
                        {MONTHS.map((month) => (
                            <SelectItem
                                key={month}
                                value={month}
                                className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500"
                            >
                                {month}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="h-[250px] w-full sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 5,
                            left: typeof window !== 'undefined' && window.innerWidth < 640 ? -30 : -20,
                            bottom: 0
                        }}
                    >
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#E87A3F" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#E87A3F" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 500 }}
                            dy={10}
                            ticks={getTicks(chartData, isMobile ? 3 : 5)}
                            tickFormatter={(value) => {
                                // Expecting format "Jan 01" or "Mon"
                                const parts = value.split(' ');
                                return parts.length > 1 ? parts[1] : value;
                            }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#9CA3AF", fontSize: 12, fontWeight: 500 }}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#E87A3F", strokeWidth: 1, strokeDasharray: "3 3" }} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#E87A3F"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorSales)"
                            dot={{ r: 4, fill: "#E87A3F", stroke: "#fff", strokeWidth: 2 }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: "#E87A3F" }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
