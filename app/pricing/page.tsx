"use client";

import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Search,
  BadgeCheck,
  MousePointerClick,
} from "lucide-react";
import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";

const PACKAGES = [
  {
    id: "3_DAYS",
    days: 3,
    label: "Quick Boost",
    price: "$2.99",
    priceNote: "one-time",
    description: "Great for weekend sales or clearing specific items fast.",
    features: [
      "Top of search results",
      "Featured badge on listing",
      "3 full days of boosted visibility",
    ],
    accent: {
      border: "border-blue-200",
      badge: "text-blue-700 bg-blue-100",
      check: "text-blue-500",
    },
  },
  {
    id: "7_DAYS",
    days: 7,
    label: "Weekly Spotlight",
    price: "$5.99",
    priceNote: "one-time",
    description: "Our most popular pick. A full week of premium placement.",
    features: [
      "Top of search results",
      "Featured badge on listing",
      "7 full days of boosted visibility",
      "Optimal buyer engagement window",
    ],
    popular: true,
    accent: {
      border: "border-[#E87A3F]",
      badge: "text-white bg-gradient-to-r from-[#E87A3F] to-amber-500",
      check: "text-[#E87A3F]",
    },
  },
  {
    id: "15_DAYS",
    days: 15,
    label: "Maximum Reach",
    price: "$9.99",
    priceNote: "one-time",
    description: "Best value for high-margin items needing sustained exposure.",
    features: [
      "Top of search results",
      "Featured badge on listing",
      "15 full days of boosted visibility",
      "Highest return on investment",
    ],
    accent: {
      border: "border-emerald-200",
      badge: "text-emerald-700 bg-emerald-100",
      check: "text-emerald-500",
    },
  },
];

const HOW_IT_WORKS = [
  {
    icon: MousePointerClick,
    step: "1",
    title: "Post Your Product",
    description:
      "List your item on Soukloop. After publishing, select a Boost package directly.",
  },
  {
    icon: Zap,
    step: "2",
    title: "Activate Your Boost",
    description:
      "Choose 3, 7, or 15 days. Complete a simple one-time payment via Stripe.",
  },
  {
    icon: Search,
    step: "3",
    title: "Get Seen Instantly",
    description:
      "Your listing jumps to the top of search results with a Featured badge — immediately.",
  },
];

export default function BoostPricingPage() {
  const { profile } = useProfile({ skipAddresses: true });
  const role = profile?.user?.role;
  // Sellers + all admin variants get "Post a Product"; buyers/guests get "Become a Seller"
  const canPost = role && role !== "BUYER";

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gray-50 font-sans">
      <EcommerceHeader />

      <main className="flex-1 pt-24 pb-20 sm:pt-32 sm:pb-28">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8 mb-20 sm:mb-28">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6 border border-orange-200 shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Product Boost — Pay Once, Sell Faster</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl mb-5 leading-tight">
            Put Your Listing{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E87A3F] to-amber-500">
              At The Top
            </span>
          </h1>

          <p className="mx-auto max-w-xl text-lg text-gray-500 leading-relaxed">
            Boosted products appear at the very top of search with a{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md text-sm">
              <BadgeCheck className="h-3.5 w-3.5" /> Featured
            </span>{" "}
            badge — no subscription, just a simple one-time payment per
            listing.
          </p>
        </section>



        {/* ── Pricing Cards ────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-20 sm:mb-28">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
              Choose Your Boost
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Three simple, transparent packages. No recurring charges.
              Cancel anytime your product sells.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3 lg:gap-10 items-start max-w-5xl mx-auto">
            {PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative flex flex-col bg-white rounded-3xl p-8 border-2 transition-all hover:-translate-y-1 hover:shadow-xl
                  ${pkg.popular
                    ? `${pkg.accent.border} shadow-xl shadow-orange-100/60 scale-[1.03] z-10`
                    : `${pkg.accent.border} shadow-sm`
                  }`}
              >
                {/* Popular badge */}
                {pkg.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span
                      className={`${pkg.accent.badge} text-xs font-bold uppercase tracking-wider py-1.5 px-5 rounded-full shadow-md`}
                    >
                      Most Popular Choice
                    </span>
                  </div>
                )}

                {/* Duration pill */}
                <div className="mb-5">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${pkg.accent.badge}`}
                  >
                    <Zap className="h-3 w-3" />
                    {pkg.days} Days
                  </span>
                </div>

                {/* Label + description */}
                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                    {pkg.label}
                  </h3>
                  <p className="text-sm text-gray-500 min-h-[2.5rem] leading-relaxed">
                    {pkg.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-7 flex items-end gap-1.5">
                  <span className="text-5xl font-black text-gray-900 leading-none">
                    {pkg.price}
                  </span>
                  <span className="text-sm text-gray-400 mb-1">
                    {pkg.priceNote}
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2
                        className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${pkg.accent.check}`}
                      />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────────── */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mb-24 sm:mb-32">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-3">
              How It Works
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              From listing to top-of-search in three easy steps.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {HOW_IT_WORKS.map(({ icon: Icon, step, title, description }) => (
              <div
                key={step}
                className="relative flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {/* Step number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white text-xs font-black shadow-md">
                  {step}
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-orange-600 mb-5 mt-2 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Smart Bottom CTA ─────────────────────────────── */}
        <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <Link href={canPost ? "/seller/post-new-product" : "/become-a-seller"}>
            <Button className="bg-gradient-to-r from-[#E87A3F] to-amber-500 hover:from-[#d96d34] hover:to-amber-600 text-white rounded-full px-9 py-6 text-base font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-200 group">
              {canPost ? "Post a Product" : "Become a Seller"}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}
