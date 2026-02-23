"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Package, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProductCard, { ProductCardProps } from "./ProductCard";

interface ProductGridWithFiltersProps<T extends ProductCardProps['product']> {
    title: string;
    products: T[];
    icon?: React.ReactNode;
    filterLabel?: string;
    filterOptions?: string[]; // List of values to filter by
    getFilterValue?: (product: T) => string | undefined; // Accessor for filtering
    className?: string;
    description?: string;
}

// Custom Dropdown Component (matching DataTable style)
function CustomFilterDropdown({
    label,
    options,
    activeValue,
    onChange
}: {
    label: string,
    options: string[],
    activeValue: string,
    onChange: (val: string) => void
}) {
    const getPlural = (label: string) => {
        const l = label.toLowerCase();
        if (l === 'status') return 'Statuses';
        if (l.endsWith('y')) return label.slice(0, -1) + 'ies';
        return label + 's';
    };

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={dropdownRef} className="relative min-w-[180px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm outline-none transition-all ${isOpen ? "border-[#E87A3F] ring-1 ring-[#E87A3F]" : "border-gray-200 hover:border-gray-300"
                    }`}
            >
                <span className={activeValue !== "All" ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {activeValue === "All" ? `All ${getPlural(label)}` : activeValue}
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 z-20 mt-2 w-full min-w-[200px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                        <button
                            onClick={() => { onChange("All"); setIsOpen(false); }}
                            className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${activeValue === "All"
                                ? "bg-[#FFF5F2] text-[#E87A3F] font-medium"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            All {getPlural(label)}
                        </button>
                        {options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => { onChange(opt); setIsOpen(false); }}
                                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${activeValue === opt
                                    ? "bg-[#FFF5F2] text-[#E87A3F] font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProductGridWithFilters<T extends ProductCardProps['product']>({
    title,
    products,
    icon,
    filterLabel = "Filter",
    filterOptions = [],
    getFilterValue,
    className = "",
    description
}: ProductGridWithFiltersProps<T>) {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("All");

    const filteredProducts = useMemo(() => {
        let result = products;

        // Search
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(lowerQuery) ||
                p.vendor?.businessName?.toLowerCase().includes(lowerQuery) ||
                p.vendor?.user?.name?.toLowerCase().includes(lowerQuery)
            );
        }

        // Filter
        if (activeFilter !== "All" && getFilterValue) {
            result = result.filter(p => {
                const val = getFilterValue(p);
                return val === activeFilter;
            });
        }

        return result;
    }, [products, searchQuery, activeFilter, getFilterValue]);

    return (
        <div className={`bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        {icon || <Package className="h-5 w-5 text-gray-500" />}
                        <h3 className="text-lg font-bold text-gray-900">{title} ({filteredProducts.length})</h3>
                    </div>
                    {description && <p className="text-sm text-gray-500">{description}</p>}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 w-full sm:w-[250px] bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        />
                    </div>

                    {filterOptions.length > 0 && (
                        <CustomFilterDropdown
                            label={filterLabel}
                            options={filterOptions}
                            activeValue={activeFilter}
                            onChange={setActiveFilter}
                        />
                    )}
                </div>
            </div>

            {/* Grid */}
            <div className="p-6">
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-medium">No products match your criteria</p>
                        <p className="text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
