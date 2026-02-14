"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/hooks/useCart";
import { ArrowRight } from "lucide-react";
import ProductCard from "./product-card";
import { toast } from "sonner";
import { CardSkeleton } from "@/components/ui/skeletons";
import { useSession } from "next-auth/react";

interface ProductGridSectionProps {
  title?: string;
  category?: string;
  products?: any[]; // Accept pre-fetched products
}

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
  slug?: string;
  vendor?: {
    userId: string;
  }
}

interface DisplayProduct {
  id: string;
  image: string;
  images?: { url: string }[];
  title: string;
  description?: string;
  price: string;
  originalPrice?: string;
  daysAgo?: string;
  isWishlist: boolean;
  createdAt?: string;
  quantity?: number;
  isActive?: boolean;
  status?: string;
  category?: string;
  size?: string;
  vendorId?: string;
  vendorUserId?: string;
  hasPendingStyle?: boolean;
}

function formatDaysAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default function ProductGridSection({ title = "Featured Products", category, products: initialProducts }: ProductGridSectionProps) {
  const { data: session, status } = useSession();
  const { addItem } = useCart();
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // Transform initial products to DisplayProduct format if provided
  const transformedInitialProducts = initialProducts ? initialProducts.map((p: any) => ({
    id: p.id,
    image: p.images?.[0]?.url || "/images/placeholder.png",
    images: p.images || [],
    title: p.name,
    description: p.description || "Premium quality product",
    price: `$${p.price.toFixed(2)}`,
    originalPrice: p.comparePrice ? `$${p.comparePrice.toFixed(2)}` : "",
    daysAgo: formatDaysAgo(p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt),
    isWishlist: false, // Will be updated by client-side fetch if logged in
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    quantity: p.quantity,
    isActive: p.isActive,
    status: p.status,
    category: p.category,
    size: p.size,
    vendorId: p.vendorId,
    vendorUserId: p.vendor?.userId,
    hasPendingStyle: p.hasPendingStyle,
  })) : [];

  const [products, setProducts] = useState<DisplayProduct[]>(transformedInitialProducts);
  const [isLoading, setIsLoading] = useState(!initialProducts);

  useEffect(() => {
    // If we have initial products and no category filter change, satisfy with initial data
    // But we might still need to fetch wishlist status if logged in
    if (initialProducts && !category) {
      if (status === "authenticated") {
        // Just fetch favorites
        fetch("/api/favorites").then(res => res.json()).then(favData => {
          if (Array.isArray(favData)) {
            const favIds = new Set(favData.map((f: any) => f.product.id));
            setProducts(prev => prev.map(p => ({ ...p, isWishlist: favIds.has(p.id) })));
          }
        }).catch(console.error);
      }
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setIsLoading(true);
        let url = `/api/products?limit=6`;
        if (title === "Featured Products" && !category) {
          url += `&sold=false&sortBy=viewCount&sortOrder=desc`;
        } else if (category) {
          url += `&category=${category}`;
        }

        const [productsRes, favoritesRes] = await Promise.all([
          fetch(url),
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
            daysAgo: formatDaysAgo(p.createdAt),
            isWishlist: favoriteIds.has(p.id),
            createdAt: p.createdAt,
            quantity: p.quantity,
            isActive: p.isActive,
            status: p.status,
            category: p.category,
            size: p.size,
            vendorId: p.vendorId,
            vendorUserId: p.vendor?.userId,
            hasPendingStyle: p.hasPendingStyle,
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
  }, [status, title, category, initialProducts]);

  const handleAddToCart = async (product: DisplayProduct) => {
    setAnimatingId(product.id);
    await addItem(product.id, 1, {
      id: product.id,
      name: product.title,
      price: parseFloat(product.price.replace("$", "")),
      images: [{ url: product.image }],
    });
    toast.success("Added to cart! 🛒");
    setTimeout(() => {
      setAnimatingId(null);
    }, 1200);
  };

  const toggleWishlist = async (id: string) => {
    if (status !== "authenticated") {
      window.dispatchEvent(new Event('open-auth-modal'));
      return;
    }

    const product = products.find(p => p.id === id);
    if (!product) return;

    const currentlyFavorited = product.isWishlist;

    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === id ? { ...p, isWishlist: !p.isWishlist } : p))
    );

    try {
      if (currentlyFavorited) {
        await fetch(`/api/favorites?productId=${id}`, { method: 'DELETE' });
      } else {
        await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: id })
        });
      }
    } catch (error) {
      console.error("Failed to toggle wishlist", error);
      setProducts((prevProducts) =>
        prevProducts.map((p) => (p.id === id ? { ...p, isWishlist: currentlyFavorited } : p))
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            animatingId={animatingId}
            handleAddToCart={handleAddToCart}
            toggleWishlist={toggleWishlist}
          />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <a
          href="/products"
          className="flex items-center gap-2 rounded-full border border-gray-300 px-8 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-gray-900"
        >
          View All Products
          <ArrowRight className="size-4" />
        </a>
      </div>
    </div>
  );
}
