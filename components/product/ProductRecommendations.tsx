"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { useProducts } from "@/hooks/useProducts";
import { ProductWithRelations } from "@/types";

interface ProductRecommendationsProps {
    product: ProductWithRelations;
}

export default function ProductRecommendations({ product }: ProductRecommendationsProps) {
    if (!product) return null;

    const vendorUserId = product.vendor?.userId;

    // We can break this down further, but handling the logic here keeps the main page clean.
    // Fetching logic extracted from the original page.

    // 1. More From This Seller
    const { data: sellerProducts } = useProducts({
        params: vendorUserId ? { userId: vendorUserId, limit: 6 } : undefined
    });

    // 2. Same Occasion
    const { data: occasionProducts } = useProducts({
        params: product.occasion ? { occasion: product.occasion, limit: 6 } : undefined
    });

    // 3. Similar Dress Style
    const { data: dressProducts } = useProducts({
        params: product.dress ? { dress: product.dress, limit: 6 } : undefined
    });

    // 4. Same Brand
    const { data: brandProducts } = useProducts({
        params: product.brand ? { brand: product.brand, limit: 6 } : undefined
    });

    // 5. Near Location
    const { data: locationProducts } = useProducts({
        params: product.location ? { location: product.location, limit: 6 } : undefined
    });

    const renderSection = (title: string, products: any[], viewAllLink?: string) => {
        // Filter out current product
        const filtered = products.filter((p: any) => p.id !== product.id);
        if (filtered.length === 0) return null;

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                        {title}
                    </h2>
                    {viewAllLink && (
                        <Button variant="link" className="text-[#E87A3F] font-bold text-sm" asChild>
                            <Link href={viewAllLink}>View All</Link>
                        </Button>
                    )}
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                    {filtered.slice(0, 6).map((p: any) => (
                        <ProductCard
                            key={p.id}
                            compact
                            product={{
                                id: p.id,
                                image: (p.images && p.images.length > 0) ? p.images[0].url : (p.image || "/images/placeholder.png"),
                                title: p.name || p.title,
                                category: p.category,
                                size: p.size,
                                price: `$${p.price}`,
                                originalPrice: p.comparePrice ? `$${p.comparePrice}` : "",
                                isWishlist: false,
                                vendorId: p.vendorId,
                                vendorUserId: p.vendor?.userId,
                                createdAt: p.createdAt,
                                hasPendingStyle: p.hasPendingStyle,
                                isActive: p.isActive,
                                status: p.status,
                                // Add necessary props for card
                            }}
                            handleAddToCart={() => { }} // Placeholder as we might not need add-to-cart in these small cards or it should be handled inside ProductCard
                        />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="mt-16 space-y-12">
            {sellerProducts?.items && renderSection("More From This Seller", sellerProducts.items, `/products?userId=${vendorUserId}`)}
            {occasionProducts?.items && renderSection(`For ${product.occasion || "Similar Occasions"}`, occasionProducts.items)}
            {dressProducts?.items && renderSection(`Similar Styles (${product.dress || "Style"})`, dressProducts.items)}
            {brandProducts?.items && renderSection(`More from ${product.brand || "This Brand"}`, brandProducts.items)}
            {locationProducts?.items && renderSection(`Near ${product.location || "You"}`, locationProducts.items)}
        </div>
    );
}
