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
import BankAccountsSection from './BankAccountsSection';
import SellerApplicationSection from './SellerApplicationSection';

export default function AccountSettings() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize from URL or default to 'edit-profile'
  const initialSection = searchParams?.get("section") || "edit-profile";
  const [activeSection, setActiveSection] = useState(initialSection);

  const { addItem } = useCart();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);

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

  // Fetch Favorites
  useEffect(() => {
    if (activeSection === "wishlist") {
      setIsLoadingFavorites(true);
      fetch("/api/favorites")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setFavorites(data);
          }
          setIsLoadingFavorites(false);
        })
        .catch((err) => {
          console.error("Failed to fetch favorites", err);
          setIsLoadingFavorites(false);
        });
    }
  }, [activeSection]);

  const handleRemoveFavorite = async (productId: string) => {
    setFavorites(prev => prev.filter(f => f.product.id !== productId));
    try {
      await fetch(`/api/favorites?productId=${productId}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to remove favorite", err);
      // could revert optimistic update here
    }
  };

  const handleAddToCartFromWishlist = async (product: any) => {
    await addItem(product.id, 1, {
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images
    });
    toast.success("Added to cart");
  };

  const { addresses, createAddress, updateAddress, isLoading } = useProfile();

  const shippingAddress = useMemo(() => {
    return addresses?.find(addr => addr.isShipping) || null;
  }, [addresses]);

  const handleSaveAddress = async (data: any) => {
    try {
      if (shippingAddress) {
        await updateAddress(shippingAddress.id, { ...data, isShipping: true });
        toast.success("Shipping address updated successfully");
      } else {
        await createAddress({ ...data, isShipping: true });
        toast.success("Shipping address created successfully");
      }
    } catch (error) {
      console.error("Failed to save address:", error);
      toast.error("Failed to save address");
    }
  };

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
              {[
                { id: "edit-profile", label: "Edit Profile", icon: Edit },
                { id: 'orders', label: 'My Orders', icon: Package },
                { id: 'wishlist', label: 'Wishlist', icon: Heart },
                { id: 'address', label: 'Address Book', icon: MapPin },
                { id: 'payment', label: 'Bank Accounts', icon: Building2 },
              ].map((item) => {
                const isActive = activeSection === item.id;
                const Icon = item.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSectionChange(item.id)}
                    className={`
                      flex flex-col md:flex-row items-center justify-center 
                      rounded-2xl px-2 py-2 md:px-6 md:py-3 
                      w-[60px] md:w-auto md:min-w-[200px] h-auto flex-shrink-0 
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
                {[
                  { id: "edit-profile", label: "Edit Profile" },
                  { id: "orders", label: "My Orders" },
                  { id: "wishlist", label: "Wishlist" },
                  { id: "address", label: "Address Book" },
                  { id: "payment", label: "Bank Accounts" },
                  { id: "security", label: "Security" },
                ].find(i => i.id === activeSection)?.label}
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
        {activeSection === 'orders' && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-sm">
              <MyOrdersSection />
            </div>
          </div>
        )}

        {/* Address Book */}
        {activeSection === 'address' && <AddressBookSection />}

        {/* Bank Accounts (Payouts) */}
        {activeSection === 'payment' && (
          <div className="flex justify-center px-4 sm:px-6">
            <div className="w-full max-w-6xl space-y-6 md:space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-gray-900">Bank Accounts</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your bank accounts for receiving earnings and payouts.</p>
              </div>
              <div className="h-px bg-gray-100" />
              <BankAccountsSection />
            </div>
          </div>
        )}

        {/* Wishlist */}
        {activeSection === 'wishlist' && (
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
                  {isLoadingFavorites ? (
                    // Skeleton Rows
                    [1, 2, 3].map((i) => (
                      <div key={i} className="px-4 md:px-6 py-4 animate-pulse">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                          {/* Product Info Skeleton */}
                          <div className="col-span-1 md:col-span-6 flex items-center space-x-3 md:space-x-4">
                            <div className="w-16 h-16 md:w-[72px] md:h-[72px] bg-gray-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4" />
                              <div className="h-3 bg-gray-200 rounded w-1/2 md:hidden" />
                            </div>
                          </div>
                          {/* Price Skeleton */}
                          <div className="col-span-1 md:col-span-2 hidden md:block">
                            <div className="h-5 bg-gray-200 rounded w-20" />
                          </div>
                          {/* Stock Skeleton */}
                          <div className="col-span-1 md:col-span-2 hidden md:block">
                            <div className="h-6 bg-gray-200 rounded-full w-24" />
                          </div>
                          {/* Actions Skeleton */}
                          <div className="col-span-1 md:col-span-2 hidden md:block">
                            <div className="h-10 bg-gray-200 rounded-lg w-full" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : favorites.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">Your wishlist is empty.</div>
                  ) : (
                    favorites.map((item) => {
                      const product = item.product;
                      const image = product.images?.[0]?.url || "/placeholder.svg";
                      const inStock = product.status !== 'SOLD'; // Simplified

                      return (
                        <div key={item.id} className="px-4 md:px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                            {/* Product Info */}
                            <div className="col-span-1 md:col-span-6 flex items-center space-x-3 md:space-x-4 cursor-pointer" onClick={() => window.location.href = `/productdetails?id=${product.id}`}>
                              <img
                                src={image}
                                alt={product.name}
                                className="w-16 h-16 md:w-[72px] md:h-[72px] object-cover rounded-lg flex-shrink-0"
                              />
                              <p className="text-sm text-gray-900 line-clamp-2 hover:text-[#E87A3F] transition-colors">
                                {product.name}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="col-span-1 md:col-span-2 flex justify-between md:block mt-2 md:mt-0">
                              <span className="text-xs text-gray-500 md:hidden">
                                Price:
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  ${product.price.toFixed(2)}
                                </span>
                              </div>
                            </div>

                            {/* Stock Status */}
                            <div className="col-span-1 md:col-span-2 flex justify-between md:block mt-2 md:mt-0">
                              <span className="text-xs text-gray-500 md:hidden">
                                Stock:
                              </span>
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${inStock
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                                  }`}
                              >
                                {inStock ? "IN STOCK" : "OUT OF STOCK"}
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-1 md:col-span-2 flex justify-between md:flex items-center space-x-2 mt-3 md:mt-0">
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleAddToCartFromWishlist(product); }}
                                className={`w-full md:w-[130px] h-10 md:h-12 rounded-lg text-xs md:text-sm font-medium ${inStock
                                  ? "bg-[#E87A3F] hover:bg-[#d96d34] text-white"
                                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  }`}
                                disabled={!inStock}
                              >
                                <ShoppingCart className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                                ADD TO CART
                              </Button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(product.id); }}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
    </div >
  );
}
