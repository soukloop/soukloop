"use client";

import { useEffect, useRef } from "react";
import { useSWRConfig } from "swr";

interface CartHydrationProps {
    initialCartData: any;
}

export function CartHydration({ initialCartData }: CartHydrationProps) {
    const { mutate } = useSWRConfig();
    const hydrated = useRef(false);

    useEffect(() => {
        // Only hydrate if we have valid initial data
        if (initialCartData && !hydrated.current) {
            // Optimistically update the cache with server data immediately
            // revalidate: false -> Don't re-fetch immediately, trust the server data
            mutate("/api/cart", initialCartData, false);
            hydrated.current = true;
        }
    }, [initialCartData, mutate]);

    return null;
}
