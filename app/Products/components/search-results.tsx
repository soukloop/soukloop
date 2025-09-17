"use client"

import { useState } from "react"
import { ChevronDown, Search, Heart, ChevronLeft, ChevronRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"

export default function SearchResults() {
  const [filtersOpen, setFiltersOpen] = useState(false)

  const products = [
    {
      id: 1,
      image: "/white-quilted-butterfly-bag.png",
      price: "$199.99",
      originalPrice: "$249.99",
      title: "Premium Leather Bag",
      description: "A timeless striped design meets tailored elegance...",
    },
    {
      id: 2,
      image: "/beige-pleated-bag.png",
      price: "$199.99",
      originalPrice: "$249.99",
      title: "Premium Leather Bag",
      description: "A timeless striped design meets tailored elegance...",
    },
    {
      id: 3,
      image: "/white-cherry-pattern-bag.png",
      price: "$199.99",
      originalPrice: "$249.99",
      title: "Premium Leather Bag",
      description: "A timeless striped design meets tailored elegance...",
    },
    {
      id: 4,
      image: "/tan-structured-bag.png",
      price: "$199.99",
      originalPrice: "$249.99",
      title: "Premium Leather Bag",
      description: "A timeless striped design meets tailored elegance...",
    },
    {
      id: 5,
      image: "/white-crossbody-bag.png",
      price: "$199.99",
      originalPrice: "$249.99",
      title: "Premium Leather Bag",
      description: "A timeless striped design meets tailored elegance...",
    },
    {
      id: 6,
      image: "/white-geometric-bag.png",
      price: "$199.99",
      originalPrice: "$249.99",
      title: "Premium Leather Bag",
      description: "A timeless striped design meets tailored elegance...",
    },
  ]

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Bar Section */}
      <div className="bg-gray-50 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-center">
            <div className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-3 w-full max-w-md lg:max-w-lg h-12 sm:h-14 lg:h-16 rounded-full">
              <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full bg-gray-400"></div>
              </div>
              <span className="text-gray-700 text-sm sm:text-base truncate">Select Country</span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 ml-auto flex-shrink-0" />
            </div>
            <div className="relative w-full max-w-md lg:max-w-lg">
              <Input
                type="text"
                placeholder="Find cars, fashion, Grocery and more..."
                className="w-full h-12 sm:h-14 lg:h-16 pl-4 pr-12 rounded-full border border-gray-300 focus:border-[#E87A3F] focus:ring-1 focus:ring-[#E87A3F] text-sm sm:text-base"
                defaultValue="handbags"
              />
            </div>
            <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white font-medium w-full max-w-xs sm:max-w-sm lg:w-48 h-12 sm:h-14 lg:h-16 rounded-full text-sm sm:text-base">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title + Mobile Filter Button */}
        <div className="mb-8 flex items-center gap-3">
          {/* Mobile/Tablet: menu button on the LEFT side to open filters */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 bg-white text-gray-700"
            aria-label="Open filters"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Search results for "handbags"
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar — keep desktop exactly the same */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* Filters Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button className="text-[#E87A3F] text-sm font-medium hover:underline">Clear all</button>
              </div>

              <div className="text-sm text-gray-600 mb-6">Showing 0 of 100</div>

              {/* Category Filter */}
              <div className="mb-8">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="radio" id="all" name="category" className="mr-3" defaultChecked />
                    <label htmlFor="all" className="text-gray-700">
                      All
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="formalwear" name="category" className="mr-3" />
                    <label htmlFor="formalwear" className="text-gray-700">
                      Formalwear
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="handbags" name="category" className="mr-3" />
                    <label htmlFor="handbags" className="text-[#E87A3F] font-medium">
                      Handbags
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="sneakers" name="category" className="mr-3" />
                    <label htmlFor="sneakers" className="text-gray-700">
                      Sneakers
                    </label>
                  </div>
                </div>
              </div>

              {/* Brand Filter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Brand</h3>
                  <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Brand name"
                    className="pl-10 h-10 border-gray-300 focus:ring-[#E87A3F] focus:border-[#E87A3F]"
                  />
                </div>
                <div className="mt-3 bg-gray-100 px-3 py-2 rounded-md inline-block">
                  <span className="text-sm text-gray-700">Brand name</span>
                  <button className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                </div>
              </div>

              {/* Condition Filter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Condition</h3>
                  <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input type="radio" id="brand-new" name="condition" className="mr-3" defaultChecked />
                    <label htmlFor="brand-new" className="text-gray-700">
                      Brand New
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="like-new" name="condition" className="mr-3" />
                    <label htmlFor="like-new" className="text-gray-700">
                      Like new
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="used-excellent" name="condition" className="mr-3" />
                    <label htmlFor="used-excellent" className="text-gray-700">
                      Used - Excellent
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="used-good" name="condition" className="mr-3" />
                    <label htmlFor="used-good" className="text-gray-700">
                      Used - Good
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input type="radio" id="used-fair" name="condition" className="mr-3" />
                    <label htmlFor="used-fair" className="text-gray-700">
                      Used - Fair
                    </label>
                  </div>
                </div>
              </div>

              {/* Size Filter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Size</h3>
                  <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="bg-[#E87A3F] text-white px-3 py-1 rounded-md text-sm font-medium">Small</button>
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                    Medium
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                    Large
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                    XL
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                    XXL
                  </button>
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Price</h3>
                  <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                </div>
                <div className="mb-4">
                  <Slider defaultValue={[0]} max={1000} step={10} className="w-full" />
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>$0</span>
                  <span>$1000</span>
                </div>
              </div>

              {/* On Sale Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 font-medium">On sale</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only" />
                    <div className="w-11 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                    <div className="absolute w-4 h-4 bg-white rounded-full shadow left-1 top-1 transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Filters Drawer */}
          {filtersOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white z-50 p-5 overflow-y-auto lg:hidden">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-md border border-gray-200"
                    aria-label="Close filters"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-sm text-gray-600 mb-6">Showing 0 of 100</div>

                {/* Category Filter */}
                <div className="mb-8">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="radio" id="m-all" name="m-category" className="mr-3" defaultChecked />
                      <label htmlFor="m-all" className="text-gray-700">
                        All
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-formalwear" name="m-category" className="mr-3" />
                      <label htmlFor="m-formalwear" className="text-gray-700">
                        Formalwear
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-handbags" name="m-category" className="mr-3" />
                      <label htmlFor="m-handbags" className="text-[#E87A3F] font-medium">
                        Handbags
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-sneakers" name="m-category" className="mr-3" />
                      <label htmlFor="m-sneakers" className="text-gray-700">
                        Sneakers
                      </label>
                    </div>
                  </div>
                </div>

                {/* Brand Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Brand</h3>
                    <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Brand name"
                      className="pl-10 h-10 border-gray-300 focus:ring-[#E87A3F] focus:border-[#E87A3F]"
                    />
                  </div>
                  <div className="mt-3 bg-gray-100 px-3 py-2 rounded-md inline-block">
                    <span className="text-sm text-gray-700">Brand name</span>
                    <button className="ml-2 text-gray-500 hover:text-gray-700">×</button>
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Condition</h3>
                    <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <input type="radio" id="m-brand-new" name="m-condition" className="mr-3" defaultChecked />
                      <label htmlFor="m-brand-new" className="text-gray-700">
                        Brand New
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-like-new" name="m-condition" className="mr-3" />
                      <label htmlFor="m-like-new" className="text-gray-700">
                        Like new
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-used-excellent" name="m-condition" className="mr-3" />
                      <label htmlFor="m-used-excellent" className="text-gray-700">
                        Used - Excellent
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-used-good" name="m-condition" className="mr-3" />
                      <label htmlFor="m-used-good" className="text-gray-700">
                        Used - Good
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input type="radio" id="m-used-fair" name="m-condition" className="mr-3" />
                      <label htmlFor="m-used-fair" className="text-gray-700">
                        Used - Fair
                      </label>
                    </div>
                  </div>
                </div>

                {/* Size Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Size</h3>
                    <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="bg-[#E87A3F] text-white px-3 py-1 rounded-md text-sm font-medium">Small</button>
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                      Medium
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                      Large
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                      XL
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-3 py-1 rounded-md text-sm hover:border-[#E87A3F]">
                      XXL
                    </button>
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Price</h3>
                    <button className="text-[#E87A3F] text-sm hover:underline">Clear</button>
                  </div>
                  <div className="mb-4">
                    <Slider defaultValue={[0]} max={1000} step={10} className="w-full" />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>$0</span>
                    <span>$1000</span>
                  </div>
                </div>

                {/* On Sale Toggle */}
                <div className="mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">On sale</span>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" />
                      <div className="w-11 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                      <div className="absolute w-4 h-4 bg-white rounded-full shadow left-1 top-1 transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort By */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex items-center gap-2">
                <span className="text-gray-700">Sort by</span>
                <div className="flex items-center gap-1 cursor-pointer">
                  <span className="text-gray-900 font-medium">Brand name</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-64 object-cover"
                    />
                    <button className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50">
                      <Heart className="h-5 w-5 text-[#E87A3F] fill-current" />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl font-bold text-gray-900">{product.price}</span>
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{product.description}</p>
                    <Button className="w-full bg-[#E87A3F] hover:bg-[#d96d34] text-white font-medium py-2 rounded-lg">
                      Add to cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-4">
              <div className="flex items-center space-x-2 order-2 sm:order-1">
                <ChevronLeft className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600 text-sm sm:text-base">Previous</span>
              </div>

              <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
                <Button className="bg-[#E87A3F] text-white h-8 w-8 sm:h-10 sm:w-10 rounded text-sm">1</Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 sm:h-10 sm:w-10 border-gray-300 hover:border-[#E87A3F] hover:text-[#E87A3F] bg-transparent text-sm"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 sm:h-10 sm:w-10 border-gray-300 hover:border-[#E87A3F] hover:text-[#E87A3F] bg-transparent text-sm"
                >
                  3
                </Button>
                <span className="px-1 sm:px-2 text-gray-500 text-sm">...</span>
                <Button
                  variant="outline"
                  className="h-8 w-8 sm:h-10 sm:w-10 border-gray-300 hover:border-[#E87A3F] hover:text-[#E87A3F] bg-transparent text-sm"
                >
                  67
                </Button>
                <Button
                  variant="outline"
                  className="h-8 w-8 sm:h-10 sm:w-10 border-gray-300 hover:border-[#E87A3F] hover:text-[#E87A3F] bg-transparent text-sm"
                >
                  68
                </Button>
              </div>

              <div className="flex items-center space-x-2 order-3">
                <span className="text-gray-600 text-sm sm:text-base">Next</span>
                <ChevronRight className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
