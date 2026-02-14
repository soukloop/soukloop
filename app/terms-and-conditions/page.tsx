"use client";

import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import Link from "next/link";

export default function TermsAndConditionsPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <EcommerceHeader />

            <main className="container mx-auto flex-1 px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl space-y-8">
                    {/* Header Section */}
                    <div>
                        <h1 className="mb-2 text-3xl font-bold text-[#e0622c] sm:text-4xl">
                            Terms & Conditions
                        </h1>
                        <p className="text-sm text-gray-500">
                            Last Updated: October 26, 2024
                        </p>
                    </div>

                    {/* Overview */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Overview
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            Welcome to Soukloop! These Terms & Conditions govern your use of our
                            e-commerce platform. By accessing or using our services, you agree to
                            comply with these terms. Please read them carefully.
                        </p>
                    </section>

                    {/* User Account & Responsibilities */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            User Account & Responsibilities
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            To use certain features, you may need to create an account. You are
                            responsible for maintaining the confidentiality of your account
                            information and for all activities that occur under your account.
                            Provide accurate and up-to-date information during registration.
                        </p>
                    </section>

                    {/* Orders */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Orders
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            Placing an order constitutes an offer to purchase the products
                            listed. We reserve the right to accept or decline your order. Once
                            an order is accepted, you will receive a confirmation email with
                            details.
                        </p>
                    </section>

                    {/* Payments & Pricing */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Payments & Pricing
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            Prices are listed in the local currency and are subject to change
                            without notice. Payment methods accepted include credit/debit cards
                            and other specified options. You agree to pay all charges incurred in
                            connection with your order.
                        </p>
                    </section>

                    {/* Shipping & Returns */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Shipping & Returns
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            We aim to ship orders promptly. Shipping times may vary. Please
                            review our Shipping Policy for details. Our Return Policy outlines
                            the process for returning items, subject to certain conditions.
                        </p>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Intellectual Property
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            All content on Soukloop, including logos, text, and images, is
                            protected by intellectual property laws. You may not use, reproduce,
                            or distribute any content without our express permission.
                        </p>
                    </section>

                    {/* Liability Limitations */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Liability Limitations
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            Soukloop is not liable for any indirect, incidental, or consequential
                            damages arising from your use of our platform. Our liability is
                            limited to the purchase price of the products.
                        </p>
                    </section>

                    {/* Account Suspension or Termination */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Account Suspension or Termination
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            We reserve the right to suspend or terminate your account if you
                            violate these Terms & Conditions or engage in any harmful or illegal
                            activities.
                        </p>
                    </section>

                    {/* Governing Law */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Governing Law
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            These Terms & Conditions are governed by the laws of the jurisdiction
                            in which Soukloop operates. Any disputes will be resolved in
                            accordance with these laws.
                        </p>
                    </section>

                    {/* Contact Details */}
                    <section>
                        <h2 className="mb-3 text-lg font-bold text-gray-900 sm:text-xl">
                            Contact Details
                        </h2>
                        <p className="leading-relaxed text-gray-600">
                            For any questions or concerns regarding these Terms & Conditions,
                            please contact us at support@soukloop.com or call us at (555)
                            123-4567.
                        </p>
                    </section>

                    {/* Footer Links */}
                    <div className="mt-12 flex justify-between pt-8 text-sm font-medium">
                        <Link href="/privacy-policy" className="text-gray-600 hover:text-[#e0622c]">
                            Privacy Policy
                        </Link>
                        <span className="text-[#e0622c]">Terms of Service</span>
                        <Link href="/contact-us" className="text-gray-600 hover:text-[#e0622c]">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
}
