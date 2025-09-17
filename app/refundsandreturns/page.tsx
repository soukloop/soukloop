import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import RefundsReturnsPage from "./components/refunds-returns-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <RefundsReturnsPage />
      <FooterSection />
    </div>
  )
}
