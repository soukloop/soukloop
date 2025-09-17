import EcommerceHeader from "@/components/ecommerce-header"
import HeroSection from "@/components/hero-section"
import SearchSection from "@/components/search-section"
import CategoriesSection from "@/components/categories-section"
import FeaturedProductsSection from "@/components/featured-products-section"
import BestSellersSection from "@/components/best-sellers-section"
import CTAButtonsSection from "@/components/cta-buttons-section"
import ShopByPriceSection from "@/components/shop-by-price-section"
import CollectionsShowcaseSection from "@/components/collections-showcase-section"
import StyleCollectionsSection from "@/components/style-collections-section"
import WinterPromotionSection from "@/components/winter-promotion-section"
import FeaturesSection from "@/components/features-section"
import TestimonialsSection from "@/components/testimonials-section"
import FooterSection from "@/components/footer-section"

export default function Page() {
  return (
    <div className="w-full bg-white max-w-[1920px] mx-auto">
      <EcommerceHeader />
      <HeroSection />
      <SearchSection />
      <CategoriesSection />
      <FeaturedProductsSection />
      <BestSellersSection />
      <CTAButtonsSection />
      <ShopByPriceSection />
      <CollectionsShowcaseSection />
      <StyleCollectionsSection />
      <WinterPromotionSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FooterSection />
    </div>
  )
}
