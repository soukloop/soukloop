"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Package, ChevronDown } from "lucide-react";
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
    description: string;
    images: { url: string }[];
    hasPendingStyle: boolean;
    isActive: boolean;
    status: string;
    condition: string;
    vendorId: string;
    vendor: {
        id: string;
        user: { name: string; email: string };
    };
    dressStyle?: { id: string; name: string };
}

interface DressStyle {
    id: string;
    name: string;
}

interface CategoryProductsProps {
    products: Product[];
    total: number;
    currentPage: number;
    totalPages: number;
    dressStyles: DressStyle[];
}

export default function CategoryProducts({ products, total, currentPage, totalPages, dressStyles }: CategoryProductsProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
    const [statusFilter, setStatusFilter] = useState(searchParams?.get('status') || 'all');
    const [dressStyleFilter, setDressStyleFilter] = useState(searchParams?.get('dressStyle') || 'all');
    const [isStyleDropdownOpen, setIsStyleDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsStyleDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        updateURL({ status: value, page: '1' });
    };

    const handleDressStyleChange = (value: string) => {
        setDressStyleFilter(value);
        setIsStyleDropdownOpen(false);
        updateURL({ dressStyle: value, page: '1' });
    };

    const handlePageChange = (page: number) => {
        updateURL({ page: page.toString() });
    };

    const selectedStyleName = dressStyles.find(s => s.id === dressStyleFilter)?.name || 'All Styles';

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Package className="h-5 w-5 text-gray-500" />
                        <h3 className="text-lg font-bold text-gray-900">Products ({total})</h3>
                    </div>
                    <p className="text-sm text-gray-500">Browse products in this category</p>
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
                    <Select value={statusFilter} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-[180px] h-10 rounded-xl border-gray-200 focus:border-[#E87A3F] focus:ring-[#E87A3F]">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Dress Style Filter */}
                    {dressStyles.length > 0 && (
                        <div ref={dropdownRef} className="relative min-w-[180px]">
                            <button
                                onClick={() => setIsStyleDropdownOpen(!isStyleDropdownOpen)}
                                className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm outline-none transition-all ${isStyleDropdownOpen ? "border-[#E87A3F] ring-1 ring-[#E87A3F]" : "border-gray-200 hover:border-gray-300"
                                    }`}
                            >
                                <span className={dressStyleFilter !== "all" ? "text-gray-900 font-medium" : "text-gray-500"}>
                                    {dressStyleFilter === "all" ? "All Styles" : selectedStyleName}
                                </span>
                                <ChevronDown className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${isStyleDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isStyleDropdownOpen && (
                                <div className="absolute top-full right-0 z-20 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                                        <button
                                            onClick={() => handleDressStyleChange("all")}
                                            className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${dressStyleFilter === "all"
                                                ? "bg-[#FFF5F2] text-[#E87A3F] font-medium"
                                                : "text-gray-600 hover:bg-gray-50"
                                                }`}
                                        >
                                            All Styles
                                        </button>
                                        {dressStyles.map((style) => (
                                            <button
                                                key={style.id}
                                                onClick={() => handleDressStyleChange(style.id)}
                                                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${dressStyleFilter === style.id
                                                    ? "bg-[#FFF5F2] text-[#E87A3F] font-medium"
                                                    : "text-gray-600 hover:bg-gray-50"
                                                    }`}
                                            >
                                                {style.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
