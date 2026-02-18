import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import Image from "next/image"; // Needed for Pinterest icon/image or just similar icon
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="bg-[#f9f9f9]">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-12 lg:gap-6">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2 lg:col-span-4">
            <div className="mb-3">
              <Link href="/">
                <h2 className="text-2xl font-bold">
                  <img src="/images/logo.png" alt="SoukLoop" className="h-10" />
                </h2>
              </Link>
            </div>
            <p className="mb-1 text-sm leading-relaxed text-gray-600">
              Your one-stop shop for the latest trends in fashion. Quality clothes for men, women, and kids at unbeatable prices.
            </p>
            <p className="mb-4 text-sm text-gray-600">Shop smarter, look better.</p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 mt-4">
              <Link href="#" className="group flex size-9 items-center justify-center rounded-full border border-[#1877F2] bg-[#1877F2] transition-colors hover:opacity-90">
                <Facebook className="size-4 text-white" />
              </Link>
              <Link href="#" className="group flex size-9 items-center justify-center rounded-full border border-black bg-black transition-colors hover:opacity-90">
                <Twitter className="size-4 text-white" />
              </Link>
              <Link href="#" className="group flex size-9 items-center justify-center rounded-full border border-[#E4405F] bg-[#E4405F] transition-colors hover:opacity-90">
                <Instagram className="size-4 text-white" />
              </Link>
              <Link href="#" className="group flex size-9 items-center justify-center rounded-full border border-[#E60023] bg-[#E60023] transition-colors hover:opacity-90">
                <div className="font-bold text-white">P</div>
              </Link>
              <Link href="#" className="group flex size-9 items-center justify-center rounded-full border border-[#FF0000] bg-[#FF0000] transition-colors hover:opacity-90">
                <Youtube className="size-4 text-white" />
              </Link>
            </div>
          </div>

          {/* Quick Links and Support - Side by side on mobile */}
          <div className="col-span-1 grid grid-cols-2 gap-6 md:col-span-2 md:grid-cols-2 lg:col-span-4 lg:gap-6">
            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black">
                QUICK LINK
              </h3>
              <div className="flex flex-col space-y-2">
                <Link href="/#" className="text-sm font-semibold text-[#E87A3F]">
                  Home
                </Link>

                <Link href="/products" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  Products
                </Link>

                <Link href="/about-us" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  About Us
                </Link>

                <Link href="/faqs" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  FAQs
                </Link>

                <Link href="/contact-us" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black">
                SUPPORT
              </h3>
              <div className="flex flex-col space-y-2">
                <Link href="/help" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  Help &amp; Support
                </Link>
                <Link href="/terms-and-conditions" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy-policy" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/pricing" className="text-sm text-gray-900 hover:text-[#E87A3F] transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
          </div>
          {/* Newsletter */}
          <div className="col-span-1 md:col-span-4 lg:col-span-4">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-black">
              NEWSLETTER
            </h3>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#E87A3F] focus:outline-none focus:ring-1 focus:ring-[#E87A3F]"
              />
              <Button className="w-full rounded-md border border-[#E87A3F] bg-[#E87A3F] text-sm font-medium text-white hover:bg-[#d96d34] sm:w-auto">
                Subscribe
              </Button>
            </div>
            <p className="text-sm leading-relaxed text-gray-600">
              Stay on trend — subscribe to our newsletter for exclusive
              discounts and style updates!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer - Matched to Header Top Bar Style */}
      <div className="bg-[#E87A3F] text-xs sm:text-sm text-white">
        <div className="container mx-auto flex h-6 sm:h-9 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Left - Copyright (Always visible, text centered on mobile if alone) */}
          <div className="flex w-full items-center justify-center sm:justify-start sm:w-auto gap-6">
            <span>Copyright © 2024 SoukLoop. All rights reserved</span>

            {/* Hidden on mobile: Privacy Links */}
            <div className="hidden sm:flex h-4 w-px bg-white/40"></div>
            <div className="hidden sm:flex items-center space-x-6 font-semibold">
              <a href="/privacy" className="hover:text-gray-200">
                Privacy Policy
              </a>
              <a href="/terms-and-conditions" className="hover:text-gray-200">
                Terms & Conditions
              </a>
            </div>
          </div>

          {/* Right - Payment Methods (Hidden on mobile) */}
          <div className="hidden sm:flex flex-wrap items-center justify-end gap-2">
            <div className="flex h-[24px] min-w-[38px] items-center justify-center rounded bg-white px-2 py-1">
              <span className="text-[9px] font-bold text-blue-600">
                VISA
              </span>
            </div>
            <div className="flex h-[24px] min-w-[45px] items-center justify-center rounded bg-white px-2 py-1">
              <span className="text-center text-[6px] font-bold leading-tight text-blue-600">
                AMERICAN
                <br />
                EXPRESS
              </span>
            </div>
            <div className="flex h-[24px] min-w-[38px] items-center justify-center rounded bg-white px-2 py-1">
              <div className="flex items-center">
                <div className="size-2.5 rounded-full bg-red-500"></div>
                <div className="-ml-1.5 size-2.5 rounded-full bg-yellow-400"></div>
              </div>
            </div>
            <div className="flex h-[24px] min-w-[38px] items-center justify-center rounded bg-white px-2 py-1">
              <span className="text-[9px] font-bold text-purple-600">
                stripe
              </span>
            </div>
            <div className="flex h-[24px] min-w-[38px] items-center justify-center rounded bg-white px-2 py-1">
              <span className="text-[9px] font-bold text-blue-600">
                PayPal
              </span>
            </div>
            <div className="flex h-[24px] min-w-[38px] items-center justify-center rounded bg-white px-2 py-1">
              <div className="flex items-center space-x-0.5">
                <div className="size-2 rounded-sm bg-black"></div>
                <span className="text-[9px] font-medium text-black">
                  Pay
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
