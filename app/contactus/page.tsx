import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, Mail } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Contact Section */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Side - Contact Form */}
          <div className="max-w-md w-full">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact us</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Whether it's about your order, a product, or selling on Soukloop — we're just a message away.
            </p>

            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter Your Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter Your Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Type your message..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <input type="checkbox" id="terms" className="mt-1" />
                <label htmlFor="terms">
                  I accept the{" "}
                  <a href="#" className="text-[#E87A3F] hover:underline">
                    Terms of Use
                  </a>{" "}
                  &{" "}
                  <a href="#" className="text-[#E87A3F] hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                className="bg-[#E87A3F] hover:bg-[#d96d34] text-white font-medium w-full sm:w-[200px] h-14 rounded-full"
              >
                Submit
              </Button>
            </form>
          </div>

          {/* Right Side - Customer Service Image + Cards */}
          <div className="relative w-full">
            {/* Image */}
            <div className="rounded-2xl relative overflow-hidden w-full sm:w-[616px] h-[220px] sm:h-[388.5px]">
              <img
                src="/images/customer-service.png"
                alt="Customer service representative with headset"
                className="w-full h-full object-cover relative z-10"
              />
            </div>

            {/* Contact blocks */}
            <div className="mt-8 bg-gray-50 rounded-2xl p-6 w-full sm:w-[616px]">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm w-full sm:w-[568px] h-auto sm:h-[104.17px]">
                  <div className="w-12 h-12 bg-[#E87A3F] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600 text-sm underline">123 Sample St, Sydney NSW 2000 AU</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm w-full sm:w-[568px] h-auto sm:h-[104.17px]">
                  <div className="w-12 h-12 bg-[#E87A3F] rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Live Chat</h3>
                    <p className="text-gray-600 text-sm underline">+1 (555) 000-0000</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 flex items-center space-x-4 shadow-sm w-full sm:w-[568px] h-auto sm:h-[104.17px]">
                  <div className="w-12 h-12 bg-[#E87A3F] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600 text-sm underline">email@example.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="py-16 flex justify-center">
          <div className="bg-white rounded-xl shadow-md border border-gray-100 px-6 sm:px-8 py-8 w-full lg:w-[1248px] h-auto lg:h-[150px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-center">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/box-9itWrNFyNKZhRnrEFDqjoKRePUqwyS.png"
                    alt="Discount box icon"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Discount</h3>
                  <p className="text-gray-600 text-sm">Every week new sales</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Group%2051-1GioPHjg9haWY83FnsLayexoPucswv.png"
                    alt="Free delivery truck icon"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Free Delivery</h3>
                  <p className="text-gray-600 text-sm">100% Free for $100 or above order</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/24-hours-Zn0qgWUc2uThsT7x2Dg4fEBwMjksGB.png"
                    alt="24 hours support icon"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Great Support 24/7</h3>
                  <p className="text-gray-600 text-sm">We care your experiences</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/shield-Sv0OrLS2ZJeW18VJb3kgT79jEykFEp.png"
                    alt="Secure payment shield icon"
                    className="w-8 h-8"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
                  <p className="text-gray-600 text-sm">100% Secure Payment Method</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  )
}
