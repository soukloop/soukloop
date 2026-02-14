
"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown, Search, Plus, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchableDropdownProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    onAddNew?: (newValue: string) => void; // Optional: Allow adding custom values
    isLoading?: boolean;
    placeholder?: string;
    renderOption?: (option: string) => React.ReactNode; // Optional: Custom option rendering (e.g. colors)
    renderValue?: () => React.ReactNode; // Optional: Custom display for selected value
    zIndex?: number;
    disabled?: boolean;
    variant?: "input" | "button"; // New prop
    searchable?: boolean; // New prop to toggle search visibility
    actionLabel?: string; // e.g. "Add" or "Request"
}

export default function SearchableDropdown({
    label,
    value,
    onChange,
    options,
    onAddNew,
    isLoading = false,
    placeholder = "Select...",
    renderOption,
    renderValue,
    zIndex = 10,
    disabled = false,
    variant = "input",
    searchable = true,
    actionLabel = "Add"
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);

    // For "input" variant: trigger IS the search input
    // For "button" variant: trigger is static, search input is internal
    const [inputValue, setInputValue] = useState(value || "");
    const [internalSearch, setInternalSearch] = useState("");

    // Instruction state for "Add New" guidance
    const [showInstruction, setShowInstruction] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null); // Ref for main input
    const internalInputRef = useRef<HTMLInputElement>(null); // Ref for internal search input

    // Sync input value with external value changes
    useEffect(() => {
        setInputValue(value || "");
    }, [value]);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setShowInstruction(false);
                // Revert to selected value if user clicked away without adding
                setInputValue(value || "");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // DETERMINE SEARCH QUERY based on variant
    const effectiveSearch = variant === "input" ? inputValue : internalSearch;

    // Filter options based on search
    const filteredOptions = useMemo(() => {
        // 1. First, sanitize options (remove empty/null)
        const cleanOptions = options.filter(opt => opt && opt.trim().length > 0);

        // If not searchable (and variant is button), just return clean options
        if (!searchable && variant === "button") return cleanOptions;

        if (!effectiveSearch) return cleanOptions;

        // For input mode, if exactly matches value, show all clean options
        if (variant === "input" && effectiveSearch === value) return cleanOptions;

        // 2. Filter by search query
        return cleanOptions.filter(opt =>
            opt.toLowerCase().includes(effectiveSearch.toLowerCase())
        );
    }, [options, effectiveSearch, value, variant, searchable]);

    const handleSelect = (option: string) => {
        onChange(option);
        setInputValue(option); // Update display
        setInternalSearch(""); // Reset internal search
        setIsOpen(false);
        setShowInstruction(false);
    };

    const handleAddNew = () => {
        const query = variant === "input" ? inputValue : internalSearch;

        // Validation: If empty, guide user to type
        if (!query || !query.trim()) {
            setShowInstruction(true);

            // Focus the appropriate input
            if (variant === "input" && inputRef.current) {
                inputRef.current.focus();
            } else if (variant === "button" && internalInputRef.current) {
                internalInputRef.current.focus();
            }
            return;
        }

        if (onAddNew) {
            onAddNew(query);
            if (query) handleSelect(query);
        }
    };

    // INPUT VARIANT HANDLERS
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
        setShowInstruction(false); // Hide instruction once typing starts
        setIsOpen(true);
    };

    return (
        <div className="mb-6 relative" ref={dropdownRef} style={{ zIndex }}>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
                {label}
            </label>

            <div className="relative">
                {/* TOOLTIP INSTRUCTION */}
                {showInstruction && variant === "input" && (
                    <div className="absolute -top-10 left-0 animate-in fade-in slide-in-from-bottom-2 z-50">
                        <div className="bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-md shadow-sm relative whitespace-nowrap">
                            Type the name of the new {label} to {actionLabel.toLowerCase()}
                            <div className="absolute top-full left-4 -translate-x-1/2 border-4 border-transparent border-t-orange-600" />
                        </div>
                    </div>
                )}

                {variant === "input" ? (
                    <>
                        <Input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onFocus={() => setIsOpen(true)}
                            placeholder={placeholder}
                            disabled={disabled}
                            className={`h-14 w-full rounded-xl border-gray-100 bg-white pr-20 focus-visible:ring-2 focus-visible:ring-[#E87A3F] focus-visible:border-[#E87A3F] transition-all
                                ${showInstruction ? "border-orange-500 ring-1 ring-orange-500 bg-orange-50" : ""}
                            `}
                            style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                        />

                        {/* Inline Add Button: Shows when user types something new */}
                        {onAddNew && inputValue && inputValue !== value && !options.some(opt => opt.toLowerCase() === inputValue.trim().toLowerCase()) && (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleAddNew();
                                }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-orange-100 text-orange-700 hover:bg-orange-200 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors"
                            >
                                {actionLabel}
                            </button>
                        )}

                        {/* Hide Chevron if Inline Add is showing, or just keep it? keeping it might be crowded. Let's hide it if Add is shown. */}
                        {(!onAddNew || !inputValue || inputValue === value) && (
                            <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 size-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className={`flex h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none transition-all ${isOpen
                            ? "border-[#E87A3F] ring-2 ring-[#E87A3F]"
                            : "border-gray-100 hover:border-gray-300"
                            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                        style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                    >
                        <span className={value ? "text-gray-900 font-medium" : "text-gray-400"}>
                            {renderValue ? renderValue() : (renderOption && value ? renderOption(value) : (value || placeholder))}
                        </span>
                        <ChevronDown className={`size-5 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                )}
            </div>

            {/* Dropdown Content */}
            {isOpen && !disabled && (
                <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">

                    {/* Internal Search & Add New Logic */}
                    <div className="flex flex-col">

                        {/* SEARCH BAR (Only for button variant AND searchable) */}
                        {variant === "button" && searchable && (
                            <div className="p-2 border-b border-gray-50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        ref={internalInputRef}
                                        type="text"
                                        placeholder={`Search ${label}...`}
                                        value={internalSearch}
                                        onChange={(e) => {
                                            setInternalSearch(e.target.value);
                                            setShowInstruction(false);
                                        }}
                                        className="w-full h-10 pl-9 pr-4 rounded-lg bg-gray-50 border-none outline-none text-sm focus:ring-1 focus:ring-[#E87A3F]"
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {/* Add New Button - Always visible if onAddNew provided */}
                        {onAddNew && (
                            <button
                                type="button"
                                onClick={handleAddNew}
                                className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm font-medium text-[#E87A3F] bg-orange-50/50 hover:bg-orange-50 transition-colors border-b border-gray-50"
                            >
                                <Plus className="h-4 w-4" />
                                <span>
                                    {effectiveSearch && !options.some(opt => opt.toLowerCase() === effectiveSearch.trim().toLowerCase())
                                        ? `${actionLabel} "${effectiveSearch}"`
                                        : `${actionLabel} New ${label}`
                                    }
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                            <div className="p-2 space-y-2">
                                <DropdownSkeleton />
                                <DropdownSkeleton />
                                <DropdownSkeleton />
                            </div>
                        ) : (
                            <div className="p-2 space-y-1">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => handleSelect(opt)}
                                            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition-colors ${value === opt
                                                ? "bg-[#FEF3EC] text-[#E87A3F] font-medium"
                                                : "text-gray-600 hover:bg-orange-50 hover:text-[#E87A3F]"
                                                }`}
                                        >
                                            {renderOption ? renderOption(opt) : opt}
                                            {value === opt && <Check className="h-4 w-4" />}
                                        </button>
                                    ))
                                ) : (
                                    !onAddNew && (
                                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                                            No options found
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function DropdownSkeleton() {
    return (
        <div className="flex items-center gap-3 px-4 py-2 animate-pulse">
            <div className="h-4 w-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
    );
}
