"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import Header from "../components/header"
import FooterSection from "@/components/footer-section"
import Image from "next/image"
import { CopyButton } from "@/components/ui/copy-button"

export default function CryptoPaymentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const orderId = searchParams?.get("orderId")
  const address = searchParams?.get("address")
  const amount = searchParams?.get("amount")
  const currency = searchParams?.get("currency")
  const expiresAt = searchParams?.get("expiresAt")

  const [timeLeft, setTimeLeft] = useState<string>("")

  // Calculate time remaining
  useEffect(() => {
    if (!expiresAt) return

    const updateTimeLeft = () => {
      const now = new Date().getTime()
      const expiry = new Date(expiresAt).getTime()
      const diff = expiry - now

      if (diff <= 0) {
        setTimeLeft("Expired")
        return
      }

      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`)
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [expiresAt])



  const handlePaymentComplete = () => {
    // In a real implementation, you would verify the payment on the blockchain
    router.push(`/cart/success?orderId=${orderId}`)
  }

  if (!orderId || !address || !amount || !currency) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <AlertCircle className="mx-auto mb-4 size-12 text-red-500" />
            <h2 className="mb-2 text-2xl font-bold">Invalid Payment Link</h2>
            <p className="mb-6 text-gray-600">The payment information is missing or invalid.</p>
            <Link href="/cart">
              <Button className="bg-[#E87A3F] hover:bg-[#d96d34]">
                Return to Cart
              </Button>
            </Link>
          </div>
        </div>
        <FooterSection />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Card */}
          <div className="rounded-xl bg-white p-8 shadow-lg">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="relative size-20">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/CurrencyDollar-FtQFHmEaQtePHH4dsKV2gizcN4b9YO.png"
                    alt="Crypto Payment"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Complete Your Payment
              </h1>
              <p className="text-gray-600">
                Send exactly <span className="font-semibold">{amount} {currency}</span> to the address below
              </p>
            </div>

            {/* Timer Warning */}
            {expiresAt && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg bg-yellow-50 p-4 text-yellow-800">
                <Clock className="size-5" />
                <span className="text-sm font-medium">
                  Time remaining: <span className="text-lg font-bold">{timeLeft}</span>
                </span>
              </div>
            )}

            {/* Payment Amount */}
            <div className="mb-6 rounded-lg border-2 border-[#E87A3F] bg-[#FEF3EC] p-6 text-center">
              <p className="mb-2 text-sm text-gray-600">Amount to Send</p>
              <p className="text-4xl font-bold text-[#E87A3F]">
                {amount} <span className="text-2xl">{currency}</span>
              </p>
            </div>

            {/* Wallet Address */}
            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Address
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 p-4">
                  <p className="break-all font-mono text-sm text-gray-900">
                    {address}
                  </p>
                </div>
                <CopyButton
                  value={address}
                  className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white hover:bg-gray-50"
                  iconClassName="size-5 text-gray-600"
                />
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="mb-6 flex justify-center">
              <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
                <div className="flex size-48 items-center justify-center bg-white">
                  <p className="text-center text-sm text-gray-500">
                    QR Code
                    <br />
                    (Not available)
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-6 rounded-lg bg-blue-50 p-6">
              <h3 className="mb-4 font-semibold text-gray-900">Payment Instructions</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    1
                  </span>
                  <span>Open your crypto wallet and initiate a payment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    2
                  </span>
                  <span>Copy the payment address above or scan the QR code</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    3
                  </span>
                  <span>Send exactly <strong>{amount} {currency}</strong> to the address</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    4
                  </span>
                  <span>Wait for blockchain confirmation (this may take a few minutes)</span>
                </li>
              </ol>
            </div>

            {/* Important Notes */}
            <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4">
              <h4 className="mb-2 flex items-center gap-2 font-semibold text-red-900">
                <AlertCircle className="size-5" />
                Important Notes
              </h4>
              <ul className="space-y-1 text-sm text-red-800">
                <li>• Send only {currency} to this address</li>
                <li>• Sending a different cryptocurrency will result in permanent loss</li>
                <li>• Send the exact amount shown above</li>
                <li>• This address expires in {timeLeft}</li>
              </ul>
            </div>

            {/* Order Info */}
            <div className="mb-6 rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-sm text-gray-600">
                Order ID: <span className="font-medium text-gray-900">#{orderId.slice(0, 12)}...</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                onClick={handlePaymentComplete}
                className="flex-1 rounded-lg bg-[#E87A3F] py-6 text-lg font-medium text-white hover:bg-[#d96d34]"
              >
                I've Completed Payment
                <ArrowRight className="ml-2 size-5" />
              </Button>
              <Link href={`/cart/cancel?orderId=${orderId}`} className="flex-1">
                <Button
                  variant="outline"
                  className="w-full rounded-lg border-2 border-gray-300 py-6 text-lg font-medium hover:bg-gray-50"
                >
                  Cancel Payment
                </Button>
              </Link>
            </div>

            {/* Support Link */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Having issues?{" "}
              <Link href="/contact-us" className="font-medium text-[#E87A3F] hover:underline">
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FooterSection />
    </div>
  )
}
