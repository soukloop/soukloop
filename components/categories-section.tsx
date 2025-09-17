"use client"
import { useEffect, useRef } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const categories = [
  { name: "Formalwear", image: "/categories/formalwear.png" },
  { name: "Handbags", image: "/categories/handbags.png" },
  { name: "Sneakers", image: "/categories/sneakers.png" },
  { name: "Necklaces", image: "/categories/necklaces.png" },
  { name: "Knitwear", image: "/categories/knitwear.png" },
  { name: "Earrings", image: "/categories/earrings.png" },
]

export default function CategoriesSection() {
  const scrollRef = useRef(null)

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    let scrollAmount = 0
    const scrollStep = 1 // speed of scrolling
    const delay = 20 // smoothness (ms)

    const autoScroll = setInterval(() => {
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
        container.scrollLeft = 0 // reset to start
      } else {
        container.scrollLeft += scrollStep
      }
    }, delay)

    return () => clearInterval(autoScroll)
  }, [])

  return (
    <div className="bg-[#fdf7f4] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h2>
          <div className="flex items-center text-gray-700 hover:text-[#E87A3F] cursor-pointer transition-colors">
            <span className="text-base sm:text-lg font-medium mr-2">View More</span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {/* Mobile Auto-Scrolling */}
        <div
          ref={scrollRef}
          className="sm:hidden flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }} // hide scrollbar (Firefox + IE)
        >
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-40 flex flex-col items-center group cursor-pointer bg-white rounded-2xl"
            >
              <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-3 border-white border-solid border-[6px]">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm font-medium text-gray-900 text-center">
                {category.name}
              </h3>
            </div>
          ))}
        </div>

        {/* Grid for larger screens */}
        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="flex flex-col items-center group cursor-pointer bg-white rounded-2xl"
            >
              <div className="w-full aspect-square bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-3 border-white border-solid border-[6px] sm:border-[10px]">
                <Image
                  src={category.image || "/placeholder.svg"}
                  alt={category.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-900 text-center">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar (Chrome, Safari, Edge) */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
