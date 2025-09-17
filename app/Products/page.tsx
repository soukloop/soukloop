import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import SearchResults from "../Products/components/search-results"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <SearchResults />
      <FooterSection />
    </div>
  )
}
