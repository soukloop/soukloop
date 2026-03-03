"use client";

import { usePathname } from "next/navigation";
import React from "react";

/**
 * Hides children (e.g., SiteHeader) if on a dashboard/admin route.
 */
export default function ConditionalHeader({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Define routes where the main site header should be hidden
    const hideOnRoutes = ["/admin", "/seller"];

    const shouldHide = hideOnRoutes.some((route) =>
        pathname === route || pathname?.startsWith(route + "/")
    );

    if (shouldHide) return null;

    return <>{children}</>;
}
