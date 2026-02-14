import Link from "next/link";
import { Package, MapPin, Info } from "lucide-react";
import { ProductWithRelations } from "@/types";
import { Badge } from "@/components/ui/badge";

interface ProductInfoProps {
    product: ProductWithRelations;
}

export default function ProductInfo({ product }: ProductInfoProps) {
    if (!product) return null;

    return (
        <div className="space-y-6">
            {/* Title & Category */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        {product.name}
                    </h1>
                    <Link
                        href={`/category?name=${product.category}`}
                        className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        {product.category || "General"}
                    </Link>
                </div>

                {/* Price Display */}
                <div className="flex items-baseline gap-4">
                    <span className="text-4xl font-black text-[#E87A3F]">${product.price}</span>
                    {product.comparePrice && product.comparePrice > product.price && (
                        <>
                            <span className="text-xl text-gray-400 line-through decoration-red-400/50">
                                ${product.comparePrice}
                            </span>
                            <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                                {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                            </div>
                        </>
                    )}
                </div>

                {/* Reward Points */}
                <div className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                    <span className="mr-1">🏆</span>
                    Earn {Math.floor(product.price * 1)} Points
                </div>

                {/* Posted Date */}
                {product.createdAt && (
                    <p className="text-sm text-gray-500">
                        {(() => {
                            const created = new Date(product.createdAt);
                            const now = new Date();
                            const daysDiff = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
                            if (daysDiff === 0) return "Listed today";
                            if (daysDiff === 1) return "Listed 1 day ago";
                            if (daysDiff < 7) return `Listed ${daysDiff} days ago`;
                            return `Listed ${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''} ago`;
                        })()}
                    </p>
                )}
            </div>

            {/* Static Attributes */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <Attribute label="Size" value={product.size || "Standard"} />
                <div className="h-10 w-px bg-gray-100 mx-2" />
                <Attribute label="Condition" value={product.condition || "Used"} />
            </div>

            {/* Specification Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
                {[
                    { val: product.brand, icon: null },
                    { val: product.fabric, icon: null },
                    { val: product.dress, icon: null },
                    { val: product.occasion, icon: null },
                    { val: product.gender, icon: null },
                    { val: product.location, icon: MapPin },
                ].filter(s => s.val).map((spec, i) => (
                    <div key={i} className="rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-medium text-gray-500 flex items-center gap-1">
                        {spec.icon && <spec.icon className="size-3" />}
                        <span className="text-gray-900">{spec.val}</span>
                    </div>
                ))}
            </div>

            {/* Description */}
            <div className="pt-6 mt-4 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-base leading-relaxed text-gray-600 whitespace-pre-line">
                    {product.description || "No description provided."}
                </p>
            </div>
        </div>
    );
}

function Attribute({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</span>
            <span className="text-lg font-medium text-gray-900">{value}</span>
        </div>
    );
}
