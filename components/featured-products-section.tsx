"use client"

import { useState, useEffect, useRef } from "react"
import ProductGridSection from "./product-grid-section"

const categories = ["Formalwear", "Sneakers", "Deals", "Necklaces", "Streetwear"]

export default function FeaturedProductsSection() {
  const [activeCategory, setActiveCategory] = useState("Deals")
  const scrollRef = useRef(null)

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let scrollAmount = 0
    const scrollStep = 1 // pixels per step
    const interval = setInterval(() => {
      if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth) {
        scrollContainer.scrollLeft = 0 // reset when end reached
      } else {
        scrollContainer.scrollLeft += scrollStep
      }
    }, 30) // speed (lower = faster)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#f9f9f9]">
      <div className="py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 leading-7">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl mb-4">
              <span className="text-[#e0622c] font-extrabold">Featured</span>{" "}
              <span className="text-gray-900 font-light italic">Products</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Explore the Hottest Trending Products from Our Most Wanted Collections
            </p>
          </div>

          {/* Category Navigation with Auto Scroll */}
          <div
            ref={scrollRef}
            className="
              flex items-center 
              space-x-4 sm:space-x-6 lg:space-x-12 
              mb-12 py-0 
              flex-nowrap 
              overflow-x-auto scrollbar-hide px-2 sm:px-4 md:px-[50px] lg:px-[130px]
            "
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap font-medium text-base transition-all duration-200 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 ${
                  activeCategory === category
                    ? "bg-[#e0622c] text-white rounded-full shadow-md"
                    : "text-gray-900 hover:text-[#e0622c]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <ProductGridSection />
    </div>
  )
}
