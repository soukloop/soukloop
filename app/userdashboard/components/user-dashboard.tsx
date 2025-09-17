import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown } from "lucide-react"

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-black mb-8 self-start w-full max-w-[1248px] lg:ml-14">
          User Dashboard
        </h1>

        {/* Stats Cards */}
        <div className="w-full max-w-[1248px] lg:h-[161px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* Total Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-gray-600 text-sm mb-1">Total Order</p>
              <p className="text-3xl font-bold text-black mb-2">54</p>
              <div className="flex items-center">
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500 text-sm">4.3% Down from yesterday</span>
              </div>
            </div>
            <div>
              <img src="/icons/total-orders.png" alt="Total Orders" className="w-12 h-12" />
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-gray-600 text-sm mb-1">Pending Orders</p>
              <p className="text-3xl font-bold text-black mb-2">02</p>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-teal-500 mr-1" />
                <span className="text-teal-500 text-sm">1.8% Up from yesterday</span>
              </div>
            </div>
            <div>
              <img src="/icons/pending-orders.png" alt="Pending Orders" className="w-12 h-12" />
            </div>
          </div>

          {/* Spent on Purchase */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 flex items-center justify-between">
            <div className="flex flex-col">
              <p className="text-gray-600 text-sm mb-1">Spent on Purchase</p>
              <p className="text-3xl font-bold text-black mb-2">$12,00</p>
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-teal-500 mr-1" />
                <span className="text-teal-500 text-sm">1.3% Up from past week</span>
              </div>
            </div>
            <div>
              <img src="/icons/spent-purchase.png" alt="Spent on Purchase" className="w-12 h-12" />
            </div>
          </div>
        </div>

        {/* Account Info and Billing Address */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8 w-full max-w-[1248px]">
          {/* Account Info */}
          <div className="w-full lg:w-[612px] lg:h-[242px] bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-full lg:w-[612px] h-[52px] bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
              <h2 className="text-sm font-medium text-gray-700 tracking-wide">ACCOUNT INFO</h2>
              <Button variant="ghost" className="text-[#E87A3F] hover:text-[#d96d34] p-0 h-auto flex items-center">
                <span className="mr-1 text-sm">Edit</span>
                <img src="/icons/edit-icon.png" alt="Edit" className="w-3 h-3" />
              </Button>
            </div>
            <div className="p-6 lg:h-[190px]">
              <div className="flex items-start space-x-4 mb-6">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="/user-profile.png" alt="User" />
                  <AvatarFallback>UN</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-black text-base">User Name</h3>
                  <p className="text-gray-500 text-sm mt-1">Location</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm">
                  <span className="text-black font-medium">Email: </span>
                  <span className="text-gray-600">info@gmail.com</span>
                </div>
                <div className="text-sm">
                  <span className="text-black font-medium">Shop name: </span>
                  <span className="text-gray-600">online clothing</span>
                </div>
                <div className="text-sm">
                  <span className="text-black font-medium">Phone: </span>
                  <span className="text-gray-600">+44-1223-1544</span>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div className="w-full lg:w-[612px] lg:h-[242px] bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="w-full lg:w-[612px] h-[52px] bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
              <h2 className="text-sm font-medium text-gray-700 tracking-wide">BILLING ADDRESS</h2>
              <Button variant="ghost" className="text-[#E87A3F] hover:text-[#d96d34] p-0 h-auto flex items-center">
                <span className="mr-1 text-sm">Edit</span>
                <img src="/icons/edit-icon.png" alt="Edit" className="w-3 h-3" />
              </Button>
            </div>
            <div className="p-6 lg:h-[190px]">
              <div className="space-y-2">
                <div>
                  <span className="text-black font-medium">USER NAME</span>
                </div>
                <div className="text-gray-600 text-sm">
                  Westfield Grove, Ward No. 07, Lane No. 22/B, House No. 548A, Flat No. 3C, Kensington - 1945, United
                  Kingdom
                </div>
                <div className="mt-4">
                  <span className="text-black font-medium">Phone Number: </span>
                  <span className="text-gray-600">+44-1223-1544</span>
                </div>
                <div>
                  <span className="text-black font-medium">Email: </span>
                  <span className="text-gray-600">info@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Info */}
        <div className="w-full lg:w-[612px] lg:h-[174px] bg-white border border-gray-200 rounded-lg mb-8 overflow-hidden max-w-[1248px] self-start lg:ml-14">
          <div className="w-full lg:w-[612px] h-[52px] bg-gray-50 border-b border-gray-200 flex items-center justify-between px-6">
            <h2 className="text-sm font-medium text-gray-700 tracking-wide">CARD INFO</h2>
            <Button variant="ghost" className="text-[#E87A3F] hover:text-[#d96d34] p-0 h-auto flex items-center">
              <span className="mr-1 text-sm">Edit</span>
              <img src="/icons/edit-icon.png" alt="Edit" className="w-3 h-3" />
            </Button>
          </div>
          <div className="p-6 lg:h-[122px]">
            <div className="space-y-3">
              <div className="text-sm">
                <span className="text-black font-medium">Card Number: </span>
                <span className="text-gray-600">1234-5678-9102</span>
              </div>
              <div className="text-sm">
                <span className="text-black font-medium">Expire Date: </span>
                <span className="text-gray-600">03/28</span>
              </div>
              <div className="text-sm">
                <span className="text-black font-medium">CVV: </span>
                <span className="text-gray-600">723</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="w-full lg:w-[1248px] lg:h-[596px] bg-white border border-gray-200 rounded-lg overflow-hidden">
  {/* Header */}
  <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200">
    <h2 className="text-sm font-medium text-gray-700 tracking-wide">ORDER HISTORY</h2>
    <Button variant="ghost" className="text-[#E87A3F] hover:text-[#d96d34] p-0 h-auto flex items-center">
      <span className="mr-1 text-sm">View details</span>
      <span className="ml-1">→</span>
    </Button>
  </div>

  {/* Tabs */}
  <div className="flex flex-wrap gap-3 sm:gap-6 px-4 sm:px-6 border-b border-gray-200">
    <button className="pb-3 pt-4 text-black border-b-2 border-[#E87A3F] font-medium">
      All Order
    </button>
    <button className="pb-3 pt-4 text-gray-600 hover:text-black">To ship</button>
    <button className="pb-3 pt-4 text-gray-600 hover:text-black">Delivered</button>
    <button className="pb-3 pt-4 text-gray-600 hover:text-black">Reviews</button>
  </div>

  {/* Table Header (visible only ≥640px) */}
  <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
    <div className="text-sm font-medium text-gray-600">Number ID</div>
    <div className="text-sm font-medium text-gray-600">Dates</div>
    <div className="text-sm font-medium text-gray-600">Status</div>
    <div className="text-sm font-medium text-gray-600">Price</div>
  </div>

  {/* Rows */}
  <div className="px-4 sm:px-6">
    {[
      { id: "#3456_768", date: "October 17, 2023", status: "To_Ship", statusClass: "text-[#E87A3F]", price: "$1234.00" },
      { id: "#3456_769", date: "October 17, 2023", status: "Delivered", statusClass: "text-green-500", price: "$1234.00" },
      { id: "#3456_980", date: "October 11, 2023", status: "Delivered", statusClass: "text-green-500", price: "$345.00" },
      { id: "#3456_120", date: "August 24, 2023", status: "Delivered", statusClass: "text-green-500", price: "$2345.00" },
      { id: "#3456_030", date: "August 12, 2023", status: "Delivered", statusClass: "text-green-500", price: "$845.00" },
    ].map((item, i) => (
      <div key={i} className="py-4 border-b border-gray-100 last:border-0">
        {/* Desktop row */}
        <div className="hidden sm:grid grid-cols-4 gap-4">
          <div className="text-black font-medium">{item.id}</div>
          <div className="text-gray-600">{item.date}</div>
          <div className={`${item.statusClass} font-medium`}>{item.status}</div>
          <div className="text-black font-medium">{item.price}</div>
        </div>

        {/* Mobile row (stacked/shrinked) */}
        <div className="flex flex-col space-y-2 sm:hidden text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Number ID</span>
            <span className="text-black font-medium">{item.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date</span>
            <span className="text-gray-900">{item.date}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status</span>
            <span className={`${item.statusClass} font-medium`}>{item.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Price</span>
            <span className="text-black font-medium">{item.price}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>



      </div>
    </div>
  )
}
