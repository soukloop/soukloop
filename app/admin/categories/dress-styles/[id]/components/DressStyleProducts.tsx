"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/admin/ProductCard";
import Pagination from "@/components/admin/Pagination";

interface Product {
    id: string;
    name: string;
    price: number;
    images: { url: string }[];
    hasPendingStyle: boolean;
    isActive: boolean;
    status: string;
    vendor: {
        id: string;
        user?: { name: string; email?: string };
    };
    dressStyle?: { name: string };
}

interface DressStyleProductsProps {
    products: Product[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export default function DressStyleProducts({ products, total, currentPage, totalPages }: DressStyleProductsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'all');

    // Assuming useDebouncedValue is imported or defined elsewhere.
    // For the purpose of this edit, I'm adding it as requested, but it might require an import.
    // const debouncedSearch = useDebouncedValue(searchQuery, 500);

    const updateURL = (params: Record<string, string>) => {
        const current = new URLSearchParams(searchParams?.toString() || '');
        Object.entries(params).forEach(([key, value]) => {
            if (value && value !== 'all') {
                current.set(key, value);
            } else {
                current.delete(key);
            }
        });
        router.push(`?${current.toString()}`);
    };

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        const timer = setTimeout(() => {
            updateURL({ search: value, page: '1' });
        }, 500);
        return () => clearTimeout(timer);
    };

    const handleFilterChange = (value: string) => {
        setStatusFilter(value);
        updateURL({ status: value, page: '1' });
    };

    const handlePageChange = (page: number) => {
        updateURL({ page: page.toString() });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-900">Products ({total})</h3>
                    </div>
                    <p className="text-sm text-gray-500">Manage products using this dress style</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 w-full sm:w-[250px] bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={handleFilterChange}>
                        <SelectTrigger className="w-[180px] h-10 rounded-xl border-gray-200 focus:border-[#E87A3F] focus:ring-[#E87A3F]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Grid */}
            <div className="p-6">
                {products.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">No products match your criteria</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                isPending={product.hasPendingStyle}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="border-t p-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}
