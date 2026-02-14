"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// AuthInput - Universal input component for all auth popups
// ============================================================================

export interface AuthInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    error?: string;
    type?: "text" | "email" | "password" | "tel";
}

export function AuthInput({
    label,
    error,
    type = "text",
    className,
    id,
    ...props
}: AuthInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Consistent focus styling - orange border to match brand
    const inputStyles = cn(
        "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm sm:text-base",
        "outline-none transition-all duration-200",
        "focus:border-[#e0622c] focus:ring-2 focus:ring-[#e0622c] focus:ring-opacity-50",
        isPassword && "pr-12",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
        className
    );

    return (
        <div className="w-full">
            {label && (
                <label
                    htmlFor={inputId}
                    className="mb-1 block text-sm font-medium text-black"
                >
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={inputId}
                    type={isPassword && showPassword ? "text" : type}
                    className={inputStyles}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="size-5" />
                        ) : (
                            <Eye className="size-5" />
                        )}
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
}

export default AuthInput;
