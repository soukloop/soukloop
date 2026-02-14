"use client";

import { useState, useEffect } from 'react';
import { ShoppingBag, Tag } from 'lucide-react';

interface StyleDetail {
    name: string;
    value?: number; // sales amount
    count: number; // items sold or active count
    percentage?: number;
    image?: string | null;
}

interface CategoryGroup {
    category: string;
    styles: StyleDetail[];
}

interface TopCategoriesProps {
    topSelling?: CategoryGroup[];
    topListed?: CategoryGroup[];
    isLoading?: boolean;
}

export default function TopCategories({
    topSelling = [],
    topListed = [],
    isLoading
}: TopCategoriesProps) {
    const [activeTab, setActiveTab] = useState<'selling' | 'listed'>('selling');
    const [activeCategory, setActiveCategory] = useState<string>('');

    // Determine current data based on tab
    const currentData = activeTab === 'selling' ? topSelling : topListed;

    // Effect to set initial category or update if invalid
    useEffect(() => {
        if (currentData.length > 0) {
            // If no active category, or active category not in current list, pick first
            const exists = currentData.some(g => g.category === activeCategory);
            if (!activeCategory || !exists) {
                setActiveCategory(currentData[0].category);
            }
        } else {
            setActiveCategory('');
        }
    }, [activeTab, currentData, activeCategory]);

    const activeGroup = currentData.find(g => g.category === activeCategory);
    const displayStyles = activeGroup ? activeGroup.styles : [];

    if (isLoading) {
        return (
            <div className="rounded-xl border bg-white p-6 animate-pulse h-[500px]">
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

    return (
        <div className="rounded-xl border bg-white p-6 h-[500px] flex flex-col">
            <div className="mb-6 flex flex-col gap-4">
                {/* Main Tab Switcher */}
                <div className="flex gap-2 bg-gray-100 p-1 rounded-lg self-start">
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

                {/* Dynamic Category Tabs */}
                {currentData.length > 0 ? (
                    <div className="flex gap-4 border-b border-gray-100 pb-2 overflow-x-auto custom-scrollbar">
                        {currentData.map((group) => (
                            <button
                                key={group.category}
                                onClick={() => setActiveCategory(group.category)}
                                className={`text-sm font-medium transition-colors relative whitespace-nowrap px-1 pb-2 ${activeCategory === group.category
                                    ? 'text-orange-600'
                                    : 'text-gray-500 hover:text-gray-800'
                                    }`}
                            >
                                {group.category}
                                {activeCategory === group.category && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-600 rounded-t-full" />
                                )}
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-gray-400 italic pb-2 border-b border-gray-100">
                        No categories found.
                    </div>
                )}
            </div>

            {/* Content List */}
            {displayStyles.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center text-gray-500 flex-1">
                    {activeTab === 'selling' ? <ShoppingBag className="h-12 w-12 text-gray-300 mb-2" /> : <Tag className="h-12 w-12 text-gray-300 mb-2" />}
                    <p>No data available for {activeCategory}.</p>
                </div>
            ) : (
                <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
                    {displayStyles.map((style, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 rounded-lg border p-4 hover:bg-gray-50 transition-colors"
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
                                    <p className="font-medium text-gray-900 truncate">
                                        {style.name}
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {activeTab === 'selling'
                                            ? `$${(style.value || 0).toLocaleString()}`
                                            : (style.count || 0)}
                                    </p>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-sm">
                                    <p className="text-gray-500">
                                        {activeTab === 'selling'
                                            ? `${style.count} sold`
                                            : `Active Listings`}
                                    </p>

                                    {/* Only show percentage for selling if needed, though 'All Time' percentage is less meaningful */}
                                </div>

                                {/* Simple Bar for visual variety */}
                                {activeTab === 'selling' && (
                                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                        {/* Just a visual indicator - full width for sold items as we don't calculate % against inventory anymore */}
                                        <div
                                            className="h-full rounded-full bg-orange-500 opacity-80"
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
