"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { ShoppingBag, Tag, ExternalLink, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface TopStyleData {
    id: string;
    name: string;
    category: string;
    value: number;
    count: number;
    image?: string | null;
    percentage: number;
}

interface ListedStyleData {
    id: string;
    name: string;
    category: string;
    count: number;
    image?: string | null;
}

interface PaginatedTopStyles {
    styles: TopStyleData[];
    total: number;
    page: number;
    totalPages: number;
}

interface PaginatedListedStyles {
    styles: ListedStyleData[];
    total: number;
    page: number;
    totalPages: number;
}

interface TopDressStylesProps {
    initialSelling?: PaginatedTopStyles;
    initialListed?: PaginatedListedStyles;
}

export default function TopDressStyles({
    initialSelling,
    initialListed
}: TopDressStylesProps) {
    const [activeTab, setActiveTab] = useState<'selling' | 'listed'>('selling');
    const [page, setPage] = useState(1);

    const handleTabSwitch = (tab: 'selling' | 'listed') => {
        setActiveTab(tab);
        setPage(1); // Reset page on tab switch
    };

    const { data: sellingData, isValidating: isSellingValidating } = useSWR<PaginatedTopStyles>(
        activeTab === 'selling' && (page > 1 || !initialSelling)
            ? `/api/admin/stats/styles?type=selling&page=${page}&limit=10`
            : null,
        (url) => fetch(url).then(res => res.json()),
        { fallbackData: activeTab === 'selling' && page === 1 ? initialSelling : undefined, keepPreviousData: true }
    );

    const { data: listedData, isValidating: isListedValidating } = useSWR<PaginatedListedStyles>(
        activeTab === 'listed' && (page > 1 || !initialListed)
            ? `/api/admin/stats/styles?type=listed&page=${page}&limit=10`
            : null,
        (url) => fetch(url).then(res => res.json()),
        { fallbackData: activeTab === 'listed' && page === 1 ? initialListed : undefined, keepPreviousData: true }
    );

    const currentData = activeTab === 'selling' ? sellingData : listedData;
    const isValidating = activeTab === 'selling' ? isSellingValidating : isListedValidating;
    const items = currentData?.styles || [];
    const totalPages = currentData?.totalPages || 1;

    // Prepare data based on active tab
    const displayData = items.map(item => {
        if (activeTab === 'selling') {
            const sItem = item as TopStyleData;
            return {
                id: sItem.id,
                name: sItem.name || 'Unknown',
                category: sItem.category || 'Uncategorized',
                value: sItem.value || 0,
                secondaryValue: `${sItem.count || 0} items sold`,
                percentage: sItem.percentage || 0,
                image: sItem.image
            };
        } else {
            const lItem = item as ListedStyleData;
            return {
                id: lItem.id,
                name: lItem.name || 'Unknown',
                category: lItem.category || 'Uncategorized',
                value: lItem.count || 0,
                secondaryValue: 'active listings',
                percentage: 0,
                image: lItem.image
            };
        }
    });

    return (
        <div className="rounded-xl border bg-white p-6 h-[500px] flex flex-col w-full">
            <div className="mb-4 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        Dress Style Analytics
                        {isValidating && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </h3>
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => handleTabSwitch('selling')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'selling'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Top Selling
                        </button>
                        <button
                            onClick={() => handleTabSwitch('listed')}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'listed'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-900'
                                }`}
                        >
                            Top Listed
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500">Most popular styles across the platform grouped by performance. (All-time data)</p>
            </div>

            <div className={`flex-1 overflow-hidden flex flex-col ${isValidating ? 'opacity-70 transition-opacity' : ''}`}>
                {displayData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                        {activeTab === 'selling' ? <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" /> : <Tag className="h-12 w-12 text-gray-300 mb-2" />}
                        <p>No data available.</p>
                    </div>
                ) : (
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {displayData.map((style) => (
                            <Link
                                key={style.id}
                                href={`/admin/categories/dress-styles/${style.id}`}
                                className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 transition-all group"
                            >
                                {/* Image or Letter Fallback */}
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    {style.image ? (
                                        <Image
                                            src={style.image}
                                            alt={style.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
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

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-4 pt-4 border-t flex items-center justify-between flex-shrink-0">
                    <p className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-2 rounded-lg border bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
