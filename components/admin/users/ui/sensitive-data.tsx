"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/copy-button";

interface SensitiveDataDisplayProps {
    value: string;
    label?: string; // For accessibility
    onReveal?: () => Promise<string | void>; // Optional async callback to "fetch/decrypt"
    className?: string;
    allowCopy?: boolean;
}

export function SensitiveDataDisplay({
    value,
    label = "sensitive data",
    onReveal,
    className,
    allowCopy = true,
}: SensitiveDataDisplayProps) {
    const [isRevealed, setIsRevealed] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [displayValue, setDisplayValue] = React.useState(value);

    const handleReveal = async () => {
        if (isRevealed) {
            setIsRevealed(false);
            return;
        }

        setIsLoading(true);
        // If there's an async action (e.g. decrypt on server), await it
        if (onReveal) {
            try {
                const fetched = await onReveal();
                if (typeof fetched === 'string') {
                    setDisplayValue(fetched);
                }
            } catch (error) {
                console.error("Failed to reveal data", error);
            }
        }

        // Artificial delay for effect if no async prop or just to show skeleton briefly for "decrypt" feel
        if (!onReveal) {
            await new Promise((resolve) => setTimeout(resolve, 600));
        }

        setIsLoading(false);
        setIsRevealed(true);
    };

    return (
        <div className={cn("group/sensitive flex items-center gap-1", className)}>
            {isLoading ? (
                <Skeleton className="h-5 w-24 rounded-md" />
            ) : (
                <span className={cn("font-mono text-sm", isRevealed ? "text-zinc-900" : "text-zinc-400 tracking-widest")}>
                    {isRevealed ? displayValue : "•".repeat(Math.min(displayValue.length, 12))}
                </span>
            )}

            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-zinc-400 hover:text-zinc-700 ml-1"
                onClick={handleReveal}
                disabled={isLoading}
            >
                <span className="sr-only">{isRevealed ? "Hide" : "Show"} {label}</span>
                {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </Button>

            {isRevealed && allowCopy && (
                <CopyButton value={displayValue} className="ml-0" hoverOnly />
            )}
        </div>
    );
}
