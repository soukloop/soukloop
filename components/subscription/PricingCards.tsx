"use client";

import React from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingCardsProps {
    currentTier: string;
    onSelect: (priceId?: string) => void;
    isPending?: boolean;
    className?: string;
}

export const PricingCards: React.FC<PricingCardsProps> = ({
    currentTier,
    onSelect,
    isPending,
    className
}) => {
    const plans = [
        {
            id: "BASIC",
            name: "Basic plan",
            description: "Perfect for trying out the platform.",
            price: "Free",
            priceDetails: "",
            features: ["3 active products only", "12% commission rate", "Standard payout schedule"],
            buttonText: currentTier === "BASIC" ? "Current Plan" : "Select",
            highlight: false,
            priceId: undefined
        },
        {
            id: "STARTER",
            name: "Starter plan",
            description: "Great for occasional sellers.",
            price: "$10",
            priceDetails: "/mo",
            features: ["30 active products", "10% commission rate", "Weekly payout schedule", "Seller Stats", "Premium Badge"],
            buttonText: currentTier === "STARTER" ? "Current Plan" : "Get started",
            highlight: false,
            priceId: "starter_price"
        },
        {
            id: "PRO",
            name: "Pro plan",
            description: "Everything you need to grow.",
            price: "$30",
            priceDetails: "/mo",
            features: ["Unlimited products", "8% commission rate", "Weekly payout schedule", "Seller Stats", "Premium Badge", "Priority Support"],
            buttonText: currentTier === "PRO" ? "Current Plan" : "Get started",
            highlight: true,
            priceId: "pro_price"
        }
    ];

    return (
        <div className={cn("mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3 pt-2 px-4 lg:px-0", className)}>
            {plans.map((plan) => {
                const isCurrent = currentTier?.toUpperCase() === plan.id;

                return (
                    <div
                        key={plan.id}
                        className={cn(
                            "rounded-2xl p-6 shadow-sm flex flex-col relative transition-all duration-300",
                            plan.highlight
                                ? "border-2 border-orange-500 bg-orange-500 text-white shadow-lg lg:scale-105 z-10"
                                : "border border-gray-200 bg-white text-gray-900",
                            !plan.highlight && plan.id === 'STARTER' && "border-orange-200 bg-orange-50"
                        )}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-orange-500 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                Recommended
                            </div>
                        )}

                        <div className="mb-5">
                            <h3 className={cn("text-2xl md:text-3xl font-serif font-semibold tracking-tight italic", plan.highlight ? "text-white" : "text-gray-900")}>
                                {plan.name}
                            </h3>
                            <p className={cn("text-xs", plan.highlight ? "text-orange-100" : "text-gray-500")}>
                                {plan.description}
                            </p>
                        </div>

                        <div className="mb-6 flex items-baseline gap-1">
                            <span className={cn("text-3xl font-bold", plan.highlight ? "text-white" : "text-gray-900")}>
                                {plan.price}
                            </span>
                            {plan.priceDetails && (
                                <span className={cn("text-xs", plan.highlight ? "text-orange-100" : "text-gray-500")}>
                                    {plan.priceDetails}
                                </span>
                            )}
                        </div>

                        <div className="space-y-3 mb-8">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <Check className={cn("size-4", plan.highlight ? "text-white" : "text-orange-500")} />
                                    <span className={cn("text-xs", plan.highlight ? "text-orange-50" : "text-gray-600")}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant={plan.highlight ? "default" : "outline"}
                            disabled={isPending || isCurrent}
                            className={cn(
                                "mt-auto h-11 w-full rounded-xl font-bold transition-all border-2",
                                plan.highlight
                                    ? "bg-white text-orange-500 hover:bg-orange-50 border-white"
                                    : "border-orange-500 text-orange-500 hover:bg-orange-50",
                                isCurrent && "opacity-50 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-500 hover:bg-gray-100"
                            )}
                            onClick={() => !isCurrent && plan.priceId && onSelect(plan.priceId)}
                        >
                            {isCurrent ? "Current Plan" : plan.buttonText}
                        </Button>
                    </div>
                );
            })}
        </div>
    );
};
