import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import RewardsPointsPage from "./components/rewards-points-page"
import { getMyRewardsAction } from "@/src/features/rewards/actions"

export default async function Home() {
  const initialData = await getMyRewardsAction(1, 5);

  return (
    <div className="min-h-screen bg-white sm:mt-[-9rem] mt-[-6.2rem]">
      <EcommerceHeader />
      <RewardsPointsPage initialData={initialData} />
      <FooterSection />
    </div>
  )
}
