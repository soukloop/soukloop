"use client";

import { useState } from "react";
import { X, Check } from "lucide-react";
import { toast } from "sonner";

// =============================================================================
// TYPES
// =============================================================================

interface UpgradeAdModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId?: string;
}

interface PricingOption {
    id: string;
    title: string;
    description: string;
    price: string;
}

// =============================================================================
// DATA
// =============================================================================

const features = [
    "Your ad gets priority display for maximum visibility.",
    "Reach more potential buyers faster.",
    "Appear higher in search results.",
    "Featured in special sections for premium traffic.",
];

const pricingOptions: PricingOption[] = [
    {
        id: "bump",
        title: "Bump Your Ad",
        description: "Boost your listing to the top so buyers see your product first during related searches.",
        price: "$4.99",
    },
    {
        id: "video",
        title: "Video Promo",
        description: "Feature your product in the homepage video section for maximum visibility and higher conversions.",
        price: "$4.99",
    },
    {
        id: "weekly",
        title: "Feature 1 Ad Weekly",
        description: "Reach up to 4 times more buyers",
        price: "$4.99",
    },
    {
        id: "14days",
        title: "Feature 1 Ad 14 Days",
        description: "Reach up to 6 times more buyers",
        price: "$9.99",
    },
    {
        id: "30days",
        title: "Feature 1 Ad 30 days",
        description: "Reach up to 8 times more buyers",
        price: "$29.99",
    },
];

// =============================================================================
// COMPONENT
// =============================================================================

export default function UpgradeAdModal({ isOpen, onClose }: UpgradeAdModalProps) {
    const [selectedOption, setSelectedOption] = useState("14days");

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
        >
            <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 transition-colors hover:text-gray-600"
                >
                    <X className="size-5" />
                </button>

                {/* Title */}
                <div className="mb-2 flex items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">Upgrade To</h2>
                    <span className="rounded bg-[#E87A3F] px-2 py-0.5 text-sm font-bold text-white">
                        PRO
                    </span>
                </div>

                {/* Subtitle */}
                <p className="mb-6 text-sm text-gray-600">
                    Get Unlimited Access to all Features
                </p>

                {/* Features List */}
                <div className="mb-6 space-y-3">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                            <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#E87A3F]">
                                <Check className="size-2.5 text-white" strokeWidth={3} />
                            </div>
                            <p className="text-sm text-gray-600">{feature}</p>
                        </div>
                    ))}
                </div>

                {/* Pricing Options */}
                <div className="mb-6 space-y-3">
                    {pricingOptions.map((option) => (
                        <label
                            key={option.id}
                            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-colors ${selectedOption === option.id
                                ? "border-[#E87A3F] bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Radio Button */}
                                <div className="mt-1 flex items-center justify-center">
                                    <div
                                        className={`size-5 rounded-full border-2 ${selectedOption === option.id
                                            ? "border-[#E87A3F]"
                                            : "border-gray-300"
                                            }`}
                                    >
                                        {selectedOption === option.id && (
                                            <div className="m-0.5 size-3 rounded-full bg-[#E87A3F]" />
                                        )}
                                    </div>
                                </div>

                                {/* Option Details */}
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {option.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{option.description}</p>
                                </div>
                            </div>

                            {/* Price */}
                            <span className="shrink-0 text-lg font-bold text-gray-900">
                                {option.price}
                            </span>

                            {/* Hidden input for form submission */}
                            <input
                                type="radio"
                                name="pricing-option"
                                value={option.id}
                                checked={selectedOption === option.id}
                                onChange={() => setSelectedOption(option.id)}
                                className="sr-only"
                            />
                        </label>
                    ))}
                </div>

                {/* Footer Note */}
                <p className="mb-4 text-center text-xs text-gray-500">
                    No Commitment. Cancel Anytime.
                </p>

                {/* CTA Button */}
                <button
                    onClick={() => {
                        toast.info(`Selected: ${pricingOptions.find(o => o.id === selectedOption)?.title}`);
                        onClose();
                    }}
                    className="w-full rounded-full bg-[#E87A3F] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#d6692f]"
                >
                    Add Card Details
                </button>
            </div>
        </div>
    );
}
