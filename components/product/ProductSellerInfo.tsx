import Link from "next/link";
import { Star } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { ProductWithRelations } from "@/types";
interface ProductSellerInfoProps {
    vendor: ProductWithRelations['vendor'];
}

export default function ProductSellerInfo({ vendor }: ProductSellerInfoProps) {
    if (!vendor) return null;

    // Use user name or "Seller" as fallback since Vendor doesn't have a specific store name field in schema
    const sellerName = vendor.user?.name || "Seller";
    // Construct avatar URL
    const avatarUrl = vendor.logo || vendor.user?.image || null;

    return (
        <div className="mt-16 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                    <UserAvatar
                        src={avatarUrl}
                        name={sellerName}
                        fallbackType="initials"
                        className="size-12 sm:size-14 ring-2 ring-gray-100"
                    />

                    <div className="min-w-0">
                        <p className="text-lg sm:text-xl font-bold text-gray-900 leading-tight truncate flex items-center gap-1.5">
                            {sellerName}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                            <div className="flex text-yellow-400">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`size-3 sm:size-3.5 ${star <= Math.round(vendor.averageRating || 0) ? "fill-current" : "text-gray-200"}`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-gray-600">
                                {vendor.averageRating ? vendor.averageRating.toFixed(1) : "New"}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    asChild
                    variant="outline"
                    className="w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-50 font-bold px-8 rounded-full h-10 sm:h-12 text-sm sm:text-base"
                >
                    <Link href={`/sellerprofile?id=${vendor.userId}`}>View Profile</Link>
                </Button>
            </div>
        </div>
    );
}
