"use client";

import Link from "next/link";

export default function ShopByPriceSection() {
  const priceRanges = [
    { label: "Under", price: "$10", maxPrice: 10 },
    { label: "Under", price: "$20", maxPrice: 20 },
    { label: "Under", price: "$30", maxPrice: 30 },
  ];

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="mx-auto h-[36px] w-[224px] text-3xl font-bold text-gray-900">
            Shop by price
          </h2>
        </div>

        {/* Price Range Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-6">
          {priceRanges.map((range, index) => (
            <Link
              key={index}
              href={`/products?maxPrice=${range.maxPrice}`}
              className="group flex h-[180px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl bg-gray-200 transition-all hover:bg-[#e0622c] hover:shadow-md"
            >
              <div className="text-center text-3xl text-gray-900 group-hover:text-white">
                <span className="font-normal hidden sm:inline">{range.label} </span>
                <span className="font-bold">{range.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
