import { Button } from "@/components/ui/button"
// import ProgressSteps from "./progress-steps"

export default function OrderCompletePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Order Complete Header */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8">Complete!</h1>
          {/* <ProgressSteps currentStep={3} /> */}
        </div>
      </div>

      {/* Order Complete Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
  <div className="max-w-2xl mx-auto">
    {/* Card */}
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      {/* Thank You Message */}
      <div className="mb-12">
        <p className="text-xl text-gray-600 mb-4">Thank you! 🎉</p>
        <h2 className="text-3xl font-bold mb-8">
          Your order has been
          <br />
          received
        </h2>

        {/* Order Items */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          <div className="relative">
            <img
              src="/premium-brown-leather-bag.png"
              alt="Premium Leather Bag"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              2
            </div>
          </div>
          <div className="relative">
            <img
              src="/premium-gray-leather-bag.png"
              alt="Premium Leather Bag"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              2
            </div>
          </div>
          <div className="relative">
            <img
              src="/premium-pink-leather-bag.png"
              alt="Premium Leather Bag"
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              1
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-lg p-6 text-left max-w-md mx-auto shadow-sm">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Order code:</span>
              <div className="flex items-center">
                <span className="font-medium">#0123_45678</span>
                <Button variant="ghost" size="sm" className="ml-2 p-0 h-auto">
                  📋
                </Button>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">October 19, 2023</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium">$1,345.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment method:</span>
              <span className="font-medium">Credit Card</span>
            </div>
          </div>
        </div>

        {/* Purchase History + Shop More Buttons */}
        <div className="mt-16 flex flex-row sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white w-full sm:w-[340px] px-2 text-lg font-medium rounded-[80px]">
            Purchase history
          </Button>

          <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white w-full sm:w-[340px] px-2 text-lg font-medium rounded-[80px]">
            Shop More
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>

      </div>
    
  )
}
