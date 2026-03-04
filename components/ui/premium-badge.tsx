import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface PremiumBadgeProps {
    tier?: string;
    className?: string;
    iconClassName?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ tier, className, iconClassName, size = 'md' }: PremiumBadgeProps) {
    const sizeClasses = {
        sm: 'size-4',
        md: 'size-5',
        lg: 'size-6'
    };
    const iconSize = sizeClasses[size];
    // Map tier to appropriate colors
    // PRO / STARTER: Soukloop Orange (#E87A3F)
    // STARTER: Light Orange (#FB923C)
    const isPro = tier === 'PRO';
    const isStarter = tier === 'STARTER';

    if (!isPro && !isStarter) return null;

    const badgeColor = isPro ? "#E87A3F" : "#FB923C";
    const tooltipText = isPro ? "Pro Verified Seller" : "Starter Verified Seller";

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn("inline-flex items-center justify-center cursor-help", className)}>
                        <BadgeCheck
                            className={cn(iconSize, iconClassName)}
                            style={{ color: badgeColor, fill: `${badgeColor}20` }}
                        />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs font-medium">{tooltipText}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
