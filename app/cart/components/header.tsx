"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import AuthPopup from "@/components/auth/auth-popup";
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
    { icon: "/icons/dashboard.png", label: "Dashboard", href: "/dashboard" },
    {
      icon: "/icons/account-settings.png",
      label: "Account settings",
      href: "/edit-profile",
    },
    {
      icon: "/icons/notification-settings.png",
      label: "Notification settings",
      href: "/notification-settings",
    },
    {
      icon: "/icons/refunds-returns.png",
      label: "Refunds & Returns",
      href: "/refunds-and-returns",
    },
    { icon: "/icons/my-orders.png", label: "My Orders", href: "/edit-profile" },
    {
      icon: "/icons/track-order.png",
      label: "Track Order",
      href: "/track-orders",
    },
    { icon: "/icons/rewards.png", label: "Rewards", href: "/reward-points" },
    { icon: "/icons/chat-box.png", label: "Chat box", href: "/chats" },
  ];

  return (
    <header className="w-full bg-white text-gray-800">
      {/* Top Bar */}
      <div className="h-11 bg-[#E87A3F] text-sm text-white">
        <div className="container mx-auto flex h-10 flex-wrap items-center justify-center px-4 sm:px-6 md:justify-between lg:justify-between lg:px-8">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <Check className="size-4" />
            <span className="hidden sm:inline">
              Free Shipping On All Orders Over $50
            </span>
            <span className="sm:hidden">
              Free Shipping On All Orders Over $50
            </span>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4 text-sm md:mt-0 md:justify-end">
            <div className="flex cursor-pointer items-center space-x-1 hover:opacity-80">
              <span>Eng</span>
              <ChevronDown className="size-4" />
            </div>
            <div className="flex cursor-pointer items-center space-x-1 hover:opacity-80">
              <span>USD</span>
              <ChevronDown className="size-4" />
            </div>
            <a href="/privacy-policy" className="hover:opacity-80">
              Privacy Policy
            </a>
            <a
              href="#"
              className="flex items-center space-x-1 hover:opacity-80"
            >
              <Info className="size-4" />
              <span>Need Help</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:h-24 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="text-2xl font-bold sm:text-3xl">
            <span className="text-[#E87A3F]">Souk</span>
            <span className="text-[#008080]">Loop</span>
          </div>

          {/* Desktop Icons */}
          <div className="hidden items-center space-x-2 sm:flex">
            <Link href="/cart">
              <Button
                variant="outline"
                className="relative h-11 rounded-lg bg-transparent px-4"
              >
                <ShoppingCart className="size-6" />
                <span className="ml-2 hidden md:inline">Cart</span>
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#E87A3F] text-xs text-white">
                  2
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="size-11 rounded-lg bg-transparent"
            >
              <Heart className="size-6" />
            </Button>
            {/* User + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-lg bg-transparent"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User className="size-6" />
              </Button>

              {showProfile && (
                <div
                  className="absolute right-0 z-[9999] mt-2 flex max-h-[80vh] w-[250px] flex-col overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg"
                  onClick={(e) => e.stopPropagation()} // ✅ Prevent outside click from closing immediately
                >
                  {/* Profile Section */}
                  <div className="shrink-0 border-b border-gray-100 p-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-full">
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
                        <Link href="/profile">
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
                  <div className="flex-1 py-1">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setShowProfile(false)} // ✅ Close dropdown on click
                        className="flex w-full items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative size-4 shrink-0">
                            <Image
                              src={item.icon}
                              alt={item.label}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[14px] font-normal text-gray-900">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="size-5 text-gray-400" />
                      </Link>
                    ))}

                    {/* Wishlist */}
                    <Link
                      href="/edit-profile"
                      onClick={() => setShowProfile(false)} // ✅ Close dropdown on click
                      className="flex w-full items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="size-5 text-gray-600" />
                        <span className="text-base font-normal text-gray-900">
                          My wishlist
                        </span>
                      </div>
                      <ChevronRight className="size-5 text-gray-400" />
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="shrink-0 border-t border-gray-100">
                    <div className="p-2" style={{ backgroundColor: "#fdf7f4" }}>
                      <button
                        className="flex w-full items-center gap-3 rounded-md px-4 py-3 transition-colors"
                        style={{ backgroundColor: "#E0622C0D" }}
                      >
                        <div className="relative size-5 shrink-0">
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

            <Button className="h-10 w-[100px] rounded-3xl bg-[#E87A3F] px-4 text-sm font-semibold text-white hover:bg-[#d96d34] sm:h-11 sm:w-[135px] sm:px-6 sm:text-base">
              Sell
            </Button>
          </div>

          {/* Mobile Icons */}
          <div className="flex items-center space-x-2 sm:hidden">
            <Link href="/cart">
              <Button
                variant="outline"
                size="icon"
                className="relative size-10 rounded-lg bg-transparent"
              >
                <ShoppingCart className="size-6" />
                <span className="ml-2 hidden md:inline">Cart</span>
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-[#E87A3F] text-xs text-white">
                  2
                </span>
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="size-10 rounded-lg bg-transparent"
            >
              <Heart className="size-6" />
            </Button>
            {/* User + Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Button
                variant="outline"
                size="icon"
                className="size-11 rounded-lg bg-transparent"
                onClick={() => setShowProfile(!showProfile)}
              >
                <User className="size-6" />
              </Button>

              {showProfile && (
                <div className="absolute right-0 z-50 mt-2 flex max-h-[80vh] w-[250px] flex-col overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg">
                  {/* Profile Section */}
                  <div className="shrink-0 border-b border-gray-100 p-2">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12 overflow-hidden rounded-full">
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
                  <div className="flex-1 py-1">
                    {menuItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href} // ✅ use href from menuItems
                        className="flex w-full items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative size-4 shrink-0">
                            <Image
                              src={item.icon}
                              alt={item.label}
                              fill
                              className="object-contain"
                            />
                          </div>
                          <span className="text-[14px] font-normal text-gray-900">
                            {item.label}
                          </span>
                        </div>
                        <ChevronRight className="size-5 text-gray-400" />
                      </Link>
                    ))}

                    {/* Wishlist */}
                    <Link
                      href="/edit-profile"
                      className="flex w-full items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Heart className="size-5 text-gray-600" />
                        <span className="text-base font-normal text-gray-900">
                          My wishlist
                        </span>
                      </div>
                      <ChevronRight className="size-5 text-gray-400" />
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="shrink-0 border-t border-gray-100">
                    <div className="p-2" style={{ backgroundColor: "#fdf7f4" }}>
                      <button
                        className="flex w-full items-center gap-3 rounded-md px-4 py-3 transition-colors"
                        style={{ backgroundColor: "#E0622C0D" }}
                      >
                        <div className="relative size-5 shrink-0">
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
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="size-6" />
              ) : (
                <Menu className="size-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="hidden bg-white shadow-sm md:block">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8">
            <Button
              variant="outline"
              className="h-12 rounded-lg border-gray-300 bg-transparent px-4"
            >
              <Menu className="mr-2 size-6" />
              <span className="font-medium">All Categories</span>
            </Button>
            <nav className="flex items-center space-x-8 text-base">
              <a
                href="#"
                className="border-b-2 border-[#E87A3F] pb-1 font-semibold text-[#E87A3F]"
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
            className="h-12 rounded-full border-[#FEF3EC] bg-[#FEF3EC] px-6 text-base font-medium text-[#E87A3F] hover:bg-[#fde8d9]"
            onClick={() => setShowAuth(true)} // ✅ Open popup
          >
            Log in / Sign up
          </Button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white shadow-md sm:hidden">
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
              className="flex items-center space-x-2 hover:text-[#E87A3F]"
            >
              <ShoppingCart className="size-5" /> <span>Cart</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 hover:text-[#E87A3F]"
            >
              <Heart className="size-5" /> <span>Wishlist</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-2 hover:text-[#E87A3F]"
            >
              <User className="size-5" /> <span>Account</span>
            </a>
            <Button
              variant="outline"
              className="h-11 rounded-3xl border-[#FEF3EC] bg-[#FEF3EC] text-[#E87A3F] hover:bg-[#fde8d9]"
              onClick={() => {
                setShowAuth(true); // ✅ Open popup
                setMobileMenuOpen(false); // Close mobile menu
              }}
            >
              Log in / Sign up
            </Button>

            <Button className="h-11 rounded-3xl bg-[#E87A3F] px-6 text-base font-semibold text-white hover:bg-[#d96d34]">
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
