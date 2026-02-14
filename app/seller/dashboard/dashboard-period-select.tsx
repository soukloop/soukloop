"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DashboardPeriodSelectProps {
    period: string;
    onPeriodChange: (value: string) => void;
    isDisabled?: boolean;
}

export function DashboardPeriodSelect({ period, onPeriodChange, isDisabled }: DashboardPeriodSelectProps) {
    return (
        <div className="flex items-center gap-3 bg-white p-1 rounded-lg border border-gray-100 shadow-sm">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider pl-2">Period:</span>
            <Select value={period} onValueChange={onPeriodChange} disabled={isDisabled}>
                <SelectTrigger className="w-[140px] h-9 border-none bg-[#F9F9F9] px-4 text-sm font-medium text-gray-500 shadow-none hover:bg-gray-100 focus:ring-0 focus:ring-offset-0 transition-colors">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent align="end" className="border-gray-100 bg-white shadow-xl">
                    <SelectItem value="daily" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">Daily View</SelectItem>
                    <SelectItem value="weekly" className="cursor-pointer text-gray-600 focus:bg-orange-50 focus:text-orange-500">Weekly View</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
