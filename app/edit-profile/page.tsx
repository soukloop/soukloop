import EcommerceHeader from "@/components/ecommerce-header"
import AccountSettings from "../edit-profile/components/account-settings"
import FooterSection from "@/components/footer-section"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <AccountSettings />
      <FooterSection />
    </div>
  )
}
