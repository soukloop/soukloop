import { Suspense } from "react";
import SiteHeader from "@/components/site-header";
import { Loader2 } from "lucide-react";

export default function ProductLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            {children}
        </>
    );
}
