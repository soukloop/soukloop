import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function RewardsPointsPage() {
  const pointsData = [
    {
      date: "07/15/2024",
      action: "Purchase",
      points: "+250",
      status: "Completed",
      statusColor: "bg-green-500",
    },
    {
      date: "07/10/2024",
      action: "Review",
      points: "+50",
      status: "Completed",
      statusColor: "bg-green-500",
    },
    {
      date: "07/05/2024",
      action: "Referral",
      points: "+500",
      status: "Completed",
      statusColor: "bg-green-500",
    },
    {
      date: "06/20/2024",
      action: "Redemption",
      points: "-350",
      status: "Redeemed",
      statusColor: "bg-[#E87A3F]",
    },
    {
      date: "06/15/2024",
      action: "Purchase",
      points: "+700",
      status: "Completed",
      statusColor: "bg-green-500",
    },
  ];

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Reward Points
          </h1>
          <p className="text-gray-600">
            Earn points with every purchase and unlock exclusive rewards.
          </p>
        </div>

        {/* Points Display Container */}
        <div
          className="
            bg-white rounded-lg shadow-sm border border-gray-200
            p-4 sm:p-6 md:p-8 mb-8
            w-full lg:w-[1248px]
          "
        >
          {/* Top row: Icon, Points, and Earn Button */}
          <div className="flex flex-row sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Image
                src="/images/coin-icon.png"
                alt="Coin icon"
                width={48}
                height={48}
                className="w-8 h-8 sm:w-12 sm:h-12"
              />
              <h2 className="text-[14px] sm:text-2xl font-bold text-gray-900">
                1265 Points
              </h2>
            </div>
            <Button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-[20px] w-36 sm:w-[150px] h-11 sm:h-12">
              Earn Points
            </Button>
          </div>

          {/* Bottom section: Customer and Seller info */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                For Customer
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">•</span>
                <span className="text-gray-700 text-[11px]">
                  100 Points = $1
                </span>
              </div>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                For Seller
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-gray-700">•</span>
                <span className="text-gray-700 text-[11px]">
                  1000 Points = One Month (Free) Premium Plan
                </span>
              </div>
            </div>
          </div>

          {/* How it Works Link positioned at bottom left */}
          <div className="mt-4 sm:mt-[22px]">
            <a
              href="#"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              How it Works
            </a>
          </div>
        </div>

        {/* Points Activity Section */}
        <div className="bg-white rounded-lg shadow-sm w-full lg:w-[1248px]">
  <div className="p-4 sm:p-6">
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
      Points Activity
    </h2>
  </div>

  {/* Always a single-row layout per item on all screens */}
  <div className="w-full">
    <table className="w-full table-fixed">
      {/* Column widths keep everything in one row without scrolling */}
      <colgroup>
        <col className="w-[28%] sm:w-[25%] lg:w-[25%]" />
        <col className="w-[28%] sm:w-[25%] lg:w-[25%]" />
        <col className="w-[24%] sm:w-[25%] lg:w-[25%]" />
        <col className="w-[20%] sm:w-[25%] lg:w-[25%]" />
      </colgroup>

      <thead className="bg-gray-50">
        <tr>
          <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
            Date
          </th>
          <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
            Action
          </th>
          <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
            Points
          </th>
          <th className="px-2 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-200">
        {pointsData.map((item, index) => (
          <tr key={index} className="hover:bg-gray-50">
            {/* Date */}
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 truncate">
              {item.date}
            </td>

            {/* Action */}
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 truncate">
              {item.action}
            </td>

            {/* Points */}
            <td className="px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1 sm:gap-2 min-w-0">
                <Image
                  src="/images/table-coin-icon.png"
                  alt="Coin icon"
                  width={16}
                  height={16}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0"
                />
                <span
                  className={`font-medium truncate ${
                    item.points.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.points}
                </span>
              </div>
            </td>

            {/* Status */}
            <td className="px-2 sm:px-6 py-2 sm:py-4">
              <span
                className={`inline-flex items-center justify-center sm:w-[104px] md:w-[104px] lg:w-[104px] text-[8px] sm:text-[9px] font-medium text-white ${item.statusColor}`}
                style={{
                  width: "50px",      // slimmer on mobile to keep one line
                  height: "24px",
                  borderRadius: "12px",
                }}
              >
                {item.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Pagination (unchanged) */}
  <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
      <Button
        variant="outline"
        className="flex items-center space-x-2 text-gray-600 bg-transparent order-2 sm:order-1"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
      </Button>

      <div className="flex items-center space-x-2 order-1 sm:order-2">
        <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white w-8 h-8 rounded text-sm">
          1
        </Button>
        <Button variant="outline" className="w-8 h-8 rounded text-sm bg-transparent">
          2
        </Button>
        <Button variant="outline" className="w-8 h-8 rounded text-sm bg-transparent">
          3
        </Button>
        <span className="text-gray-500">...</span>
        <Button variant="outline" className="w-8 h-8 rounded text-sm bg-transparent">
          67
        </Button>
        <Button variant="outline" className="w-8 h-8 rounded text-sm bg-transparent">
          68
        </Button>
      </div>

      <Button
        variant="outline"
        className="flex items-center space-x-2 text-gray-600 bg-transparent order-3"
      >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </div>
</div>


      </div>
    </main>
  );
}
