"use client";

import { useState } from 'react';
import { ShoppingBag, Tag, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface TopDetail {
    id: string;
    name: string;
    category: string;
    value: number; // sales sum or count
    secondaryValue?: string | number;
    percentage?: number;
    image?: string | null;
}

interface TopDressStylesProps {
    topSelling?: any[];
    topListed?: any[];
    isLoading?: boolean;
}

export default function TopDressStyles({
    topSelling = [],
    topListed = [],
    isLoading
}: TopDressStylesProps) {
    const [activeTab, setActiveTab] = useState<'selling' | 'listed'>('selling');

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white p-6 animate-pulse">
                <div className="flex justify-between mb-4">
                    <div className="h-6 w-40 bg-gray-200 rounded" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-lg" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                                <div className="h-3 w-1/2 bg-gray-200 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const rawData = activeTab === 'selling' ? topSelling : topListed;

    // Prepare data based on active tab
    const displayData: TopDetail[] = rawData.map(item => {
        if (activeTab === 'selling') {
            return {
                id: item.id,
                name: item.name || 'Unknown',
                category: item.category || 'Uncategorized',
                value: item.value || 0,
                secondaryValue: `${item.count || 0} items sold`,
                percentage: item.percentage || 0,
                image: item.image
            };
        } else {
            return {
                id: item.id,
                name: item.name || 'Unknown',
                category: item.category || 'Uncategorized',
                value: item.count || 0,
                secondaryValue: 'active listings',
                percentage: 0,
                image: item.image
            };
        }
    });

    return (
        <div className="rounded-xl border bg-white p-6 h-[500px] flex flex-col">
            <div className="mb-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Dress Style Analytics</h3>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('selling')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'selling'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Top Selling
                        </button>
                        <button
                            onClick={() => setActiveTab('listed')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'listed'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Top Listed
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500">Most popular styles across the platform grouped by performance.</p>
            </div>

            {displayData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 flex-1">
                    {activeTab === 'selling' ? <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" /> : <Tag className="h-12 w-12 text-gray-300 mb-2" />}
                    <p>No data available for the selected range.</p>
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {displayData.map((style, index) => (
                        <Link
                            key={style.id}
                            href={`/admin/categories/dress-styles/${style.id}`}
                            className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 transition-all group"
                        >
                            {/* Image or Letter Fallback */}
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                {style.image ? (
                                    <img
                                        src={style.image}
                                        alt={style.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-orange-100 text-xl font-bold text-orange-600">
                                        {(style.name || '?').charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                                                {style.name}
                                            </p>
                                            <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-orange-400 opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 px-2 py-0.5 bg-gray-100 rounded-full w-fit">
                                            {style.category}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-gray-900">
                                        {activeTab === 'selling'
                                            ? `$${(style.value || 0).toLocaleString()}`
                                            : (style.value || 0)}
                                    </p>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-sm">
                                    <p className="text-gray-500">{style.secondaryValue}</p>
                                    {activeTab === 'selling' && style.percentage > 0 && (
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.percentage > 70 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {style.percentage}% sold
                                        </span>
                                    )}
                                </div>
                                {activeTab === 'selling' && style.percentage > 0 && (
                                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-orange-500 transition-all duration-500"
                                            style={{ width: `${style.percentage || 0}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
