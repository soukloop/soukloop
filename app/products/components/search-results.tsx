"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/use-wishlist";
import { motion, AnimatePresence } from "framer-motion";
import SearchSection from "@/components/search-section";
import { Pagination } from "@/components/ui/pagination";
import ProductCard from "@/components/product-card";
import { CardSkeleton } from "@/components/ui/skeletons";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

import ProductFilters from "./product-filters";

interface SearchResultsProps {
  initialCategories: { id: string, name: string, slug: string }[];
  initialBrands: { id: string, name: string }[];
  initialDressStyles: { id: string, name: string, categoryType: string }[];
  initialOccasions: { id: string, name: string }[];
  initialMaterials: { id: string, name: string }[];
}

export default function SearchResults({
  initialCategories = [],
  initialBrands = [],
  initialDressStyles = [],
  initialOccasions = [],
  initialMaterials = []
}: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryFromURL = searchParams?.get("category") || "all";
  const queryFromURL = searchParams?.get("q") || "";
  const stateFromURL = searchParams?.get("state") || "Select State";

  const itemsPerPage = 10;

  // State management
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Initialize from URL
  const [searchQuery, setSearchQuery] = useState(queryFromURL || "");
  const [brandQuery, setBrandQuery] = useState(searchParams?.get("brand") || "");
  const [condition, setCondition] = useState(searchParams?.get("condition") || "all");
  const [gender, setGender] = useState(searchParams?.get("gender") || "all");
  const [fabric, setFabric] = useState(searchParams?.get("fabric") || "all");
  const [occasion, setOccasion] = useState(searchParams?.get("occasion") || "all");
  const [size, setSize] = useState(searchParams?.get("size") || "all");
  const [onSale, setOnSale] = useState(searchParams?.get("onSale") === "true");
  const [dress, setDress] = useState(searchParams?.get("dress") || "all");
  const [minRating, setMinRating] = useState<string>(searchParams?.get("minRating") || "all");

  // Parse price range from URL
  const initialMinPrice = searchParams?.get("minPrice") ? Number(searchParams.get("minPrice")) : 0;
  const initialMaxPrice = searchParams?.get("maxPrice") ? Number(searchParams.get("maxPrice")) : 1000;
  const [priceRange, setPriceRange] = useState([initialMinPrice, initialMaxPrice]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedState, setSelectedState] = useState(stateFromURL);

  // Debounce values for API calls and URL updates
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const debouncedBrandQuery = useDebounce(brandQuery, 500);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  const debouncedLocation = useDebounce(selectedState, 300);

  // Track initial mount to prevent immediate URL replacement
  const isMounted = useRef(false);

  // Update URL function
  const updateURL = useCallback(() => {
    // Skip on first render to allow hydration
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() || "");

    const setOrDel = (key: string, val: string | number | boolean, defaultVal: any) => {
      if (val !== defaultVal && val !== "" && val !== undefined) {
        params.set(key, String(val));
      } else {
        params.delete(key);
      }
    };

    setOrDel("q", debouncedSearchQuery, "");
    setOrDel("brand", debouncedBrandQuery, "");
    setOrDel("condition", condition, "all");
    setOrDel("gender", gender, "all");
    setOrDel("fabric", fabric, "all");
    setOrDel("occasion", occasion, "all");
    setOrDel("size", size, "all");
    setOrDel("dress", dress, "all");
    setOrDel("minRating", minRating, "all");
    setOrDel("state", selectedState, "Select State");

    if (onSale) params.set("onSale", "true");
    else params.delete("onSale");

    if (debouncedPriceRange[0] !== 0) params.set("minPrice", debouncedPriceRange[0].toString());
    else params.delete("minPrice");

    if (debouncedPriceRange[1] !== 1000) params.set("maxPrice", debouncedPriceRange[1].toString());
    else params.delete("maxPrice");

    if (selectedState === "All US" || selectedState === "Current Location") params.delete("state");

    const currentString = searchParams?.toString();
    const newString = params.toString();

    if (currentString !== newString) {
      params.set("page", "1");
      router.replace(`/products?${params.toString()}`, { scroll: false });
    }
  }, [
    debouncedSearchQuery, debouncedBrandQuery, condition, gender, fabric, occasion,
    size, dress, minRating, onSale, debouncedPriceRange, selectedState,
    router, searchParams
  ]);

  // Sync state to URL
  useEffect(() => {
    updateURL();
  }, [updateURL]);

  // Memoize filters to prevent unstable object references in useProducts
  const productFilters = useMemo(() => ({
    limit: itemsPerPage,
    page: currentPage,
    q: debouncedSearchQuery || undefined,
    category: categoryFromURL !== "all" ? categoryFromURL : undefined,
    location: (selectedState && selectedState !== "Select State") ? selectedState : undefined,
    brandId: debouncedBrandQuery || undefined,
    condition: condition !== "all" ? condition : undefined,
    size: size !== "all" ? size : undefined,
    gender: gender !== "all" ? gender : undefined,
    fabric: fabric !== "all" ? fabric : undefined,
    occasion: occasion !== "all" ? occasion : undefined,
    minPrice: debouncedPriceRange[0],
    maxPrice: debouncedPriceRange[1],
    onSale: onSale === true ? true : undefined,
    dress: dress !== "all" ? dress : undefined,
    minRating: minRating !== "all" ? minRating : undefined
  }), [
    itemsPerPage, currentPage, debouncedSearchQuery, categoryFromURL, selectedState,
    debouncedBrandQuery, condition, size, gender, fabric, occasion,
    debouncedPriceRange, onSale, dress, minRating
  ]);

  // Fetch from backend
  const { data: apiProducts, isLoading, error, mutate } = useProducts({
    params: productFilters
  });

  const backendProducts = apiProducts?.items || [];
  const totalPages = apiProducts?.totalPages || 1;
  const paginatedProducts = backendProducts;

  // Handle Category Change
  const handleCategoryChange = (newCategory: string) => {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newCategory) {
      params.set("category", newCategory);
    } else {
      params.delete("category");
    }
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  const { addItem } = useCart();
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const handleAddToCart = async (product: any) => {
    setAnimatingId(product.id);
    setTimeout(async () => {
      await addItem(product.id, 1);
      setAnimatingId(null);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    }, 1200);
  };

  const { isWithlisted, toggleWishlist } = useWishlist();

  const filterProps = {
    categoryFromURL,
    occasion, setOccasion,
    gender, setGender,
    condition, setCondition,
    size, setSize,
    fabric, setFabric,
    brandQuery, setBrandQuery,
    priceRange, setPriceRange,
    onSale, setOnSale,
    dress, setDress,
    minRating, setMinRating,
    categories: initialCategories,
    brands: initialBrands,
    allDressStyles: initialDressStyles,
    initialOccasions,
    initialMaterials
  };

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🔍 Search Bar Section */}
      <SearchSection
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedState={selectedState}
        onStateChange={handleStateChange}
        onCategoryChange={handleCategoryChange}
        onSearch={() => { }}
        dressStyles={initialDressStyles}
      />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="inline-flex size-10 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-700 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl capitalize">
            {categoryFromURL} products
          </h1>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="hidden w-64 shrink-0 lg:block">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <button
                  className="text-sm font-medium text-[#E87A3F] hover:underline"
                  onClick={() => {
                    setSearchQuery("");
                    setBrandQuery("");
                    setCondition("all");
                    setGender("all");
                    setFabric("all");
                    setOccasion("all");
                    setSize("all");
                    setOnSale(false);
                    setDress("all");
                    setMinRating("all");
                    setPriceRange([0, 1000]);
                    setSelectedState("Select State");
                  }}
                >
                  Clear all
                </button>
              </div>
              <ProductFilters {...filterProps} />
            </div>
          </div>

          {/* Mobile Filters Drawer */}
          {filtersOpen && (
            <>
              <div
                className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                onClick={() => setFiltersOpen(false)}
              />
              <div className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white p-5 lg:hidden">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h2>
                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-gray-200"
                  >
                    <X className="size-5" />
                  </button>
                </div>
                <ProductFilters {...filterProps} />
              </div>
            </>
          )}

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading && (
              <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-3 col-span-full">
                {[...Array(6)].map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            )}

            {error && !isLoading && (
              <div className="col-span-full flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <AlertCircle className="size-10 text-red-500" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      Failed to load products
                    </p>
                    <p className="text-sm text-gray-600">
                      {error.message || "Please try again later"}
                    </p>
                  </div>
                  <Button
                    onClick={() => mutate()}
                    className="bg-[#E87A3F] hover:bg-[#d96d34]"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {!isLoading && !error && paginatedProducts.length === 0 && (
              <div className="col-span-full flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-center">
                  <Search className="size-10 text-gray-400" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      No products found
                    </p>
                    <p className="text-sm text-gray-600">
                      Try adjusting your filters
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Product Cards */}
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {!isLoading &&
                !error &&
                paginatedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    product={{
                      id: product.id,
                      image: product.image || product.images?.[0]?.url || "/white-quilted-butterfly-bag.png",
                      images: product.images,
                      title: product.title || product.name || "Product",
                      price: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(product.priceCents ? product.priceCents / 100 : product.price),
                      originalPrice: product.originalPrice ? `$${product.originalPrice}` : "",
                      isWishlist: isWithlisted(product.id),
                      vendorId: product.vendorId,
                      vendorUserId: product.vendor?.userId,
                      category: product.category,
                      size: product.size,
                      createdAt: product.createdAt,
                      hasPendingStyle: product.hasPendingStyle,
                      isActive: product.isActive,
                      status: product.status,
                    }}
                    animatingId={animatingId}
                    handleAddToCart={() => handleAddToCart(product)}
                    toggleWishlist={() => toggleWishlist(product.id)}
                  />
                ))}
            </div>

            {/* Pagination */}
            {paginatedProducts.length > 0 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
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
    </div>
  );
}

