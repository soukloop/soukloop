"use client";

import { useState } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";

export default function PricingPage() {
  const [showPaymentOptionModal, setShowPaymentOptionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const paymentMethods = [
    {
      id: "mastercard",
      name: "Master Card",
      icon: "/icons/mastercard-icon.png",
    },
    { id: "applepay", name: "Apple Pay", icon: "/icons/apple-pay-icon.png" },
    {
      id: "crypto wallet",
      name: "Crypto Wallet",
      icon: "icons/bitcoin-final.png",
    },
    { id: "paypal", name: "PayPal", icon: "icons/paypal-final.png" },
  ];

  const [selectedMethod, setSelectedMethod] = useState("mastercard");

  const [formData, setFormData] = useState({
    nameOnCard: "",
    cardNumber: "",
    expireDate: "",
    cvc: "",
  });

  // Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const [isPrimary, setIsPrimary] = useState(true);

  const handleConfirmPayment = () => {
    setShowVerificationModal(true);
  };

  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const handleCodeChange = (index, value) => {
    if (/^[0-9]?$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // ✅ Auto move to next input
      if (value && index < 5) {
        const nextInput =
          document.querySelectorAll<HTMLInputElement>("input[type='text']")[
            index + 1
          ];
        nextInput?.focus();
      }

      // ✅ Move back if deleted
      if (!value && index > 0) {
        const prevInput =
          document.querySelectorAll<HTMLInputElement>("input[type='text']")[
            index - 1
          ];
        prevInput?.focus();
      }
    }
  };

  const handleVerificationConfirm = () => {
    setShowVerificationModal(false);
    setShowSuccessModal(true);
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [countdown, setCountdown] = useState(59);

  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />

      {/* Main Pricing Section */}
      <main className="container mx-auto px-4 py-16 pb-[100px] sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            Find Your Perfect Plan
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:text-lg">
            Discover the ideal plan to fuel your business growth. Our pricing
            options are carefully crafted to cater to businesses.
          </p>

          {/* Plan Toggle */}
          <div className="mb-12 flex items-center justify-center">
            <div
              className="flex items-center rounded-[14px] bg-gray-100 p-1"
              style={{
                width: "256px",
                height: "65px",
              }}
            >
              <span className="flex-1 px-4 text-center text-lg font-medium text-gray-700">
                Buyer
              </span>
              <div className="relative">
                <Button
                  className="relative bg-[#E87A3F] text-lg font-medium text-white hover:bg-[#d96d34]"
                  style={{
                    width: "120px",
                    height: "49px",
                    borderRadius: "12px",
                  }}
                >
                  Seller
                  <span className="absolute -right-1 -top-1 rounded-md bg-black px-2 py-0.5 text-xs font-medium text-white">
                    20% off
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 lg:mr-56 lg:grid-cols-2 lg:px-0">
          {/* Basic Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Basic Plan
              </h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">Free</span>
                <span className="text-gray-600">per month</span>
              </div>
            </div>

            <ul className="mb-8 space-y-4">
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600" />
                <span className="text-gray-700">Limited Product Listings</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600" />
                <span className="text-gray-700">Basic Order Management</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="size-5 shrink-0 text-green-600" />
                <span className="text-gray-700">Standard Seller Support</span>
              </li>
            </ul>

            <Button
              variant="outline"
              className="h-12 w-full rounded-[12px] border-gray-300 bg-transparent text-lg font-medium hover:bg-gray-50 lg:h-[57px] lg:w-[420px]"
            >
              Get Started
            </Button>
          </div>

          {/* Premium Plan */}
          <div
            className="relative mx-auto h-auto w-full overflow-hidden rounded-[20px] p-8 text-white lg:h-[860px] lg:w-[708px]"
            style={{
              background: "#E0622C",
              border: "1px solid rgba(232, 232, 232, 0.2)",
              boxShadow:
                "0px 244px 98px rgba(224, 98, 44, 0.01), 0px 137px 82px rgba(224, 98, 44, 0.05), 0px 61px 61px rgba(224, 98, 44, 0.09), 0px 15px 34px rgba(224, 98, 44, 0.1)",
            }}
          >
            <div className="absolute right-0 top-8 h-44 w-full overflow-hidden rounded-t-[20px] sm:h-56 lg:h-[280px]">
              <img
                src="/images/premium-women-new.png"
                alt="Two women smiling"
                className="size-full object-cover object-center"
              />
            </div>

            {/* Content overlay */}
            <div className="relative z-10 flex h-full flex-col">
              {/* Spacer to push below image */}
              <div className="h-44 sm:h-56 lg:h-[200px]" />

              {/* Bottom content section */}
              <div className="mt-auto">
                {/* Gem Icon */}
                <div className="mb-6">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white/20">
                    <img
                      src="/images/gem-icon.png"
                      alt="Premium gem icon"
                      className="size-6"
                    />
                  </div>
                </div>

                {/* Plan Title and Description */}
                <div className="mb-8">
                  <div className="mb-3 flex items-center gap-3">
                    <h3 className="text-2xl font-bold">Premium Plan</h3>
                    <span
                      className="flex items-center justify-center rounded-lg border border-white text-sm font-semibold text-white"
                      style={{
                        width: "79px",
                        height: "24px",
                        borderRadius: "8px",
                      }}
                    >
                      Best offer
                    </span>
                  </div>
                  <p className="mb-6 text-base text-white/90">
                    Take Your Business to the Next Level with Premium Plan.
                  </p>

                  {/* Price */}
                  <div className="mb-8 flex items-baseline gap-2">
                    <span className="text-5xl font-bold">$100</span>
                    <span className="text-lg text-white/90">per month</span>
                  </div>

                  {/* Divider line */}
                  <div className="mb-8 h-px w-full bg-white/30" />
                </div>

                {/* Features List */}
                <ul className="mb-8 space-y-4">
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-white" />
                    <span className="text-white">
                      Unlimited Product Listings
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-white" />
                    <span className="text-white">
                      Free Shipping on Eligible Orders
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-white" />
                    <span className="text-white">
                      Boosted Product Visibility
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-white" />
                    <span className="text-white">In-Depth Sales Analytics</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="size-5 shrink-0 text-white" />
                    <span className="text-white">
                      Promote Listings with Free Credits
                    </span>
                  </li>
                </ul>

                {/* Get Started Button */}
                <Button
                  onClick={() => setShowPaymentOptionModal(true)}
                  className="h-12 w-full rounded-[12px] bg-white text-lg font-medium text-[#E87A3F] hover:bg-gray-100 lg:h-[61px] lg:w-[628px]"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showPaymentOptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 sm:p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentOptionModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <div className="mb-0 w-full rounded-2xl border-0 bg-white shadow-none">
              <h1 className="mb-6 text-xl font-semibold text-gray-900 sm:mb-8 sm:text-2xl">
                Payment Option
              </h1>

              {/* Payment Methods */}
              <div className="mb-6 grid grid-cols-2 gap-4 sm:mb-8 sm:grid-cols-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all sm:p-6 ${
                      selectedMethod === method.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="flex size-8 items-center justify-center">
                        <Image
                          src={method.icon || "/placeholder.svg"}
                          alt={method.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {method.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Card Info */}
              <div className="mb-6 space-y-6">
                <div>
                  <Label
                    htmlFor="nameOnCard"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Name on Card <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nameOnCard"
                    value={formData.nameOnCard}
                    onChange={(e) =>
                      handleInputChange("nameOnCard", e.target.value)
                    }
                    required
                    className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="cardNumber"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Card Number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    required
                    className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <Label
                      htmlFor="expireDate"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      Expire Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="expireDate"
                      placeholder="MM/YY"
                      value={formData.expireDate}
                      onChange={(e) =>
                        handleInputChange("expireDate", e.target.value)
                      }
                      required
                      className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="cvc"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      CVC <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="cvc"
                      value={formData.cvc}
                      onChange={(e) => handleInputChange("cvc", e.target.value)}
                      required
                      className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Payment Switch */}
              <div className="mb-4 flex items-center space-x-3">
                <Switch
                  id="primary-payment"
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                  className="data-[state=checked]:bg-orange-500"
                />
                <Label
                  htmlFor="primary-payment"
                  className="text-sm font-medium text-gray-900"
                >
                  Set as Primary Payment Method
                </Label>
              </div>

              {/* Info Note */}
              <div className="mb-6 sm:mb-8">
                <p className="flex items-start text-sm text-gray-600">
                  <span className="mr-2 text-orange-500">•</span>
                  We will send you order details to your email after successful
                  payment.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col justify-end gap-4 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-lg border-orange-200 bg-orange-50 text-orange-500 hover:border-orange-300 hover:bg-orange-100 sm:h-14 sm:w-[297px]"
                  onClick={() => setShowPaymentOptionModal(false)}
                >
                  Discard
                </Button>

                <Button
                  onClick={handleConfirmPayment}
                  disabled={
                    !selectedMethod ||
                    !formData.nameOnCard ||
                    !formData.cardNumber ||
                    !formData.expireDate ||
                    !formData.cvc
                  }
                  className={`h-12 w-full rounded-lg text-white sm:h-14 sm:w-[297px] transition-colors ${
                    !selectedMethod ||
                    !formData.nameOnCard ||
                    !formData.cardNumber ||
                    !formData.expireDate ||
                    !formData.cvc
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  Confirm Payment Option
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="flex w-full max-w-sm sm:max-w-md lg:max-w-lg flex-col max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <h2 className="mb-2 text-lg font-bold text-black sm:mb-4 sm:text-xl lg:text-2xl">
              Enter 6-Digit Code
            </h2>
            <p className="mb-4 text-xs text-gray-600 sm:mb-6 sm:text-sm lg:text-sm">
              Enter the 6-digit code sent to info*****gmail.com
            </p>

            {/* Code Inputs */}
            <div className="mb-4 flex justify-center gap-2 sm:gap-3 lg:gap-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="size-10 sm:size-12 lg:size-12 rounded-xl border-2 border-gray-200 text-center text-base sm:text-lg lg:text-2xl font-semibold focus:border-orange-500 focus:outline-none"
                  maxLength={1}
                />
              ))}
            </div>

            {/* Countdown */}
            <p className="mb-4 text-center text-xs sm:text-sm lg:text-base text-gray-500">
              Resend code in 00:{countdown.toString().padStart(2, "0")}
            </p>

            {/* Confirm Button */}
            <Button
              className="mx-auto h-11 sm:h-12 lg:h-14 w-full sm:w-[300px] lg:w-[436px] rounded-full bg-orange-500 text-sm sm:text-base lg:text-lg font-semibold text-white hover:bg-orange-600"
              onClick={
                (() => setShowPaymentOptionModal(false),
                handleVerificationConfirm)
              }
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

      <div className="mt-10" style={{ backgroundColor: "#f9f9f9" }}>
        <FooterSection />
      </div>
    </div>
  );
}
