"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    image: "/products/handbag-beige.png",
    title: "Premium Leather Bag",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 2,
    image: "/products/handbag-butterfly.png",
    title: "Premium Leather Bag",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 3,
    image: "/products/handbag-cherry.png",
    title: "Premium Leather Bag",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 4,
    image: "/products/handbag-tan-structured.png",
    title: "Premium Leather Bag",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 5,
    image: "/products/handbag-white-luxury.png",
    title: "Premium Leather Bag",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
  {
    id: 6,
    image: "/products/handbag-white-crossbody.png",
    title: "Premium Leather Bag",
    description: "A timeless striped design meets tailored elegance...",
    price: "$199.99",
    originalPrice: "$299.99",
    daysAgo: "4 days ago",
  },
];

export default function ProductGridSection() {
  const scrollRef = useRef(null);

  // Auto scroll for mobile
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const scrollInterval = setInterval(() => {
      if (window.innerWidth < 640) {
        // Only run on mobile (<640px)
        if (
          container.scrollLeft + container.clientWidth >=
          container.scrollWidth
        ) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 200, behavior: "smooth" });
        }
      }
    }, 2500); // every 2.5s

    return () => clearInterval(scrollInterval);
  }, []);

  return (
    <div className="bg-[#f9f9f9] py-2.5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Handbags
          </h2>
          <div className="flex items-center text-gray-700 hover:text-[#e0622c] cursor-pointer transition-colors">
            <span className="text-base sm:text-lg font-medium mr-2">
              View More
            </span>
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>

        {/* Products */}
        <div
          ref={scrollRef}
          className={`
    flex gap-6 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-3
    scrollbar-hide
  `}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="min-w-[80%] sm:min-w-0 bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
            >
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
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs sm:text-sm text-gray-500">
                    {product.daysAgo}
                  </span>
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-[#e0622c] fill-current cursor-pointer" />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg sm:text-2xl font-black text-gray-900">
                    {product.price}
                  </span>
                  <span className="text-sm sm:text-lg text-gray-400 line-through">
                    {product.originalPrice}
                  </span>
                </div>

                <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-2">
                  {product.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  {product.description}
                </p>

                <Button className="w-full bg-[#e0622c] hover:bg-[#c55424] text-white rounded-lg font-semibold text-sm sm:text-base px-6 sm:px-14 py-3 sm:py-4">
                  Add to cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
