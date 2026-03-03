
"use client";

import * as React from "react";
import { ChevronDown, Plus, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

interface FormSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: string[] | { label: string; value: string }[];
    placeholder?: string;
    searchPlaceholder?: string;
    emptyText?: string;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
    triggerClassName?: string;
    onAddNew?: (value: string) => void;
    renderOption?: (option: any) => React.ReactNode;
    renderValue?: (value: string) => React.ReactNode;
    searchable?: boolean;
    actionItem?: { label: string; onClick: (query: string) => void; premium?: boolean };
    hideDefaultAddOption?: boolean;
}

export function FormSelect({
    label,
    value,
    onChange,
    options,
    placeholder = "Select option",
    searchPlaceholder = "Search...",
    emptyText = "No results found.",
    isLoading = false,
    disabled = false,
    className,
    triggerClassName,
    onAddNew,
    renderOption,
    renderValue,
    searchable = true,
    actionItem,
    hideDefaultAddOption = false,
}: FormSelectProps) {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);

    const normalizedOptions = React.useMemo(() => {
        return options.map((opt) =>
            typeof opt === "string" ? { label: opt, value: opt } : opt
        );
    }, [options]);

    const selectedOption = normalizedOptions.find((opt) => opt.value === value);

    // Filter options based on search query
    const filteredOptions = React.useMemo(() => {
        if (!searchQuery) return normalizedOptions;
        return normalizedOptions.filter((opt) =>
            opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [normalizedOptions, searchQuery]);

    const handleSelect = (val: string) => {
        onChange(val);
        setSearchQuery("");
        setOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchQuery("");
    };

    // Focus input when popover opens
    React.useEffect(() => {
        if (open && searchable && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
        if (!open) {
            setSearchQuery("");
        }
    }, [open, searchable]);

    // Display text for the trigger
    const displayText = value
        ? renderValue
            ? renderValue(value)
            : selectedOption?.label || value
        : null;

    return (
        <div className={cn("grid w-full gap-2", className)}>
            {label && <Label className="text-sm font-semibold text-gray-900">{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <div
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "flex h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition-all cursor-pointer",
                            "border-gray-100 hover:border-gray-200",
                            open && "border-[#E87A3F] ring-2 ring-[#E87A3F]",
                            (disabled || isLoading) && "opacity-50 pointer-events-none",
                            triggerClassName
                        )}
                        style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                        onClick={() => !disabled && !isLoading && setOpen(true)}
                    >
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400 shrink-0" />
                            ) : null}
                            {open && searchable ? (
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={value ? (selectedOption?.label || value) : searchPlaceholder}
                                    className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 outline-none border-none focus:ring-0 p-0"
                                    onClick={(e) => e.stopPropagation()}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            setOpen(false);
                                        }
                                    }}
                                />
                            ) : (
                                <span className={cn("truncate text-sm", value ? "text-gray-900 font-normal" : "text-gray-400")}>
                                    {displayText || placeholder}
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                            {value && !open && (
                                <button
                                    onClick={handleClear}
                                    className="p-0.5 rounded-full hover:bg-orange-50 transition-colors"
                                    type="button"
                                >
                                    <X className="h-3.5 w-3.5 text-gray-400 hover:text-[#E87A3F]" />
                                </button>
                            )}
                            <ChevronDown className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")} />
                        </div>
                    </div>
                </PopoverTrigger>
                <PopoverContent
                    className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-xl border-gray-100 overflow-hidden"
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-1.5">
                        {filteredOptions.length === 0 ? (
                            <div className="py-6 text-center text-sm">
                                <p className="text-gray-500 mb-3">{emptyText}</p>
                                {onAddNew && !hideDefaultAddOption && searchQuery && (
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => {
                                            onAddNew(searchQuery);
                                            setSearchQuery("");
                                            setOpen(false);
                                        }}
                                        className="bg-orange-50 text-orange-600 hover:bg-orange-100 h-8 rounded-lg"
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add &quot;{searchQuery}&quot;
                                    </Button>
                                )}
                            </div>
                        ) : (
                            filteredOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleSelect(opt.value)}
                                    className={cn(
                                        "flex w-full items-center justify-between rounded-lg px-3 py-2.5 my-0.5 text-sm cursor-pointer transition-colors",
                                        value === opt.value
                                            ? "bg-[#FEF3EC] text-[#E87A3F] font-medium"
                                            : "text-gray-700 hover:bg-orange-50 hover:text-[#E87A3F]"
                                    )}
                                >
                                    <div className="flex items-center gap-2">
                                        {renderOption ? renderOption(opt) : opt.label}
                                    </div>
                                    {value === opt.value && <Check className="h-4 w-4" />}
                                </button>
                            ))
                        )}
                    </div>

                    {onAddNew && !hideDefaultAddOption && searchQuery && filteredOptions.length > 0 && !normalizedOptions.some(o => o.label.toLowerCase() === searchQuery.toLowerCase()) && (
                        <div className="p-1.5 border-t border-gray-50 bg-gray-50/30">
                            <button
                                onClick={() => {
                                    onAddNew(searchQuery);
                                    setSearchQuery("");
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#E87A3F] font-medium cursor-pointer hover:bg-orange-50"
                            >
                                <Plus className="h-4 w-4" />
                                Add &quot;{searchQuery}&quot;
                            </button>
                        </div>
                    )}

                    {/* Persistent Action Item (e.g. Request new style) */}
                    {actionItem && (
                        <div className="p-1.5 border-t border-gray-50 bg-gray-50/30">
                            <button
                                onClick={() => {
                                    actionItem.onClick(searchQuery);
                                    setSearchQuery("");
                                    setOpen(false);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#E87A3F] font-medium cursor-pointer hover:bg-orange-50"
                            >
                                <Plus className="h-4 w-4" />
                                {actionItem.label}
                                {actionItem.premium && (
                                    <span className="ml-auto bg-[#E87A3F] text-white text-[10px] leading-tight font-bold px-1.5 py-0.5 rounded shadow-sm">
                                        UPGRADE
                                    </span>
                                )}
                            </button>
                        </div>
                    )}
                </PopoverContent>
            </Popover>
        </div>
    );
}
