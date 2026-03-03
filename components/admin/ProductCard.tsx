"use client";

import { Package, ExternalLink, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    comparePrice?: number | null;
    images: { url: string }[];
    hasPendingStyle?: boolean;
    isActive?: boolean;
    vendor: {
      id: string;
      businessName?: string;
      user?: { name: string | null; email?: string | null };
    };
    dressStyle?: { id?: string; name: string } | null;
  };
  isPending?: boolean;
}

export default function ProductCard({ product, isPending }: ProductCardProps) {
  const isProductPending = isPending || product.hasPendingStyle;

  return (
    <div
      className={`group rounded-xl border overflow-hidden transition-all hover:shadow-md flex flex-col h-full bg-white relative block ${isProductPending ? "border-amber-200" : "border-gray-100"}`}
    >
      {/* Image Area - Link to Product */}
      <Link
        href={`/admin/products/${product.id}`}
        className="relative aspect-square bg-gray-50 block"
      >
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-8 w-8 text-gray-300" />
          </div>
        )}
        {isProductPending && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            PENDING
          </div>
        )}
      </Link>

      {/* External Link Button - Positioned absolutely relative to the card */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto">
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7 rounded-full bg-white/90"
          asChild
        >
          <Link href={`/productdetails/${product.id}`} target="_blank">
            <ExternalLink className="h-3.5 w-3.5 text-gray-700" />
          </Link>
        </Button>
      </div>

      {/* Content Area */}
      <div className="p-3 flex flex-col flex-1">
        {/* Title and Price - Link to Product */}
        <Link href={`/admin/products/${product.id}`} className="block mb-2">
          <p
            className="font-medium text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-[#E87A3F] transition-colors"
            title={product.name}
          >
            {product.name}
          </p>
          <div className="flex justify-between items-center">
            {/* <p className="text-[#E87A3F] font-bold text-sm">${product.price}</p> */}
            <div className="flex items-center gap-2">
              <p className="text-[#E87A3F] font-bold text-sm">
                ${product.price}
              </p>

              {product.comparePrice != null &&
                product.comparePrice > product.price && (
                  <p className="text-xs text-gray-400 line-through">
                    ${product.comparePrice}
                  </p>
                )}
            </div>
            {product.dressStyle && (
              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full truncate max-w-[80px]">
                {product.dressStyle.name}
              </span>
            )}
          </div>
        </Link>

        <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
          <Link
            href={`/admin/sellers/${product.vendor.id}`}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#E87A3F] font-medium transition-colors relative z-20"
            title="View Seller Profile"
          >
            <Store className="h-3 w-3" />
            <span className="truncate max-w-[120px]">
              {product.vendor?.businessName ||
                product.vendor?.user?.name ||
                "Seller"}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
