"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
    displayText?: string;
    label?: string; // e.g. "Copy Email" for accessibility
    iconOnly?: boolean;
    variant?: "ghost" | "outline" | "default" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    showIconAlways?: boolean;
    hoverOnly?: boolean;
    iconClassName?: string;
}

/**
 * Unified professionally styled Copy Button
 * Merged from:
 * - components/ui/copy-text.tsx
 * - components/admin/CopyableText.tsx
 * - components/admin/users/ui/copy-button.tsx
 */
export function CopyButton({
    value,
    displayText,
    label = "Copy to clipboard",
    iconOnly = false,
    variant = "ghost",
    size = "icon",
    className,
    showIconAlways = true,
    iconClassName,
    ...props
}: CopyButtonProps) {
    const [hasCopied, setHasCopied] = React.useState(false);

    const copyToClipboard = React.useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        setHasCopied(true);
        toast.success("Copied to clipboard");

        setTimeout(() => {
            setHasCopied(false);
        }, 2000);
    }, [value]);

    if (!iconOnly && (displayText || value)) {
        return (
            <div
                className={cn(
                    "group/copy flex items-center gap-2 cursor-pointer w-fit select-none",
                    className
                )}
                onClick={copyToClipboard}
                title={label}
            >
                <span className="truncate">{displayText || value}</span>
                <div
                    className={cn(
                        "text-gray-400 group-hover/copy:text-gray-600 transition-opacity",
                        !showIconAlways && "opacity-0 group-hover/copy:opacity-100",
                        hasCopied && "opacity-100"
                    )}
                >
                    {hasCopied ? (
                        <Check className={cn("h-4 w-4 text-green-500 animate-in zoom-in duration-300", iconClassName)} />
                    ) : (
                        <Copy className={cn("h-4 w-4", iconClassName)} />
                    )}
                </div>
            </div>
        );
    }

    return (
        <Button
            size={size}
            variant={variant}
            className={cn(
                "relative h-8 w-8 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200",
                props.hoverOnly && !hasCopied && "opacity-0 group-hover:opacity-100",
                className
            )}
            onClick={copyToClipboard}
            title={label}
            {...props}
        >
            <span className="sr-only">{label}</span>
            {hasCopied ? (
                <Check className={cn("h-4 w-4 text-green-500 animate-in zoom-in duration-300", iconClassName)} />
            ) : (
                <Copy className={cn("h-4 w-4", iconClassName)} />
            )}
        </Button>
    );
}

export default CopyButton;
