"use client";

import { useSession } from "next-auth/react";
import { useVendor } from "./useVendor";

/**
 * Custom hook for seller authentication and authorization
 * Returns authentication status and seller/vendor information
 */
export function useSellerAuth() {
    const { data: session, status } = useSession();
    const { vendorProfile, isLoadingProfile, isSeller } = useVendor();

    return {
        // Authentication state
        isLoading: status === "loading" || isLoadingProfile,
        isAuthenticated: status === "authenticated",

        // Seller/Vendor state
        isSeller: isSeller,
        vendor: vendorProfile,

        // Session data
        user: session?.user,
        session,
    };
}
