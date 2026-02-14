"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import AuthPopup from "@/components/auth/auth-popup";

import {
  Check,
  ChevronDown,
  Heart,
  Info,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

// Sub-components
import CartWidget from "./header/CartWidget";
import UserMenu from "./header/UserMenu";
import MobileNav from "./header/MobileNav";
import DesktopNav from "./header/DesktopNav";
// SearchBar is deliberately omitted to preserve visual parity (currently in page body)
import SearchBar from "./header/SearchBar";
import { useQuery } from "@tanstack/react-query";
import type { GroupedDressStyles } from "@/types/product";

const DRESS_STYLES_CACHE_KEY = ['dress-styles'];
const STALE_TIME = 30 * 60 * 1000; // 30 minutes

interface EcommerceHeaderProps {
  initialDressStyles?: GroupedDressStyles;
}


export default function EcommerceHeader({ initialDressStyles }: EcommerceHeaderProps) {
  const router = useRouter();
  const { scrollY } = useScroll();
  const [isTop, setIsTop] = useState(true);
  const [headerHidden, setHeaderHidden] = useState(false);
  const { user, refreshSession } = useAuth();


  const dressStyles = initialDressStyles;

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;

    if (latest < 50) {
      setIsTop(true);
      setHeaderHidden(false);
    } else {
      setIsTop(false);
    }

    if (latest > previous && latest > 150) {
      setHeaderHidden(true);
    } else if (latest < previous) {
      setHeaderHidden(false);
    }
  });

  const [showAuth, setShowAuth] = useState(false);

  // Currency & Language
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [showCurrencyPopup, setShowCurrencyPopup] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);

  const currencyPopupRef = useRef<HTMLDivElement>(null);
  const languagePopupRef = useRef<HTMLDivElement>(null);

  const currencies = [{ code: "USD", name: "Dollar (USD)" }];
  const languages = [
    { code: "en", name: "English", flag: "/icons/us-flag.png" },
  ];

  // close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        currencyPopupRef.current &&
        !currencyPopupRef.current.contains(event.target as Node)
      ) {
        setShowCurrencyPopup(false);
      }
      if (
        languagePopupRef.current &&
        !languagePopupRef.current.contains(event.target as Node)
      ) {
        setShowLanguagePopup(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Listen for open-auth-modal event
  useEffect(() => {
    const handleOpenAuth = () => setShowAuth(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  return (
    <>
      <div className="w-full h-[110px] sm:h-[136px]" />
      <header className="fixed top-0 z-[100] w-full shadow-sm">
        {/* Top Bar */}
        <motion.div
          initial="visible"
          animate={isTop ? "visible" : "hidden"}
          variants={{
            visible: { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } },
            hidden: { height: 0, opacity: 0, overflow: "hidden" }
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-[#E87A3F] text-xs sm:text-sm text-white"
        >
          <div className="container mx-auto flex h-6 sm:h-9 items-center justify-center sm:justify-between px-3 sm:px-6 lg:px-8">
            {/* Mobile: Centered text only */}
            <div className="flex sm:hidden items-center justify-center space-x-1.5 text-xs">
              <Check className="size-3 flex-shrink-0" />
              <span>Free Shipping Over $50</span>
            </div>

            {/* Desktop: Left side */}
            <div className="hidden sm:flex items-center space-x-2 text-sm">
              <Check className="size-4 flex-shrink-0" />
              <span>Free Shipping On All Orders Over $50</span>
            </div>

            {/* Desktop: Right side menu */}
            <div className="hidden sm:flex flex-wrap justify-center gap-4 text-sm md:mt-0 md:justify-end">
              {/* Language dropdown */}
              <div className="relative" ref={languagePopupRef}>
                <div
                  className="flex cursor-pointer items-center space-x-1 hover:opacity-80"
                  onClick={() => setShowLanguagePopup(!showLanguagePopup)}
                >
                  <span>
                    {selectedLanguage === "English" ? "Eng" : selectedLanguage}
                  </span>
                  <ChevronDown className="size-4" />
                </div>

                {showLanguagePopup && (
                  <div
                    className="absolute top-full sm:right-0 z-50 mt-2 border border-gray-200 bg-white shadow-lg"
                    style={{
                      width: "200px",
                      borderRadius: "6px",
                      padding: "8px 0",
                    }}
                  >
                    <div className="flex flex-col">
                      {languages.map((language) => (
                        <div
                          key={language.code}
                          className="flex cursor-pointer items-center gap-3 transition-colors hover:bg-[#fdf7f4]"
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "6px 12px",
                          }}
                          onClick={() => {
                            setSelectedLanguage(language.name);
                            setShowLanguagePopup(false);
                          }}
                        >
                          <Image
                            src={language.flag}
                            alt={`${language.name} flag`}
                            width={20}
                            height={20}
                            className="rounded-full object-cover"
                          />
                          <span
                            className={`text-sm font-medium ${selectedLanguage === language.name
                              ? "text-orange-500"
                              : "text-gray-600"
                              }`}
                          >
                            {language.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Currency dropdown */}
              <div className="relative" ref={currencyPopupRef}>
                <div
                  className="flex cursor-pointer items-center space-x-1 hover:opacity-80"
                  onClick={() => setShowCurrencyPopup(!showCurrencyPopup)}
                >
                  <span>{selectedCurrency}</span>
                  <ChevronDown className="size-4" />
                </div>

                {showCurrencyPopup && (
                  <div
                    className="absolute top-full sm:right-0 z-50 mt-2 border border-gray-200 bg-white shadow-lg"
                    style={{
                      width: "220px",
                      borderRadius: "6px",
                      padding: "8px 0",
                    }}
                  >
                    <div className="flex flex-col">
                      {currencies.map((currency) => (
                        <div
                          key={currency.code}
                          className="cursor-pointer transition-colors hover:bg-[#fdf7f4]"
                          style={{
                            width: "100%",
                            height: "40px",
                            padding: "8px 12px",
                            display: "flex",
                            alignItems: "center",
                          }}
                          onClick={() => {
                            setSelectedCurrency(currency.code);
                            setShowCurrencyPopup(false);
                          }}
                        >
                          <span
                            className={`text-sm font-medium ${selectedCurrency === currency.code
                              ? "text-orange-500"
                              : "text-gray-600"
                              }`}
                          >
                            {currency.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <a href="/privacy-policy" className="hover:opacity-80">
                Privacy Policy
              </a>
              <div className="flex items-center space-x-1 hover:opacity-80">
                <Info className="size-4" />
                <Link href="/faqs">
                  <span>Need Help</span>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Middle Row (Static) */}
        <div className="border-b border-gray-200 bg-white relative z-30">
          <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8 relative">
            {/* Logo */}
            <Link href="/">
              <div className="text-2xl font-bold sm:text-3xl">
                <img src="/images/logo.png" alt="SoukLoop" className="h-10" />
              </div>
            </Link>

            {/* Desktop Icons */}
            <div className="hidden items-center space-x-2 sm:flex">
              <CartWidget />

              {/* Wishlist Button - Only for logged-in users */}
              {user && (
                <Link href="/editprofile?section=wishlist">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Heart className="size-6 text-[#ff4500] fill-[#ff4500]" />
                  </Button>
                </Link>
              )}

              <UserMenu />
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center gap-2 sm:hidden">
              <CartWidget />

              {/* Wishlist Button - Only for logged-in users */}
              {user && (
                <Link href="/editprofile?section=wishlist">
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors">
                    <Heart className="size-5 text-[#ff4500] fill-[#ff4500]" />
                  </button>
                </Link>
              )}

              <UserMenu />
            </div>
          </div>
        </div>

        {/* Navigation Bar (Revealing) */}
        <motion.div
          animate={headerHidden ? "hidden" : "visible"}
          variants={{
            visible: { height: "auto", opacity: 1, transitionEnd: { overflow: "visible" } },
            hidden: { height: 0, opacity: 0, overflow: "hidden" }
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="bg-white shadow-sm relative z-20"
        >
          <div className="container mx-auto flex h-auto min-h-[36px] py-0 sm:py-0 sm:h-9 flex-wrap sm:flex-nowrap items-center justify-between px-4 sm:px-6 lg:px-8">
            <DesktopNav initialDressStyles={dressStyles} />
            <div className="sm:hidden w-full">
              <MobileNav />
            </div>
          </div>
        </motion.div>

        {/* Auth Popup */}
        {showAuth && (
          <AuthPopup isOpen={showAuth} onClose={() => setShowAuth(false)} />
        )}
      </header>
    </>
  );
}

