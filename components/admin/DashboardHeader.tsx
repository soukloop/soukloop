"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { MONTHS } from '@/lib/admin/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardHeaderProps {
    period: 'daily' | 'weekly';
    selectedMonth: number;
    selectedYear: number;
}

export default function DashboardHeader({
    period,
    selectedMonth,
    selectedYear
}: DashboardHeaderProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(key, value);
        router.push(`/admin?${params.toString()}`);
    };

    const currentYear = new Date().getFullYear();

    // Filter months if current year is selected
    const displayedMonths = selectedYear === currentYear
        ? MONTHS.filter(m => m.value <= new Date().getMonth())
        : MONTHS;

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">Welcome Admin</h1>
                <img src="/icons/hand-icon.png" alt="Wave" className="h-6 w-6" />
            </div>

            <div className="flex items-center gap-4">
                {/* Month Selector */}
                <Select
                    value={String(selectedMonth)}
                    onValueChange={(val) => updateParam('month', val)}
                >
                    <SelectTrigger className="w-36 border-gray-200 bg-white shadow-sm hover:bg-gray-50 focus:ring-orange-500">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent align="end" side="bottom" className="max-h-[300px]">
                        {displayedMonths.map((month) => (
                            <SelectItem key={month.value} value={String(month.value)} className="cursor-pointer focus:bg-orange-50">
                                {month.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Period Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button
                        onClick={() => updateParam('period', 'daily')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'daily'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => updateParam('period', 'weekly')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${period === 'weekly'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        Weekly
                    </button>
                </div>
            </div>
        </div>
    );
}
