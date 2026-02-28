"use client";

import { useState, useMemo, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';
import Pagination from './Pagination';
import ActionDropdown, { ActionItem } from './ActionDropdown';
import TableSkeleton from './TableSkeleton';

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T, index: number) => React.ReactNode;
    className?: string;
    sortable?: boolean;
}

export interface FilterOption<T> {
    key: keyof T;
    label: string;
    options: { label: string; value: string | number | boolean }[];
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    pageSize?: number;
    searchable?: boolean;
    searchPlaceholder?: string;
    searchKeys?: (keyof T)[];
    actions?: (item: T) => ActionItem[];
    onRowClick?: (item: T) => void;
    rowCount?: number;
    filterOptions?: FilterOption<T>[];
    manualPagination?: boolean;
    onPageChange?: (page: number) => void;
    onSearch?: (term: string) => void;
    currentPage?: number;
    initialFilters?: Partial<Record<keyof T, any>>;
    toolbarActions?: React.ReactNode;
    isLoading?: boolean;
    emptyMessage?: string;
    className?: string;
}

function FilterDropdown<T>({
    option,
    activeValue,
    onChange
}: {
    option: FilterOption<T>;
    activeValue: string | number | boolean | undefined;
    onChange: (value: string) => void;
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

    const selectedLabel = option.options.find(o => String(o.value) === String(activeValue))?.label || `All ${getPlural(option.label as string)}`;

    return (
        <div ref={dropdownRef} className="relative min-w-[200px]">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3 text-sm outline-none transition-all ${isOpen ? "border-orange-500 ring-1 ring-orange-500" : "border-gray-200 hover:border-gray-300"
                    }`}
                style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
            >
                <span className={activeValue ? "text-gray-900 font-medium" : "text-gray-500"}>
                    {selectedLabel}
                </span>
                <ChevronDown className={`ml-2 h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        <div className="p-1.5">
                            <button
                                onClick={() => {
                                    onChange("");
                                    setIsOpen(false);
                                }}
                                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${!activeValue
                                    ? "bg-orange-50 text-orange-600 font-medium"
                                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                    }`}
                            >
                                All {getPlural(option.label as string)}
                            </button>
                            {option.options.map((opt) => (
                                <button
                                    key={String(opt.value)}
                                    onClick={() => {
                                        onChange(String(opt.value));
                                        setIsOpen(false);
                                    }}
                                    className={`block w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${String(activeValue) === String(opt.value)
                                        ? "bg-orange-50 text-orange-600 font-medium"
                                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DataTable<T extends Record<string, any>>({
    data,
    columns,
    pageSize = 10,
    searchable = true,
    searchPlaceholder = 'Search...',
    searchKeys = [],
    actions,
    onRowClick,
    isLoading = false,
    emptyMessage = 'No data available',
    className = '',
    filterOptions = [],
    rowCount,
    manualPagination = false,
    onPageChange,
    onSearch,
    currentPage: controlledPage,
    initialFilters,
    toolbarActions,
}: DataTableProps<T> & { currentPage?: number; initialFilters?: Partial<Record<keyof T, any>> }) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Partial<Record<keyof T, any>>>(initialFilters || {});
    const [internalPage, setInternalPage] = useState(1);
    const [isSearching, setIsSearching] = useState(false);
    const hasUserSearched = useRef(false);

    // Sync activeFilters with initialFilters when they change
    useEffect(() => {
        if (initialFilters) {
            setActiveFilters(initialFilters);
        }
    }, [initialFilters]);

    // Init search term from URL on mount
    useEffect(() => {
        if (manualPagination && typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlSearch = params.get('search') || '';
            if (urlSearch) setSearchTerm(urlSearch);
        }
    }, [manualPagination]);

    const currentPage = controlledPage !== undefined ? controlledPage : internalPage;

    // Filter data based on search/filters
    const filteredData = useMemo(() => {
        const safeData = Array.isArray(data) ? data : [];
        if (manualPagination) return safeData;

        if (!searchTerm && Object.keys(activeFilters).length === 0) return safeData;

        return safeData.filter((item) => {
            // Apply search
            const matchesSearch = searchKeys.length === 0 || !searchTerm || searchKeys.some((key) => {
                const value = item[key];
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm.toLowerCase());
                }
                return false;
            });

            // Apply filters
            const matchesFilters = Object.entries(activeFilters).every(([key, filterValue]) => {
                if (!filterValue || filterValue === 'all') return true;
                const itemValue = item[key as keyof T];
                return String(itemValue).toLowerCase() === String(filterValue).toLowerCase();
            });

            return matchesSearch && matchesFilters;
        });
    }, [data, searchTerm, searchKeys, activeFilters, manualPagination]);

    // Paginate data
    const totalPages = manualPagination
        ? Math.ceil((rowCount || 0) / pageSize)
        : Math.ceil(filteredData.length / pageSize);

    const paginatedData = useMemo(() => {
        if (manualPagination) return filteredData;
        const start = (currentPage - 1) * pageSize;
        return filteredData.slice(start, start + pageSize);
    }, [filteredData, currentPage, pageSize, manualPagination]);

    // Debounce search for manual pagination (server-side)
    useEffect(() => {
        if (!manualPagination || !hasUserSearched.current) return;

        const timer = setTimeout(() => {
            const params = new URLSearchParams(window.location.search);
            if (searchTerm) params.set('search', searchTerm);
            else params.delete('search');
            params.set('page', '1');
            router.push(`?${params.toString()}`);
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm, manualPagination, router]);

    // Handle search input change
    const handleSearch = (value: string) => {
        hasUserSearched.current = true;
        if (manualPagination) setIsSearching(true);
        setSearchTerm(value);
        if (!manualPagination) {
            setInternalPage(1);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={`space-y-4 ${className}`}>
                <TableSkeleton rowCount={pageSize} columnCount={columns.length + (actions ? 1 : 0)} />
            </div>
        );
    }

    return (
        <div className={`w-full relative px-0.5 pt-0.5 ${className}`}>
            {/* Toolbar: Search and Filters */}
            {(searchable || (filterOptions && filterOptions.length > 0) || toolbarActions) && (
                <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 items-center gap-3">
                        {searchable && (
                            <div className="relative w-full max-w-md">
                                {isSearching ? (
                                    <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange-500 animate-spin" />
                                ) : (
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                )}
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className={`h-10 w-full rounded-full border bg-white pl-10 pr-4 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm transition-all ${isSearching ? 'border-orange-300' : 'border-gray-200'
                                        }`}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {filterOptions && filterOptions.map((option) => (
                            <FilterDropdown
                                key={String(option.key)}
                                option={option}
                                activeValue={activeFilters[option.key]}
                                onChange={(value) => {
                                    const nextFilters = { ...activeFilters };
                                    if (value && value !== 'all') {
                                        nextFilters[option.key] = value;
                                    } else {
                                        delete nextFilters[option.key];
                                    }
                                    setActiveFilters(nextFilters);

                                    if (manualPagination) {
                                        const params = new URLSearchParams(window.location.search);
                                        if (value && value !== 'all') params.set(String(option.key), value);
                                        else params.delete(String(option.key));
                                        params.set('page', '1');
                                        router.push(`?${params.toString()}`);
                                    } else {
                                        setInternalPage(1);
                                    }
                                }}
                            />
                        ))}
                        {toolbarActions}
                    </div>
                </div>
            )}

            {/* Table Container - Cleaned up to remove "white box" */}
            <div className="overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {columns.map((column, index) => (
                                    <th
                                        key={index}
                                        className={`px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 ${column.className || ''}`}
                                    >
                                        {column.header}
                                    </th>
                                ))}
                                {actions && (
                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500 text-right">
                                        Actions
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {paginatedData.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length + (actions ? 1 : 0)}
                                        className="px-6 py-20 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <div className="mb-4 rounded-full bg-gray-50 p-4">
                                                <Search className="h-8 w-8 opacity-20" />
                                            </div>
                                            <p className="text-base font-medium text-gray-900">{emptyMessage}</p>
                                            <p className="mt-1 text-sm">Try adjusting your search or filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedData.map((item, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={`group hover:bg-gray-50/50 transition-colors duration-150 ${onRowClick ? 'cursor-pointer' : ''}`}
                                        onClick={(e) => {
                                            // Don't trigger row click if we clicked a button, anchor, or something inside them
                                            const target = e.target as HTMLElement;
                                            if (
                                                target.closest('button') ||
                                                target.closest('a') ||
                                                target.closest('[role="menuitem"]') ||
                                                target.closest('.action-trigger')
                                            ) {
                                                return;
                                            }
                                            onRowClick?.(item);
                                        }}
                                    >
                                        {columns.map((column, colIndex) => (
                                            <td
                                                key={colIndex}
                                                className={`px-6 py-4 text-sm text-gray-600 ${column.className || ''}`}
                                            >
                                                {column.render
                                                    ? column.render(item, rowIndex)
                                                    : String(item[column.key as keyof T] ?? '')}
                                            </td>
                                        ))}
                                        {actions && (
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="action-trigger" onClick={(e) => e.stopPropagation()}>
                                                    <ActionDropdown actions={actions(item)} />
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-50 bg-white px-6 py-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => {
                                if (manualPagination) {
                                    const params = new URLSearchParams(window.location.search);
                                    params.set('page', String(page));
                                    router.push(`?${params.toString()}`);
                                } else {
                                    setInternalPage(page);
                                }
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
