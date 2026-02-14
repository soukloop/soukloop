"use client";

import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <EcommerceHeader />

      <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* Header Section */}
          <div>
            <h1 className="mb-2 text-3xl font-bold text-[#e0622c] sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">Last Updated: July 26, 2024</p>
          </div>

          {/* Introduction */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Introduction
            </h2>
            <p className="leading-relaxed text-gray-600">
              Welcome to Soukloop! Your privacy is important to us. This Privacy
              Policy explains how we collect, use, and protect your information
              when you use our platform. By using Soukloop, you agree to the
              terms of this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Information We Collect
            </h2>
            <p className="leading-relaxed text-gray-600">
              We collect information you provide directly, such as when you
              create an account, make a purchase, or contact us. This includes
              your name, email address, phone number, payment information, and
              shipping address. We also collect information automatically, such
              as your IP address, device information, and browsing activity on
              our site.
            </p>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              How We Use Your Information
            </h2>
            <p className="leading-relaxed text-gray-600">
              We use your information to provide and improve our services, process
              transactions, communicate with you, and personalize your experience.
              This includes sending order confirmations, updates, and promotional
              emails. We may also use your information for analytics and research
              to enhance our platform.
            </p>
          </section>

          {/* Sharing & Security */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Sharing & Security
            </h2>
            <p className="leading-relaxed text-gray-600">
              We may share your information with service providers who assist us
              in operating our platform, such as payment processors and shipping
              companies. We implement security measures to protect your
              information from unauthorized access, alteration, or disclosure.
              However, no method of transmission over the internet is completely
              secure.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Your Rights
            </h2>
            <p className="leading-relaxed text-gray-600">
              You have the right to access, correct, or delete your personal
              information. You can manage your account settings and communication
              preferences. If you have any questions or requests regarding your
              information, please contact us.
            </p>
          </section>

          {/* Cookies & Tracking Tools */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Cookies & Tracking Tools
            </h2>
            <p className="leading-relaxed text-gray-600">
              We use cookies and similar tracking tools to collect information
              about your browsing activity and personalize your experience. You
              can manage your cookie preferences through your browser settings.
              Please note that disabling cookies may affect the functionality of
              our platform.
            </p>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Policy Updates
            </h2>
            <p className="leading-relaxed text-gray-600">
              We may update this Privacy Policy from time to time. We will notify
              you of any significant changes by posting the updated policy on our
              site and updating the "Last Updated" date. Your continued use of
              Soukloop after any changes indicates your acceptance of the updated
              policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
              Contact Us
            </h2>
            <p className="leading-relaxed text-gray-600">
              If you have any questions or concerns about this Privacy Policy,
              please contact us at privacy@soukloop.com.
            </p>
          </section>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
