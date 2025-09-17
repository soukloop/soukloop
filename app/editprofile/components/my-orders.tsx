"use client"

import { useState } from "react"

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState("All Order")

  const allOrders = [
    { id: "#3456_768", date: "October 17, 2023", status: "Delivered", price: "$1234.00" },
    { id: "#3456_980", date: "October 11, 2023", status: "Delivered", price: "$345.00" },
    { id: "#3456_030", date: "August 12, 2023", status: "Delivered", price: "$845.00" },
    { id: "#3456_030", date: "August 12, 2023", status: "Delivered", price: "$845.00" },
  ]

  const getFilteredOrders = () => {
    switch (activeTab) {
      case "To ship":
        return allOrders.filter((order) => order.status === "Pending")
      case "Delivered":
        return allOrders.filter((order) => order.status === "Delivered")
      case "Reviews":
        return allOrders.filter((order) => order.status === "Delivered")
      default:
        return allOrders
    }
  }

  const filteredOrders = getFilteredOrders()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 pb-16 sm:pb-20 md:pb-[250px] max-[400px]:px-2 max-[400px]:py-3">
        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Order Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto hide-scrollbar">
            <nav className="flex space-x-0 md:space-x-8 px-3 sm:px-4 md:px-6 min-w-max max-[400px]:px-2">
              {["All Order", "To ship", "Delivered", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 sm:py-4 px-3 sm:px-4 md:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap
                              max-[400px]:py-2.5 max-[400px]:px-2 max-[400px]:text-[11px]
                    ${
                      activeTab === tab
                        ? "border-[#E87A3F] text-[#E87A3F]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            {/* Desktop Table */}
            <table className="w-full hidden md:table">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "Reviews" ? "Reviews" : "Price"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {activeTab === "Reviews" ? (
                        <button className="text-[#E87A3F] hover:text-[#d6692f] font-medium flex items-center">
                          View review
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-gray-900 font-medium">{order.price}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Tablet (>=640 & <768) */}
            <table className="w-full hidden sm:table md:hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === "Reviews" ? "Reviews" : "Price"}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500 mt-1">{order.date}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      {activeTab === "Reviews" ? (
                        <button className="text-[#E87A3F] hover:text-[#d6692f] font-medium flex items-center">
                          View
                          <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      ) : (
                        <span className="text-gray-900 font-medium">{order.price}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards (<640px) */}
            <div className="sm:hidden">
              {filteredOrders.map((order, index) => (
                <div key={index} className="border-b border-gray-200 p-4 max-[400px]:p-3">
                  <div className="flex justify-between items-start mb-3 max-[400px]:mb-2">
                    <div className="text-base font-semibold text-gray-900 break-words max-[400px]:text-sm">
                      {order.id}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full flex-shrink-0
                                  max-[400px]:px-1.5 max-[400px]:text-[10px]
                        ${order.status === "Pending" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-3 max-[400px]:mb-2">
                    <div className="text-sm text-gray-600 max-[400px]:text-xs">Date:</div>
                    <div className="text-sm text-gray-900 max-[400px]:text-xs">{order.date}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 max-[400px]:text-xs">Price:</div>
                    <div className="text-base font-semibold text-gray-900 max-[400px]:text-sm">{order.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
