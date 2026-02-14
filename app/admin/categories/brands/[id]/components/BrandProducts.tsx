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

interface BrandProductsProps {
  products: any[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function BrandProducts({ products, total, currentPage, totalPages }: BrandProductsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams?.get('search') || '');
  const [activeFilter, setActiveFilter] = useState(searchParams?.get('status') || 'all');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    updateURL({ search: value, page: '1' });
  };

  const handleFilterChange = (value: string) => {
    setActiveFilter(value);
    updateURL({ status: value, page: '1' });
  };

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Products ({total})
          </h3>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-10 rounded-xl border-gray-200 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
            />
          </div>

          {/* Status Filter */}
          <Select value={activeFilter} onValueChange={handleFilterChange}>
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

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => updateURL({ page: page.toString() })}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || activeFilter !== 'all'
              ? 'No products match your filters'
              : 'This brand has no products yet'}
          </p>
        </div>
      )}
    </div>
  );
}
