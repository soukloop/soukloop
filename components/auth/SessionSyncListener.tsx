"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SessionSyncListener() {
    const { update } = useSession();
    const router = useRouter();

    useEffect(() => {
        const handleRefresh = async () => {
            console.log("🔄 SessionSync: Refreshing session...");
            await update(); // This re-fetches the session from the server
            router.refresh(); // This refreshes Server Components
        };

        window.addEventListener("soukloop:session-refresh", handleRefresh);

        return () => {
            window.removeEventListener("soukloop:session-refresh", handleRefresh);
        };
    }, [update, router]);

    return null;
}
