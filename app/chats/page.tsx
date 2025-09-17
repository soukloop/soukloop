import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import MessagingInterface from "../chats/components/messaging-interface"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <MessagingInterface />
      <FooterSection />
    </div>
  )
}
