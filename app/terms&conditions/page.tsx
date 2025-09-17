import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Content */}
      <main className="container mx-auto px-6 sm:px-8 lg:px-12 xl:px-16 py-8 max-w-7xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#E87A3F] mb-2">Terms & Conditions</h1>
          <p className="text-sm text-gray-600">Last Updated: October 26, 2024</p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8 text-gray-800 border-b-2">
          {/* Overview */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Soukloop! These Terms & Conditions govern your use of our e-commerce platform. By accessing or
              using our services, you agree to comply with these terms. Please read them carefully.
            </p>
          </section>

          {/* User Account & Responsibilities */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">User Account & Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed">
              To use certain features, you may need to create an account. You are responsible for maintaining the
              confidentiality of your account information and for all activities that occur under your account. Provide
              accurate and up-to-date information during registration.
            </p>
          </section>

          {/* Orders */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Orders</h2>
            <p className="text-gray-700 leading-relaxed">
              Placing an order constitutes an offer to purchase the products listed. We reserve the right to accept or
              decline your order. Once an order is accepted, you will receive a confirmation email with details.
            </p>
          </section>

          {/* Payments & Pricing */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Payments & Pricing</h2>
            <p className="text-gray-700 leading-relaxed">
              Prices are listed in the local currency and are subject to change without notice. Payment methods accepted
              include credit/debit cards and other specified options. You agree to pay all charges incurred in
              connection with your order.
            </p>
          </section>

          {/* Shipping & Returns */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Shipping & Returns</h2>
            <p className="text-gray-700 leading-relaxed">
              We aim to ship orders promptly. Shipping times may vary. Please review our Shipping Policy for details.
              Our Return Policy outlines the process for returning items, subject to certain conditions.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on Soukloop, including logos, text, and images, is protected by intellectual property laws.
              You may not use, reproduce, or distribute any content without our express permission.
            </p>
          </section>

          {/* Liability Limitations */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Liability Limitations</h2>
            <p className="text-gray-700 leading-relaxed">
              Soukloop is not liable for any indirect, incidental, or consequential damages arising from your use of our
              platform. Our liability is limited to the purchase price of the products.
            </p>
          </section>

          {/* Account Suspension or Termination */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Account Suspension or Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account if you violate these Terms & Conditions or
              engage in any harmful or illegal activities.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms & Conditions are governed by the laws of the jurisdiction in which Soukloop operates. Any
              disputes will be resolved in accordance with these laws.
            </p>
          </section>

          {/* Contact Details */}
          <section>
            <h2 className="text-xl font-bold text-black mb-4">Contact Details</h2>
            <p className="text-gray-700 leading-relaxed">
              For any questions or concerns regarding these Terms & Conditions, please contact us at
              support@soukloop.com or call us at (555) 123-4567.
            </p>
          </section>
        </div>

        {/* Bottom Navigation Links */}
        {/* <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 max-w-[1440px] mx-auto h-[104px]">
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
      </main>

      <FooterSection />
    </div>
  )
}
