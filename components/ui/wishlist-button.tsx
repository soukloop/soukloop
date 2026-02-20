"use client";

import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WishlistButtonProps {
    isWishlisted: boolean;
    onClick: (e: React.MouseEvent) => void;
    className?: string; // Additional classes for the button container
    iconClassName?: string; // Additional classes for the icon
    variant?: "icon" | "full"; // 'icon' = just the heart (or minimal button), 'full' = with text (future proofing)
    size?: "sm" | "md" | "lg";
}

export default function WishlistButton({
    isWishlisted,
    onClick,
    className,
    iconClassName,
    size = "md",
}: WishlistButtonProps) {

    // Size mapping
    const iconSizes = {
        sm: "size-4 sm:size-5", // Compact
        md: "size-5 sm:size-6", // Default Product Card
        lg: "size-6 span:size-7", // Detail Page / Hero
    };

    return (
        <button
            onClick={onClick}
            className={cn(
                "group relative flex items-center justify-center rounded-full transition-all focus:outline-none",
                "active:scale-95",
                className
            )}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
            <Heart
                className={cn(
                    "transition-transform group-hover:scale-110",
                    iconSizes[size],
                    isWishlisted
                        ? "fill-[#ff4500] text-[#ff4500]" // Active State
                        : "text-gray-400 group-hover:text-gray-600", // Inactive State
                    iconClassName
                )}
            />
        </button>
    );
}
