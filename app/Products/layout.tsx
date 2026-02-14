import { Suspense } from "react";
import FooterSection from "@/components/footer-section";
import { Loader2 } from "lucide-react";

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-white">
            {children}
            <FooterSection />
        </div>
    );
}
