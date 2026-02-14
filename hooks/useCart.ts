"use client";

import { useCart as useCartFromContext } from "../app/context/CartContext";

/**
 * Professional Hybrid Cart Hook
 * Now centrally managed via CartProvider for instant state sync across all components.
 */
export function useCart() {
  return useCartFromContext();
}
