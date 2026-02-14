import { getBanners } from "@/features/promotions/queries";
import { PromotionsClient } from "@/features/promotions/components/PromotionsClient";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Promotions Management | Admin Dashboard",
    description: "Manage promotional banners and campaigns.",
};

export default async function PromotionsPage() {
    const banners = await getBanners();

    return (
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <PromotionsClient initialBanners={banners} />
        </div>
    );
}
