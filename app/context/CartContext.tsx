"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSocket } from "@/components/providers/socket-provider";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { getCart, addItem, updateItem, removeItem } from "@/services/cart.service";
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItem,
  removeFromGuestCart,
  clearGuestCart as clearLocalStorageCart,
} from "@/lib/guest-cart";

interface ProductDetails {
  id: string;
  name: string;
  price: number;
  images: { url: string }[];
  vendor?: { user?: { name: string | null } };
}

interface CartContextType {
  cart: any;
  isLoading: boolean;
  isError: boolean;
  error: any;
  isAuthenticated: boolean;
  addItem: (productId: string, quantity?: number, productDetails?: any) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeItems: (itemIds: string[]) => Promise<void>;
  clearCart: (productIds?: string[]) => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
  isItemInCart: (productId: string) => boolean;
  getCartSubtotal: () => number;
  selectedItems: Set<string>;
  toggleSelection: (itemId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  selectableItemsCount: number;
  isAllSelected: boolean;
  isSyncing: boolean;
  stockUpdates: Map<string, number>;
}

interface StockContextType {
  stockUpdates: Map<string, number>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const StockContext = createContext<StockContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoadingSession = status === "loading";

  // --- Authenticated Cart (SWR) ---
  const { data: authCart, error, isLoading: isAuthLoading, mutate } = useSWR(
    isAuthenticated ? "/api/cart" : null,
    async () => {
      const { data, error } = await getCart();
      if (error) throw new Error(error.message);
      return data;
    },
    {
      revalidateOnFocus: false, // Disable aggressive fetching on window focus
      dedupingInterval: 10000, // Prevent duplicate requests within 10 seconds
      shouldRetryOnError: false,
      keepPreviousData: true, // CRITICAL: Show previous (cached) data while fetching new
      refreshInterval: 60000, // Fallback polling: Check every 60s in case WebSockets fail
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        if (error.message.includes('401') || error.message.includes('403')) return;
        if (retryCount >= 3) return;
        setTimeout(() => revalidate({ retryCount }), 5000);
      }
    }
  );

  // --- Guest Cart State ---
  const [guestCartData, setGuestCartData] = useState<any>(null);
  const [guestProducts, setGuestProducts] = useState<any[]>([]);
  const [isSyncingGuest, setIsSyncingGuest] = useState(false); // Background sync only
  const [detailsCache, setDetailsCache] = useState<Record<string, any>>({});
  const [isMerging, setIsMerging] = useState(false);

  // Synchronize Guest Cart across tabs
  const syncGuestCart = useCallback(() => {
    if (typeof window !== "undefined") {
      const cart = getGuestCart();

      // OPTIMISTIC: Set data immediately from local storage
      setGuestCartData((prev: any) => {
        // If we already have data and it matches, don't trigger re-render
        if (JSON.stringify(prev) === JSON.stringify(cart)) return prev;
        return { ...cart };
      });

      if (cart.items.length > 0) {
        fetchBatchProducts(cart.items.map((i) => i.productId));
      } else {
        setGuestProducts([]);
      }
    }
  }, []);

