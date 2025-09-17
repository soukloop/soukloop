import EcommerceHeader from "@/components/ecommerce-header"
import UserDashboard from "../userdashboard/components/user-dashboard"
import FooterSection from "@/components/footer-section"

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <UserDashboard />
      <FooterSection />
    </div>
  )
}
