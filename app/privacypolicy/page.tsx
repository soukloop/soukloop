import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Content */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full border-b-2">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#E87A3F] mb-2">Privacy Policy</h1>
            <p className="text-gray-600 text-sm">Last Updated: July 26, 2024</p>
          </div>

          {/* Content Sections */}
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Soukloop! Your privacy is important to us. This Privacy Policy explains how we collect, use,
                and protect your information when you use our platform. By using Soukloop, you agree to the terms of
                this policy.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed">
                We collect information you provide directly, such as when you create an account, make a purchase, or
                contact us. This includes your name, email address, phone number, payment information, and shipping
                address. We also collect information automatically, such as your IP address, device information, and
                browsing activity on our site.
              </p>
            </section>

            {/* How We Use Your Information */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We use your information to provide and improve our services, process transactions, communicate with you,
                and personalize your experience. This includes sending order confirmations, updates, and promotional
                emails. We may also use your information for analytics and research to enhance our platform.
              </p>
            </section>

            {/* Sharing & Security */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sharing & Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We may share your information with service providers who assist us in operating our platform, such as
                payment processors and shipping companies. We implement security measures to protect your information
                from unauthorized access, alteration, or disclosure. However, no method of transmission over the
                internet is completely secure.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to access, correct, or delete your personal information. You can manage your account
                settings and communication preferences. If you have any questions or requests regarding your
                information, please contact us.
              </p>
            </section>

            {/* Cookies & Tracking Tools */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Cookies & Tracking Tools</h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar tracking tools to collect information about your browsing activity and
                personalize your experience. You can manage your cookie preferences through your browser settings.
                Please note that disabling cookies may affect the functionality of our platform.
              </p>
            </section>

            {/* Policy Updates */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any significant changes by
                posting the updated policy on our site and updating the "Last Updated" date. Your continued use of
                Soukloop after any changes indicates your acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions or concerns about this Privacy Policy, please contact us at
                privacy@soukloop.com.
              </p>
            </section>
          </div>

          {/* Bottom Navigation Links */}
          {/* <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 h-[104px]">
            <a href="#" className="text-gray-600 hover:text-[#E87A3F] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-[#E87A3F] font-medium">
              Terms of Service
            </a>
            <a href="#" className="text-gray-600 hover:text-[#E87A3F] transition-colors">
              Contact Us
            </a>
          </div> */}
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
