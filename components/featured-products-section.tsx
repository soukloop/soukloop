"use client"

import ProductGridSection from "./product-grid-section"
import { FeaturedProduct } from "@/features/products/queries"

interface FeaturedProductsSectionProps {
  initialProducts?: FeaturedProduct[];
}

export default function FeaturedProductsSection({ initialProducts }: FeaturedProductsSectionProps) {
  return (
    <div className="bg-[#f9f9f9] py-12">
      <div className="container mx-auto px-4 leading-7 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl sm:text-4xl lg:text-5xl">
            <span className="font-extrabold text-[#e0622c]">Featured</span>{" "}
            <span className="font-light italic text-gray-900">Products</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xs sm:text-sm md:text-base text-gray-600">
            Explore the Hottest Trending Products from Our Most Wanted Collections
          </p>
        </div>
      </div>

      {/* Product Grid - Showing all featured products */}
      <ProductGridSection title="Featured Products" products={initialProducts} />
    </div>
  )
}
