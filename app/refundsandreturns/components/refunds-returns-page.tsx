"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Tag, Calendar } from "lucide-react"

export default function RefundsReturnsPage() {
  const [orderStatus, setOrderStatus] = useState("")

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Main Form (shows second on mobile, same place on desktop) */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Refunds & Returns</h1>
              <p className="text-gray-600 mb-8">We're here to make returns easy and stress-free.</p>

              <div className="space-y-6">
                {/* Order ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Order ID</label>
                  <Input
                    type="text"
                    placeholder="Enter your order ID"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F]"
                  />
                </div>

                {/* Email or Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email or Phone Number</label>
                  <Input
                    type="text"
                    placeholder="Enter your email or phone number"
                    className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F]"
                  />
                </div>

                {/* Item(s) being returned */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Item(s) being returned</label>
                  <Select>
                    <SelectTrigger className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F]">
                      <SelectValue placeholder="Select items" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="item1">Item 1</SelectItem>
                      <SelectItem value="item2">Item 2</SelectItem>
                      <SelectItem value="item3">Item 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reason for return */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Reason for return</label>
                  <Select>
                    <SelectTrigger className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F]">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defective">Defective item</SelectItem>
                      <SelectItem value="wrong-size">Wrong size</SelectItem>
                      <SelectItem value="not-as-described">Not as described</SelectItem>
                      <SelectItem value="changed-mind">Changed my mind</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Additional comments */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Additional comments (optional)</label>
                  <Textarea
                    placeholder="Please provide any additional details..."
                    className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F] resize-none"
                  />
                </div>

                {/* Upload Photo Section */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Upload a photo of the return item (optional)
                  </h3>
                  <p className="text-gray-600 mb-4">Drag and drop or click to upload</p>
                  <Button
                    variant="outline"
                    className="w-[84px] h-[40px] border-[#E87A3F] text-[#E87A3F] hover:bg-[#E87A3F] hover:text-white bg-transparent rounded-[20px]"
                  >
                    Upload
                  </Button>
                </div>

                {/* Submit Button */}
                <div className="pt-6 flex justify-end">
                  <Button className="w-[209px] h-[56px] bg-[#E87A3F] hover:bg-[#d96d34] text-white text-base font-medium rounded-[50px]">
                    Submit Return Request
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar (shows first on mobile, same place on desktop) */}
          <div className="space-y-8 order-1 lg:order-2">
            {/* Return Policy Summary */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Return Policy Summary</h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Calendar className="w-4 h-4 text-[#E87A3F]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">24-hr return timeframe</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Tag className="w-4 h-4 text-[#E87A3F]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Items must be unworn and with tags</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-[#E87A3F]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Refunds within 7-10 business days</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Check Return Status */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Check Return Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Order ID</label>
                  <Input
                    type="text"
                    placeholder="Enter your order ID"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E87A3F] focus:border-[#E87A3F]"
                  />
                </div>

                <div className="flex justify-end">
                  <Button className="w-[113px] h-[40px] bg-[#E87A3F] hover:bg-[#d96d34] text-white text-sm font-medium rounded-[20px]">
                    Check Status
                  </Button>
                </div>

                <div className="pt-2">
                  <p className="text-sm text-gray-600">Status: Pending</p>
                </div>
              </div>
            </div>
          </div>
          {/* /Right Column */}
        </div>
      </div>
    </div>
  )
}
