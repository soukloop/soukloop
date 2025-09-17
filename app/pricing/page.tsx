import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Pricing Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-[100px]">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Find Your Perfect Plan
          </h1>
          <p className="sm:text-lg text-base text-gray-600 max-w-2xl mx-auto mb-8">
            Discover the ideal plan to fuel your business growth. Our pricing
            options are carefully crafted to cater to businesses.
          </p>

          {/* Plan Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div
              className="bg-gray-100 flex items-center rounded-[14px] p-1"
              style={{
                width: "256px",
                height: "65px",
              }}
            >
              <span className="text-lg font-medium text-gray-700 px-4 flex-1 text-center">
                Buyer
              </span>
              <div className="relative">
                <Button
                  className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-lg font-medium relative"
                  style={{
                    width: "120px",
                    height: "49px",
                    borderRadius: "12px",
                  }}
                >
                  Seller
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs px-2 py-0.5 rounded-md font-medium">
                    20% off
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto px-4 lg:px-0 lg:mr-56">
          {/* Basic Plan */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Basic Plan
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">Free</span>
                <span className="text-gray-600">per month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Limited Product Listings</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Basic Order Management</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">Standard Seller Support</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="w-full lg:w-[420px] h-12 lg:h-[57px] text-lg font-medium border-gray-300 hover:bg-gray-50 bg-transparent rounded-[12px]"
            >
              Get Started
            </Button>
          </div>

          {/* Premium Plan */}
          <div
            className="relative w-full lg:w-[708px] h-auto lg:h-[860px] rounded-[20px] p-8 text-white overflow-hidden mx-auto"
            style={{
              background: "#E0622C",
              border: "1px solid rgba(232, 232, 232, 0.2)",
              boxShadow:
                "0px 244px 98px rgba(224, 98, 44, 0.01), 0px 137px 82px rgba(224, 98, 44, 0.05), 0px 61px 61px rgba(224, 98, 44, 0.09), 0px 15px 34px rgba(224, 98, 44, 0.1)",
            }}
          >
            <div className="absolute top-8 right-0 w-full h-44 sm:h-56 lg:h-[280px] overflow-hidden rounded-t-[20px]">
              <img
                src="/images/premium-women-new.png"
                alt="Two women smiling"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 h-full flex flex-col">
              {/* Spacer to push below image */}
              <div className="h-44 sm:h-56 lg:h-[200px]" />

              {/* Bottom content section */}
              <div className="mt-auto">
                {/* Gem Icon */}
                <div className="mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <img
                      src="/images/gem-icon.png"
                      alt="Premium gem icon"
                      className="w-6 h-6"
                    />
                  </div>
                </div>

                {/* Plan Title and Description */}
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-2xl font-bold">Premium Plan</h3>
                    <span
                      className="text-white text-sm font-semibold border border-white rounded-lg flex items-center justify-center"
                      style={{
                        width: "79px",
                        height: "24px",
                        borderRadius: "8px",
                      }}
                    >
                      Best offer
                    </span>
                  </div>
                  <p className="text-white/90 mb-6 text-base">
                    Take Your Business to the Next Level with Premium Plan.
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="text-5xl font-bold">$100</span>
                    <span className="text-white/90 text-lg">per month</span>
                  </div>

                  {/* Divider line */}
                  <div className="w-full h-px bg-white/30 mb-8" />
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white">
                      Unlimited Product Listings
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white">
                      Free Shipping on Eligible Orders
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white">
                      Boosted Product Visibility
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white">In-Depth Sales Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-white flex-shrink-0" />
                    <span className="text-white">
                      Promote Listings with Free Credits
                    </span>
                  </li>
                </ul>

                {/* Get Started Button */}
                <Button className="w-full lg:w-[628px] h-12 lg:h-[61px] text-lg font-medium bg-white text-[#E87A3F] hover:bg-gray-100 rounded-[12px]">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="mt-10" style={{ backgroundColor: "#f9f9f9" }}>
        <FooterSection />
      </div>
    </div>
  );
}
