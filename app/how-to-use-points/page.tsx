import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingBag, Store, Star, Facebook, Instagram, Truck, ShieldCheck, Headphones, Tag } from "lucide-react";

export default function PointsSystemPage() {
  return (
    <div className="min-h-screen bg-white sm:mt-[-9rem] mt-[-6.2rem]">
      <EcommerceHeader />

      <main className="py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">

          {/* Hero Section */}
          <div className="mb-12 sm:mb-20 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center p-3 mb-6 bg-orange-50 rounded-full">
              <Coins className="w-8 h-8 text-[#E87A3F]" />
            </div>
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight md:text-5xl">
              Unlock Rewards as You Shop
            </h1>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed px-4">
              Our rewards program is designed to give back. Earn points for every action you take and redeem them for direct discounts on your future orders.
            </p>
          </div>

          {/* 1. Value / Redemption Tiers - Compact Horizontal Row */}
          <div className="mb-16 sm:mb-24 px-2 sm:px-0">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Redeem Your Points</h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                You can get a massive of almost $1 for the exchange of just 100 points.
              </p>
            </div>

            {/* Horizontal Row (Grid 3 cols) - No Scroll */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-4xl mx-auto">
              {[
                { amount: 10, points: 100, label: "$10" },
                { amount: 20, points: 200, label: "$20" },
                { amount: 30, points: 300, label: "$30" },
              ].map((tier) => (
                <div key={tier.amount} className="group relative bg-white border border-gray-200 rounded-xl p-4 sm:p-8 text-center hover:shadow-lg transition-all hover:border-[#E87A3F]/30 cursor-default flex flex-col justify-center items-center">
                  <div className="absolute top-0 right-0 p-2 sm:p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Tag className="w-12 h-12 sm:w-24 sm:h-24 text-[#E87A3F]" />
                  </div>

                  <div className="relative z-10 w-full">
                    <h3 className="text-xl sm:text-4xl font-black text-gray-900 mb-2">{tier.label} <span className="text-base sm:text-2xl">OFF</span></h3>
                    <div className="inline-block bg-orange-50 text-[#E87A3F] font-bold px-2 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-sm">
                      {tier.points} Points Needed
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Subtext beneath the row */}
            <div className="text-center mt-6">
              <p className="text-gray-500 text-xs sm:text-sm">
                Apply instantly at checkout. No minimum spend required.
              </p>
            </div>
          </div>

          {/* 2. Ways to Earn - 2 Boxes per row on mobile */}
          <div className="mb-16 sm:mb-24">
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="text-2xl font-bold text-gray-900">How to Earn</h2>
              <p className="text-gray-500 mt-2 text-sm sm:text-base">Collecting points is easy. Here's how to stack them up.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {[
                {
                  icon: Store,
                  title: "Become a Seller",
                  points: "50 Pts",
                  desc: "Join our community to start earning immediately.",
                  style: "bg-orange-50 text-[#E87A3F]"
                },
                {
                  icon: ShoppingBag,
                  title: "Make a Purchase",
                  points: "1 point = 1 dollar",
                  desc: "Earn 1 point for every single dollar you spend.",
                  style: "bg-orange-50 text-[#E87A3F]"
                },
                {
                  icon: ShoppingBag,
                  title: "4th Purchase Bonus",
                  points: "100 Pts",
                  desc: "Get a special bonus reward on your 4th order.",
                  style: "bg-orange-50 text-[#E87A3F]"
                },
                {
                  icon: Star,
                  title: "Leave a Review",
                  points: "25 Pts",
                  desc: "Share your thoughts on a product you purchased.",
                  style: "bg-yellow-50 text-yellow-500 fill-yellow-500"
                },
                {
                  icon: Instagram,
                  title: "Follow on Instagram",
                  points: "50 Pts",
                  desc: "Connect with us on social media for updates.",
                  style: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white"
                },
                {
                  icon: Facebook,
                  title: "Follow on Facebook",
                  points: "50 Pts",
                  desc: "Join our Facebook page for exclusive deals.",
                  style: "bg-[#1877F2] text-white"
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-4 sm:p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow h-full flex flex-col justify-between">
                  <div className="flex flex-col items-center">
                    <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${item.style}`}>
                      <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.title.includes("Review") ? "fill-current" : ""}`} />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-[#E87A3F] font-bold text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-tight">{item.points}</p>
                  </div>
                  <p className="text-[10px] sm:text-sm text-gray-500 leading-relaxed hidden sm:block">{item.desc}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed sm:hidden line-clamp-2">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Features Grid (Footer-like) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
            {[
              { icon: Tag, title: "Weekly Discounts", desc: "New deals every Monday." },
              { icon: Truck, title: "Free Delivery", desc: "On orders over $100." },
              { icon: Headphones, title: "24/7 Support", desc: "We're here to help anytime." },
              { icon: ShieldCheck, title: "Secure Payment", desc: "100% encrypted transactions." },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 text-center sm:text-left">
                <div className="flex-shrink-0 h-10 w-10 bg-gray-50 text-gray-900 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{feature.title}</h4>
                  <p className="text-gray-500 text-xs mt-0.5">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>

      <FooterSection />
    </div>
  );
}
