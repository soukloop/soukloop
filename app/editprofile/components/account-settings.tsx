"use client";

import { Edit, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import MyOrders from "./my-orders";
import { useState } from "react";

export default function AccountSettings() {
  const [activeSection, setActiveSection] = useState("edit-profile");
  const [isPrimaryPayment, setIsPrimaryPayment] = useState(false);

  const wishlistItems = [
    {
      id: 1,
      image: "/product-bag-1.png",
      title: "A timeless striped design meets tailored elegance...",
      originalPrice: "$199",
      currentPrice: "$99.9",
      inStock: true,
    },
    {
      id: 2,
      image: "/product-bag-2.png",
      title:
        "A timeless striped design meets tailored elegance A timeless striped design meets tailored elegance...",
      originalPrice: null,
      currentPrice: "$200.00",
      inStock: true,
    },
    {
      id: 3,
      image: "/product-bag-3.png",
      title: "A timeless striped design meets tailored elegance...",
      originalPrice: "$250.00",
      currentPrice: "$120.00",
      inStock: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Step Navigation */}
      <div className="bg-white py-4 md:py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`
    flex overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2
    md:flex-wrap md:items-center md:justify-center md:gap-4
    max-w-6xl mx-auto 
  `}
          >
            {/* Step 1 - Edit Profile */}
            <div
              className={`flex items-center rounded-2xl px-4 py-2 md:px-6 md:py-3 
                    w-[180px] md:w-[216.8px] h-16 md:h-20 flex-shrink-0 
                    snap-start cursor-pointer transition-colors ${
                      activeSection === "edit-profile"
                        ? "bg-[#FEF3EC] border border-[#E87A3F]"
                        : "bg-gray-100"
                    }`}
              onClick={() => setActiveSection("edit-profile")}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center 
                      text-xs md:text-sm font-semibold mr-2 md:mr-3 ${
                        activeSection === "edit-profile"
                          ? "bg-[#E87A3F] text-white"
                          : "bg-gray-400 text-white"
                      }`}
              >
                1
              </div>
              <span
                className={`font-medium text-sm md:text-base ${
                  activeSection === "edit-profile"
                    ? "text-[#E87A3F]"
                    : "text-gray-600"
                }`}
              >
                Edit Profile
              </span>
            </div>

            {/* Step 2 - My Orders */}
            <div
              className={`flex items-center rounded-2xl px-4 py-2 md:px-6 md:py-3 
                    w-[180px] md:w-[216.8px] h-16 md:h-20 flex-shrink-0 
                    snap-start cursor-pointer transition-colors ${
                      activeSection === "my-orders"
                        ? "bg-[#FEF3EC] border border-[#E87A3F]"
                        : "bg-gray-100"
                    }`}
              onClick={() => setActiveSection("my-orders")}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center 
                      text-xs md:text-sm font-semibold mr-2 md:mr-3 ${
                        activeSection === "my-orders"
                          ? "bg-[#E87A3F] text-white"
                          : "bg-gray-400 text-white"
                      }`}
              >
                2
              </div>
              <span
                className={`font-medium text-sm md:text-base ${
                  activeSection === "my-orders"
                    ? "text-[#E87A3F]"
                    : "text-gray-600"
                }`}
              >
                My Orders
              </span>
            </div>

            {/* Step 3 - Wishlist */}
            <div
              className={`flex items-center rounded-2xl px-4 py-2 md:px-6 md:py-3 
                    w-[180px] md:w-[216.8px] h-16 md:h-20 flex-shrink-0 
                    snap-start cursor-pointer transition-colors ${
                      activeSection === "wishlist"
                        ? "bg-[#FEF3EC] border border-[#E87A3F]"
                        : "bg-gray-100"
                    }`}
              onClick={() => setActiveSection("wishlist")}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center 
                      text-xs md:text-sm font-semibold mr-2 md:mr-3 ${
                        activeSection === "wishlist"
                          ? "bg-[#E87A3F] text-white"
                          : "bg-gray-400 text-white"
                      }`}
              >
                3
              </div>
              <span
                className={`font-medium text-sm md:text-base ${
                  activeSection === "wishlist"
                    ? "text-[#E87A3F]"
                    : "text-gray-600"
                }`}
              >
                Wishlist
              </span>
            </div>

            {/* Step 4 - Address Book */}
            <div
              className={`flex items-center rounded-2xl px-4 py-2 md:px-6 md:py-3 
                    w-[180px] md:w-[216.8px] h-16 md:h-20 flex-shrink-0 
                    snap-start cursor-pointer transition-colors ${
                      activeSection === "address-book"
                        ? "bg-[#FEF3EC] border border-[#E87A3F]"
                        : "bg-gray-100"
                    }`}
              onClick={() => setActiveSection("address-book")}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center 
                      text-xs md:text-sm font-semibold mr-2 md:mr-3 ${
                        activeSection === "address-book"
                          ? "bg-[#E87A3F] text-white"
                          : "bg-gray-400 text-white"
                      }`}
              >
                4
              </div>
              <span
                className={`font-medium text-sm md:text-base ${
                  activeSection === "address-book"
                    ? "text-[#E87A3F]"
                    : "text-gray-600"
                }`}
              >
                Address Book
              </span>
            </div>

            {/* Step 5 - Payment Methods */}
            <div
              className={`flex items-center rounded-2xl px-4 py-2 md:px-6 md:py-3 
                    w-[180px] md:w-[216.8px] h-16 md:h-20 flex-shrink-0 
                    snap-start cursor-pointer transition-colors ${
                      activeSection === "payment-methods"
                        ? "bg-[#FEF3EC] border border-[#E87A3F]"
                        : "bg-gray-100"
                    }`}
              onClick={() => setActiveSection("payment-methods")}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center 
                      text-xs md:text-sm font-semibold mr-2 md:mr-3 flex-shrink-0 ${
                        activeSection === "payment-methods"
                          ? "bg-[#E87A3F] text-white"
                          : "bg-gray-400 text-white"
                      }`}
              >
                5
              </div>
              <span
                className={`font-medium text-sm md:text-base whitespace-nowrap ${
                  activeSection === "payment-methods"
                    ? "text-[#E87A3F]"
                    : "text-gray-600"
                }`}
              >
                Payment Methods
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="py-6 md:py-8">
        {/* Profile Image - only show for Edit Profile section */}
        {activeSection === "edit-profile" && (
          <div className="flex justify-center mb-6 md:mb-8">
            <div className="relative">
              <div className="w-24 h-24 md:w-30 md:h-30 rounded-full overflow-hidden">
                <img
                  src="/profile-image.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-[#E87A3F] text-white rounded-full flex items-center justify-center hover:bg-[#d96d34] transition-colors">
                <Edit className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          </div>
        )}

        {activeSection === "edit-profile" && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8 w-full max-w-6xl h-auto md:h-[500px]">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                Billing Information
              </h2>
              <div className="space-y-4 md:space-y-6">
                {/* User Name and Company Name Row */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User name
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                      <Input
                        placeholder="First name"
                        className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                      />
                      <Input
                        placeholder="Last name"
                        className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                      />
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name{" "}
                      <span className="text-gray-400">(Optional)</span>
                    </label>
                    <Input className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]" />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <Input className="h-10 md:h-12 border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]" />
                </div>

                {/* Location Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                  {/* Country */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <Select>
                      <SelectTrigger className="w-full h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="us">United States</SelectItem>
                        <SelectItem value="ca">Canada</SelectItem>
                        <SelectItem value="uk">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Region/State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region/State
                    </label>
                    <Select>
                      <SelectTrigger className="w-full h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Select>
                      <SelectTrigger className="w-full h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="la">Los Angeles</SelectItem>
                        <SelectItem value="sf">San Francisco</SelectItem>
                        <SelectItem value="sd">San Diego</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Zip Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Zip Code
                    </label>
                    <Input
                      placeholder="Enter zip code"
                      className="w-full h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                    />
                  </div>
                </div>

                {/* Contact Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <Input
                      type="email"
                      className="h-10 md:h-12 border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      className="h-10 md:h-12 border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                    />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="mt-4 md:mt-6 mb-4 md:mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="different-address"
                      className="border-gray-300 data-[state=checked]:bg-[#E87A3F] data-[state=checked]:border-[#E87A3F]"
                    />
                    <label
                      htmlFor="different-address"
                      className="text-sm text-gray-600 cursor-pointer border-0 pr-0 pb-0 pt-0"
                    >
                      Ship into different address
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-6 md:mt-12">
                  <Button
                    variant="outline"
                    className="w-full sm:w-[200px] md:w-[297px] h-12 md:h-14 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#F5F1ED]"
                  >
                    Discard
                  </Button>
                  <Button className="w-full sm:w-[200px] md:w-[297px] h-12 md:h-14 rounded-lg bg-[#E87A3F] hover:bg-[#d96d34] text-white">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "address-book" && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8 w-full max-w-6xl h-auto md:h-[520px]">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                Shipping Address
              </h2>

              <div className="space-y-4 md:space-y-6">
                {/* Street Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    STREET ADDRESS <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Stress Address"
                    className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    COUNTRY <span className="text-red-500">*</span>
                  </label>
                  <Select>
                    <SelectTrigger className="w-full h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Town/City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    TOWN / CITY <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="Town / City"
                    className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                  />
                </div>

                {/* State and Zip Code Row */}
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      STATE
                    </label>
                    <Input
                      placeholder="State"
                      className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP CODE
                    </label>
                    <Input
                      placeholder="Zip Code"
                      className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                    />
                  </div>
                </div>

                {/* Save Address Checkbox */}
                <div className="mt-4 md:mt-6 mb-4 md:mb-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="save-address"
                      className="border-gray-300 data-[state=checked]:bg-[#E87A3F] data-[state=checked]:border-[#E87A3F]"
                    />
                    <label
                      htmlFor="save-address"
                      className="text-sm text-gray-600 cursor-pointer"
                    >
                      Save address details for next time (optional)
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 mt-6 md:mt-12">
                  <Button
                    variant="outline"
                    className="w-full sm:w-[200px] md:w-[297px] h-12 md:h-14 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#F5F1ED]"
                  >
                    Discard
                  </Button>
                  <Button className="w-full sm:w-[200px] md:w-[297px] h-12 md:h-14 rounded-lg bg-[#E87A3F] hover:bg-[#d96d34] text-white">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === "payment-methods" && (
          <>
            <div className="flex justify-center px-4 sm:px-6">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8 w-full max-w-6xl min-h-[500px] md:min-h-[700px]">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
                  Payment Option
                </h2>

                <div className="space-y-6 md:space-y-8">
                  {/* Payment Options Grid */}
                  <div className="w-full h-auto md:h-[124px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 h-full">
                      {/* Master Card */}
                      <div className="w-full h-24 md:h-[124px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E87A3F] transition-colors p-2">
                        <img
                          src="/card-icon.png"
                          alt="Master Card"
                          className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2"
                        />
                        <span className="text-xs md:text-sm font-medium text-gray-700 text-center">
                          Master Card
                        </span>
                      </div>

                      {/* Apple Pay */}
                      <div className="w-full h-24 md:h-[124px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E87A3F] transition-colors relative p-2">
                        <img
                          src="/visa-icon.png"
                          alt="Apple Pay"
                          className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2"
                        />
                        <span className="text-xs md:text-sm font-medium text-gray-700 text-center">
                          Apple Pay
                        </span>
                        <img
                          src="/star-icon.png"
                          alt="Star"
                          className="w-3 h-3 md:w-4 md:h-4 absolute top-2 right-2"
                        />
                      </div>

                      {/* Wallet */}
                      <div className="w-full h-24 md:h-[124px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E87A3F] transition-colors p-2">
                        <img
                          src="/wallet-icon.png"
                          alt="Wallet"
                          className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2"
                        />
                        <span className="text-xs md:text-sm font-medium text-gray-700 text-center">
                          Wallet
                        </span>
                      </div>

                      {/* Bank Account */}
                      <div className="w-full h-24 md:h-[124px] bg-gray-50 border border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#E87A3F] transition-colors p-2">
                        <img
                          src="/bank-icon.png"
                          alt="Bank Account"
                          className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2"
                        />
                        <span className="text-xs md:text-sm font-medium text-gray-700 text-center">
                          Bank Account
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Form */}
                  <div className="space-y-4 md:space-y-6">
                    {/* Name on Card */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <Input className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]" />
                    </div>

                    {/* Card Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <Input className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]" />
                    </div>

                    {/* Expire Date and CVC */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expire Date
                        </label>
                        <Input
                          placeholder="DD/YY"
                          className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <Input className="h-10 md:h-11 rounded-lg border-gray-300 focus:border-[#E87A3F] focus:ring-[#E87A3F]" />
                      </div>
                    </div>

                    {/* Primary Payment Method Toggle Switch */}
                    <div className="mt-4 md:mt-6">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setIsPrimaryPayment(!isPrimaryPayment)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#E87A3F] focus:ring-offset-2 ${
                            isPrimaryPayment ? "bg-[#E87A3F]" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isPrimaryPayment
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                        <label className="text-sm text-gray-700 cursor-pointer font-medium">
                          Set as Primary Payment Method
                        </label>
                      </div>
                    </div>

                    {/* Info Text */}
                    <p className="text-sm text-gray-600">
                      • We will send you an order details to your email after
                      the successful payment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-4 md:mt-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row justify-end gap-3 md:gap-4 w-full max-w-6xl">
                <Button
                  variant="outline"
                  className="w-full sm:w-[200px] md:w-[297px] h-12 md:h-14 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50 bg-[#F5F1ED]"
                >
                  Discard
                </Button>
                <Button className="w-full sm:w-[200px] md:w-[297px] h-12 md:h-14 rounded-lg bg-[#E87A3F] hover:bg-[#d96d34] text-white">
                  Save
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Placeholder sections for other steps */}
        {activeSection === "my-orders" && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 lg:p-8 w-full max-w-6xl">
              <MyOrders />
            </div>
          </div>
        )}

        {activeSection === "wishlist" && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-6xl">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 md:mb-8">
                Wishlist
              </h2>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Table Header - Hidden on mobile */}
                <div className="bg-gray-50 px-4 md:px-6 py-3 md:py-4 hidden md:block">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
                    <div className="col-span-6">PRODUCTS</div>
                    <div className="col-span-2">PRICE</div>
                    <div className="col-span-2">STOCK STATUS</div>
                    <div className="col-span-2">ACTIONS</div>
                  </div>
                </div>

                {/* Wishlist Items */}
                <div className="divide-y divide-gray-200">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="px-4 md:px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                        {/* Product Info */}
                        <div className="col-span-1 md:col-span-6 flex items-center space-x-3 md:space-x-4">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.title}
                            className="w-16 h-16 md:w-[72px] md:h-[72px] object-cover rounded-lg flex-shrink-0"
                          />
                          <p className="text-sm text-gray-900 line-clamp-2">
                            {item.title}
                          </p>
                        </div>

                        {/* Price */}
                        <div className="col-span-1 md:col-span-2 flex justify-between md:block mt-2 md:mt-0">
                          <span className="text-xs text-gray-500 md:hidden">
                            Price:
                          </span>
                          <div className="flex items-center space-x-2">
                            {item.originalPrice && (
                              <span className="text-sm text-gray-400 line-through">
                                {item.originalPrice}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-gray-900">
                              {item.currentPrice}
                            </span>
                          </div>
                        </div>

                        {/* Stock Status */}
                        <div className="col-span-1 md:col-span-2 flex justify-between md:block mt-2 md:mt-0">
                          <span className="text-xs text-gray-500 md:hidden">
                            Stock:
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.inStock
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {item.inStock ? "IN STOCK" : "OUT OF STOCK"}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1 md:col-span-2 flex justify-between md:flex items-center space-x-2 mt-3 md:mt-0">
                          <Button
                            className={`w-full md:w-[166px] h-10 md:h-12 rounded-lg text-xs md:text-sm font-medium ${
                              item.inStock
                                ? "bg-[#E87A3F] hover:bg-[#d96d34] text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            disabled={!item.inStock}
                          >
                            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            ADD TO CART
                          </Button>
                          <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-16 md:h-[100px]"></div>

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
  );
}
