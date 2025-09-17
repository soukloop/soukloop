import { Star, ChevronDown } from "lucide-react";

export default function UserProfileSection() {
  return (
    <div className="bg-white">
      {/* Banner Image */}
      <div className="w-full h-[300px] bg-gray-100">
        <img
          src="/hero-banner.png"
          alt="Banner"
          className="w-full h-full"
        />
      </div>

      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Info Section */}
        <div className="flex flex-col items-start mb-8">
          {/* Profile Image */}
          <div className="w-32 h-32 rounded-full overflow-hidden mb-6 -mt-16 relative z-10 border-4 border-white shadow-lg">
            <img
              src="/images/new-profile-image.png"
              alt="User Profile"
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* User Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              User_Name_here
            </h1>
            <p className="text-gray-600 mb-2">05 Sold - Active Now</p>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-4 h-4 fill-orange-400 text-orange-400"
                  />
                ))}
              </div>
              <span className="text-gray-600 text-sm ml-2">(167)</span>
            </div>

            {/* Followers */}
            <div className="flex items-center gap-6 mb-6">
              <div>
                <span className="font-semibold text-gray-900">4</span>
                <span className="text-gray-600 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-semibold text-gray-900">12</span>
                <span className="text-gray-600 ml-1">Following</span>
              </div>
            </div>

            {/* Shop Name */}
            <div className="mb-2">
              <h2 className="font-semibold text-gray-900 mb-1">Shop_Name</h2>
              <p className="text-gray-600 text-sm">
                feel free to dm w any questions! & all prices negotiable
              </p>
            </div>
          </div>

          {/* Products Section */}
          <div className="w-full">
            {/* Product Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex space-x-8">
                <button className="pb-3 border-b-2 border-orange-500 text-orange-500 font-extrabold">
                  All Products
                </button>
                <button className="pb-3 text-gray-600 hover:text-gray-900 font-extrabold">
                  Sold
                </button>
              </div>
            </div>

            {/* Filter Dropdowns */}
            <div className="w-full md:w-[1248px] mb-8 grid grid-cols-2 gap-3 md:gap-4 md:flex md:h-[44px]">
              <div className="w-full md:w-[240px] h-10 md:h-[44px] flex items-center justify-between px-6 bg-gray-50 rounded-[50px] cursor-pointer hover:bg-gray-100 border border-gray-200">
                <span className="text-gray-700">Category</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-full md:w-[240px] h-10 md:h-[44px] flex items-center justify-between px-6 bg-gray-50 rounded-[50px] cursor-pointer hover:bg-gray-100 border border-gray-200">
                <span className="text-gray-700">Price</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-full md:w-[240px] h-10 md:h-[44px] flex items-center justify-between px-6 bg-gray-50 rounded-[50px] cursor-pointer hover:bg-gray-100 border border-gray-200">
                <span className="text-gray-700">Size</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-full md:w-[240px] h-10 md:h-[44px] flex items-center justify-between px-6 bg-gray-50 rounded-[50px] cursor-pointer hover:bg-gray-100 border border-gray-200">
                <span className="text-gray-700">Brand</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <div className="w-full md:w-[240px] h-10 md:h-[44px] flex items-center justify-between px-6 bg-gray-50 rounded-[50px] cursor-pointer hover:bg-gray-100 border border-gray-200">
                <span className="text-gray-700">Condition</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Start Selling Section */}
      <div className="bg-white py-2">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
          <div className="w-full max-w-[500px] min-h-[438px] bg-white rounded-2xl p-6 sm:p-8 text-center flex flex-col justify-center items-center shadow-sm border">
            {/* Sell Icon */}
            <div className="w-16 h-16 mb-6">
              <img
                src="/images/sell-icon.png"
                alt="Sell Icon"
                className="w-full h-full"
              />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Start Selling with
              <br />
              Soukloop
            </h2>

            {/* Description */}
            <p className="text-gray-600 mb-8 max-w-sm text-sm sm:text-base">
              Clear out your closet and turn your unused clothes into extra
              cash. With Soukloop, selling is simple, sustainable, and actually
              fun.
            </p>

            {/* Sell Now Button */}
            <button className="w-full sm:w-[436px] h-12 sm:h-[56px] bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full transition-colors">
              Sell Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
