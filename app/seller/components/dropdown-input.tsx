"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface DropdownProps {
    label: string;
    placeholder: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
    zIndex?: number;
    isOpen: boolean;
    onToggle: () => void;
}

export default function DropdownInput({
    label,
    placeholder,
    value,
    options,
    onChange,
    zIndex,
    isOpen,
    onToggle,
}: DropdownProps) {
    return (
        <div className="mb-8 w-full custom-dropdown relative" style={{ zIndex }}>
            <label className="mb-2 block text-sm font-semibold text-gray-900">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={onToggle}
                    className={`flex h-14 w-full items-center justify-between rounded-xl border bg-white px-4 text-left outline-none transition-all ${isOpen
                        ? "border-orange-500 ring-2 ring-orange-500"
                        : "border-gray-100 hover:border-gray-300"
                        }`}
                    style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.02)" }}
                >
                    <span
                        className={`text-base ${value ? "font-medium text-gray-900" : "text-gray-400"
                            }`}
                    >
                        {value || placeholder}
                    </span>
                    <ChevronDown
                        className={`size-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                            }`}
                    />
                </button>

                {/* Menus */}
                {isOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="max-h-[240px] overflow-y-auto py-2 custom-scrollbar">
                            {options.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => {
                                        onChange(option);
                                        onToggle();
                                    }}
                                    className={`block w-full px-4 py-3 text-left text-sm transition-colors ${value === option
                                        ? "bg-orange-50 text-orange-600 font-medium"
                                        : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
