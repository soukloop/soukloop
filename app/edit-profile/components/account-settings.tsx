"use client";

import {
  Edit,
  X,
  ShoppingCart,
  Heart,
  MapPin,
  CreditCard,
  Store,
  Package,
  Unlock,
  Lock,
  Settings,
  LogOut,
  LayoutDashboard,
  History,
  User as UserIcon,
  Building2,
  Star
} from "lucide-react";
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
import EditProfileSection from './EditProfileSection'
import BillingAddressForm from "@/components/forms/BillingAddressForm";
import { useProfile } from "@/hooks/useProfile";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { useCart } from "@/hooks/useCart";
import MyOrdersSection from './my-orders';
import AddressBookSection from './AddressBookSection';
import PaymentsSection from './PaymentsSection';
import SellerApplicationSection from './SellerApplicationSection';
import { useSellerAuth } from "@/hooks/useSellerAuth";
import WishlistSection from './WishlistSection';
import PromoCodesSection from './PromoCodesSection';
import { Tag } from "lucide-react";

export default function AccountSettings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from URL or default to 'edit-profile'
  const initialSection = searchParams?.get("section") || "edit-profile";
  const [activeSection, setActiveSection] = useState(initialSection);

  // Sync state with URL when URL changes (e.g. back button)
  useEffect(() => {
    const section = searchParams?.get("section");
    if (section && section !== activeSection) {
      setActiveSection(section);
    }
  }, [searchParams]);

  // Update URL when state changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("section", section);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const { isSeller } = useSellerAuth();

  // Actually, we should use the user object to check the tier.
  // Wait, I need to get the user from useProfile or useAuth.
  const { profile } = useProfile();
  const planTier = useMemo(() => {
    return (profile?.user as any)?.planTier || (profile?.user as any)?.vendor?.planTier || (typeof window !== 'undefined' ? (window as any).__USER_PLAN_TIER__ : 'BASIC');
  }, [profile]);

  const filteredTabs = useMemo(() => {
    const isPremium = planTier === 'STARTER' || planTier === 'PRO';
    return [
      { id: 'edit-profile', label: 'Edit Profile', icon: Edit },
      { id: 'my-orders', label: 'My Orders', icon: Package },
      { id: 'wishlist', label: 'Wishlist', icon: Heart },
      { id: 'address', label: 'Address Book', icon: MapPin },
      ...(isSeller ? [{ id: 'payment', label: 'Payments', icon: CreditCard }] : []),
      ...(isSeller && isPremium ? [{ id: 'promo-codes', label: 'Promo Codes', icon: Tag }] : []),
    ];
  }, [isSeller, planTier]);

  // Mandatory Redirect for restricted sections
  useEffect(() => {
    const isPremium = planTier === 'STARTER' || planTier === 'PRO';
    if (activeSection === 'promo-codes' && (!isSeller || !isPremium)) {
      handleSectionChange('edit-profile');
    }
  }, [activeSection, isSeller, planTier]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Step Navigation */}
      <div className="bg-white py-4 shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4">
            <div
              className={`
                flex overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 items-center 
                justify-between md:justify-center md:gap-4 w-full mx-auto hide-scrollbar
              `}
            >
              {filteredTabs.map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`
                      flex flex-col md:flex-row items-center justify-center 
                      rounded-2xl px-2 py-2 md:px-4 md:py-2 
                      w-[60px] md:w-auto md:min-w-[140px] h-auto flex-shrink-0 
                      snap-start cursor-pointer transition-all duration-300
                      ${isActive
                        ? "md:bg-[#FEF3EC] md:border md:border-[#E87A3F]"
                        : "md:bg-gray-100"
                      }
                    `}
                  >
                    <div
                      className={`
                        w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center 
                        transition-colors duration-300
                        ${isActive
                          ? "bg-[#E87A3F] text-white shadow-md md:shadow-none scale-110 md:scale-100"
                          : "bg-gray-100 md:bg-gray-400 text-gray-500 md:text-white hover:bg-gray-200"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5 md:w-4 md:h-4" />
                    </div>

                    {/* Desktop Label */}
                    <span
                      className={`
                        hidden md:inline-block ml-3 font-medium text-base
                        ${isActive ? "text-[#E87A3F]" : "text-gray-600"}
                      `}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Active Section Title */}
            <div className="md:hidden text-center pb-2 animate-in fade-in slide-in-from-top-1 duration-300">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 mx-10">
                {filteredTabs.find(i => i.id === activeSection)?.label}
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="py-6 md:py-8">
        {/* Edit Profile */}
        {activeSection === "edit-profile" && <EditProfileSection />}

        {/* My Orders */}
        {activeSection === 'my-orders' && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm">
              <MyOrdersSection />
            </div>
          </div>
        )}

        {/* Address Book */}
        {activeSection === 'address' && <AddressBookSection />}

        {/* Payments Section */}
        {/* Payments Section */}
        {activeSection === 'payment' && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-6xl animate-in fade-in slide-in-from-right-4 duration-500">
              <PaymentsSection />
            </div>
          </div>
        )}

        {/* Wishlist */}
        {activeSection === 'wishlist' && <WishlistSection />}

        {/* Promo Codes */}
        {activeSection === 'promo-codes' && isSeller && (planTier === 'STARTER' || planTier === 'PRO') && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-6xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Promo Codes</h2>
                <p className="text-sm text-gray-500 mt-1">Manage discount codes for your customers to use at checkout.</p>
              </div>
              <div className="h-px bg-gray-100" />
              <PromoCodesSection />
            </div>
          </div>
        )}

        {/* No restricted UI prompt - we use absolute redirection now */}
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
