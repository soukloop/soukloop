"use client"

import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { useState } from "react"

export default function TrackOrderPage() {
  const [showResults, setShowResults] = useState(false)
  const [orderData, setOrderData] = useState({
    orderId: "",
    email: "",
  })

  const handleTrackOrder = () => setShowResults(true)
  const handleBackToForm = () => setShowResults(false)

  return (
    <div className="min-h-screen bg-white pb-[100px]">
      <EcommerceHeader />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        {/* Keep 1248px on desktop, fluid on smaller screens */}
        <div className="w-full max-w-[1248px] mx-auto">
          {!showResults ? (
            <>
              {/* Track Order Section */}
              <div className="h-auto lg:h-[176px]">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 lg:mb-4">
                  Track Order
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  You'll find this ID on your receipt and in the confirmation email we sent you.
                </p>
              </div>

              {/* Form Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
                {/* Order ID Input */}
                <div>
                  <label htmlFor="orderId" className="block text-sm font-medium text-black mb-2">
                    Order ID
                  </label>
                  <input
                    type="text"
                    id="orderId"
                    placeholder="ID..."
                    value={orderData.orderId}
                    onChange={(e) => setOrderData({ ...orderData, orderId: e.target.value })}
                    className="w-full md:w-[612px] h-11 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F] bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                </div>

                {/* Billing Email Input */}
                <div>
                  <label htmlFor="billingEmail" className="block text-sm font-medium text-black mb-2">
                    Billing Email
                  </label>
                  <input
                    type="email"
                    id="billingEmail"
                    placeholder="Email address"
                    value={orderData.email}
                    onChange={(e) => setOrderData({ ...orderData, email: e.target.value })}
                    className="w-full md:w-[612px] h-11 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F] bg-gray-50 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Track Order Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleTrackOrder}
                  className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-sm sm:text-base font-semibold rounded-lg flex items-center justify-center gap-2 w-full sm:w-[360px] h-12 sm:h-14"
                >
                  <span>TRACK ORDER</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Results Panel */}
              <div className="border border-gray-200 rounded-lg bg-white w-full lg:h-[956px]">
                <div className="border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
                  <button
                    onClick={handleBackToForm}
                    className="flex items-center text-gray-600 hover:text-gray-800 text-sm sm:text-base"
                  >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    <span className="font-medium">ORDER DETAILS</span>
                  </button>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 py-6">
                  {/* Order Summary */}
                  <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-black mb-1 sm:mb-2">#96459761</h1>
                        <p className="text-gray-600 text-sm sm:text-base">
                          3 Products • Order Placed in 17 Jan, 2025 at 7:32 PM
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <span className="text-2xl sm:text-3xl font-bold text-[#E87A3F]">$1199.00</span>
                      </div>
                    </div>
                  </div>

                  {/* Expected Arrival */}
                  <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base">
                    Order expected arrival <span className="font-semibold text-black">30 MAY, 2025</span>
                  </p>

                  {/* Progress Line */}
                  <div className="relative mb-10 sm:mb-12">
                    {/* Line wrapper keeps desktop width, fluid on smaller */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-300 rounded-full w-full max-w-[702px] h-2">
                      <div className="h-full bg-[#E87A3F] rounded-full w-1/3"></div>
                    </div>

                    {/* Steps */}
                    <div className="flex justify-between w-full max-w-[702px] mx-auto">
                      {/* Order Placed */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-[#E87A3F] rounded-full flex items-center justify-center relative z-10">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="mt-2 mb-2">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Notebook-cfu77dMfurOMfxZEMv9ggthXOfRNGu.png"
                            alt="Order Placed"
                            className="w-7 h-7 sm:w-8 sm:h-8"
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">Order Placed</span>
                      </div>

                      {/* Packaging */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 bg-[#E87A3F] rounded-full flex items-center justify-center relative z-10">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="mt-2 mb-2">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Package-mUViTX4Y5TdrYjObWpjHKyLbrmUpWT.png"
                            alt="Packaging"
                            className="w-7 h-7 sm:w-8 sm:h-8"
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">Packaging</span>
                      </div>

                      {/* On The Road */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 border-2 border-gray-300 bg-white rounded-full relative z-10" />
                        <div className="mt-2 mb-2">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Truck-wtWa1UGpJJFUDdl3AEfbXXj6xikWtZ.png"
                            alt="On The Road"
                            className="w-7 h-7 sm:w-8 sm:h-8 opacity-50"
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">On The Road</span>
                      </div>

                      {/* Delivered */}
                      <div className="flex flex-col items-center text-center">
                        <div className="w-8 h-8 border-2 border-gray-300 bg-white rounded-full relative z-10" />
                        <div className="mt-2 mb-2">
                          <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Handshake-e2WEFDI8dAmmGqUPLJUqDkscFs4j3q.png"
                            alt="Delivered"
                            className="w-7 h-7 sm:w-8 sm:h-8 opacity-50"
                          />
                        </div>
                        <span className="text-xs sm:text-sm text-gray-600">Delivered</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Activity */}
                  <div className="mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-black mb-4 sm:mb-6">Order Activity</h3>

                    <div className="space-y-5 sm:space-y-6">
                      {/* Activity Item 1 */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon-sHMLoRycd0GJFYMDujPFbgAB133t3g.png"
                          alt="Delivered"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                        />
                        <div>
                          <p className="text-black font-medium text-sm sm:text-base">
                            Your order has been delivered. Thank you for shopping at Soukloop!
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">25 May, 2025 at 7:32 PM</p>
                        </div>
                      </div>

                      {/* Activity Item 2 */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20%283%29-clofvlbN20UgFAbQhdYs08c92Lqpoy.png"
                          alt="Pickup"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                        />
                        <div>
                          <p className="text-black font-medium text-sm sm:text-base">
                            Our delivery man [name] Has picked-up your order for delivery.
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">25 May, 2025 at 7:32 PM</p>
                        </div>
                      </div>

                      {/* Activity Item 3 */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20%282%29-OgxBtCsfRfo2H0qj2S0IOFZrrfS49n.png"
                          alt="Hub"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                        />
                        <div>
                          <p className="text-black font-medium text-sm sm:text-base">
                            Your order has reached at last mile hub.
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">25 May, 2025 at 7:32 PM</p>
                        </div>
                      </div>

                      {/* Activity Item 4 */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20%284%29-t9GKw262La8ne4vZnAXYzDGJnnbb1e.png"
                          alt="On the way"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                        />
                        <div>
                          <p className="text-black font-medium text-sm sm:text-base">
                            Your order on the way to [last mile] hub.
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">25 May, 2025 at 7:32 PM</p>
                        </div>
                      </div>

                      {/* Activity Item 5 */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20%285%29-7dx7N2CiCfDbVqFWS8SsfmwH47Jlv2.png"
                          alt="Verified"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                        />
                        <div>
                          <p className="text-black font-medium text-sm sm:text-base">
                            Your order is successfully verified.
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">25 May, 2025 at 7:32 PM</p>
                        </div>
                      </div>

                      {/* Activity Item 6 */}
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <img
                          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Icon%20%286%29-fEDzbFI5xukKUGC4ueDjaTNz9kDTTJ.png"
                          alt="Confirmed"
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                        />
                        <div>
                          <p className="text-black font-medium text-sm sm:text-base">
                            Your order has been confirmed.
                          </p>
                          <p className="text-gray-500 text-xs sm:text-sm">25 May, 2025 at 7:32 PM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex flex-row sm:flex-row justify-end items-stretch sm:items-center gap-3 sm:gap-4 mt-6">
                <button
                  className="bg-orange-100 text-[#e8642c] font-medium text-[12px] w-full sm:w-[242px] h-12 sm:h-14 rounded-full"
                >
                  Marked as delivered
                </button>
                <Button
                  className="bg-[#e8642c] hover:bg-[#d96d34] text-white font-medium text-[12px] flex items-center justify-center gap-2 w-full sm:w-[242px] h-12 sm:h-14 rounded-full"
                >
                  <span>Leave a Rating</span>
                  <span className="text-xl leading-none">+</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>

      <FooterSection />
    </div>
  )
}
