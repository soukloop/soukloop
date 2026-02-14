import { auth } from "@/auth";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { SupportForm } from "@/app/help/components/SupportForm";
import FeaturesSection from "@/components/features-section";

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Contact Section */}
      <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-2">

          {/* Left Side - Contact Form (Order 2 on Mobile, Order 1 on Desktop) */}
          <div className="w-full max-w-md order-2 lg:order-1">
            <h1 className="mb-6 text-4xl font-bold text-gray-900">
              Contact us
            </h1>
            <p className="mb-8 leading-relaxed text-gray-600">
              Whether it's about your order, a product, or selling on Soukloop —
              we're just a message away.
            </p>

            {/* Unified Support Form */}
            <SupportForm user={session?.user} />
          </div>

          {/* Right Side - Info & Image (Order 1 on Mobile, Order 2 on Desktop) */}
          <div className="relative w-full order-1 lg:order-2">
            {/* Image */}
            <div className="relative h-[400px] w-full overflow-hidden rounded-2xl sm:h-[388.5px] sm:w-[616px]">
              <img
                src="/images/customer-service.png"
                alt="Customer service representative with headset"
                className="relative z-10 size-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Reused Features Section */}
        <section className="mt-16">
          <FeaturesSection />
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
