import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";

export default function PointsSystemPage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Content */}
      <main className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* How to Use Points Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              How to Use Points
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
              At checkout, simply enter the number of coins you want to redeem.
              The discount will be applied instantly to your order total.
            </p>
          </div>

          {/* Discount Tiers */}
          <div className="max-w-[1248px] mx-auto mb-20">
            <div className="flex justify-between items-center gap-3 sm:gap-6 flex-wrap sm:flex-nowrap">
              {/* $10 OFF */}
              <div
                className="
        bg-white rounded-lg p-6 sm:p-8 text-center shadow-sm border border-gray-100
        flex flex-col justify-center
        w-full max-w-[400px] h-[140px] sm:h-[161px]
        flex-1
      "
              >
                <div className="flex items-center justify-center mx-auto mb-3">
                  <img src="/coin-icon.png" alt="Coin" className="w-8 h-8" />
                </div>
                <h3 className="text-[15px] sm:text-2xl font-bold text-gray-900 mb-1">
                  $10 OFF
                </h3>
                <p className="text-[10px] sm:text-base text-gray-600">
                  100 Points
                </p>
              </div>

              {/* $20 OFF */}
              <div
                className="
        bg-white rounded-lg p-6 sm:p-8 text-center shadow-sm border border-gray-100
        flex flex-col justify-center
        w-full max-w-[400px] h-[140px] sm:h-[161px]
        flex-1
      "
              >
                <div className="flex items-center justify-center mx-auto mb-3">
                  <img src="/coin-icon.png" alt="Coin" className="w-8 h-8" />
                </div>
                <h3 className="text-[15px] sm:text-2xl font-bold text-gray-900 mb-1">
                  $20 OFF
                </h3>
                <p className="text-[10px] sm:text-base text-gray-600">
                  200 Points
                </p>
              </div>

              {/* $30 OFF */}
              <div
                className="
        bg-white rounded-lg p-6 sm:p-8 text-center shadow-sm border border-gray-100
        flex flex-col justify-center
        w-full max-w-[400px] h-[140px] sm:h-[161px]
        flex-1
      "
              >
                <div className="flex items-center justify-center mx-auto mb-3">
                  <img src="/coin-icon.png" alt="Coin" className="w-8 h-8" />
                </div>
                <h3 className="text-[15px] sm:text-2xl font-bold text-gray-900 mb-1">
                  $30 OFF
                </h3>
                <p className="text-[10px] sm:text-base text-gray-600">
                  300 Points
                </p>
              </div>
            </div>
          </div>

          {/* Earn Points Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Earn Points
            </h2>
            <p className="text-gray-600 text-base max-w-3xl mx-auto leading-relaxed">
              Get rewarded every time you shop! Earn points on every purchase,
              product review, or referral — the more you engage, the more you
              save.
            </p>
          </div>

          {/* Earning Methods Grid */}
          <div className="max-w-[1248px] mx-auto mb-16">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Create an Account */}
              <div className="text-center border border-gray-200 rounded-lg p-6 w-full h-[140px] sm:h-[240px] flex flex-col justify-center">
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2">
                  Create an Account
                </h3>
                <p className="text-gray-600 mb-6 text-[10px] sm:text-base">
                  Earn 50 Points
                </p>
                <Button className="bg-gray-400 hover:bg-gray-500 text-white w-full max-w-[141px] h-7 sm:h-10 rounded-[20px] mx-auto text-xs sm:text-sm">
                  Collected
                </Button>
              </div>

              {/* Make a Purchase */}
              <div className="text-center border border-gray-200 rounded-lg p-6 w-full h-[140px] sm:h-[240px] flex flex-col justify-center">
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2">
                  Make a Purchase
                </h3>
                <p className="text-gray-600 mb-6 text-[10px] sm:text-base">
                  $1 = 1 Point
                </p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-full max-w-[141px] h-7 sm:h-10 rounded-[20px] mx-auto font-medium text-xs sm:text-sm">
                  Shop Now
                </Button>
              </div>

              {/* Follow Us on Instagram */}
              <div className="text-center border border-gray-200 rounded-lg p-6 w-full h-[140px] sm:h-[240px] flex flex-col justify-center">
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2">
                  Follow Us on Instagram
                </h3>
                <p className="text-gray-600 mb-6 text-[10px] sm:text-base">
                  Earn 50 Points
                </p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-full max-w-[141px] h-7 sm:h-10 rounded-[20px] mx-auto font-medium text-xs sm:text-sm">
                  Follow Now
                </Button>
              </div>

              {/* Make 4 Purchase */}
              <div className="text-center border border-gray-200 rounded-lg p-6 w-full h-[140px] sm:h-[240px] flex flex-col justify-center">
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2">
                  Make 4 Purchase
                </h3>
                <p className="text-gray-600 mb-6 text-[10px] sm:text-base">
                  Earn 100 Points
                </p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-full max-w-[141px] h-7 sm:h-10 rounded-[20px] mx-auto font-medium text-xs sm:text-sm">
                  Shop Now
                </Button>
              </div>

              {/* Leave a Review */}
              <div className="text-center border border-gray-200 rounded-lg p-6 w-full h-[140px] sm:h-[240px] flex flex-col justify-center">
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2">
                  Leave a Review
                </h3>
                <p className="text-gray-600 mb-6 text-[10px] sm:text-base">
                  Earn 25 Points
                </p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-full max-w-[141px] h-7 sm:h-10 rounded-[20px] mx-auto font-medium text-xs sm:text-sm">
                  Shop Now
                </Button>
              </div>

              {/* Follow Us on Facebook */}
              <div className="text-center border border-gray-200 rounded-lg p-6 w-full h-[140px] sm:h-[240px] flex flex-col justify-center">
                <h3 className="text-sm sm:text-xl font-semibold text-gray-900 mb-2">
                  Follow Us on Facebook
                </h3>
                <p className="text-gray-600 mb-6 text-[10px] sm:text-base">
                  Earn 50 Points
                </p>
                <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 w-full max-w-[141px] h-7 sm:h-10 rounded-[20px] mx-auto font-medium text-xs sm:text-sm">
                  Follow Now
                </Button>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 bg-white rounded-lg p-8 shadow-sm border border-gray-100">
            {/* Discount */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img src="/box.png" alt="Discount" className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Discount</h4>
                <p className="text-sm text-gray-600">Every week new sales</p>
              </div>
            </div>

            {/* Free Delivery */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src="/delivery-truck.png"
                  alt="Free Delivery"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Free Delivery
                </h4>
                <p className="text-sm text-gray-600">
                  100% Free for $100 or above order
                </p>
              </div>
            </div>

            {/* Great Support */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src="/24-hours.png"
                  alt="24/7 Support"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Great Support 24/7
                </h4>
                <p className="text-sm text-gray-600">
                  We care your experiences
                </p>
              </div>
            </div>

            {/* Secure Payment */}
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <img
                  src="/shield.png"
                  alt="Secure Payment"
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  Secure Payment
                </h4>
                <p className="text-sm text-gray-600">
                  100% Secure Payment Method
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <FooterSection />
    </div>
  );
}
