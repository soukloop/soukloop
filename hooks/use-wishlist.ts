"use client";

import useSWR, { mutate } from "swr";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useCallback } from "react";

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useWishlist() {
    const { data: session, status } = useSession();
    const isAuthenticated = status === "authenticated";

    // Deduped fetch for favorites using SWR
    // Only fetch if authenticated
    const { data: favorites, error, isLoading, mutate: mutateFavorites } = useSWR(
        isAuthenticated ? "/api/favorites" : null,
        fetcher,
        {
            revalidateOnFocus: false, // Don't refetch on window focus to avoid spam
            dedupingInterval: 5000,
        }
    );

    const isWithlisted = useCallback(
        (productId: string) => {
            if (!favorites || !Array.isArray(favorites)) return false;
            return favorites.some((fav: any) => fav.product?.id === productId || fav.productId === productId);
        },
        [favorites]
    );

    const toggleWishlist = useCallback(
        async (productId: string) => {
            // 1. Auth Check
            if (!isAuthenticated) {
                // Trigger generic auth modal or redirect
                // Assuming there is a global event listener for 'open-auth-modal' as seen in other files
                // OR fallback to toast + redirect
                if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("open-auth-modal"));
                } else {
                    toast.info("Please login to save items to your wishlist");
                }
                return;
            }

            // 2. Optimistic Update
            const currentlyWishlisted = isWithlisted(productId);

            // Create optimistic data
            const optimisticFavorites = currentlyWishlisted
                ? favorites.filter((fav: any) => (fav.product?.id || fav.productId) !== productId)
                : [...(favorites || []), { productId, product: { id: productId } }]; // Minimal mock

            // Apply optimistic update immediately
            mutateFavorites(optimisticFavorites, false); // false = don't revalidate yet

            try {
                if (currentlyWishlisted) {
                    // REMOVE
                    await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
                    toast.success("Removed from wishlist");
                } else {
                    // ADD
                    await fetch("/api/favorites", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ productId }),
                    });
                    toast.success("Added to wishlist");
                }
                // 3. Revalidate to ensure sync
                mutateFavorites();
            } catch (err) {
                console.error("Failed to toggle wishlist", err);
                toast.error("Failed to update wishlist");
                // Revert optimistic update by revalidating immediately
                mutateFavorites();
            }
        },
        [isAuthenticated, favorites, mutateFavorites, isWithlisted]
    );

    return {
        favorites,
        isLoading,
        isWithlisted,
        toggleWishlist,
    };
}
