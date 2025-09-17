"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductFiltersProps {
  activeTab: "all" | "sold"
  onTabChange: (tab: "all" | "sold") => void
}

export default function ProductFilters({ activeTab, onTabChange }: ProductFiltersProps) {
  return (
    <section className="bg-white py-6 border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex relative w-full">
            {/* Full underline spanning entire width */}
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-200"></div>

            <button
              onClick={() => onTabChange("all")}
              className={`font-semibold pb-2 px-4 relative ${
                activeTab === "all" ? "text-[#e0622c]" : "text-gray-600 hover:text-[#e0622c]"
              }`}
            >
              All Products
              {/* Active orange underline - only show when All Products is active */}
              {activeTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e0622c]"></div>}
            </button>
            <button
              onClick={() => onTabChange("sold")}
              className={`font-semibold pb-2 px-4 relative ${
                activeTab === "sold" ? "text-[#e0622c]" : "text-gray-600 hover:text-[#e0622c]"
              }`}
            >
              Sold
              {/* Active orange underline - only show when Sold is active */}
              {activeTab === "sold" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#e0622c]"></div>}
            </button>
          </div>
        </div>

        <div className="flex flex-row gap-1 mr-6 md:flex-row md:space-x-4">
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-gray-100 border-gray-100 hover:bg-gray-200 text-gray-700 w-full md:w-[240px]"
            style={{ height: "44px", borderRadius: "50px" }}
          >
            <span>Category</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-gray-100 border-gray-100 hover:bg-gray-200 text-gray-700 w-full md:w-[240px]"
            style={{ height: "44px", borderRadius: "50px" }}
          >
            <span>Price</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-gray-100 border-gray-100 hover:bg-gray-200 text-gray-700 w-full md:w-[240px]"
            style={{ height: "44px", borderRadius: "50px" }}
          >
            <span>Size</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          {/* <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-gray-100 border-gray-100 hover:bg-gray-200 text-gray-700 w-full md:w-[240px]"
            style={{ height: "44px", borderRadius: "50px" }}
          >
            <span>Brand</span>
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2 bg-gray-100 border-gray-100 hover:bg-gray-200 text-gray-700 w-full md:w-[240px]"
            style={{ height: "44px", borderRadius: "50px" }}
          >
            <span>Condition</span>
            <ChevronDown className="w-4 h-4" />
          </Button> */}
        </div>
      </div>
    </section>
  )
}