"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function SuspendedUserToast() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const error = searchParams.get("error");

    useEffect(() => {
        if (error === "SuspendedAccount") {
            toast.error("Account Suspended", {
                description: "Your account is currently inactive. Please contact support.",
                duration: 5000,
            });

            // Clean up the URL to remove the error param so toast doesn't show on refresh
            const url = new URL(window.location.href);
            url.searchParams.delete("error");
            router.replace(url.pathname + url.search);
        }
    }, [error, router]);

    return null;
}
