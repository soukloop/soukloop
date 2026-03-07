"use client";

import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";

export default function BoostPricingPage() {
  const { profile } = useProfile({ skipAddresses: true });
  const isSeller = profile?.user?.role === "SELLER";

  const packages = [
    {
      id: '3_DAYS',
      days: 3,
      label: 'Quick Boost',
      price: '$2.99',
      description: 'Perfect for weekend sales or clearing out specific inventory items quickly.',
      features: [
        'Appears at the top of search',
        'Featured badge included',
        '3 full days of visibility',
      ],
      color: 'from-blue-400 to-indigo-500',
      buttonProps: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
    },
    {
      id: '7_DAYS',
      days: 7,
      label: 'Weekly Spotlight',
      price: '$5.99',
      description: 'Our most popular option. Get consistent, week-long visibility for your best items.',
      features: [
        'Appears at the top of search',
        'Featured badge included',
        '7 full days of visibility',
        'Optimal engagement window',
      ],
      popular: true,
      color: 'from-orange-400 to-amber-500',
      buttonProps: 'bg-[#E87A3F] text-white hover:bg-[#d66b33] shadow-md shadow-orange-200'
    },
    {
      id: '15_DAYS',
      days: 15,
      label: 'Maximum Reach',
      price: '$9.99',
      description: 'Best value for high-margin items that need sustained exposure to find the right buyer.',
      features: [
        'Appears at the top of search',
        'Featured badge included',
        '15 full days of visibility',
        'Highest return on investment',
      ],
      color: 'from-emerald-400 to-teal-500',
      buttonProps: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
    }
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50 font-sans">
      <EcommerceHeader />

      <main className="flex-1 pt-24 pb-16 sm:pt-32 sm:pb-24">
        {/* Hero Section */}
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 mb-6 border border-orange-200 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Introducing Product Boosts</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-6">
            Get Your Products <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Noticed Faster</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 leading-relaxed mb-10">
            Stand out from the crowd. Boosted products appear at the very top of search results with a special featured badge, driving more views and sales to your listings.
          </p>
        </div>

        {/* Benefits Section */}
        <div className="mx-auto max-w-5xl px-4 mb-16 sm:mb-24 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-orange-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-4 shadow-sm">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">More Views, More Sales</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Boosted items receive up to 5x more impressions than standard listings.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-amber-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 mb-4 shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Featured Badge</h3>
              <p className="text-sm text-gray-500 leading-relaxed">Your product will stand out with a dedicated badge that builds buyer trust.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md hover:border-green-100">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4 shadow-sm">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Pay Per Listing</h3>
              <p className="text-sm text-gray-500 leading-relaxed">No expensive monthly subscriptions. Only pay to boost the specific products you choose.</p>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3 lg:gap-12 items-start max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col bg-white rounded-3xl p-8 shadow-sm border-2 transition-transform hover:-translate-y-1 hover:shadow-lg ${pkg.popular ? 'border-[#E87A3F] shadow-xl shadow-orange-100/50 scale-105 z-10' : 'border-gray-100'
                  }`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-gradient-to-r from-[#E87A3F] to-amber-500 text-white text-xs font-bold uppercase tracking-wider py-1.5 px-4 rounded-full shadow-md">
                      Most Popular Choice
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.label}</h3>
                  <p className="text-sm text-gray-500 h-10">{pkg.description}</p>
                </div>

                <div className="mb-6 flex items-baseline text-5xl font-extrabold text-gray-900">
                  {pkg.price}
                </div>

                <ul className="mb-8 space-y-4 flex-1">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <CheckCircle2 className={`h-5 w-5 shrink-0 mr-3 ${pkg.popular ? 'text-[#E87A3F]' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href={isSeller ? "/seller/manage-listings" : "/become-a-seller"} className="w-full mt-auto">
                  <Button className={`w-full py-6 text-sm font-bold uppercase tracking-wide rounded-xl ${pkg.buttonProps}`}>
                    {isSeller ? 'Boost a Product Now' : 'Become a Seller First'}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mx-auto max-w-4xl px-4 mt-24 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to accelerate your sales?</h2>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">You can select a Boost Package during product creation or apply it anytime from your Seller Dashboard.</p>
          <Link href={isSeller ? "/seller/post-new-product" : "/signup"}>
            <Button className="bg-gray-900 text-white hover:bg-gray-800 rounded-full px-8 py-6 text-base font-semibold transition-all hover:scale-105 active:scale-95 shadow-md group">
              {isSeller ? 'Create a New Listing' : 'Get Started'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
