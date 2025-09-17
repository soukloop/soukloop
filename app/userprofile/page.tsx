import EcommerceHeader from "@/components/ecommerce-header"
import UserProfileSection from "../userprofile/components/user-profile-section"
import FooterSection from "@/components/footer-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <UserProfileSection />
      <FooterSection />
    </div>
  )
}
