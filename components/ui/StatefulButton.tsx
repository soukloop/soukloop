"use client";

import * as React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatefulButtonProps extends ButtonProps {
    isLoading?: boolean;
    loadingText?: string;
}

export function StatefulButton({
    children,
    isLoading = false,
    loadingText = "Processing...",
    className,
    disabled,
    ...props
}: StatefulButtonProps) {
    return (
        <Button
            className={cn("relative transition-all", className)}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isLoading ? loadingText : children}
        </Button>
    );
}
