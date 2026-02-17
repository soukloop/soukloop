"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { User, ChevronRight, LogOut, X, Settings, Bell, RotateCcw, Package, Truck, Gift, MessageCircle, Heart, LayoutDashboard, PlusCircle, List, Wallet, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { useSellerVerification } from "@/hooks/useSellerVerification";
import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import { isAtLeastSeller, isAtLeastAdmin, hasRole } from "@/lib/roles";

export default function UserMenu() {
    const router = useRouter();
    const { user, logout, isLoading } = useAuth();
    const { profile } = useProfile();
    const { isSeller } = useSellerAuth();
    const { hasApplication } = useSellerVerification();
    const [showProfile, setShowProfile] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const displayUser = profile?.user || user;
    const userAvatar = profile?.avatar || displayUser?.image || "/icons/user-avatar.png";

    const { unreadCount, getUnreadNotifications } = useNotifications();
    const unreadNotifications = getUnreadNotifications();

    // Check specific categories for unread items
    const hasUnreadMessages = unreadNotifications.some(n => n.type === 'NEW_MESSAGE');
    const hasUnreadOrders = unreadNotifications.some(n => n.type.startsWith('ORDER_'));
    const hasUnreadGeneral = unreadCount > 0; // For main bell or generic notifications

    const commonMenuItems = [
        { icon: Settings, label: "Account settings", href: "/edit-profile" },
        { icon: Bell, label: "Notification settings", href: "/notifications", hasBadge: hasUnreadGeneral },
        { icon: RotateCcw, label: "Refunds & Returns", href: "/refunds-and-returns" },
        { icon: Package, label: "My orders", href: "/editprofile?section=my-orders", hasBadge: hasUnreadOrders },
        { icon: Truck, label: "Track Order", href: "/track-orders" },
        { icon: Gift, label: "Rewards", href: "/reward-points" },
        { icon: MessageCircle, label: "Chat box", href: "/chats", hasBadge: hasUnreadMessages },
        { icon: Heart, label: "My wishlist", href: "/editprofile?section=wishlist" },
    ];

    const sellerMenuItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/seller/dashboard" },
        { icon: PlusCircle, label: "Post New Product", href: "/seller/post-new-product" },
        { icon: List, label: "Manage Listings", href: "/seller/manage-listings" },
        { icon: Wallet, label: "Withdraw Earnings", href: "/withdraw-earnings" },
    ];

    const adminMenuItems = [
        { icon: Shield, label: "Admin Dashboard", href: "/admin" },
    ];

    // Build menu items based on hierarchical roles
    let menuItems: any[] = [];

    // 1. Add Admin Dashboard if user is at least an admin/moderator
    if (hasRole(user?.role, "SUPPORT")) { // SUPPORT is the lowest admin-level role in our hierarchy
        menuItems = [...adminMenuItems];
    }

    // 2. Add Seller items if user is at least a seller
    if (isAtLeastSeller(user?.role)) {
        menuItems = [...menuItems, ...sellerMenuItems];
    }

    // 3. Add Common items
    menuItems = [...menuItems, ...commonMenuItems];

    // ✅ Trigger Auth Modal
    const triggerAuth = () => {
        window.dispatchEvent(new CustomEvent('open-auth-modal'));
    };

    // ✅ Close profile dropdown on outside click
    // Using 'click' instead of 'mousedown' to ensure navigation completes before closing
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowProfile(false);
            }
        };
        if (showProfile) {
            // Use 'click' event - 'mousedown' fires before navigation can start
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [showProfile]);

    return (
        <>
            {/* Desktop User Menu */}
            <div className="hidden sm:block">
                {isLoading ? (
                    <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200" />
                ) : user ? (
                    <div className="relative" ref={dropdownRef}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="size-12 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:text-orange-500 transition-colors relative"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <User className="size-6" />
                            {/* Profile Icon Global Badge */}
                            {(hasUnreadGeneral || hasUnreadMessages) && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                            )}
                        </Button>

                        {showProfile && (
                            <div
                                className="absolute right-0 z-[9999] mt-2 flex max-h-[85vh] w-[280px] flex-col overflow-y-auto custom-scrollbar rounded-lg border border-gray-100 bg-white shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Profile Section */}
                                <div className="shrink-0 border-b border-gray-100 p-2">
                                    <div className="flex items-center gap-3">
                                        <div className="relative size-12 overflow-hidden rounded-full">
                                            <Image
                                                src={userAvatar}
                                                alt="User avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-medium text-gray-900">
                                                {displayUser?.name || displayUser?.username || "Guest"}
                                            </h3>
                                            {displayUser?.email && (
                                                <p className="text-xs text-gray-400">
                                                    {displayUser.email}
                                                </p>
                                            )}
                                            <Link href="/profile" className="inline-block mt-1">
                                                <p className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                                    View public profile
                                                </p>
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="flex-1 py-1">
                                    {menuItems.map((item, index) => (
                                        <button
                                            key={index}
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent dropdown close before navigation
                                                setShowProfile(false);
                                                router.push(item.href);
                                            }}
                                            className="flex w-full items-center justify-between rounded-md px-4 py-3 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <item.icon className="size-5 shrink-0 text-gray-500" />
                                                </div>
                                                <span className="text-[14px] font-normal text-gray-900">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Badge for menu item */}
                                                {item.hasBadge && (
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                )}
                                                <ChevronRight className="size-5 text-gray-400" />
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Logout */}
                                <div className="shrink-0 border-t border-gray-100">
                                    <div className="p-2" style={{ backgroundColor: "#fdf7f4" }}>
                                        <button
                                            className="flex w-full items-center gap-3 rounded-md px-4 py-3 transition-colors"
                                            style={{ backgroundColor: "#E0622C0D" }}
                                            onClick={() => {
                                                setShowLogoutModal(true);
                                                setShowProfile(false);
                                            }}
                                        >
                                            <LogOut className="size-5 shrink-0 text-[#7A2E0E]" />
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

                        {/* Sell/Post/Login Button inside User Menu Container (moved from outside in original file for better grouping) */}
                        {/* Wait, original file had this separate. I will extract user dropdown logic here mostly, but the "Sell" button was separate. */}
                    </div>
                ) : (
                    <div className="hidden items-center gap-2 sm:flex">
                        <Button
                            onClick={triggerAuth}
                            className="h-12 w-[140px] rounded-3xl bg-[#E87A3F] px-4 text-sm font-semibold text-white hover:bg-[#d96d34] sm:h-12 sm:w-[160px] sm:px-6 sm:text-base shadow-sm"
                        >
                            Log in / Sign up
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile User Icon / Login Pill */}
            <div className="sm:hidden">
                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors relative"
                            onClick={() => setShowProfile(!showProfile)}
                        >
                            <User className="size-5 text-gray-700" />
                            {/* Mobile Icon Global Badge */}
                            {(hasUnreadGeneral || hasUnreadMessages) && (
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                            )}
                        </button>

                        {showProfile && (
                            <div
                                className="absolute right-0 z-[9999] mt-2 flex max-h-[70vh] w-[260px] flex-col overflow-y-auto custom-scrollbar rounded-lg border border-gray-100 bg-white shadow-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Mobile Profile Section */}
                                <div className="shrink-0 border-b border-gray-100 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="relative size-10 overflow-hidden rounded-full">
                                            <Image
                                                src={userAvatar}
                                                alt="User avatar"
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900">
                                                {user?.username || "Guest"}
                                            </h3>
                                            <Link href="/profile">
                                                <p className="text-xs text-gray-500">View profile</p>
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
                                            onClick={() => setShowProfile(false)}
                                            className="flex w-full items-center justify-between rounded-md px-3 py-2.5 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className="relative">
                                                    <item.icon className="size-4 shrink-0 text-gray-500" />
                                                </div>
                                                <span className="text-[13px] font-normal text-gray-900">
                                                    {item.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Badge for menu item */}
                                                {item.hasBadge && (
                                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                )}
                                                <ChevronRight className="size-4 text-gray-400" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Logout */}
                                <div className="shrink-0 border-t border-gray-100 p-2">
                                    <div className="p-1" style={{ backgroundColor: "#fdf7f4" }}>
                                        <button
                                            className="flex w-full items-center gap-3 rounded-md px-4 py-3 transition-colors hover:bg-[#E0622C1A]"
                                            style={{ backgroundColor: "#E0622C0D" }}
                                            onClick={() => {
                                                setShowLogoutModal(true);
                                                setShowProfile(false);
                                            }}
                                        >
                                            <LogOut className="size-5 shrink-0 text-[#7A2E0E]" />
                                            <span className="text-[14px] font-normal text-[#7A2E0E]">
                                                Logout
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        className="flex h-9 items-center justify-center rounded-full bg-[#E87A3F] px-4 transition-colors hover:bg-[#d96d34]"
                        onClick={triggerAuth}
                    >
                        <span className="text-xs font-semibold text-white">Log in / Sign up</span>
                    </button>
                )}
            </div>

            {showLogoutModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                        onClick={() => setShowLogoutModal(false)}
                    />
                    <div
                        className="relative flex w-[90%] flex-col items-center justify-center bg-white p-8 shadow-xl sm:w-[500px]"
                        style={{ height: "auto", borderRadius: "16px" }}
                    >
                        <button
                            onClick={() => setShowLogoutModal(false)}
                            className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
                        >
                            <X className="size-4" />
                        </button>
                        <div className="mb-6 flex size-20 items-center justify-center rounded-full bg-orange-100">
                            <div className="flex size-12 items-center justify-center rounded-full bg-orange-500">
                                <LogOut className="size-6 text-white" />
                            </div>
                        </div>
                        <h2 className="mb-4 text-center text-2xl font-bold text-gray-900">
                            Are you sure you want to log out?
                        </h2>
                        <p className="mb-8 text-center text-gray-600">
                            {"You'll be signed out from your account."}
                        </p>
                        <div className="flex w-full flex-col gap-4 sm:flex-row">
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                className="h-14 w-full bg-gray-100 font-medium text-orange-500 transition-colors hover:bg-gray-200 sm:w-[212px]"
                                style={{ borderRadius: "50px" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await logout();
                                        setShowLogoutModal(false);
                                        router.push("/");
                                    } catch (error) {
                                        console.error("Logout failed:", error);
                                    }
                                }}
                                className="h-14 w-full bg-orange-500 font-medium text-white transition-colors hover:bg-orange-600 sm:w-[212px]"
                                style={{ borderRadius: "50px" }}
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Separate Sell/Post Button for Desktop */}
            {user && (
                <div className="hidden sm:block ml-2">
                    {isSeller ? (
                        <Button
                            onClick={() => router.push('/seller/post-new-product')}
                            className="h-12 w-[120px] rounded-3xl bg-[#E87A3F] px-4 text-sm font-semibold text-white hover:bg-[#d96d34] sm:h-12 sm:w-[140px] sm:px-6 sm:text-base shadow-sm"
                        >
                            Post
                        </Button>
                    ) : (
                        <Button
                            onClick={() => {
                                if (hasApplication) {
                                    router.push('/editprofile?section=edit-profile#become-seller-section');
                                } else {
                                    router.push('/become-a-seller');
                                }
                            }}
                            className="h-12 w-[120px] rounded-3xl bg-[#E87A3F] px-4 text-sm font-semibold text-white hover:bg-[#d96d34] sm:h-12 sm:w-[140px] sm:px-6 sm:text-base shadow-sm"
                        >
                            Sell
                        </Button>
                    )}
                </div>
            )}
        </>
    );
}
