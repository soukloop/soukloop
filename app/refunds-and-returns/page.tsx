import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import RefundsReturnsPage from "./components/refunds-returns-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-white sm:mt-[-7rem] mt-[-5.2rem]">
      <EcommerceHeader />
      <RefundsReturnsPage />
      <FooterSection />
    </div>
  )
}
