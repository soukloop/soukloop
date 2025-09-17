import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FooterSection() {
  return (
    <footer className="bg-white">
      {/* Main Footer Content */}
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-[1248px] mx-auto">
          {/* Logo and Description */}
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-bold">
                <span className="text-[#E87A3F]">Souk</span>
                <span className="text-[#008080]">Loop</span>
              </h2>
            </div>
            <p className="text-gray-600 text-sm mb-1 leading-relaxed">
              Vivamus tristique odio sit amet velit semper, eu posuere turpis
              interdum.
            </p>
            <p className="text-gray-600 text-sm mb-5">Cras egestas purus</p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border border-[#E87A3F] rounded-full flex items-center justify-center hover:bg-[#E87A3F] group transition-colors cursor-pointer">
                <Facebook className="h-4 w-4 text-[#E87A3F] group-hover:text-white fill-current transition-colors" />
              </div>
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <Twitter className="h-4 w-4 text-black hover:text-gray-700 transition-colors" />
              </div>
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <Instagram className="h-4 w-4 text-black hover:text-gray-700 transition-colors" />
              </div>
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <div className="w-4 h-4 bg-black hover:bg-gray-700 transition-colors rounded-full relative">
                  <div
                    className="absolute inset-0 bg-white rounded-full"
                    style={{ clipPath: "circle(25% at 50% 30%)" }}
                  ></div>
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-0.5 h-1.5 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="w-8 h-8 flex items-center justify-center cursor-pointer">
                <Youtube className="h-4 w-4 text-black hover:text-gray-700 transition-colors" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">
              QUICK LINK
            </h3>
            <div className="flex flex-col">
              <Link href="/#">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F] transition-colors">
                  Home
                </button>
              </Link>

              <Link href="/Products">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F]  transition-colors">
                  Products
                </button>
              </Link>

              <Link href="/Aboutus">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F]  transition-colors">
                  About Us
                </button>
              </Link>

              <Link href="/FAQs">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F]  transition-colors">
                  FAQs
                </button>
              </Link>

              <Link href="/contactus">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F]  transition-colors">
                  Contact Us
                </button>
              </Link>

              <Link href="/privacypolicy">
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:text-[#E87A3F] transition-colors">
                  Privacy Policy
                </button>
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">
              SUPPORT
            </h3>
            <div className="flex flex-col gap-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 rounded-md hover:text-[#E87A3F] transition-colors">
                Help &amp; Support
              </button>

              <Link href="/terms&conditions">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F] transition-colors">
                Terms &amp; Conditions
              </button>
              </Link>

              <Link href="/privacypolicy">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F] transition-colors">
                Privacy Policy
              </button>
              </Link>

              <button className="w-full text-left px-4 py-2 text-sm text-gray-700  rounded-md hover:text-[#E87A3F] transition-colors">
                Help
              </button>
            </div>
          </div>
          {/* Newsletter */}
          <div>
            <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">
              NEWSLETTER
            </h3>
            <div className="flex flex-col sm:flex-row mb-3 gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E87A3F] focus:border-[#E87A3F] bg-white"
              />
              <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-sm font-medium rounded-md border border-[#E87A3F] w-full sm:w-auto">
                Subscribe
              </Button>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Stay on trend — subscribe to our newsletter for exclusive
              discounts and style updates!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="bg-[#E87A3F] py-3 pt-6">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            {/* Left */}
            <div className="flex flex-col md:flex-row items-center text-white text-xs space-y-2 md:space-y-0 md:space-x-6 mb-3 md:mb-0">
              <span>Copyright © 2023 3legant. All rights reserved</span>
              <div className="flex items-center space-x-6">
                <a href="#" className="hover:underline">
                  Privacy Policy
                </a>
                <a href="#" className="hover:underline">
                  Terms & Conditions
                </a>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-2">
              <div className="bg-white rounded px-3 py-1.5 min-w-[45px] h-[28px] flex items-center justify-center">
                <span className="text-blue-600 font-bold text-[10px]">
                  VISA
                </span>
              </div>
              <div className="bg-white rounded px-2 py-1.5 min-w-[55px] h-[28px] flex items-center justify-center">
                <span className="text-blue-600 font-bold text-[7px] leading-tight text-center">
                  AMERICAN
                  <br />
                  EXPRESS
                </span>
              </div>
              <div className="bg-white rounded px-2 py-1.5 min-w-[45px] h-[28px] flex items-center justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full -ml-1.5"></div>
                </div>
              </div>
              <div className="bg-white rounded px-3 py-1.5 min-w-[45px] h-[28px] flex items-center justify-center">
                <span className="text-purple-600 font-bold text-[10px]">
                  stripe
                </span>
              </div>
              <div className="bg-white rounded px-3 py-1.5 min-w-[45px] h-[28px] flex items-center justify-center">
                <span className="text-blue-600 font-bold text-[10px]">
                  PayPal
                </span>
              </div>
              <div className="bg-white rounded px-3 py-1.5 min-w-[45px] h-[28px] flex items-center justify-center">
                <div className="flex items-center space-x-0.5">
                  <div className="w-2.5 h-2.5 bg-black rounded-sm"></div>
                  <span className="text-black font-medium text-[10px]">
                    Pay
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
