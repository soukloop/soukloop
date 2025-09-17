import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

export default function SellerProfile() {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner Image */}
      {/* <div className="w-full h-[400px] md:h-[400px] bg-gray-100">
        <img src="/hero-banner.png" alt="Banner" className="w-full h-full object-cover" />
      </div> */}
        {/* On mobile: stack vertically, on larger keep row */}
        <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-6 sm:space-y-0">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 -mt-16 relative z-10 border-4 border-white shadow-lg">
            <img
              src="/images/new-profile-image.png"
              alt="User Profile"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Profile Info */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seller_Name_here</h2>

            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600 mb-2 space-y-1 sm:space-y-0">
              <span>05 sold</span>
              <span className="hidden sm:inline">•</span>
              <span>Active today</span>
            </div>

            <div className="flex sm:justify-start space-x-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-gray-600 ml-2">(62)</span>
            </div>

            <div className="flex sm:justify-start items-center space-x-6 text-sm text-gray-600 mb-4">
              <span>
                <strong className="text-gray-900">4</strong> Followers
              </span>
              <span>
                <strong className="text-gray-900">12</strong> Following
              </span>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-1">Seller_Name_Shop</h3>
              <p className="text-gray-600 text-sm">
                feel free to dm w any questions! & all prices negotiable
              </p>
            </div>

            {/* Buttons stack on mobile */}
            <div className="flex flex-row sm:flex-row gap-3 sm:space-x-3">
              <Button className="bg-[#e0622c] hover:bg-[#d96d34] text-white rounded-lg w-full sm:w-[297px] h-12 sm:h-14">
                Follow
              </Button>
              <Button
                variant="outline"
                className="border-[#e0622c] text-[#e0622c] hover:bg-[#FEF3EC] rounded-lg bg-[#FEF3EC] w-full sm:w-[297px] h-12 sm:h-14"
              >
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
