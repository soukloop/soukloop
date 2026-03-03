"use client";

import { useState, useTransition, useEffect } from "react";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { createSubscriptionCheckout } from "@/features/subscriptions/actions";
import { toast } from "sonner";
import { useProfile } from "@/hooks/useProfile";
import { PricingCards } from "@/components/subscription/PricingCards";
import { useMemo } from "react";

export default function PricingPage() {
  const [showPaymentOptionModal, setShowPaymentOptionModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);
  const { profile } = useProfile();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentTier = useMemo(() => {
    if (!isMounted) return null;
    const user = profile?.user as any;
    return user?.vendor?.planTier || user?.planTier || (typeof window !== 'undefined' ? (window as any).__USER_PLAN_TIER__ : 'BASIC');
  }, [profile, isMounted]);

  const handleCheckout = (priceId?: string) => {
    startTransition(() => {
      createSubscriptionCheckout(priceId).catch(err => {
        toast.error("Checkout Unavailable", {
          description: err.message || "Failed to start checkout. Ensure you are an approved seller."
        });
      });
    });
  };

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

  const handleCodeChange = (index: number, value: string) => {
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
    <div className="min-h-screen bg-white sm:mt-[-9rem] mt-[-6.2rem]">
      <EcommerceHeader />

      {/* Main Pricing Section */}
      <main className="container mx-auto px-4 py-16 pb-[100px] sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-3xl font-bold text-gray-900 sm:text-4xl md:text-5xl">
            Pricing plans
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-base text-gray-600 sm:text-lg">
            Choose the plan that suits your business needs. Switch plans or cancel any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-24">
          <PricingCards
            currentTier={currentTier || "BASIC"}
            onSelect={handleCheckout}
            isPending={isPending}
          />
        </div>

        {/* Feature Comparison Table */}
        <div className="mx-auto max-w-6xl px-4 lg:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compare features</h2>
          <div className="overflow-x-auto">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="w-[28%] font-semibold text-gray-900 px-6">Features</TableHead>
                  <TableHead className="w-[24%] font-semibold text-gray-900 px-6 text-center">Basic plan</TableHead>
                  <TableHead className="w-[24%] font-semibold text-orange-950 bg-orange-50 px-6 text-center">Starter plan</TableHead>
                  <TableHead className="w-[24%] font-semibold text-white bg-orange-500 rounded-t-2xl text-center px-6">Pro plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell className="font-medium border-b border-gray-100 px-6 py-5">Active Listings</TableCell>
                  <TableCell className="text-gray-600 border-b border-gray-100 px-6 py-5 text-center">3</TableCell>
                  <TableCell className="bg-orange-50 text-orange-900 px-6 py-5 text-center">30</TableCell>
                  <TableCell className="bg-orange-500 font-medium text-white px-6 py-5 text-center">Unlimited</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell className="font-medium border-b border-gray-100 px-6 py-5">Commission Rate</TableCell>
                  <TableCell className="text-gray-600 border-b border-gray-100 px-6 py-5 text-center">12%</TableCell>
                  <TableCell className="bg-orange-50 text-orange-900 px-6 py-5 text-center">10%</TableCell>
                  <TableCell className="bg-orange-500 font-medium text-white px-6 py-5 text-center">8%</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell className="font-medium border-b border-gray-100 px-6 py-5">Active Promo Codes</TableCell>
                  <TableCell className="text-gray-600 border-b border-gray-100 px-6 py-5 text-center"><span className="text-gray-400">—</span></TableCell>
                  <TableCell className="bg-orange-50 text-orange-900 px-6 py-5 text-center">5</TableCell>
                  <TableCell className="bg-orange-500 font-medium text-white px-6 py-5 text-center">Unlimited</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell className="font-medium border-b border-gray-100 px-6 py-5">Payout Schedule</TableCell>
                  <TableCell className="text-gray-600 border-b border-gray-100 px-6 py-5 text-center">Standard</TableCell>
                  <TableCell className="bg-orange-50 text-orange-900 px-6 py-5 text-center">Weekly</TableCell>
                  <TableCell className="bg-orange-500 font-medium text-white px-6 py-5 text-center">Weekly</TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell className="font-medium border-b border-gray-100 px-6 py-5">Seller Stats</TableCell>
                  <TableCell className="border-b border-gray-100 px-6 py-5 text-center"><span className="text-gray-400">—</span></TableCell>
                  <TableCell className="bg-orange-50 text-center px-6 py-5"><Check className="size-5 text-orange-500 mx-auto" /></TableCell>
                  <TableCell className="bg-orange-500 text-center px-6 py-5"><Check className="size-5 text-white mx-auto" /></TableCell>
                </TableRow>
                <TableRow className="border-none hover:bg-transparent">
                  <TableCell className="font-medium px-6 py-5">Premium Badge</TableCell>
                  <TableCell className="px-6 py-5 text-center"><span className="text-gray-400">—</span></TableCell>
                  <TableCell className="bg-orange-50 text-center px-6 py-5"><Check className="size-5 text-orange-500 mx-auto" /></TableCell>
                  <TableCell className="bg-orange-500 rounded-b-2xl text-center px-6 py-5"><Check className="size-5 text-white mx-auto" /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
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
                    className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all sm:p-6 ${selectedMethod === method.id
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
                  className={`h-12 w-full rounded-lg text-white sm:h-14 sm:w-[297px] transition-colors ${!selectedMethod ||
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
              onClick={() => {
                setShowPaymentOptionModal(false);
                handleVerificationConfirm();
              }}
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
