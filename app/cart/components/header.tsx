"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AuthPopup from "../../signin/components/auth-popup";
import {
  Check,
  ChevronDown,
  Heart,
  Info,
  Menu,
  ShoppingCart,
  User,
  X,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function EcommerceHeader() {
  const [showAuth, setShowAuth] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // ✅ Close profile dropdown on outside click
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       dropdownRef.current &&
  //       !dropdownRef.current.contains(event.target as Node)
  //     ) {
  //       setShowProfile(false);
  //     }
  //   };
  //   if (showProfile) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [showProfile]);

  const menuItems = [
    { icon: "/icons/dashboard.png", label: "Dashboard", href: "/userdashboard" },
    {
      icon: "/icons/account-settings.png",
      label: "Account settings",
      href: "/editprofile",
    },
    {
      icon: "/icons/notification-settings.png",
      label: "Notification settings",
      href: "/notification-settings",
    },
    {
      icon: "/icons/refunds-returns.png",
      label: "Refunds & Returns",
      href: "/refundsandreturns",
    },
    { icon: "/icons/my-orders.png", label: "My Orders", href: "/editprofile" },
    {
      icon: "/icons/track-order.png",
      label: "Track Order",
      href: "/trackorders",
    },
    { icon: "/icons/rewards.png", label: "Rewards", href: "/rewardpoints" },
    { icon: "/icons/chat-box.png", label: "Chat box", href: "/chats" },
  ];

  return (
    <header className="w-full bg-white text-gray-800">
      {/* Top Bar */}
      <div className="bg-[#E87A3F] text-white text-sm h-11">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center flex-wrap items-center h-10 md:justify-between lg:justify-between">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">
              Free Shipping On All Orders Over $50
            </span>
            <span className="sm:hidden">
              Free Shipping On All Orders Over $50
            </span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-4 mt-2 md:mt-0 text-sm">
            <div className="flex items-center space-x-1 cursor-pointer hover:opacity-80">
              <span>Eng</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-1 cursor-pointer hover:opacity-80">
              <span>USD</span>
              <ChevronDown className="h-4 w-4" />
            </div>
            <a href="/privacypolicy" className="hover:opacity-80">
              Privacy Policy
            </a>
            <a
              href="#"
              className="flex items-center space-x-1 hover:opacity-80"
            >
              <Info className="h-4 w-4" />
              <span>Need Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20 sm:h-24">
          {/* Logo */}
          <div className="text-2xl sm:text-3xl font-bold">
            <span className="text-[#E87A3F]">Souk</span>
            <span className="text-[#008080]">Loop</span>
          </div>

          {/* Desktop Icons */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link href="/cart">
              <Button
                variant="outline"
                className="relative h-11 px-4 rounded-lg bg-transparent"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="ml-2 hidden md:inline">Cart</span>
                <span className="absolute -top-1 -right-1 bg-[#E87A3F] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="h-11 w-11 rounded-lg bg-transparent"
            >
              <Heart className="h-6 w-6" />
            </Button>
            {/* User + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-lg bg-transparent"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User className="h-6 w-6" />
              </Button>

              {showProfile && (
                <div
                  className="absolute right-0 mt-2 z-[9999] w-[250px] max-h-[80vh] bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col overflow-y-auto"
                  onClick={(e) => e.stopPropagation()} // ✅ Prevent outside click from closing immediately
                >
                  {/* Profile Section */}
                  <div className="p-2 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src="/icons/user-avatar.png"
                          alt="User avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          User name
                        </h3>
                        <Link href="/userprofile">
                        <button>
                        <p className="text-sm text-gray-500">
                          View public profile
                        </p>
                        </button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1 flex-1">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setShowProfile(false)} // ✅ Close dropdown on click
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 relative flex-shrink-0">
                            <Image
                              src={item.icon}
                              alt={item.label}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[14px] text-gray-900 font-normal">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    ))}

                    {/* Wishlist */}
                    <Link
                      href="/editprofile"
                      onClick={() => setShowProfile(false)} // ✅ Close dropdown on click
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-gray-600" />
                        <span className="text-base text-gray-900 font-normal">
                          My wishlist
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 flex-shrink-0">
                    <div className="p-2" style={{ backgroundColor: "#fdf7f4" }}>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors"
                        style={{ backgroundColor: "#E0622C0D" }}
                      >
                        <div className="w-5 h-5 relative flex-shrink-0">
                          <Image
                            src="/icons/logout.png"
                            alt="Logout"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span
                          className="text-base font-normal"
                          style={{ color: "#7A2E0E" }}
                        >
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white px-4 sm:px-6 text-sm sm:text-base font-semibold h-10 sm:h-11 w-[100px] sm:w-[135px] rounded-3xl">
              Sell
            </Button>
          </div>

          {/* Mobile Icons */}
          <div className="flex sm:hidden items-center space-x-2">
            <Link href="/cart">
              <Button
                variant="outline"
                size="icon"
                className="relative h-10 w-10 rounded-lg bg-transparent"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="ml-2 hidden md:inline">Cart</span>
                <span className="absolute -top-1 -right-1 bg-[#E87A3F] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg bg-transparent"
            >
              <Heart className="h-6 w-6" />
            </Button>
            {/* User + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-lg bg-transparent"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User className="h-6 w-6" />
              </Button>

              {showProfile && (
                <div className="absolute right-0 mt-2 z-50 w-[250px] max-h-[80vh] bg-white rounded-lg shadow-lg border border-gray-100 flex flex-col overflow-y-auto">
                  {/* Profile Section */}
                  <div className="p-2 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src="/icons/user-avatar.png"
                          alt="User avatar"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">
                          User name
                        </h3>
                        <p className="text-sm text-gray-500">
                          View public profile
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1 flex-1">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href} // ✅ use href from menuItems
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-md"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 relative flex-shrink-0">
                            <Image
                              src={item.icon}
                              alt={item.label}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[14px] text-gray-900 font-normal">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </Link>
                    ))}

                    {/* Wishlist */}
                    <Link
                      href="/editprofile"
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="w-5 h-5 text-gray-600" />
                        <span className="text-base text-gray-900 font-normal">
                          My wishlist
                        </span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 flex-shrink-0">
                    <div className="p-2" style={{ backgroundColor: "#fdf7f4" }}>
                      <button
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-md transition-colors"
                        style={{ backgroundColor: "#E0622C0D" }}
                      >
                        <div className="w-5 h-5 relative flex-shrink-0">
                          <Image
                            src="/icons/logout.png"
                            alt="Logout"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <span
                          className="text-base font-normal"
                          style={{ color: "#7A2E0E" }}
                        >
                          Logout
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-white shadow-sm hidden md:block">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Button
              variant="outline"
              className="h-12 px-4 rounded-lg border-gray-300 bg-transparent"
            >
              <Menu className="h-6 w-6 mr-2" />
              <span className="font-medium">All Categories</span>
            </Button>
            <nav className="flex items-center space-x-8 text-base">
              <a
                href="#"
                className="text-[#E87A3F] font-semibold border-b-2 border-[#E87A3F] pb-1"
              >
                Women
              </a>
              <a href="#" className="hover:text-[#E87A3F]">
                Men
              </a>
              <a href="#" className="hover:text-[#E87A3F]">
                Kids
              </a>
              <a href="#" className="hover:text-[#E87A3F]">
                Handbags
              </a>
              <a href="#" className="hover:text-[#E87A3F]">
                Occasional
              </a>
            </nav>
          </div>
          <Button
            variant="outline"
            className="bg-[#FEF3EC] border-[#FEF3EC] text-[#E87A3F] hover:bg-[#fde8d9] h-12 px-6 rounded-full text-base font-medium"
            onClick={() => setShowAuth(true)} // ✅ Open popup
          >
            Log in / Sign up
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200 shadow-md">
          <nav className="flex flex-col space-y-3 p-4 text-gray-700">
            <a href="#" className="hover:text-[#E87A3F]">
              Women
            </a>
            <a href="#" className="hover:text-[#E87A3F]">
              Men
            </a>
            <a href="#" className="hover:text-[#E87A3F]">
              Kids
            </a>
            <a href="#" className="hover:text-[#E87A3F]">
              Handbags
            </a>
            <a href="#" className="hover:text-[#E87A3F]">
              Occasional
            </a>
            <hr className="my-2" />
            <a
              href="#"
              className="hover:text-[#E87A3F] flex items-center space-x-2"
            >
              <ShoppingCart className="h-5 w-5" /> <span>Cart</span>
            </a>
            <a
              href="#"
              className="hover:text-[#E87A3F] flex items-center space-x-2"
            >
              <Heart className="h-5 w-5" /> <span>Wishlist</span>
            </a>
            <a
              href="#"
              className="hover:text-[#E87A3F] flex items-center space-x-2"
            >
              <User className="h-5 w-5" /> <span>Account</span>
            </a>
            <Button
              variant="outline"
              className="bg-[#FEF3EC] border-[#FEF3EC] text-[#E87A3F] hover:bg-[#fde8d9] h-11 rounded-3xl"
              onClick={() => {
                setShowAuth(true); // ✅ Open popup
                setMobileMenuOpen(false); // Close mobile menu
              }}
            >
              Log in / Sign up
            </Button>

            <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white px-6 text-base font-semibold h-11 rounded-3xl">
              Sell
            </Button>
          </nav>
        </div>
      )}

      {/* Auth Popup */}
      {showAuth && (
        <AuthPopup isOpen={showAuth} onClose={() => setShowAuth(false)} />
      )}
    </header>
  );
}
