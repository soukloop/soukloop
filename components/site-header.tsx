import { getGroupedDressStyles } from "@/actions/product-data";
import EcommerceHeader from "./ecommerce-header";

import { headers } from "next/headers";

export default async function SiteHeader() {
    const headersList = await headers();
    const pathname = headersList.get("x-url") || "";

    if (pathname.startsWith("/admin")) {
        return null;
    }

    const dressStyles = await getGroupedDressStyles();

    return <EcommerceHeader initialDressStyles={dressStyles} />;
}
