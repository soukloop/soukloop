"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus, X } from "lucide-react"


interface CheckoutPageProps {
  onNext: () => void
}

export default function CheckoutPage({ onNext }: CheckoutPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Checkout Header */}
      <div className="bg-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8">Check Out</h1>
          {/* <ProgressSteps currentStep={2} /> */}
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-8">

            {/* Billing Information */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Billing Information</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                      User name
                    </Label>
                    <Input id="firstName" placeholder="First name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                      Company Name (Optional)
                    </Label>
                    <Input id="lastName" placeholder="Last name" className="mt-1" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                    Address
                  </Label>
                  <Input id="address" className="mt-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                      Region/State
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                      City
                    </Label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sf">San Francisco</SelectItem>
                        <SelectItem value="la">Los Angeles</SelectItem>
                        <SelectItem value="sd">San Diego</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-sm font-medium text-gray-700">
                      Zip Code
                    </Label>
                    <Input id="zipCode" className="mt-1" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <Input id="email" type="email" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <Input id="phone" className="mt-1" />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="differentAddress" className="rounded" />
                  <Label htmlFor="differentAddress" className="text-sm text-gray-600">
                    Ship into different address
                  </Label>
                </div>
              </div>
            </div>

            {/* Payment Option */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Payment Option</h2>

              <div className="border border-gray-200 rounded-lg p-6 mx-auto flex items-center justify-center w-full lg:w-[738px] lg:h-[144px]">
  <RadioGroup
    defaultValue="card"
    className="flex w-full items-stretch justify-center gap-4 sm:gap-6"
  >
    {/* Cash on Delivery */}
    <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-2 sm:gap-3">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CurrencyDollar-FtQFHmEaQtePHH4dsKV2gizcN4b9YO.png"
        alt="Cash on Delivery"
        className="w-10 h-10 sm:w-12 sm:h-12"
      />
      <Label htmlFor="cash" className="font-medium text-xs sm:text-sm leading-tight">
        Cash on Delivery
      </Label>
      <RadioGroupItem value="cash" id="cash" className="mt-1 sm:mt-2" />
    </div>

    {/* PayPal */}
    <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-2 sm:gap-3">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image%209-byroNcit4cQwRgjUe2O58o49qkeAhx.png"
        alt="PayPal"
        className="w-10 h-10 sm:w-12 sm:h-12"
      />
      <Label htmlFor="paypal" className="font-medium text-xs sm:text-sm leading-tight">
        Paypal
      </Label>
      <RadioGroupItem value="paypal" id="paypal" className="mt-1 sm:mt-2" />
    </div>

    {/* Debit/Credit Card */}
    <div className="flex-1 min-w-0 flex flex-col items-center text-center gap-2 sm:gap-3">
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CreditCard-FeshH2qIe5tLE2CuWZEnJfnkU4FIs7.png"
        alt="Credit Card"
        className="w-10 h-10 sm:w-12 sm:h-12"
      />
      <Label htmlFor="card" className="font-medium text-xs sm:text-sm leading-tight">
        Debit/Credit Card
      </Label>
      <RadioGroupItem
        value="card"
        id="card"
        className="mt-1 sm:mt-2 border-[#E87A3F] text-[#E87A3F]"
      />
    </div>
  </RadioGroup>
</div>


              {/* Card Details */}
              <div className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">
                    Name on Card
                  </Label>
                  <Input id="cardName" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                    Card Number
                  </Label>
                  <Input id="cardNumber" className="mt-1" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expireDate" className="text-sm font-medium text-gray-700">
                      Expire Date
                    </Label>
                    <Input id="expireDate" placeholder="DD/YY" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="cvc" className="text-sm font-medium text-gray-700">
                      CVC
                    </Label>
                    <Input id="cvc" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Additional Information</h2>
              <div>
                <Label htmlFor="orderNotes" className="text-sm font-medium text-gray-700">
                  Order Notes (Optional)
                </Label>
                <Textarea
                  id="orderNotes"
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  className="mt-1 min-h-[100px]"
                />
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={onNext}
              className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-lg font-medium rounded-[80px] mx-auto block w-full sm:w-[480px] h-[56px]"
            >
              Place Order
            </Button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">Order summary</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src="/premium-pink-leather-bag.png"
                        alt="Premium Leather Bag"
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        1
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">A timeless striped design meets...</h4>
                      <p className="text-[#E87A3F] text-sm">$39.99</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent">
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm">5</span>
                      <Button variant="outline" size="icon" className="h-6 w-6 bg-transparent">
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex flex-col sm:flex-row sm:space-x-2 mb-6 space-y-2 sm:space-y-0">
                <Input placeholder="Input" className="h-[52px] w-full sm:w-[258px]" />
                <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white sm:w-[95px] w-full h-[52px] rounded-lg">
                  Apply
                </Button>
              </div>

              {/* Discount */}
              <div className="flex justify-between items-center mb-4 text-sm">
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-[#008080] rounded-full mr-2"></span>
                  JenkateMW
                </span>
                <span className="text-[#E87A3F]">-$25.00 [Remove]</span>
              </div>

              {/* Summary */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span className="font-medium">$99.00</span>
                </div>
                <div className="flex justify-between text-xl font-semibold pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>$234.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
