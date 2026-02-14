"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Image mapping based on category slug
const CATEGORY_IMAGES: Record<string, string> = {
  mens: "/categories_images/men's_Style.png",
  men: "/categories_images/men's_Style.png",
  womens: "/categories_images/women's_Style.png",
  women: "/categories_images/women's_Style.png",
  casual: "/categories_images/casual_wear.png",
  kids: "/categories_images/kids_style.png",
  bridal: "/categories_images/bridal_styles.png",
  event: "/categories_images/event_styles.png",
};

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesSectionProps {
  initialCategories?: CategoryData[];
}

export default function CategoriesSection({ initialCategories = [] }: CategoriesSectionProps) {
  const [categories, setCategories] = useState<CategoryData[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(initialCategories.length === 0);

  useEffect(() => {
    if (initialCategories.length > 0) return;

    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCategories();
  }, [initialCategories.length]);

  // Triple for infinite loop
  const duplicatedCategories = [...categories, ...categories, ...categories];

  if (isLoading) {
    return (
      <div className="bg-[#fdf7f4] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-row items-center justify-between gap-4">
            <div className="h-8 w-40 bg-gray-200 animate-pulse rounded-lg" />
            <div className="h-6 w-24 bg-gray-200 animate-pulse rounded-lg" />
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-white rounded-2xl animate-pulse p-2 shadow-sm border-[6px] border-white">
                <div className="w-full h-full bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Fallback if no categories in DB to avoid empty section
  if (categories.length === 0) return null;

  return (
    <div className="bg-[#fdf7f4] py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-row items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Categories
          </h2>
          <Link
            href="/products"
            className="flex cursor-pointer items-center text-gray-700 transition-colors hover:text-[#E87A3F]"
          >
            <span className="mr-2 text-base font-medium sm:text-lg">
              View More
            </span>
            <ArrowRight className="size-5" />
          </Link>
        </div>

        {/* Mobile Infinite Auto-Scrolling */}
        <div className="relative overflow-hidden sm:hidden">
          <div className="animate-slide inline-flex gap-4">
            {duplicatedCategories.map((category, index) => {
              const imagePath = CATEGORY_IMAGES[category.slug.toLowerCase()] || "/placeholder.svg";
              return (
                <Link
                  key={`${category.id}-${index}`}
                  href={`/products?category=${category.slug}`}
                  className="group flex w-40 shrink-0 cursor-pointer flex-col items-center rounded-2xl bg-white pb-3"
                  aria-hidden={index >= categories.length ? "true" : undefined}
                >
                  <div className="mb-3 aspect-square w-full overflow-hidden rounded-2xl border-[6px] border-solid border-white bg-white shadow-sm transition-shadow hover:shadow-md">
                    <Image
                      src={imagePath}
                      alt={category.name}
                      width={200}
                      height={200}
                      className={`size-full object-cover transition-transform duration-300 group-hover:scale-105 ${category.slug.toLowerCase().includes('men')
                        ? "object-[center_25%]"
                        : "object-top"
                        }`}
                    />
                  </div>
                  <h3 className="text-center text-sm font-medium text-gray-900">
                    {category.name}
                  </h3>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Grid for larger screens */}
        <div className="hidden grid-cols-2 gap-4 sm:grid sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((category, index) => {
            const imagePath = CATEGORY_IMAGES[category.slug.toLowerCase()] || "/placeholder.svg";
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="group flex cursor-pointer flex-col items-center rounded-2xl bg-white hover:bg-[#e0622c] pb-3"
              >
                <div className="mb-3 aspect-square w-full overflow-hidden rounded-2xl border-[6px] border-solid border-white bg-white shadow-sm transition-shadow hover:shadow-md sm:border-[10px] group-hover:bg-[#e0622c] group-hover:border-[#e0622c]">
                  <Image
                    src={imagePath}
                    alt={category.name}
                    width={200}
                    height={200}
                    className={`size-full object-cover transition-transform duration-300 group-hover:scale-105 ${category.slug.toLowerCase().includes('men')
                      ? "object-[center_25%]"
                      : "object-top"
                      }`}
                  />
                </div>
                <h3 className="text-center text-sm font-medium text-gray-900 sm:text-base md:text-lg group-hover:text-white">
                  {category.name}
                </h3>
              </Link>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(-100% / 3), 0, 0); }
        }
        .animate-slide {
          animation: slide 15s linear infinite;
          will-change: transform;
        }
        .animate-slide:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
