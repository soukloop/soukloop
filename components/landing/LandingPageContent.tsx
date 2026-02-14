import HeroSection from "@/components/hero-section";
import SearchSection from "@/components/search-section";
import CategoriesSection from "@/components/categories-section";
import FeaturedProductsSection from "@/components/featured-products-section";
import BestsellingCategories from "@/components/bestselling-categories";
import ShopByPriceSection from "@/components/shop-by-price-section";
import CollectionsShowcaseSection from "@/components/collections-showcase-section";
import WinterPromotionSection from "@/components/winter-promotion-section";
import FeaturesSection from "@/components/features-section";
import TestimonialsSection from "@/components/testimonials-section";
import FooterSection from "@/components/footer-section";
import DynamicBannerSection from "@/features/promotions/components/DynamicBannerSection";

import { getFeaturedProducts } from "@/features/products/queries";
import { getAllCategories } from "@/features/categories/queries";
import { getBestsellingStyles } from "@/features/analytics/queries";
import { getActiveBanners } from "@/features/promotions/queries";

export default async function LandingPageContent() {
    // Fetch data in parallel
    const [featuredProducts, categories, bestsellingStyles, activeBanners] = await Promise.all([
        getFeaturedProducts(),
        getAllCategories(),
        getBestsellingStyles(),
        getActiveBanners()
    ]);

    return (
        <>
            <HeroSection />
            <SearchSection />
            <CategoriesSection initialCategories={categories} />
            <FeaturedProductsSection initialProducts={featuredProducts} />
            <BestsellingCategories initialStyles={bestsellingStyles} />

            <ShopByPriceSection />
            <CollectionsShowcaseSection />

            {/* Show dynamic banners if any, otherwise fallback to static section */}
            {activeBanners.length > 0 ? (
                <DynamicBannerSection banners={activeBanners} />
            ) : (
                <WinterPromotionSection />
            )}

            <FeaturesSection />
            <TestimonialsSection />
            <FooterSection />
        </>
    );
}
