"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "@/hooks/use-wishlist";
import WishlistButton from "@/components/ui/wishlist-button";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  createdAt: Date;
}

interface ProductGridProps {
  activeTab: "all" | "sold";
  products: Product[];
}

export default function ProductGrid({ activeTab, products }: ProductGridProps) {
  const { addItem } = useCart();
  const { isWithlisted, toggleWishlist } = useWishlist();

  const [currentPage, setCurrentPage] = useState(1);
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProducts = products.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // 🛒 Add to cart animation + toast
  const handleAddToCart = (product: any) => {
    if (activeTab === "sold") return;

    // ✅ Add product to cart context (syncs to header popup)
    addItem(product.id.toString(), 1, {
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      images: [{ url: product.image }],
    });

    // ✅ Animation + Toast feedback
    setAnimatingId(product.id);
    setTimeout(() => {
      setAnimatingId(null);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }, 1200);
  };

  return (
    <section className="relative bg-white py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product grid */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="group overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="mb-2 text-sm text-gray-500">4 days ago</p>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-gray-900">
                      ${product.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${product.originalPrice}
                    </span>
                  </div>
                  <WishlistButton
                    isWishlisted={isWithlisted(product.id)}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className="hover:scale-110"
                  />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  {product.name}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {product.description}
                </p>

                {/* ✅ Animated Add to Cart Button */}
                <div className="relative">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      activeTab === "sold" || animatingId === product.id
                    }
                    className={`relative overflow-hidden flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white transition-colors ${activeTab === "sold"
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-[#e0622c] hover:bg-[#c55424]"
                      }`}
                  >
                    {animatingId === product.id
                      ? "Adding..."
                      : activeTab === "sold"
                        ? "Sold Out"
                        : "Add to cart"}
                    <ShoppingCart className="size-5" />

                    {/* ✨ Shimmer animation */}
                    {animatingId === product.id && (
                      <motion.div
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        className="absolute inset-0 bg-white/50"
                      />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row sm:gap-0">
          {/* Previous */}
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex w-full items-center space-x-2 rounded-lg border-gray-300 px-4 py-2 sm:w-auto ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <span>← Previous</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2 overflow-x-auto py-2">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  onClick={() => handlePageChange(page)}
                  className={`size-10 rounded-lg ${page === currentPage
                    ? "bg-[#e0622c] text-white"
                    : "border-gray-300 bg-transparent"
                    }`}
                >
                  {page}
                </Button>
              );
            })}
          </div>

          {/* Next */}
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex w-full items-center space-x-2 rounded-lg border-gray-300 px-4 py-2 sm:w-auto ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            <span>Next →</span>
          </Button>
        </div>
      </div>

      {/* ✅ Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 right-6 z-50 rounded-lg bg-[#101010] text-white px-5 py-3 shadow-lg"
          >
            ✅ Product added successfully
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
