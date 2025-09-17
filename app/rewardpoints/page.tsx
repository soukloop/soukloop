import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import RewardsPointsPage from "../rewardpoints/components/rewards-points-page"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <RewardsPointsPage />
      <FooterSection />
    </div>
  )
}
