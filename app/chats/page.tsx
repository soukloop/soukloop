import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import MessagingInterface from "@/components/messaging-interface"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <EcommerceHeader />
      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <MessagingInterface />
      </main>
      <FooterSection />
    </div>
  )
}
