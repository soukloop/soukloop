"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../app/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./product-card";
import { useWishlist } from "@/hooks/use-wishlist";

interface APIProduct {
  id: string;
  name: string;
  description: string | null;
  price: number;
  comparePrice: number | null;
  images: { url: string }[];
  createdAt: string;
  quantity: number;
  isActive: boolean;
  status?: string;
  category?: string;
  size?: string;
  vendorId?: string;
  hasPendingStyle?: boolean;
}

// Map to ProductCard's Product interface
interface DisplayProduct {
  id: string;
  image: string;
  images: { url: string }[];
  title: string;
  description: string;
  price: string;
  originalPrice: string;
  isWishlist: boolean;
  slug?: string;
  createdAt: string;
  quantity: number;
  isActive: boolean;
  status?: string;
  category?: string;
  size?: string;
  vendorId?: string;
  vendorUserId?: string; // Added for ownership check
  hasPendingStyle?: boolean;
}

import { useSession } from "next-auth/react";

export default function BestSellersSection() {
  const { data: session, status } = useSession();
  const { addItem } = useCart();
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products and favorites
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        // Fetch products sorted by price DESC (most expensive = premium bestsellers)
        const [productsRes, favoritesRes] = await Promise.all([
          // Add params to get necessary fields if they aren't returned by default
          // Assuming /api/products returns full object as per route.ts
          fetch("/api/products?limit=9&sortBy=price&sortOrder=desc"),
          status === "authenticated" ? fetch("/api/favorites") : Promise.resolve(null)
        ]);

        let favoriteIds = new Set<string>();
        if (favoritesRes && favoritesRes.ok) {
          const favData = await favoritesRes.json();
          if (Array.isArray(favData)) {
            favData.forEach((f: any) => favoriteIds.add(f.product.id));
          }
        }

        if (productsRes.ok) {
          const result = await productsRes.json();
          const data = Array.isArray(result) ? result : (result.items || []);

          const formatted: DisplayProduct[] = data.map((p: APIProduct) => ({
            id: p.id,
            image: p.images?.[0]?.url || "/images/placeholder.png",
            images: p.images || [],
            title: p.name,
            description: p.description || "Premium quality product",
            price: `$${p.price.toFixed(2)}`,
            originalPrice: p.comparePrice ? `$${p.comparePrice.toFixed(2)}` : "",
            isWishlist: favoriteIds.has(p.id),
            slug: (p as any).slug,
            createdAt: p.createdAt,
            quantity: p.quantity,
            isActive: p.isActive,
            status: p.status,
            category: p.category,
            size: p.size,
            vendorId: p.vendorId,
            vendorUserId: (p as any).vendor?.userId, // Pass vendor's owner ID
            isActive: p.isActive,
            status: p.status,
          }));
          setProducts(formatted);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [status]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : products.length - 3));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < products.length - 3 ? prev + 1 : 0));
  };

  const handleAddToCart = (product: any) => {
    setAnimatingId(product.id);
    addItem(product.id, 1, {
      id: product.id,
      name: product.title,
      price: parseFloat(product.price.replace("$", "")),
      images: [{ url: product.image }],
    });
    setToast(true);
    setTimeout(() => {
      setAnimatingId(null);
      setToast(false);
    }, 1200);
  };

  /* REMOVED MANUAL TOGGLE LOGIC - Using useWishlist hook downstream/via prop if needed, 
     but actually this component passes toggleWishlist to ProductCard. 
     We need to use the hook here to pass it down OR rely on ProductCard to use it?
     
     Wait, ProductCard DOES NOT use the hook internally yet (we decided to keep it dumb).
     So we MUST use the hook here and pass it down.
  */

  const { isWithlisted, toggleWishlist } = useWishlist();

  // Update products state is NO LONGER needed for wishlist status if we use the hook to derive it during render.
  // BUT `products` state here also holds the product data.
  // We should map `isWishlist` from the hook when rendering.

  const visibleProducts = products.slice(currentIndex, currentIndex + 3);

  if (isLoading) {
    return (
      <section className="bg-white pb-16 pt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl">
              <span className="font-extrabold text-[#e0622c]">Best</span>{" "}
              <span className="font-light italic text-gray-900">Sellers</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-200 aspect-[3/4]"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white pb-16 pt-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl sm:text-4xl lg:text-5xl">
            <span className="font-extrabold text-[#e0622c]">Best</span>{" "}
            <span className="font-light italic text-gray-900">Sellers</span>
          </h2>
          <p className="mx-auto max-w-3xl text-xs sm:text-sm md:text-base text-gray-600">
            Discover Our Most Popular Products Loved by Customers
          </p>
        </div>

        {/* Products Slider */}
        <div className="relative">
          {/* Navigation Arrows */}
          {products.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md hover:bg-gray-50"
                onClick={handlePrev}
              >
                <ChevronLeft className="size-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 z-10 translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md hover:bg-gray-50"
                onClick={handleNext}
              >
                <ChevronRight className="size-5" />
              </Button>
            </>
          )}

          {/* Product Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={{
                  ...product,
                  isWishlist: isWithlisted(product.id)
                }}
                animatingId={animatingId}
                handleAddToCart={handleAddToCart}
                toggleWishlist={() => toggleWishlist(product.id)}
                compact={false}
              />
            ))}
          </div>
        </div>

        {/* View All */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-full border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
          >
            View All Best Sellers
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#e0622c] px-6 py-3 text-white shadow-lg"
          >
            Added to cart!
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
