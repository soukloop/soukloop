"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductTabsProps {
    productId: string;
}

export default function ProductTabs({ productId }: ProductTabsProps) {
    const searchParams = useSearchParams();
    const currentTab = searchParams.get("tab") || "overview";

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "chats", label: "Chats" },
        { id: "reviews", label: "Reviews" },
        { id: "returns", label: "Returns & Refunds" },
        { id: "delivery", label: "Delivery" },
        { id: "reports", label: "Reports" },
    ];

    return (
        <div className="flex items-center gap-6 border-b border-gray-200 text-sm">
            {tabs.map((tab) => {
                const isActiveTab = currentTab === tab.id;
                return (
                    <Link
                        key={tab.id}
                        href={`/admin/products/${productId}?tab=${tab.id}`}
                        className={cn(
                            "pb-3 border-b-2 transition-colors font-medium",
                            isActiveTab
                                ? "border-orange-600 text-orange-600"
                                : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
                        )}
                        scroll={false} // Prevent scroll jump on tab change
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
