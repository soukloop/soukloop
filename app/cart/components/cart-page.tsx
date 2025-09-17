"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import ProgressSteps from "./progress-steps"

interface CartPageProps {
  onNext: () => void
}

export default function CartPage({ onNext }: CartPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Header */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
           {/* <ProgressSteps currentStep={1} /> */}

          <h1 className="text-4xl font-bold text-center mb-8">Cart</h1>
          {/* <ProgressSteps currentStep={1} /> */}
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6">
              {/* Table Header (hidden on mobile) */}
              <div className="hidden md:grid grid-cols-4 gap-4 pb-4 border-b border-gray-200 text-sm font-medium text-gray-600">
                <div>Product</div>
                <div className="text-center">Quantity</div>
                <div className="text-center">Price</div>
                <div className="text-center">Subtotal</div>
              </div>

              {/* Cart Items */}
              <div className="space-y-6 mt-6">
                {/* Item 1 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center py-2 border-b md:border-b-0">
                  {/* Product */}
                  <div className="flex items-start space-x-4">
                    <img
                      src="/premium-brown-leather-bag.png"
                      alt="Premium Leather Bag"
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2">Premium Leather Bag</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">A timeless striped design...</p>
                      <Button variant="ghost" size="sm" className="text-[#E87A3F] p-0 w-24 h-8 font-normal">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-xs text-gray-500 mr-3">Qty</span>
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">5</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between md:block md:text-center">
                    <span className="md:hidden text-xs text-gray-500">Price</span>
                    <span className="font-medium">$19.00</span>
                  </div>

                  {/* Subtotal */}
                  <div className="flex items-center justify-between md:block md:text-center">
                    <span className="md:hidden text-xs text-gray-500">Subtotal</span>
                    <span className="font-medium">$38.00</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center py-2 border-b md:border-b-0">
                  <div className="flex items-start space-x-4">
                    <img
                      src="/premium-pink-leather-bag.png"
                      alt="Premium Leather Bag"
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2">Premium Leather Bag</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">A timeless striped design...</p>
                      <Button variant="ghost" size="sm" className="text-[#E87A3F] p-0 w-24 h-8 font-normal">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-xs text-gray-500 mr-3">Qty</span>
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">5</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:block md:text-center">
                    <span className="md:hidden text-xs text-gray-500">Price</span>
                    <span className="font-medium">$19.00</span>
                  </div>

                  <div className="flex items-center justify-between md:block md:text-center">
                    <span className="md:hidden text-xs text-gray-500">Subtotal</span>
                    <span className="font-medium">$38.00</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 items-center py-2">
                  <div className="flex items-start space-x-4">
                    <img
                      src="/premium-gray-leather-bag.png"
                      alt="Premium Leather Bag"
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-2">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2">Premium Leather Bag</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">A timeless striped design...</p>
                      <Button variant="ghost" size="sm" className="text-[#E87A3F] p-0 w-24 h-8 font-normal">
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-center">
                    <span className="md:hidden text-xs text-gray-500 mr-3">Qty</span>
                    <div className="flex items-center justify-center space-x-2">
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center">5</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:block md:text-center">
                    <span className="md:hidden text-xs text-gray-500">Price</span>
                    <span className="font-medium">$39.00</span>
                  </div>

                  <div className="flex items-center justify-between md:block md:text-center">
                    <span className="md:hidden text-xs text-gray-500">Subtotal</span>
                    <span className="font-medium">$39.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Cart summary</h2>

              {/* Shipping Options */}
              <RadioGroup defaultValue="free" className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 border border-[#E87A3F] rounded-lg bg-[#FEF3EC] w-full md:w-[365px] h-[52px]">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="free" id="free" className="border-[#E87A3F]" />
                    <Label htmlFor="free" className="font-medium">
                      Free shipping
                    </Label>
                  </div>
                  <span className="font-medium">$0.00</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg w-full md:w-[365px] h-[52px]">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="font-medium">
                      Express shipping
                    </Label>
                  </div>
                  <span className="font-medium">+$15.00</span>
                </div>

                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg w-full md:w-[365px] h-[52px]">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="pickup" id="pickup" />
                    <Label htmlFor="pickup" className="font-medium">
                      Pick Up
                    </Label>
                  </div>
                  <span className="font-medium">%21.00</span>
                </div>
              </RadioGroup>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium">$1234.00</span>
                </div>
                <div className="flex justify-between text-xl font-semibold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>$1345.00</span>
                </div>
              </div>

              <Button
                onClick={onNext}
                className="w-full md:w-[365px] h-[52px] bg-[#E87A3F] hover:bg-[#d96d34] text-white text-lg font-medium rounded-lg mx-auto block"
              >
                Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