  const fetchBatchProducts = useCallback(async (productIds: string[]) => {
    if (productIds.length === 0) return;
    setIsSyncingGuest(true); // Don't block UI, just indicate syncing
    try {
      const res = await fetch("/api/products/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds }),
      });
      if (res.ok) {
        const products = await res.json();
        setGuestProducts(products); // Update with fresh data (status, price)
      }
    } catch (err) {
      console.error("Failed to fetch guest products:", err);
    } finally {
      setIsSyncingGuest(false);
    }
  }, []);

  useEffect(() => {
    // Always sync on mount to show cached data immediately
    syncGuestCart();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "soukloop_guest_cart") syncGuestCart();
    };

    const handleCustomUpdate = () => syncGuestCart();

    window.addEventListener("storage", handleStorage);
    window.addEventListener("cart-updated", handleCustomUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cart-updated", handleCustomUpdate);
    };
  }, [syncGuestCart]);

  // Merge Guest Cart on Login
  useEffect(() => {
    if (isAuthenticated) {
      const guestCart = getGuestCart();
      if (guestCart.items.length > 0) {
        setIsMerging(true);
        fetch("/api/cart/merge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestItems: guestCart.items }),
        }).then(async () => {
          clearLocalStorageCart();
          await mutate();
          // Reset selection after merge because IDs changed from ProductIDs to CartItemIDs
          setSelectedItems(new Set());
          setIsMerging(false);
        }).catch(() => {
          setIsMerging(false);
        });
      }
    }
  }, [isAuthenticated, mutate]);

  // --- Helper Calculations (Defined before used in actions) ---

  const getItemQuantity = useCallback((productId: string) => {
    const items = isAuthenticated ? authCart?.items : guestCartData?.items;
    return items?.find((i: any) => i.productId === productId || i.id === productId)?.quantity || 0;
  }, [isAuthenticated, authCart?.items, guestCartData?.items]);

  const isItemInCart = useCallback((productId: string) => getItemQuantity(productId) > 0, [getItemQuantity]);

  const getTotalItems = useCallback(() => {
    const items = isAuthenticated ? authCart?.items : guestCartData?.items;
    return items?.length || 0; // Unique Items count (Quantity is always 1)
  }, [isAuthenticated, authCart?.items, guestCartData?.items]);

  // Updated to exclude SOLD items
  const getTotalPrice = useCallback(() => {
    if (isAuthenticated) {
      return authCart?.items?.reduce((sum: number, i: any) => {
        // Exclude SOLD or inactive items
        // Exclude SOLD or inactive items
        if (i.product?.status === 'SOLD' || i.product?.isActive === false) return sum;

        const price = i.product?.price || 0;
        return sum + Math.round(price * 100); // Quantity is always 1
      }, 0) || 0;
    }
    return guestCartData?.items?.reduce((sum: number, item: any) => {
      const productFromApi = guestProducts.find((p) => p.id === item.productId);
      const product = productFromApi || detailsCache[item.productId];

      // Exclude SOLD or inactive items
      if (product?.status === 'SOLD' || product?.isActive === false) return sum;

      return sum + (product ? Math.round(product.price * 100) : 0); // Quantity is always 1
    }, 0) || 0;
  }, [isAuthenticated, authCart?.items, guestCartData?.items, guestProducts, detailsCache]);

  const getCartSubtotal = useCallback(() => {
    // Same logic as Total Price for now
    return getTotalPrice();
  }, [getTotalPrice]);

  // --- Optimized Actions ---

  const addItemToCart = useCallback(async (productId: string, _quantity: number = 1, productDetails?: any) => {
    const quantity = 1; // FORCE QUANTITY TO 1 (Unique Items)

    // Instant detail caching for ultra-responsive UI
    if (productDetails) {
      setDetailsCache(prev => ({ ...prev, [productId]: productDetails }));
    }

    if (isItemInCart(productId)) {
      console.log(`Product ${productId} is already in cart, skipping add.`);
      return;
    }

    if (!isAuthenticated) {
      addToGuestCart(productId, quantity);
      syncGuestCart(); // Instant UI update
      window.dispatchEvent(new Event("cart-updated"));
      return;
    }

    // Optimistic SWR Update
    await mutate(
      async (current: any) => {
        const { data, error } = await addItem({ productId, quantity });
        if (error) throw error;

        if (!current) {
          const { data: freshCart } = await getCart();
          return freshCart;
        }

        const items = [...current.items];
        const idx = items.findIndex((i: any) => i.productId === productId);
        if (idx > -1) {
          items[idx] = { ...items[idx], ...data };
        } else {
          items.push(data);
        }
        return { ...current, items };
      },
      {
        optimisticData: (current: any) => {
          if (!current) return null;
          const items = [...current.items];
          const idx = items.findIndex((i: any) => i.productId === productId);
          if (idx > -1) {
            // Should not happen with isItemInCart check, but safe fallback
            items[idx] = { ...items[idx], quantity: 1 };
          } else {
            // Price is unknown but better than NaN
            items.push({ id: `temp-${Date.now()}`, productId, quantity: 1, product: productDetails || null });
          }
          return { ...current, items };
        },
        rollbackOnError: true,
      }
    );
    window.dispatchEvent(new Event("cart-updated"));
  }, [isAuthenticated, isItemInCart, mutate, syncGuestCart]);

  const updateCartItem = useCallback(async (itemId: string, _quantity: number) => {
    // NO-OP or Force 1. We essentially disable updating quantity.
    // If we want to be strict, we just don't do anything or reset to 1.
    const quantity = 1;

    // itemId is productId for guests
    if (!isAuthenticated) {
      updateGuestCartItem(itemId, quantity);
      syncGuestCart();
      return;
    }

    await mutate(
      async (current: any) => {
        const { data, error } = await updateItem(itemId, quantity);
        if (error) throw error;

        if (!current) return null;
        return {
          ...current,
          items: current.items.map((i: any) => (i.id === itemId ? { ...i, ...data } : i)),
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current) return null;
          return {
            ...current,
            items: current.items.map((i: any) => (i.id === itemId ? { ...i, quantity: 1 } : i)),
          };
        },
        rollbackOnError: true,
      }
    );
  }, [isAuthenticated, mutate, syncGuestCart]);

  const removeItemFromCart = useCallback(async (itemId: string) => {
    if (!isAuthenticated) {
      removeFromGuestCart(itemId);
      syncGuestCart();
      return;
    }

    await mutate(
      async (current: any) => {
        const { error } = await removeItem(itemId);
        if (error) throw error;

        if (!current) return null;
        return {
          ...current,
          items: current.items.filter((i: any) => i.id !== itemId),
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current) return null;
          return {
            ...current,
            items: current.items.filter((i: any) => i.id !== itemId),
          };
        },
        rollbackOnError: true,
        revalidate: true // Re-validate to ensure totals are correct on server
      }
    );
  }, [isAuthenticated, mutate, syncGuestCart]);

  const removeItems = useCallback(async (itemIds: string[]) => {
    if (!itemIds.length) return;

    if (!isAuthenticated) {
      itemIds.forEach(id => removeFromGuestCart(id));
      syncGuestCart();
      return;
    }

    await mutate(
      async (current: any) => {
        // Execute generic remove promises
        await Promise.all(itemIds.map(id => removeItem(id)));

        if (!current) return null;
        return {
          ...current,
          items: current.items.filter((i: any) => !itemIds.includes(i.id))
        };
      },
      {
        optimisticData: (current: any) => {
          if (!current) return null;
          return {
            ...current,
            items: current.items.filter((i: any) => !itemIds.includes(i.id))
          };
        },
        rollbackOnError: true,
        revalidate: true
      }
    );
  }, [isAuthenticated, mutate, syncGuestCart]);

  const clearAll = useCallback(async (productIds?: string[]) => {
    if (!isAuthenticated) {
      if (productIds && productIds.length > 0) {
        // Partial clear for guest (not fully supported yet, but safe fallback)
        productIds.forEach(id => removeFromGuestCart(id));
      } else {
        clearLocalStorageCart();
      }
      syncGuestCart();
      return;
    }

    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds })
      });

      if (res.ok) {
        // Partial Update: Don't wipe everything, just revalidate
        // Full Clear: Wipe immediately
        if (!productIds || productIds.length === 0) {
          mutate(null, false);
        }
        await mutate(); // Revalidate with server source of truth
      } else {
        console.error("Failed to clear cart on server");
      }
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  }, [isAuthenticated, mutate, syncGuestCart]);

  // Enriched Cart Object
  const enrichedCart = useMemo(() => {
    return isAuthenticated
      ? authCart
        ? {
          ...authCart,
          items: authCart.items.map((item: any) => ({
            ...item,
            priceCents: item.product ? Math.round(item.product.price * 100) : 0,
            isSold: item.product?.status === 'SOLD' // Add helper flag
          })),
        }
        : null
      : guestCartData
        ? {
          ...guestCartData,
          items: guestCartData.items.map((item: any) => {
            const productFromApi = guestProducts.find((p) => p.id === item.productId);
            const product = productFromApi || detailsCache[item.productId];
            return {
              id: item.productId,
              productId: item.productId,
              quantity: item.quantity,
              priceCents: product ? Math.round(product.price * 100) : 0,
              product: product || null,
              isSold: product?.status === 'SOLD' // Add helper flag
            };
          }),
        }
        : null;
  }, [isAuthenticated, authCart, guestCartData, guestProducts, detailsCache]);

  // --- Real-time Stock Updates (VOLATILE STATE) ---
  const [stockUpdates, setStockUpdates] = useState<Map<string, number>>(new Map());
  const socketContext = useSocket();
  const subscribe = socketContext?.subscribe || (() => () => { });
  const isConnected = socketContext?.isConnected || false;

  // Selection State
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Helper to get all selectable items (stock > 0 AND NOT SOLD)
  // Dependencies: enrichedCart and stockUpdates
  const getSelectableItems = useCallback(() => {
    if (!enrichedCart?.items) return [];
    return enrichedCart.items.filter((i: any) => {
      // Check both explicit status and stock
      if (i.isSold || i.product?.status === 'SOLD') return false;

      return true; // Unique Items are selectable if not sold
    });
  }, [enrichedCart, stockUpdates]);

  const selectableItems = getSelectableItems();
  const selectableItemsCount = selectableItems.length;

  const isAllSelected = selectableItemsCount > 0 &&
    selectableItems.every((i: any) => selectedItems.has(i.id));

  // Centrifugo Listener for Stock Updates
  useEffect(() => {
    if (!isConnected || !subscribe) return;

    // Subscribe to a public channel for stock updates
    const unsubscribe = subscribe('product-stock-updates', (ctx: any) => {
      const data = ctx.data;
      if (data?.type === 'stock-update' && data.productId) {
        // console.log('📉 Stock Update Received (Centrifugo):', data);
        setStockUpdates(prev => {
          const newMap = new Map(prev);
          newMap.set(data.productId, data.newStock);
          return newMap;
        });

        // If stock drops to 0, deselect it
        if (data.newStock === 0) {
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            const item = enrichedCart?.items?.find((i: any) => i.productId === data.productId);
            if (item && newSet.has(item.id)) {
              newSet.delete(item.id);
            }
            return newSet;
          });
        }
      }
    });

    return unsubscribe;
  }, [isConnected, subscribe]);

  // Initialize selection when cart loads - DEPENDS ON STOCK
  const itemIdsKey = enrichedCart?.items?.map((i: any) => i.id).join(',') || '';

  useEffect(() => {
    if (enrichedCart?.items && (selectedItems.size === 0 || !Array.from(selectedItems).every(id => itemIdsKey.includes(id)))) {
      // Only select items that have stock > 0
      const availableItems = enrichedCart.items
        .filter((i: any) => {
          if (i.isSold || i.product?.status === 'SOLD') return false; // Don't select SOLD items
          return true; // If not sold, it's selectable (Unique item)
        })
        .map((i: any) => i.id);

      if (availableItems.length > 0) {
        setSelectedItems(new Set(availableItems));
      }
    }
  }, [itemIdsKey, stockUpdates]); // This effect WILL run on stock update, but it's internal.

  // Helper to Toggle Selection
  const toggleSelection = useCallback((itemId: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    const allIds = getSelectableItems().map((i: any) => i.id);
    setSelectedItems(new Set(allIds));
  }, [getSelectableItems]);

  const deselectAll = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Override getTotalPrice to only count SELECTED items
  const getSelectedTotalPrice = useCallback(() => {
    const items = isAuthenticated ? authCart?.items : guestCartData?.items;
    if (!items) return 0;

    return items.reduce((sum: number, item: any) => {
      const itemId = item.id || item.productId;
      if (!selectedItems.has(itemId)) return sum;

      const productFromApi = guestProducts.find((p) => p.id === item.productId);
      const product = isAuthenticated ? item.product : (productFromApi || detailsCache[item.productId]);

      // Exclude SOLD items from calculation even if somehow selected
      if (product?.status === 'SOLD') return sum;

      const price = product?.price || 0;
      return sum + Math.round(price * 100); // Quantity is always 1
    }, 0);
  }, [isAuthenticated, authCart?.items, guestCartData?.items, selectedItems, guestProducts, detailsCache]);

  // MEMOIZE THE MAIN CART CONTEXT
  // Exclude `stockUpdates` to prevent unrelated re-renders
  const cartContextValue = useMemo(() => ({
    cart: enrichedCart,
    // Loading is only true if we have NO data. If we have partial data (isSyncing), we are NOT loading.
    isLoading: (isAuthenticated ? (!authCart && isAuthLoading) : (!guestCartData && isSyncingGuest)) || isMerging || isLoadingSession,
    isSyncing: (isAuthenticated ? isAuthLoading : isSyncingGuest), // Expose syncing state
    isError: !!error,
    error,
    isAuthenticated,
    addItem: addItemToCart,
    updateItem: updateCartItem,
    removeItem: removeItemFromCart,
    removeItems,
    clearCart: clearAll,
    getTotalItems,
    getTotalPrice: getSelectedTotalPrice,
    getCartSubtotal,
    getItemQuantity,
    isItemInCart,
    selectedItems,
    toggleSelection,
    selectableItemsCount,
    isAllSelected,
    selectAll,
    deselectAll,
    // Note: stockUpdates is purposefully omitted here -> REVERTED: Needed for CartPage
    stockUpdates,
  }), [
    enrichedCart,
    isAuthenticated, isAuthLoading, isSyncingGuest, guestCartData, authCart, isMerging, isLoadingSession,
    error,
    addItemToCart, updateCartItem, removeItemFromCart, removeItems, clearAll,
    getTotalItems, getSelectedTotalPrice, getCartSubtotal, getItemQuantity, isItemInCart,
    selectedItems, toggleSelection, selectableItemsCount, isAllSelected, selectAll, deselectAll,
    stockUpdates // Added dependency
  ]);

  // MEMOIZE STOCK CONTEXT
  const stockContextValue = useMemo(() => ({
    stockUpdates
  }), [stockUpdates]);

  return (
    <CartContext.Provider value={cartContextValue}>
      <StockContext.Provider value={stockContextValue}>
        {children}
      </StockContext.Provider>
    </CartContext.Provider>
  );
}

// Hook for Main Cart Data (Stable)
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

// Hook for Real-time Stock (Volatile)
export function useCartStock() {
  const context = useContext(StockContext);
  if (context === undefined) {
    throw new Error("useCartStock must be used within a CartProvider");
  }
  return context.stockUpdates;
}
