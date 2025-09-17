"use client"
import { useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowRight, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"

const bestSellerProducts = [
  {
    id: 1,
    image: "/products/dress-pink-formal.png",
    title: "Formal Striped Dress",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 2,
    image: "/products/dress-white-backless.png",
    title: "Formal Striped Dress",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 3,
    image: "/products/top-pink-ribbed.png",
    title: "Formal Striped Dress",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
]

export default function BestSellersSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll only for mobile
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let scrollAmount = 0
    const scrollStep = 1 // pixels per tick
    const interval = setInterval(() => {
      if (window.innerWidth < 640) { // mobile only
        scrollAmount += scrollStep
        if (scrollAmount >= container.scrollWidth - container.clientWidth) {
          scrollAmount = 0 // reset to start
        }
        container.scrollTo({ left: scrollAmount, behavior: "smooth" })
      }
    }, 40) // speed

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#f9f9f9] py-10 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl mb-4 leading-snug">
            <span className="text-gray-900 italic font-normal">Our</span>{" "}
            <span className="text-[#e0622c] font-extrabold">Best Sellers</span>
          </h2>
          <p className="text-base sm:text-lg max-w-3xl mx-auto text-black">
            Browse Best Sellers From Our Most Wanted Collections
          </p>
        </div>

        {/* Best Sellers Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-8">
          <h3 className="text-2xl sm:text-3xl text-gray-900 font-black">Best Seller</h3>
          <div className="flex items-center text-gray-700 hover:text-[#e0622c] cursor-pointer transition-colors">
            <span className="text-base sm:text-lg font-medium mr-2">View More</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {/* Products */}
        {/* Mobile → horizontal scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide sm:hidden"
        >
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Desktop → grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bestSellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Reusable card
function ProductCard({ product }: { product: any }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow min-w-[280px] sm:min-w-0">
      {/* Product Image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden mb-4">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="px-1 sm:px-2">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs sm:text-sm text-gray-500">{product.daysAgo}</span>
          <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-[#e0622c] fill-current cursor-pointer" />
        </div>

        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-xl sm:text-2xl font-black text-gray-900">{product.price}</span>
          <span className="text-sm sm:text-lg text-gray-400 line-through">
            {product.originalPrice}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{product.title}</h3>
        <p className="text-sm sm:text-base text-gray-600 mb-6">{product.description}</p>

        <Button className="w-full bg-[#e0622c] hover:bg-[#c55424] text-white rounded-lg font-semibold text-sm sm:text-base py-3 sm:py-4">
          Add to cart
        </Button>
      </div>
    </div>
  )
}
