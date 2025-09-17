"use client";

import { useState, useEffect } from "react";

import {
  LogOut,
  X,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Bell,
  ChevronDown,
  Check,
  Plus,
  Menu,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Edit2 } from "lucide-react";

export default function AdminDashboard() {
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskAssignedModal, setShowTaskAssignedModal] = useState(false);
  const [showReplyInterface, setShowReplyInterface] = useState(false);
  const [showHelpLineModal, setShowHelpLineModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Sales");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("Dashboard");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReportedItemDetails, setShowReportedItemDetails] = useState(false);
  const [showReportedItemApprovalModal, setShowReportedItemApprovalModal] =
    useState(false);
  const [showReportedItemRejectionModal, setShowReportedItemRejectionModal] =
    useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategorySaveSuccess, setShowCategorySaveSuccess] = useState(false);
  const [showBannerEditModal, setShowBannerEditModal] = useState(false);
  const [transactionDropdownOpen, setTransactionDropdownOpen] = useState(null);
  const [payoutDropdownOpen, setPayoutDropdownOpen] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (transactionDropdownOpen) {
        setTransactionDropdownOpen(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [transactionDropdownOpen]);

  const sidebarItems = [
    { icon: "/icons/nav-dashboard.png", label: "Dashboard" },
    { icon: "/icons/nav-group.png", label: "User Management" },
    { icon: "/icons/nav-profile.png", label: "Seller Verification" },
    { icon: "/icons/nav-settings.png", label: "Product Approval/ Moderation" },
    { icon: "/icons/nav-document.png", label: "Reported Items" },
    { icon: "/icons/nav-menu.png", label: "Category Management" },
    { icon: "/icons/nav-settings.png", label: "Banner/Promotions Management" },
    { icon: "/icons/nav-currency.png", label: "Transactions & Payouts" },
    { icon: "/icons/nav-settings.png", label: "System Settings" },
    { label: "Support Tickets", icon: "/icons/nav-communication.png" },
    { label: "Help Line", icon: "/icons/nav-tools.png" },
  ];

  const supporters = [
    {
      id: 1,
      name: "Florencio Dorrance",
      team: "Supporter team",
      avatar: "/supporter-1.png",
    },
    {
      id: 2,
      name: "Florencio Dorrance",
      team: "Supporter team",
      avatar: "/supporter-2.png",
    },
    {
      id: 3,
      name: "Florencio Dorrance",
      team: "Supporter team",
      avatar: "/supporter-3.png",
    },
    {
      id: 4,
      name: "Florencio Dorrance",
      team: "Supporter team",
      avatar: "/supporter-4.png",
    },
    {
      id: 5,
      name: "Florencio Dorrance",
      team: "Supporter team",
      avatar: "/supporter-5.png",
    },
    {
      id: 6,
      name: "Florencio Dorrance",
      team: "Supporter team",
      avatar: "/supporter-6.png",
    },
  ];

  const userData = [
    {
      id: 1,
      name: "Diana Surf",
      email: "Dianasurf112@gmail.com",
      role: "Seller",
      lastActive: "12.09.2019",
      status: "Active",
      avatar: "/images/profile-woman-1.png",
    },
    {
      id: 2,
      name: "Karen Hut",
      email: "Karenhut@yahoo.com",
      role: "Seller",
      lastActive: "12.09.2019",
      status: "Suspended",
      avatar: "/images/profile-woman-2.png",
    },
    {
      id: 3,
      name: "Steve Lauda",
      email: "Stevelauda102@gmail.com",
      role: "User",
      lastActive: "12.09.2019",
      status: "In Active",
      avatar: "/images/profile-man-1.png",
    },
    {
      id: 4,
      name: "Diana Surf",
      email: "Dianasurf112@gmail.com",
      role: "Seller",
      lastActive: "12.09.2019",
      status: "Active",
      avatar: "/images/profile-woman-1.png",
    },
    {
      id: 5,
      name: "Karen Hut",
      email: "Karenhut@yahoo.com",
      role: "Seller",
      lastActive: "12.09.2019",
      status: "Suspended",
      avatar: "/images/profile-woman-2.png",
    },
    {
      id: 6,
      name: "Steve Lauda",
      email: "Stevelauda102@gmail.com",
      role: "Seller",
      lastActive: "12.09.2019",
      status: "In Active",
      avatar: "/images/profile-man-1.png",
    },
    {
      id: 7,
      name: "Diana Surf",
      email: "Dianasurf112@gmail.com",
      role: "Seller",
      lastActive: "12.09.2019",
      status: "Active",
      avatar: "/images/profile-woman-1.png",
    },
    {
      id: 8,
      name: "Karen Hut",
      email: "Karenhut@yahoo.com",
      role: "User",
      lastActive: "12.09.2019",
      status: "Suspended",
      avatar: "/images/profile-woman-2.png",
    },
    {
      id: 9,
      name: "Steve Lauda",
      email: "Stevelauda102@gmail.com",
      role: "User",
      lastActive: "12.09.2019",
      status: "In Active",
      avatar: "/images/profile-man-1.png",
    },
  ];

  const sellerData = [
    {
      id: 1,
      name: "Diana Surf",
      email: "Dianasurf112@gmail.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Approved",
    },
    {
      id: 2,
      name: "Karen Hut",
      email: "Karenhut@yahoo.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Rejected",
    },
    {
      id: 3,
      name: "Steve Lauda",
      email: "Stevelauda102@gmail.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Pending",
    },
    {
      id: 4,
      name: "Diana Surf",
      email: "Dianasurf112@gmail.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Approved",
    },
    {
      id: 5,
      name: "Karen Hut",
      email: "Karenhut@yahoo.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Pending",
    },
    {
      id: 6,
      name: "Steve Lauda",
      email: "Stevelauda102@gmail.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Approved",
    },
    {
      id: 7,
      name: "Diana Surf",
      email: "Dianasurf112@gmail.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Rejected",
    },
    {
      id: 8,
      name: "Karen Hut",
      email: "Karenhut@yahoo.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Pending",
    },
    {
      id: 9,
      name: "Steve Lauda",
      email: "Stevelauda102@gmail.com",
      storeName: "Store_name",
      submittedOn: "12.09.2019",
      status: "Rejected",
    },
  ];

  const supportTickets = [
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Login Issues",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Resolved",
      statusColor: "bg-green-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Login Issues",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Resolved",
      statusColor: "bg-green-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Login Issues",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Resolved",
      statusColor: "bg-green-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Login Issues",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Resolved",
      statusColor: "bg-green-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Payment Inquiry",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team B",
      status: "In Progress",
      statusColor: "bg-orange-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Payment Inquiry",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team B",
      status: "In Progress",
      statusColor: "bg-orange-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Payment Inquiry",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team B",
      status: "In Progress",
      statusColor: "bg-orange-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Payment Inquiry",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team B",
      status: "In Progress",
      statusColor: "bg-orange-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Technical Support",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Open",
      statusColor: "bg-red-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Technical Support",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Open",
      statusColor: "bg-red-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Technical Support",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Open",
      statusColor: "bg-red-500",
    },
    {
      id: "#123456",
      userSeller: "User Name",
      subject: "Technical Support",
      createdOn: "12.09.2019",
      lastUpdated: "14.04.2025",
      assignedTo: "Support Team A",
      status: "Open",
      statusColor: "bg-red-500",
    },
  ];

  const productData = [
    {
      id: 1,
      thumbnail: "/images/product-handbag.png",
      productName: "Women Bag",
      sellerName: "Diana Surf",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Approved",
    },
    {
      id: 2,
      thumbnail: "/images/product-boots.png",
      productName: "Men Shoes",
      sellerName: "Karen Hut",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Rejected",
    },
    {
      id: 3,
      thumbnail: "/images/leather-bag.png",
      productName: "Toys for kids",
      sellerName: "Steve Lauda",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Pending",
    },
    {
      id: 4,
      thumbnail: "/images/product-bag.png",
      productName: "Women Shoes",
      sellerName: "Diana Surf",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Approved",
    },
    {
      id: 5,
      thumbnail: "/images/product-cap.png",
      productName: "Women caps",
      sellerName: "Karen Hut",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Pending",
    },
    {
      id: 6,
      thumbnail: "/images/product-handbag.png",
      productName: "Bags for Men",
      sellerName: "Steve Lauda",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Approved",
    },
    {
      id: 7,
      thumbnail: "/images/product-bag.png",
      productName: "Laptop Bag",
      sellerName: "Diana Surf",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Rejected",
    },
    {
      id: 8,
      thumbnail: "/images/product-handbag.png",
      productName: "Headphones",
      sellerName: "Karen Hut",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Pending",
    },
    {
      id: 9,
      thumbnail: "/images/product-lipstick.png",
      productName: "Mac Lipsticks",
      sellerName: "Steve Lauda",
      category: "Store_name",
      submittedOn: "12.09.2019",
      status: "Rejected",
    },
  ];

  const statsCards = [
    {
      title: "Total Users",
      value: "40,689",
      change: "8.5% Up from yesterday",
      changeType: "positive",
      icon: "/icons/user-icon.png",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Order",
      value: "10293",
      change: "1.3% Up from past week",
      changeType: "positive",
      icon: "/icons/box-icon.png",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Revenue This Month",
      value: "$89,000",
      change: "4.3% Down from yesterday",
      changeType: "negative",
      icon: "/icons/chart-icon.png",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Sellers",
      value: "2040",
      change: "1.8% Up from yesterday",
      changeType: "positive",
      icon: "/icons/cloud-icon.png",
      bgColor: "bg-pink-50",
    },
  ];

  const pendingActions = [
    {
      id: 1,
      title: "Sellers to Verify",
      description: "5 new sellers waiting for verification",
      action: "Review",
      actionColor: "bg-red-500 hover:bg-red-600",
    },
    {
      id: 2,
      title: "Products to Approve",
      description: "12 products pending moderation",
      action: "Approve",
      actionColor: "bg-yellow-500 hover:bg-yellow-600",
    },
    {
      id: 3,
      title: "Reported Items",
      description: "3 new reports submitted",
      action: "Review",
      actionColor: "bg-red-500 hover:bg-red-600",
    },
    {
      id: 4,
      title: "Categories to Confirm",
      description: "1 category edit pending admin review",
      action: "Open",
      actionColor: "bg-teal-500 hover:bg-teal-600",
    },
    {
      id: 5,
      title: "Payout Requests",
      description: "4 payout requests from sellers",
      action: "Payouts",
      actionColor: "bg-teal-600 hover:bg-teal-700",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Women Tops",
      image: "/images/women-top.png",
      items: "1,076 items",
      date: "12.09.2019 - 12.53 PM",
      amount: "$34,295",
      status: "Sold",
    },
    {
      id: 2,
      name: "Leather Bag",
      image: "/images/leather-bag.png",
      items: "543 items",
      date: "12.09.2019 - 12.53 PM",
      amount: "$34,295",
      status: "Sold",
    },
    {
      id: 3,
      name: "Men Shoes",
      image: "/images/women-top.png",
      items: "271 items",
      date: "12.09.2019 - 12.53 PM",
      amount: "$34,295",
      status: "Sold",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Suspended":
        return "bg-red-100 text-red-800";
      case "In Active":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSellerStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const renderSystemSettings = () => {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
          <span>Admin Dashboard</span>
          <span>{">"}</span>
          <span>System Setting</span>
        </div>

        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Customer Setting
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage customer accounts, order preferences, communication settings,
            loyalty programs, and privacy settings.
          </p>
        </div>

        {/* Account Management */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Account Management
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">
                  Enable Customer Accounts
                </h3>
                <p className="text-sm text-gray-600">
                  Enable or disable customer account creation and management.
                </p>
              </div>
              <div className="relative self-start sm:self-auto">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="w-12 h-6 bg-orange-500 rounded-full shadow-inner cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">
                  Allow Profile Management
                </h3>
                <p className="text-sm text-gray-600">
                  Allow customers to manage their profiles, including personal
                  information and preferences.
                </p>
              </div>
              <div className="relative self-start sm:self-auto">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="w-12 h-6 bg-orange-500 rounded-full shadow-inner cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Preferences */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Order Preferences
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900">
                Default Order Preferences
              </h3>
              <p className="text-sm text-gray-600">
                Set default order preferences for customers, such as shipping
                and payment methods.
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 self-start sm:self-auto">
              Edit
            </button>
          </div>
        </div>

        {/* Communication Settings */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Communication Settings
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
            <div className="min-w-0">
              <h3 className="font-medium text-gray-900">
                Notification Preferences
              </h3>
              <p className="text-sm text-gray-600">
                Configure communication settings for customers, including email
                and SMS notifications.
              </p>
            </div>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 self-start sm:self-auto">
              Edit
            </button>
          </div>
        </div>

        {/* Loyalty & Reward Settings */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Loyalty & Reward Settings
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">
                  Enable Loyalty Programs
                </h3>
                <p className="text-sm text-gray-600">
                  Enable or disable loyalty programs and reward systems for
                  customers.
                </p>
              </div>
              <div className="relative self-start sm:self-auto">
                <input type="checkbox" className="sr-only" defaultChecked />
                <div className="w-12 h-6 bg-orange-500 rounded-full shadow-inner cursor-pointer">
                  <div className="w-5 h-5 bg-white rounded-full shadow transform translate-x-6 transition-transform"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">
                  Loyalty Program Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Configure loyalty program settings, such as points
                  accumulation and redemption rules.
                </p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 self-start sm:self-auto">
                Edit
              </button>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="mb-6 lg:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
            Privacy & Security
          </h2>

          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">
                  Data Privacy Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Manage customer data privacy settings, including data
                  retention and deletion policies.
                </p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 self-start sm:self-auto">
                Edit
              </button>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <h3 className="font-medium text-gray-900">
                  Account Security Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Configure security settings for customer accounts, such as
                  password policies and two-factor authentication.
                </p>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 self-start sm:self-auto">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // support start
  // ------------------ SUPPORT: DETAIL (kept) ------------------
  // ------------------ SUPPORT: DETAIL (responsive + scroll) ------------------
  const renderTicketDetail = () => (
    <div
      className="p-4 sm:p-6"
      style={{
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          {selectedTicket?.id ?? "Ticket #12345"}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          Submitted by Alex Bennett on July 15, 2024
        </p>
      </div>

      {/* Meta fields */}
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="bg-white border border-gray-200 rounded-[12px] h-12 sm:h-14 w-full max-w-full md:max-w-[1115px]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="bg-white border border-gray-200 rounded-[12px] h-12 sm:h-14 w-full max-w-full md:max-w-[1115px]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <div className="bg-white border border-gray-200 rounded-[12px] h-12 sm:h-14 w-full max-w-full md:max-w-[1115px]" />
        </div>
      </div>

      {/* Complainer Info */}
      <div className="mt-8 mb-8 w-full max-w-full md:max-w-[904px]">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Complainer Info
        </h3>
        <div className="border-b border-gray-200 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <p className="text-gray-900 pb-2 break-words">User_Name</p>
            <div className="border-b border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900 pb-2 break-words">Username@gmail.com</p>
            <div className="border-b border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order_ID
            </label>
            <p className="text-gray-900 pb-2 break-words">1029384</p>
            <div className="border-b border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-gray-900 pb-2 break-words">+11 - 2233 - 4455</p>
            <div className="border-b border-gray-200" />
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="mt-6 mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Message Thread
        </h3>
        <div className="bg-white p-4 sm:p-6 rounded-lg space-y-4">
          <div className="flex justify-end items-start gap-3">
            <div className="bg-orange-500 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm flex items-center justify-center whitespace-nowrap rounded-md">
              How may we help you?
            </div>
            <img
              src="/admin-avatar.png"
              alt="Admin"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
            />
          </div>

          <div className="flex items-start gap-3">
            <img
              src="/customer-avatar.png"
              alt="Customer"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
            />
            <div className="bg-gray-100 text-gray-900 px-4 py-3 text-sm rounded-md max-w-[85%] sm:max-w-md break-words">
              I ordered Water Bottle and the product description contains
              misleading information about the materials used.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img
              src="/customer-avatar.png"
              alt="Customer"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
            />
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm max-w-[85%] sm:max-w-md break-words">
              I need assistance with it.
            </div>
          </div>

          <div className="flex justify-end items-start gap-3">
            <div className="bg-orange-500 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md max-w-[85%] sm:max-w-md break-words">
              Sure, give us two minutes 😊
            </div>
            <img
              src="/admin-avatar.png"
              alt="Admin"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
            />
          </div>

          <div className="flex justify-end items-start gap-3">
            <div className="bg-orange-500 text-white px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md max-w-[85%] sm:max-w-md break-words">
              We will get back to you.
            </div>
            <img
              src="/admin-avatar.png"
              alt="Admin"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Action Area
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg h-12 sm:h-14 w-full max-w-full md:max-w-[1115px]" />
      </div>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          onClick={() => {
            setShowTicketDetail(false);
            setSelectedTicket(null);
            setShowReplyInterface(false);
          }}
          className="bg-orange-100 text-orange-600 font-medium hover:bg-orange-200 transition-colors flex items-center justify-center w-full sm:w-[135px] h-12 sm:h-14 rounded-full"
        >
          Go Back
        </button>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center justify-center w-full sm:w-[186px] h-12 sm:h-14 rounded-full"
        >
          Assign Complain
        </button>
        <button
          onClick={() => setShowReplyInterface(true)}
          className="bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center w-full sm:w-[186px] h-12 sm:h-14 rounded-full"
        >
          Reply
        </button>
      </div>
    </div>
  );

  // ------------------ SUPPORT: LIST (add vertical scroll for table on small) ------------------
  const renderSupportTickets = () => (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
            <span>Admin Dashboard</span>
            <span className="mx-2">›</span>
            <span>Support</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Support Ticket
          </h1>
        </div>
        <button
          onClick={() => {
            setSelectedTicket({ id: "#NEW" });
            setShowTicketDetail(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2 w-[110px] sm:w-[122px] h-8 rounded-2xl"
        >
          <img src="/plus-icon.png" alt="Plus" className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border w-full">
        {/* horizontal + vertical scroll container */}
        <div
          className="overflow-x-auto"
          style={{
            maxHeight: "calc(100vh - 240px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Order ID
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  User/Seller
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Subject
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Created On
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Last Updated
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Assigned To
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {supportTickets.map((ticket, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-blue-600 font-medium">
                    {ticket.id}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-900">
                    {ticket.userSeller}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-900">
                    {ticket.subject}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600">
                    {ticket.createdOn}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600">
                    {ticket.lastUpdated}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600">
                    {ticket.assignedTo}
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <span
                      className={`inline-flex items-center justify-center text-[10px] sm:text-xs font-medium text-white ${ticket.statusColor}`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="p-1">
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border border-gray-200 rounded-lg shadow-lg w-[204px]">
                        <DropdownMenuItem
                          className="px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketDetail(true);
                            setShowReplyInterface(true); // open inline composer
                          }}
                        >
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem className="px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer">
                          Close
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketDetail(true);
                          }}
                        >
                          View / Reassign
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ------------------ SUPPORT: INLINE REPLY (small-screen friendly) ------------------
  const renderReplyInterface = () => (
    <div className="p-4 sm:p-6 pt-0">
      <div className="bg-white border rounded-xl p-3 sm:p-5">
        <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">
          Reply
        </h4>
        <textarea
          rows={5}
          className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-y"
          placeholder={`Replying to ${
            selectedTicket?.userSeller || "customer"
          }...`}
        />
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
          <button
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-orange-600 rounded-full w-full sm:w-auto"
            onClick={() => setShowReplyInterface(false)}
          >
            Cancel
          </button>
          <button
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-full sm:w-auto"
            onClick={() => setShowReplyInterface(false)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  // ------------------ HELP LINE MODAL (responsive + scroll) ------------------
  const renderHelpLineModal = () =>
  !showHelpLineModal ? null : (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
        onClick={() => setShowHelpLineModal(false)}
      />

      <div className="relative bg-white shadow-xl flex flex-col md:flex-row w-[95vw] max-w-[990px] max-h-[90vh] rounded-2xl overflow-y-auto">
        <button
          onClick={() => setShowHelpLineModal(false)}
          className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left: contact form */}
        <div className="bg-gray-50 p-6 md:p-8 flex flex-col w-full md:w-[455px] shrink-0">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            Help Line
          </h1>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Whether it's about your order, a product, or selling on Soukloop —
            we&apos;re just a message away.
          </p>

          <div className="space-y-5 md:space-y-6 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Enter Your Name"
                className="w-full h-12 md:h-14 bg-white border border-gray-200 px-4 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-[10px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter Your Email"
                className="w-full h-12 md:h-14 bg-white border border-gray-200 px-4 py-3 md:py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-[10px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                placeholder="Type your message..."
                className="w-full h-[160px] md:h-[200px] bg-white border border-gray-200 px-4 py-3 md:py-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent rounded-[10px]"
              />
            </div>

            <div className="text-xs md:text-sm text-gray-600">
              I accept the{" "}
              <span className="text-orange-500 underline cursor-pointer">
                Terms of Use
              </span>{" "}
              &{" "}
              <span className="text-orange-500 underline cursor-pointer">
                Privacy Policy
              </span>
            </div>
          </div>

          <button className="w-full md:w-[200px] h-12 md:h-14 bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors mt-6 rounded-full">
            Submit
          </button>
        </div>

        {/* Right: contact methods */}
        <div className="flex-1 p-6 md:p-8 space-y-6 pt-16 md:pt-20">
          <div className="bg-white border border-gray-200 p-6 flex items-center gap-4 w-full md:w-[407px] rounded-lg mx-auto">
            <img
              src="/call-icon.png"
              alt="Phone"
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                Phone
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                123 Sample St, Sydney NSW 2000
              </p>
              <p className="text-gray-600 underline text-sm md:text-base">
                AU
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 flex items-center gap-4 w-full md:w-[407px] rounded-lg mx-auto">
            <img
              src="/tooltip-icon.png"
              alt="Live Chat"
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
                Live Chat
              </h3>
              <p className="text-gray-600 text-sm md:text-base">
                +1 (555) 000-0000
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-6 flex items-center gap-4 w-full md:w-[407px] rounded-lg mx-auto">
            <img
              src="/mail-icon.png"
              alt="Email"
              className="w-12 h-12 flex-shrink-0"
            />
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2">
              Email
              </h3>
              <p className="text-gray-600 underline text-sm md:text-base">
                email@example.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // end here

  const renderSellerVerificationDetails = () => (
    <main className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-1">
        <span>Admin Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1" />
        <span>Seller Verification</span>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1" />
        <span className="text-gray-900">Seller Verification Details</span>
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Seller Verification
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage seller verification and their account permissions here.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
        {/* Seller Information Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Seller Information
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User name
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full sm:w-[249.5px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full sm:w-[249.5px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name (Optional)
              </label>
              <input
                type="text"
                className="w-full lg:w-[515px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              rows={1}
              className="w-full lg:w-[1046px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full lg:w-[515px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full lg:w-[515px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Store Information Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
            Store Information:
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Store name
              </label>
              <input
                type="text"
                placeholder="Store name"
                className="w-full sm:w-[249.5px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Products
              </label>
              <input
                type="text"
                className="w-full lg:w-[515px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Store Username
            </label>
            <input
              type="text"
              className="w-full sm:w-[249.5px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4 sm:mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              rows={1}
              className="w-full lg:w-[1046px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                placeholder="Website link"
                className="w-full lg:w-[515px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Social Media Accounts
              </label>
              <select className="w-full lg:w-[515px] h-11 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                <option>Select...</option>
                <option>Facebook</option>
                <option>Instagram</option>
                <option>Twitter</option>
                <option>LinkedIn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <Button
            className="bg-gray-100 hover:bg-gray-200 text-orange-500 border-0 w-full sm:w-[297px]"
            style={{ height: "56px", borderRadius: "8px" }}
            onClick={() => setShowRejectionModal(true)}
          >
            Reject Seller
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-[297px]"
            style={{ height: "56px", borderRadius: "8px" }}
            onClick={() => setShowApprovalModal(true)}
          >
            Approve Seller Verification
          </Button>
        </div>
      </div>
    </main>
  );

  const renderSellerVerification = () => (
    <main className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-1">
        <span>Admin Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1" />
        <span className="text-gray-900">Seller Verification</span>
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Seller Verification
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage seller verification and their account permissions here.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border w-full lg:w-[1138px] lg:h-[1150px]">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-base sm:text-lg font-semibold">
              All Users (44)
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-[375px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name"
                  className="pl-10 w-full"
                  style={{ height: "48px", borderRadius: "12px" }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white flex items-center"
                  style={{
                    width: "84px",
                    height: "32px",
                    borderRadius: "16px",
                  }}
                >
                  <img
                    src="/icons/filter-icon.png"
                    alt="Filter"
                    className="w-4 h-4 mr-1"
                  />
                  Filter
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white flex items-center"
                  style={{
                    width: "107px",
                    height: "32px",
                    borderRadius: "16px",
                  }}
                  onClick={() => setShowApprovalModal(true)}
                >
                  <img
                    src="/icons/approve-icon.png"
                    alt="Approve"
                    className="w-4 h-4 mr-1"
                  />
                  Approve
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white flex items-center"
                  style={{
                    width: "91px",
                    height: "32px",
                    borderRadius: "16px",
                  }}
                  onClick={() => setShowRejectionModal(true)}
                >
                  <img
                    src="/icons/ban-icon.png"
                    alt="Reject"
                    className="w-4 h-4 mr-1"
                  />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[720px] lg:min-w-0">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">
                  <input type="checkbox" className="rounded" />
                  <span className="ml-2">Select All</span>
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">
                  Seller Name
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">
                  Store Name
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">
                  Submitted On
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {sellerData.map((seller) => (
                <tr key={seller.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 sm:px-6">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm font-medium text-gray-900">
                    {seller.name}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">
                    {seller.email}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">
                    {seller.storeName}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">
                    {seller.submittedOn}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-medium ${getSellerStatusBadge(
                        seller.status
                      )}`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      {seller.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === seller.id ? null : seller.id
                        )
                      }
                    />
                    {openDropdown === seller.id && (
                      <div className="absolute right-2 top-10 bg-white border border-gray-200 rounded-lg shadow-lg z-10 w-[204px] h-[123px]">
                        <div className="py-2">
                          <div
                            className="px-4 py-2 text-sm text-orange-500 hover:bg-gray-50 cursor-pointer w-[180px] h-[36px]"
                            onClick={() => {
                              setSelectedSeller(seller);
                              setShowSellerDetails(true);
                              setOpenDropdown(null);
                            }}
                          >
                            View Details
                          </div>
                          <div
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer w-[180px] h-[36px]"
                            onClick={() => {
                              setShowApprovalModal(true);
                              setOpenDropdown(null);
                            }}
                          >
                            Approve
                          </div>
                          <div
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer w-[180px] h-[36px]"
                            onClick={() => {
                              setShowRejectionModal(true);
                              setOpenDropdown(null);
                            }}
                          >
                            Reject
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              <Button className="bg-orange-500 text-white w-8 h-8 p-0">
                1
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                2
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                3
              </Button>
              <span className="text-gray-500">...</span>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                43
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                44
              </Button>
            </div>
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderUserManagement = () => (
    <main className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-1">
        <span>Admin Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1" />
        <span className="text-gray-900">User Management</span>
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your team members and their account permissions here.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-base sm:text-lg font-semibold">
              All Users (44)
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-[375px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name"
                  className="pl-10 w-full"
                  style={{ height: "48px", borderRadius: "12px" }}
                />
              </div>
              <Button
                className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-[84px]"
                style={{ height: "32px", borderRadius: "16px" }}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[720px] lg:min-w-0">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                  Name
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                  Email
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                  Role
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                  Last Active
                </th>
                <th className="text-left py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {userData.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="object-cover mr-3"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "8px",
                        }}
                      />
                      <span
                        className="text-sm font-medium text-gray-900 cursor-pointer hover:text-orange-500"
                        onClick={() => handleUserClick(user)}
                      >
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">
                    {user.role}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-sm text-gray-600">
                    {user.lastActive}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-medium ${getStatusBadge(
                        user.status
                      )}`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 sm:p-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              <Button className="bg-orange-500 text-white w-8 h-8 p-0">
                1
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                2
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                3
              </Button>
              <span className="text-gray-500">...</span>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                43
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                44
              </Button>
            </div>
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderProductApprovalModeration = () => (
    <main className="p-4 sm:p-6">
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-1">
        <span>Admin Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 mx-1" />
        <span className="text-gray-900">Product Approval/Moderation</span>
      </div>

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Product Approval/Moderation
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Review, approve, reject, or edit product listings submitted by
          sellers.
        </p>
      </div>

      <div
        className="bg-white rounded-lg shadow-sm border w-full max-w-[1138px] mx-auto"
        style={{ height: "auto" }}
      >
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-base sm:text-lg font-semibold">All Products</h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-[375px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name"
                  className="pl-10 w-full"
                  style={{ height: "48px", borderRadius: "12px" }}
                />
              </div>
              <div className="flex flex-row space-x-2">
                <Button
                  className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-[84px]"
                  style={{ height: "32px", borderRadius: "16px" }}
                  onClick={() => setShowApprovalModal(true)}
                >
                  <img
                    src="/icons/filter-icon.png"
                    alt="Filter"
                    className="w-4 h-4 mr-2"
                  />
                  Filter
                </Button>
                <Button
                  className="bg-green-500 hover:bg-green-600 text-white w-full sm:w-[107px]"
                  style={{ height: "32px", borderRadius: "16px" }}
                  onClick={() => setShowApprovalModal(true)}
                >
                  <img
                    src="/icons/approve-icon.png"
                    alt="Approve"
                    className="w-4 h-4 mr-2"
                  />
                  Approve
                </Button>
                <Button
                  className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-[91px]"
                  style={{ height: "32px", borderRadius: "16px" }}
                  onClick={() => setShowRejectionModal(true)}
                >
                  <img
                    src="/icons/ban-icon.png"
                    alt="Reject"
                    className="w-4 h-4 mr-2"
                  />
                  Reject
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full min-w-[900px] lg:min-w-0">
            <thead>
              <tr
                className="bg-gray-50"
                style={{
                  width: "1074px",
                  height: "48px",
                  borderRadius: "12px",
                }}
              >
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  <input type="checkbox" className="rounded" />
                  <span className="ml-3">Select All</span>
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  Thumbnail
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  Product Name
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  Seller Name
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  Category
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  Submitted On
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm">
                  Status
                </th>
                <th className="text-left py-3 px-4 sm:px-6 font-medium text-gray-500 text-xs sm:text-sm"></th>
              </tr>
            </thead>
            <tbody>
              {productData.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 sm:px-6">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <img
                      src={product.thumbnail || "/placeholder.svg"}
                      alt={product.productName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <div className="font-medium text-gray-900 text-sm sm:text-base">
                      {product.productName}
                    </div>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-600 text-sm">
                    {product.sellerName}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-600 text-sm">
                    {product.category}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-gray-600 text-sm">
                    {product.submittedOn}
                  </td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className={`px-3 py-1 text-[10px] sm:text-xs font-medium rounded-full ${
                        product.status === "Approved"
                          ? "bg-green-100 text-green-800"
                          : product.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === product.id ? null : product.id
                        )
                      }
                    />
                    {dropdownOpen === product.id && (
                      <div
                        className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10"
                        style={{ width: "204px", height: "125px" }}
                      >
                        <div
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-orange-500 whitespace-nowrap"
                          onClick={() => {
                            setDropdownOpen(null);
                            setSelectedProduct(product);
                            setShowProductDetails(true);
                          }}
                        >
                          View Product Details
                        </div>
                        <div
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                          onClick={() => {
                            setDropdownOpen(null);
                            setShowApprovalModal(true);
                          }}
                        >
                          Approve
                        </div>
                        <div
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700"
                          onClick={() => {
                            setDropdownOpen(null);
                            setShowRejectionModal(true);
                          }}
                        >
                          Reject
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="p-4 sm:p-6 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <Button
                variant="outline"
                className="flex items-center bg-transparent w-full sm:w-auto justify-center"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              <div className="flex items-center space-x-2">
                <Button className="bg-orange-500 text-white w-8 h-8 p-0">
                  1
                </Button>
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0 bg-transparent"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0 bg-transparent"
                >
                  3
                </Button>
                <span className="text-gray-500">...</span>
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0 bg-transparent"
                >
                  43
                </Button>
                <Button
                  variant="outline"
                  className="w-8 h-8 p-0 bg-transparent"
                >
                  44
                </Button>
              </div>
              <Button
                variant="outline"
                className="flex items-center bg-transparent w-full sm:w-auto justify-center"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
  const renderDashboard = () => (
    <main className="p-4 sm:p-6">
      <div className="flex items-center mb-6 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome Admin_name
        </h2>
        <img
          src="/icons/hand-icon.png"
          alt="Wave"
          className="w-5 h-5 sm:w-6 sm:h-6 ml-2"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((card, index) => (
          <Card
            key={index}
            className="border-0 shadow-sm w-full lg:w-[262px]"
            style={{ height: "161px", borderRadius: "14px" }}
          >
            <CardContent className="p-4 sm:p-6 h-full">
              <div className="flex items-center justify-between h-full">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {card.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-[11px] sm:text-xs ${
                        card.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {card.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <img
                    src={card.icon || "/placeholder.svg"}
                    alt=""
                    className="w-[48px] h-[48px] sm:w-[60px] sm:h-[60px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="w-full lg:w-auto">
          <Card
            className="border-0 shadow-sm w-full lg:w-[560px]"
            style={{ height: "401px" }}
          >
            <CardContent className="p-4 sm:p-6 h-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex space-x-4 sm:space-x-6">
                  <button
                    className={`text-sm font-medium pb-2 border-b-2 ${
                      activeTab === "Sales"
                        ? "text-gray-900 border-gray-900"
                        : "text-gray-500 border-transparent"
                    }`}
                    onClick={() => setActiveTab("Sales")}
                  >
                    Sales
                  </button>
                  <button
                    className={`text-sm font-medium pb-2 border-b-2 ${
                      activeTab === "Orders"
                        ? "text-gray-900 border-gray-900"
                        : "text-gray-500 border-transparent"
                    }`}
                    onClick={() => setActiveTab("Orders")}
                  >
                    Orders
                  </button>
                </div>
                <Select defaultValue="october">
                  <SelectTrigger className="w-28 sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="october">October</SelectItem>
                    <SelectItem value="november">November</SelectItem>
                    <SelectItem value="december">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                Sales Details
              </h3>

              <div className="h-48 relative">
                <div className="absolute inset-0 flex items-end justify-between px-2">
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] sm:text-xs text-gray-400">
                    <span>100%</span>
                    <span>80%</span>
                    <span>60%</span>
                    <span>40%</span>
                    <span>20%</span>
                    <span>0%</span>
                  </div>

                  <div className="ml-6 flex-1 h-full relative">
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 350 160"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="salesGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop
                            offset="0%"
                            stopColor="#ff6b35"
                            stopOpacity="0.2"
                          />
                          <stop
                            offset="100%"
                            stopColor="#ff6b35"
                            stopOpacity="0.05"
                          />
                        </linearGradient>
                      </defs>

                      <polyline
                        fill="none"
                        stroke="#ff6b35"
                        strokeWidth="2"
                        points="20,130 50,110 80,120 110,90 140,50 170,70 200,100 230,85 260,90 290,95"
                      />

                      <polygon
                        fill="url(#salesGradient)"
                        points="20,130 50,110 80,120 110,90 140,50 170,70 200,100 230,85 260,90 290,95 290,160 20,160"
                      />

                      <circle cx="140" cy="50" r="3" fill="#ff6b35" />

                      <rect
                        x="115"
                        y="30"
                        width="50"
                        height="16"
                        fill="#ff6b35"
                        rx="3"
                      />
                      <text
                        x="140"
                        y="41"
                        textAnchor="middle"
                        fill="white"
                        fontSize="9"
                      >
                        64,564.77
                      </text>
                    </svg>
                  </div>
                </div>

                <div className="absolute bottom-0 left-6 right-0 flex justify-between text-[10px] sm:text-xs text-gray-400 px-2">
                  <span>0k</span>
                  <span>10k</span>
                  <span>20k</span>
                  <span>30k</span>
                  <span>40k</span>
                  <span>50k</span>
                  <span>60k</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-auto">
          <Card
            className="border-0 shadow-sm w-full lg:w-[554px]"
            style={{ height: "401px" }}
          >
            <CardContent className="p-4 sm:p-6 h-full">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center mr-2">
                    <span className="text-yellow-600 text-sm">⚠</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold">
                    Pending Actions
                  </h3>
                </div>
                <Select defaultValue="october">
                  <SelectTrigger className="w-28 sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="october">October</SelectItem>
                    <SelectItem value="november">November</SelectItem>
                    <SelectItem value="december">December</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                {pendingActions.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <span className="text-sm font-medium text-gray-900 mr-2">
                          {action.id}.
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {action.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 ml-4">
                        {action.description}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className={`${action.actionColor} text-white text-[11px] sm:text-xs px-3 py-1`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      {action.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Featured Products */}
      <div className="mt-8">
        <Card className="border-0 shadow-sm w-full max-w-[1138px]">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-base sm:text-lg font-semibold">
                Featured Products
              </h3>
              <Select defaultValue="october">
                <SelectTrigger className="w-28 sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="october">October</SelectItem>
                  <SelectItem value="november">November</SelectItem>
                  <SelectItem value="december">December</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Added scroll container for mobile */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[600px]">
                {" "}
                {/* Minimum width to ensure proper display */}
                <table className="w-full">
                  <thead>
                    <tr
                      className="border-b bg-gray-50"
                      style={{
                        width: "1074px",
                        height: "48px",
                        borderRadius: "12px",
                      }}
                    >
                      <th className="text-left py-3 text-xs sm:text-sm font-medium text-gray-600">
                        Product Name
                      </th>
                      <th className="text-left py-3 text-xs sm:text-sm font-medium text-gray-600">
                        <span className="hidden sm:inline">
                          Number of products
                        </span>
                        <span className="sm:hidden">Products</span>
                      </th>
                      <th className="text-left py-3 text-xs sm:text-sm font-medium text-gray-600">
                        Date - Time
                      </th>
                      <th className="text-left py-3 text-xs sm:text-sm font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="text-left py-3 text-xs sm:text-sm font-medium text-gray-600 hidden sm:table-cell">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredProducts.map((product) => (
                      <tr key={product.id} className="border-b">
                        <td className="py-4">
                          <div className="flex items-center">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg object-cover mr-3"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 text-xs sm:text-sm text-gray-600">
                          {product.items}
                        </td>
                        <td className="py-4 text-xs sm:text-sm text-gray-600">
                          {product.date}
                        </td>
                        <td className="py-4 text-xs sm:text-sm font-medium text-gray-900">
                          {product.amount}
                        </td>
                        <td className="py-4 hidden sm:table-cell">
                          <span
                            className="inline-flex items-center justify-center text-[11px] sm:text-xs font-medium bg-teal-100 text-teal-800"
                            style={{
                              width: "93px",
                              height: "27px",
                              borderRadius: "13.5px",
                            }}
                          >
                            {product.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  const renderReportedItems = () => (
    <main className="p-4 sm:p-6">
      <div className="flex items-center text-xs sm:text-sm text-gray-500 mb-6 flex-wrap">
        <span>Admin Dashboard</span>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-900">Reported Items</span>
      </div>

      <div className="mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Reported Items
        </h1>
        <p className="text-gray-600">
          Review content reported by users and take moderation action
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6 border-b">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <h2 className="text-lg font-semibold">All Reported Items</h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="relative w-full sm:w-auto">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search name"
                  className="pl-10 h-12 rounded-[12px] w-full lg:w-[375px]"
                />
              </div>

              <div className="flex flex-row space-x-2">
                <Button className="bg-orange-500 hover:bg-orange-600 text-white w-full sm:w-auto lg:w-[84px] h-8 lg:h-[32px] rounded-[16px] justify-center">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>

                <Button
                  className="bg-red-500 hover:bg-red-600 text-white w-full sm:w-auto lg:w-[140px] h-8 lg:h-[32px] rounded-[16px] justify-center"
                  onClick={() => setShowReportedItemApprovalModal(true)}
                >
                  Dismiss/Remove
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div className="min-w-[1024px]">
            {" "}
            {/* Minimum width to ensure desktop layout on mobile */}
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                    <input type="checkbox" className="rounded" />
                    <span className="ml-2 hidden sm:inline">Select All</span>
                  </th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                    Type
                  </th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600">
                    Reported Name
                  </th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600 md:table-cell">
                    Reporter
                  </th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600 sm:table-cell">
                    Reason
                  </th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600 md:table-cell">
                    Reported On
                  </th>
                  <th className="text-left py-3 sm:py-4 px-4 sm:px-6 text-xs sm:text-sm font-medium text-gray-600 sm:table-cell">
                    Status
                  </th>
                  <th className="py-3 sm:py-4 px-4 sm:px-6"></th>
                </tr>
              </thead>

              <tbody>
                {[
                  {
                    id: 1,
                    image: "/images/reported-handbag.png",
                    name: "Women Bag",
                    reporter: "Diana Surf",
                    reason: "Inappropriate content",
                    date: "12.09.2019",
                  },
                  {
                    id: 2,
                    image: "/images/reported-boots.png",
                    name: "Men Shoes",
                    reporter: "Karen Hut",
                    reason: "Fake Seller",
                    date: "12.09.2019",
                  },
                  {
                    id: 3,
                    image: "/images/reported-toy-car.png",
                    name: "Toys for kids",
                    reporter: "Steve Lauda",
                    reason: "The toy quality was bad",
                    date: "12.09.2019",
                  },
                  {
                    id: 4,
                    image: "/images/reported-green-handbag.png",
                    name: "Women Shoes",
                    reporter: "Diana Surf",
                    reason: "Product is cheap",
                    date: "12.09.2019",
                  },
                  {
                    id: 5,
                    image: "/images/reported-cap.png",
                    name: "Women caps",
                    reporter: "Karen Hut",
                    reason: "The quality was bad",
                    date: "12.09.2019",
                  },
                  {
                    id: 6,
                    image: "/images/reported-green-bag.png",
                    name: "Bags for Men",
                    reporter: "Steve Lauda",
                    reason: "Inappropriate content",
                    date: "12.09.2019",
                  },
                  {
                    id: 7,
                    image: "/images/reported-bag.png",
                    name: "Laptop Bag",
                    reporter: "Diana Surf",
                    reason: "Fake Seller",
                    date: "12.09.2019",
                  },
                  {
                    id: 8,
                    image: "/images/reported-headphones.png",
                    name: "Headphones",
                    reporter: "Karen Hut",
                    reason: "Product is cheap",
                    date: "12.09.2019",
                  },
                  {
                    id: 9,
                    image: "/mac-lipsticks.png",
                    name: "Mac Lipsticks",
                    reporter: "Steve Lauda",
                    reason: "Product is cheap",
                    date: "12.09.2019",
                  },
                ].map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span className="text-sm">{item.name}</span>
                        {/* Show compact meta on small screens */}
                        <span className="text-xs text-gray-500 sm:hidden">
                          {item.reason}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 md:table-cell">
                      {item.reporter}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 sm:table-cell">
                      {item.reason}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 text-gray-600 md:table-cell">
                      {item.date}
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 hidden sm:table-cell">
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs sm:text-sm font-medium">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 sm:py-4 px-4 sm:px-6 relative">
                      <MoreHorizontal
                        className="w-4 h-4 text-gray-400 cursor-pointer"
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === item.id ? null : item.id
                          )
                        }
                      />
                      {dropdownOpen === item.id && (
                        <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10 w-[204px] h-[90px]">
                          <div className="p-2">
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-orange-500 font-medium whitespace-nowrap"
                              onClick={() => {
                                setDropdownOpen(null);
                                setShowReportedItemDetails(true);
                              }}
                            >
                              View Product Details
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-600"
                              onClick={() => {
                                setDropdownOpen(null);
                                setShowReportedItemApprovalModal(true);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 sm:p-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              <Button className="bg-orange-500 text-white w-8 h-8 p-0">
                1
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                2
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                3
              </Button>
              <span className="text-gray-500">...</span>
              <Button variant="outside" className="w-8 h-8 p-0 bg-transparent">
                43
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                44
              </Button>
            </div>

            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );

  const renderCategoryManagement = () => (
    <div className="p-4 sm:p-8">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
        <span>Admin Dashboard</span>
        <span className="mx-2">›</span>
        <span>Category Management</span>
      </div>

      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Category Management
        </h1>
        <p className="text-gray-600">
          Create, edit, organize, or delete categories and subcategories used to
          classify products.
        </p>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-end sm:items-center mb-6 gap-3">
        <input
          type="text"
          placeholder="Search name"
          className="px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-[375px] rounded-[12px]"
          style={{ height: "48px" }}
        />
        <div className="flex flex-row space-x-1">
          <button
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 w-full sm:w-[84px] h-10 sm:h-[32px] rounded-[16px] text-sm"
            style={{ fontSize: "14px" }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter
          </button>
          <button
            className="text-white font-medium flex items-center justify-center gap-2 w-full sm:w-[173px] h-10 sm:h-[32px] rounded-[16px] text-sm"
            style={{
              fontSize: "14px",
              backgroundColor: "#00b69b",
            }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Category
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <div className="min-w-[900px]">
          {" "}
          {/* Minimum width to ensure desktop layout on mobile */}
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left">
                  <input type="checkbox" className="rounded" />
                  <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-900">
                    Select All
                  </span>
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-900">
                  Type
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-900">
                  Category Name
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-900 md:table-cell">
                  Subcategories
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-900 md:table-cell">
                  Product Count
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-900">
                  Status
                </th>
                <th className="py-3 sm:py-4 px-4 sm:px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                {
                  id: 1,
                  icon: "/images/category-electronics.png",
                  name: "Electronics",
                  subcategories: "Phones, Laptops",
                  count: 128,
                  status: "Active",
                },
                {
                  id: 2,
                  name: "Fashion",
                  icon: "/images/category-red-cap.png",
                  subcategories: "Men, Women, Kids, Footwear",
                  productCount: 198,
                  status: "Active",
                },
                {
                  id: 3,
                  icon: "/images/category-home.png",
                  name: "Home & Kitchen",
                  subcategories: "Furniture, Decor, Appliances, Tools",
                  count: 1120,
                  status: "Active",
                },
                {
                  id: 4,
                  icon: "/images/category-beauty.png",
                  name: "Beauty & Personal Care",
                  subcategories: "Skincare, Makeup, Haircare",
                  count: 860,
                  status: "Active",
                },
                {
                  id: 5,
                  icon: "/images/category-sports.png",
                  name: "Sports & Outdoors",
                  subcategories: "Fitness, Outdoor Gear, Bicycles",
                  count: 740,
                  status: "Hidden",
                },
                {
                  id: 6,
                  icon: "/images/category-books.png",
                  name: "Books & Stationery",
                  subcategories: "Fiction, Non-fiction, School Supplies",
                  count: 1030,
                  status: "Active",
                },
                {
                  id: 7,
                  icon: "/images/category-grocery.png",
                  name: "Grocery & Essentials",
                  subcategories: "Beverages, Snacks, Cleaning Supplies",
                  count: 1500,
                  status: "Active",
                },
                {
                  id: 8,
                  icon: "/images/category-toys.png",
                  name: "Toys & Baby Products",
                  subcategories: "Toys, Baby Care, Kids Clothing",
                  count: 680,
                  status: "Hidden",
                },
                {
                  id: 9,
                  icon: "/images/category-automobile.png",
                  name: "Automobile",
                  subcategories: "Car Accessories, Bike Accessories",
                  count: 230,
                  status: "Active",
                },
              ].map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <img
                      src={category.icon || "/placeholder.svg"}
                      alt={category.name}
                      className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg"
                    />
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <span className="text-sm font-medium text-gray-900">
                      {category.name}
                    </span>
                    {/* Compact helpers on small screens */}
                    <div className="md:hidden text-xs text-gray-500 mt-1">
                      {category.subcategories}
                    </div>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 md:table-cell">
                    <span className="text-sm text-gray-600">
                      {category.subcategories}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 md:table-cell">
                    <span className="text-sm text-gray-900">
                      {category.count}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium ${
                        category.status === "Active"
                          ? "text-white"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "14px",
                        backgroundColor:
                          category.status === "Active" ? "#00b69b" : undefined,
                      }}
                    >
                      {category.status}
                    </span>
                  </td>
                  <td className="py-3 sm:py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={() =>
                        setDropdownOpen(
                          dropdownOpen === category.id ? null : category.id
                        )
                      }
                    />
                    {dropdownOpen === category.id && (
                      <div
                        className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg z-10"
                        style={{ width: "204px", height: "90px" }}
                      >
                        <div className="py-2">
                          <div
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-orange-500 text-sm font-medium whitespace-nowrap"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => {
                              setDropdownOpen(null);
                              setShowCategoryModal(true);
                            }}
                          >
                            View
                          </div>
                          <div
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-gray-700 text-sm whitespace-nowrap"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => {
                              setDropdownOpen(null);
                              // Handle remove category
                            }}
                          >
                            Remove
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="p-4 sm:p-6 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            className="flex items-center bg-transparent w-full sm:w-auto justify-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            <Button className="bg-orange-500 text-white w-8 h-8 p-0">1</Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              2
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              3
            </Button>
            <span className="text-gray-500">...</span>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              43
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              44
            </Button>
          </div>
          <Button
            variant="outline"
            className="flex items-center bg-transparent w-full sm:w-auto justify-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderBannerPromotionsManagement = () => (
    <>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 lg:mb-8">
          <div className="text-xs sm:text-sm text-gray-500 mb-2">
            Admin Dashboard &gt; Banner / Promotions Management
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
            Banner / Promotions Management
          </h1>
          <p className="text-gray-600">
            Create, edit, organize, or delete categories and subcategories used
            to classify products.
          </p>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search name"
            className="w-full sm:w-[375px] h-12 px-4 py-3 border border-gray-300 rounded-[12px] focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <div className="flex flex-row space-x-2">
            <button className="w-full sm:w-[84px] h-8 sm:h-[32px] bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center justify-center gap-2 rounded-[16px] text-sm">
              <Filter className="w-3 h-3" />
              <span className="sm:inline">Filter</span>
            </button>
            <button
              className="w-full sm:w-[173px] h-8 sm:h-[32px] text-white font-medium flex items-center justify-center gap-2 rounded-[16px] text-sm"
              style={{ backgroundColor: "#00b69b" }}
            >
              <Plus className="w-3 h-3" />
              Add New Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
          <div className="min-w-[900px]">
            {" "}
            {/* Minimum width to ensure desktop layout on mobile */}
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-4 px-4 sm:px-6 text-left">
                    <div className="flex items-center">
                      <input type="checkbox" className="rounded" />
                      <span className="ml-2 sm:ml-3 text-xs sm:text-sm font-medium text-gray-700">
                        Select All
                      </span>
                    </div>
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Banner Image
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Title
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-700 md:table-cell">
                    Placement
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-700 lg:table-cell">
                    Start Date
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-700 lg:table-cell">
                    End Date
                  </th>
                  <th className="py-4 px-4 sm:px-6 text-left text-xs sm:text-sm font-medium text-gray-700">
                    Status
                  </th>
                  <th className="py-4 px-4 sm:px-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  {
                    id: 1,
                    title: "Summer Sale",
                    placement: "Hero Section",
                    status: "Active",
                  },
                  {
                    id: 2,
                    title: "Eid Collection",
                    placement: "Homepage",
                    status: "Active",
                  },
                  {
                    id: 3,
                    title: "Flash Deal",
                    placement: "Handbags Page",
                    status: "Active",
                  },
                  {
                    id: 4,
                    title: "Weekend Discount",
                    placement: "All Pages",
                    status: "Active",
                  },
                  {
                    id: 5,
                    title: "Back to School",
                    placement: "Hero Section",
                    status: "Hidden",
                  },
                  {
                    id: 6,
                    title: "Kitchen Essentials",
                    placement: "Home & Kitchen",
                    status: "Active",
                  },
                  {
                    id: 7,
                    title: "Women's Wear",
                    placement: "Footer Banner",
                    status: "Active",
                  },
                  {
                    id: 8,
                    title: "New User Offer",
                    placement: "Clothing Page",
                    status: "Hidden",
                  },
                  {
                    id: 9,
                    title: "Collection Promo",
                    placement: "Popup Banner",
                    status: "Active",
                  },
                ].map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 sm:px-6">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <img
                        src="/images/banner-gradient.png"
                        alt="Banner"
                        className="w-10 h-10 rounded object-cover"
                      />
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="text-sm font-medium text-gray-900">
                        {banner.title}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6  md:table-cell">
                      <span className="text-sm text-gray-600">
                        {banner.placement}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6  lg:table-cell">
                      <span className="text-sm text-gray-600">01-Aug-25</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6  lg:table-cell">
                      <span className="text-sm text-gray-600">15-Aug-25</span>
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full ${
                          banner.status === "Active"
                            ? "text-white"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                        style={{
                          width: "93px",
                          height: "27px",
                          backgroundColor:
                            banner.status === "Active" ? "#00b69b" : undefined,
                        }}
                      >
                        {banner.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 relative">
                      <MoreHorizontal
                        className="w-4 h-4 text-gray-400 cursor-pointer"
                        onClick={() =>
                          setDropdownOpen(
                            dropdownOpen === banner.id.toString()
                              ? null
                              : banner.id.toString()
                          )
                        }
                      />
                      {dropdownOpen === banner.id.toString() && (
                        <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10 w-[204px] h-[90px]">
                          <div className="p-3 space-y-1">
                            <button
                              type="button"
                              className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 rounded transition-colors"
                              style={{ width: "180px", height: "36px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowBannerEditModal(true);
                                setTimeout(() => setDropdownOpen(null), 0);
                              }}
                            >
                              Edit
                            </button>

                            <button
                              className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 rounded transition-colors"
                              style={{ width: "180px", height: "36px" }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="p-4 sm:p-6 border-t">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <div className="flex items-center space-x-2">
              <Button className="bg-orange-500 text-white w-8 h-8 p-0">
                1
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                2
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                3
              </Button>
              <span className="text-gray-500">...</span>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                43
              </Button>
              <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
                44
              </Button>
            </div>
            <Button
              variant="outline"
              className="flex items-center bg-transparent w-full sm:w-auto justify-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {showBannerEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop (click to close) */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowBannerEditModal(false)}
          />

          {/* Modal shell */}
          <div className="relative bg-white rounded-lg shadow-xl w-[95%] sm:w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal content remains the same */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Create Banner
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add/Edit Banner Modal or Form
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBannerEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Details
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Banner Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date
                      </label>
                      <input
                        type="text"
                        placeholder="Enter"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date
                      </label>
                      <input
                        type="text"
                        placeholder="Enter"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image/View Upload
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        className="hidden"
                        id="banner-upload"
                      />
                      <label
                        htmlFor="banner-upload"
                        className="cursor-pointer text-gray-500"
                      >
                        Upload file
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Banner Preview
                </h3>
                <div className="bg-gradient-to-r from-blue-900 via-blue-700 to-blue-500 rounded-lg h-40 sm:h-48 flex items-center justify-center relative">
                  <div className="w-16 h-16 bg-orange-500 bg-opacity-20 rounded-full flex items-center justify-center">
                    <Edit2 className="w-8 h-8 text-orange-500" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm font-medium text-gray-700">
                    Banner Preview
                  </span>
                  <label className="relative inline-block w-12 h-6">
                    <input type="checkbox" className="sr-only" defaultChecked />
                    <span className="block bg-orange-500 w-12 h-6 rounded-full"></span>
                    <span className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-6"></span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 p-6 border-t">
              <button
                type="button"
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-orange-500 font-medium rounded-full w-full sm:w-auto"
                onClick={() => setShowBannerEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full w-full sm:w-auto"
                onClick={() => {
                  setShowBannerEditModal(false);
                  // setShowBannerSuccessModal(true)
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  const renderTransactionsPayouts = () => (
    <div className="p-4 sm:p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Transactions & Payouts
        </h1>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Revenue This Month</p>
                <p className="text-2xl font-bold text-gray-900">$89,000</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img
                  src="/images/icon-revenue.png"
                  alt="Revenue"
                  className="w-12 h-12"
                />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <span className="text-red-500 mr-1">↓</span>
              <span className="text-red-500 mr-1">4.3%</span>
              <span className="text-gray-500">Down from yesterday</span>
            </div>
          </div>

          {/* Total Orders Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Order</p>
                <p className="text-2xl font-bold text-gray-900">10293</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img
                  src="/images/icon-orders.png"
                  alt="Orders"
                  className="w-12 h-12"
                />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <img
                src="/images/icon-trending-up.png"
                alt="Up"
                className="w-4 h-4 mr-1"
              />
              <span className="text-teal-500 mr-1">1.3%</span>
              <span className="text-gray-500">Up from past week</span>
            </div>
          </div>

          {/* Pending Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900">2040</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img
                  src="/images/icon-pending.png"
                  alt="Pending"
                  className="w-12 h-12"
                />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <img
                src="/images/icon-trending-up.png"
                alt="Up"
                className="w-4 h-4 mr-1"
              />
              <span className="text-teal-500 mr-1">1.8%</span>
              <span className="text-gray-500">Up from yesterday</span>
            </div>
          </div>

          {/* Failed Card */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Failed</p>
                <p className="text-2xl font-bold text-gray-900">2040</p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <img
                  src="/images/icon-failed.png"
                  alt="Failed"
                  className="w-12 h-12"
                />
              </div>
            </div>
            <div className="flex items-center text-sm">
              <img
                src="/images/icon-trending-up.png"
                alt="Up"
                className="w-4 h-4 mr-1"
              />
              <span className="text-teal-500 mr-1">1.8%</span>
              <span className="text-gray-500">Up from yesterday</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-8">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Transactions
          </h2>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 w-full sm:w-auto">
            <select
              className="w-full sm:w-[236.33px] px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 text-center"
              style={{ height: "44px", borderRadius: "50px" }}
            >
              <option>Data Range</option>
            </select>
            <select
              className="w-full sm:w-[236.33px] px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 text-center"
              style={{ height: "44px", borderRadius: "50px" }}
            >
              <option>Status</option>
            </select>
            <select
              className="w-full sm:w-[236.33px] px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-gray-50 text-center"
              style={{ height: "44px", borderRadius: "50px" }}
            >
              <option>Payment Method</option>
            </select>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    User/Seller
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">User Name</td>
                  <td className="py-4 px-4 sm:px-6">Credit Card</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-green-100 text-green-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransactionDropdownOpen(
                          transactionDropdownOpen === "paid-1" ? null : "paid-1"
                        );
                      }}
                    />
                    {transactionDropdownOpen === "paid-1" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setTransactionDropdownOpen(null)}
                          >
                            View Details
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setTransactionDropdownOpen(null)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">User Name</td>
                  <td className="py-4 px-4 sm:px-6">Debit Card</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-yellow-100 text-yellow-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Pending
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransactionDropdownOpen(
                          transactionDropdownOpen === "pending-1"
                            ? null
                            : "pending-1"
                        );
                      }}
                    />
                    {transactionDropdownOpen === "pending-1" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setTransactionDropdownOpen(null)}
                          >
                            Send Payment
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setTransactionDropdownOpen(null)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">User Name</td>
                  <td className="py-4 px-4 sm:px-6">PayPal</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-red-100 text-red-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Failed
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setTransactionDropdownOpen(
                          transactionDropdownOpen === "failed-1"
                            ? null
                            : "failed-1"
                        );
                      }}
                    />
                    {transactionDropdownOpen === "failed-1" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setTransactionDropdownOpen(null)}
                          >
                            Retry/Refund
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setTransactionDropdownOpen(null)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            className="flex items-center bg-transparent w-full sm:w-auto justify-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            <Button className="bg-orange-500 text-white w-8 h-8 p-0">1</Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              2
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              3
            </Button>
            <span className="text-gray-500">...</span>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              43
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              44
            </Button>
          </div>
          <Button
            variant="outline"
            className="flex items-center bg-transparent w-full sm:w-auto justify-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Payout Requests Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Payout Requests
          </h2>

          {/* Payout Requests Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Order ID
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Seller
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Method
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Requested On
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">Seller Name</td>
                  <td className="py-4 px-4 sm:px-6">Credit Card</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-green-100 text-green-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Paid
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayoutDropdownOpen(
                          payoutDropdownOpen === "payout-paid-1"
                            ? null
                            : "payout-paid-1"
                        );
                      }}
                    />
                    {payoutDropdownOpen === "payout-paid-1" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            View Details
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">Seller Name</td>
                  <td className="py-4 px-4 sm:px-6">Debit Card</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-yellow-100 text-yellow-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Pending
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayoutDropdownOpen(
                          payoutDropdownOpen === "payout-pending-1"
                            ? null
                            : "payout-pending-1"
                        );
                      }}
                    />
                    {payoutDropdownOpen === "payout-pending-1" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Send Payment
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">Seller Name</td>
                  <td className="py-4 px-4 sm:px-6">PayPal</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-red-100 text-red-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Failed
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayoutDropdownOpen(
                          payoutDropdownOpen === "payout-failed-1"
                            ? null
                            : "payout-failed-1"
                        );
                      }}
                    />
                    {payoutDropdownOpen === "payout-failed-1" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Retry/Refund
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>

                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 sm:px-6">#123456</td>
                  <td className="py-4 px-4 sm:px-6">Seller Name</td>
                  <td className="py-4 px-4 sm:px-6">PayPal</td>
                  <td className="py-4 px-4 sm:px-6">12.09.2019</td>
                  <td className="py-4 px-4 sm:px-6">$34,295</td>
                  <td className="py-4 px-4 sm:px-6">
                    <span
                      className="bg-red-100 text-red-800 text-xs font-medium flex items-center justify-center"
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Failed
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 relative">
                    <MoreHorizontal
                      className="w-4 h-4 text-gray-400 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPayoutDropdownOpen(
                          payoutDropdownOpen === "payout-failed-2"
                            ? null
                            : "payout-failed-2"
                        );
                      }}
                    />
                    {payoutDropdownOpen === "payout-failed-2" && (
                      <div
                        className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border z-10"
                        style={{ width: "204px", height: "90px" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="p-3 space-y-1">
                          <button
                            className="block w-full text-left text-sm text-orange-500 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Retry/Refund
                          </button>
                          <button
                            className="block w-full text-left text-sm text-gray-600 hover:bg-gray-50 py-3 px-2 rounded transition-colors"
                            style={{ width: "180px", height: "36px" }}
                            onClick={() => setPayoutDropdownOpen(null)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 border-t">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <Button
            variant="outline"
            className="flex items-center bg-transparent w-full sm:w-auto justify-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center space-x-2">
            <Button className="bg-orange-500 text-white w-8 h-8 p-0">1</Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              2
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              3
            </Button>
            <span className="text-gray-500">...</span>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              43
            </Button>
            <Button variant="outline" className="w-8 h-8 p-0 bg-transparent">
              44
            </Button>
          </div>
          <Button
            variant="outline"
            className="flex items-center bg-transparent w-full sm:w-auto justify-center"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Product Details Modal */}
      {showProductDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className="absolute inset-0"
            onClick={() => setShowProductDetails(false)}
          ></div>
          <div
            className="bg-white shadow-xl relative h-screen w-full lg:w-[992px] overflow-y-auto"
            style={{
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* IE and Edge */,
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none; /* Chrome, Safari, Opera */
              }
            `}</style>

            {/* Close Button */}
            <button
              onClick={() => setShowProductDetails(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Product Details Content */}
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Product Details
                </h2>
                <p className="text-gray-600">
                  Review, approve, reject, or edit product listings submitted by
                  sellers.
                </p>
              </div>

              {/* Product Image */}
              <div className="mb-8">
                <img
                  src="/images/product-backpack.png"
                  alt="Product"
                  className="w-full h-56 sm:h-72 lg:h-80 object-cover rounded-lg"
                />
              </div>

              {/* Product Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Product Information
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <div className="text-gray-900 font-medium">
                      Urban Explorer Backpack
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <div className="text-gray-900">Backpacks</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price
                    </label>
                    <div className="text-gray-900 font-medium">$49.99</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seller
                    </label>
                    <div className="text-gray-900">GearUp Outfitters</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <div className="text-gray-700 leading-relaxed">
                    This product is a stylish and functional backpack designed
                    for everyday use. It features a spacious main compartment,
                    multiple pockets for organization, and adjustable straps for
                    comfort. Made from durable, water-resistant material, it's
                    perfect for school, work, or travel.
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-orange-500 font-medium w-full sm:w-[170px] h-14"
                  style={{ borderRadius: "50px" }}
                  onClick={() => {
                    setShowProductDetails(false);
                    setShowRejectionModal(true);
                  }}
                >
                  Reject
                </button>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium w-full sm:w-[170px] h-14"
                  style={{ borderRadius: "50px" }}
                  onClick={() => {
                    setShowProductDetails(false);
                    setShowApprovalModal(true);
                  }}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reported Item Details Modal */}
      {showReportedItemDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div
            className="absolute inset-0"
            onClick={() => setShowReportedItemDetails(false)}
          ></div>
          <div
            className="bg-white shadow-xl relative h-screen w-full lg:w-[992px] overflow-y-auto"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {/* Close Button */}
            <button
              onClick={() => setShowReportedItemDetails(false)}
              className="absolute top-6 right-6 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Reported Item
                </h2>
                <p className="text-gray-600">
                  Review, approve, reject, or edit product listings submitted by
                  sellers.
                </p>
              </div>

              {/* Product Image */}
              <div className="mb-8">
                <img
                  src="/images/reported-water-bottle-banner.png"
                  alt="Reported Product"
                  className="w-full h-40 sm:h-48 object-cover rounded-lg"
                />
              </div>

              {/* Product Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Reported Item
                </h3>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Product: Eco-Friendly Water Bottle
                </h4>
                <p className="text-gray-600 mb-6">
                  A reusable water bottle made from sustainable materials,
                  designed for everyday use.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">
                      Product Name
                    </h5>
                    <p className="text-gray-900">Eco Friendly Water Bottle</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">
                      Reporter Name
                    </h5>
                    <p className="text-gray-900">Reporter Name</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">
                      Reporter_ID
                    </h5>
                    <p className="text-gray-900">1029384</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">
                      Report Date
                    </h5>
                    <p className="text-gray-900">12-04-2025</p>
                  </div>
                  <div className="lg:col-span-2">
                    <h5 className="text-sm font-medium text-gray-500 mb-1">
                      Description
                    </h5>
                    <p className="text-gray-900">
                      The reporter stated that the product description contains
                      misleading information about the materials used.
                    </p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-500 mb-1">
                      Seller
                    </h5>
                    <p className="text-gray-900">GearUp Outfitters</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 mt-12">
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-orange-500 font-medium w-full sm:w-[170px] h-14"
                  style={{ borderRadius: "50px" }}
                  onClick={() => {
                    setShowReportedItemDetails(false);
                    setShowReportedItemRejectionModal(true);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white font-medium w-full sm:w-[170px] h-14"
                  style={{ borderRadius: "50px" }}
                  onClick={() => {
                    setShowReportedItemDetails(false);
                    setShowReportedItemApprovalModal(true);
                  }}
                >
                  Remove Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReportedItemApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-[90%] sm:w-full max-w-md mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowReportedItemApprovalModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <Check className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Approved
              </h2>
              <p className="text-gray-600">
                The Product has been reported.
                <br />
                The seller will be notified shortly.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 py-3 px-6 font-medium rounded-full"
                style={{ backgroundColor: "#fff4ec", color: "#ea580c" }}
                onClick={() => setShowReportedItemApprovalModal(false)}
              >
                Undo
              </button>
              <button
                className="flex-1 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full"
                onClick={() => setShowReportedItemApprovalModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportedItemRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-[90%] sm:w-full max-w-md mx-4 relative">
            {/* Close Button */}
            <button
              onClick={() => setShowReportedItemRejectionModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <X className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Rejected
              </h2>
              <p className="text-gray-600">
                The Product report has been rejected.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 py-3 px-6 font-medium rounded-full"
                style={{ backgroundColor: "#fff4ec", color: "#ea580c" }}
                onClick={() => setShowReportedItemRejectionModal(false)}
              >
                Undo
              </button>
              <button
                className="flex-1 py-3 px-6 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full"
                onClick={() => setShowReportedItemRejectionModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[95%] sm:w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Manage Categories
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Add/Edit Category Modal/Form
                  </p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Banner Image */}
              <div className="mb-6">
                <img
                  src="/images/category-banner.png"
                  alt="Category Banner"
                  className="w-full h-40 sm:h-48 object-cover rounded-lg"
                />
              </div>

              {/* Form Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Details</h3>

                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Description here....."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Parent Category and Active/Hidden */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parent Category
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white">
                      <option>Select category</option>
                      <option>Electronics</option>
                      <option>Fashion</option>
                      <option>Home & Kitchen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Active/Hidden
                    </label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white">
                      <option>Select</option>
                      <option>Active</option>
                      <option>Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Existing Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Existing Categories
                  </label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white">
                    <option>Select category</option>
                    <option>Electronics</option>
                    <option>Fashion</option>
                    <option>Home & Kitchen</option>
                    <option>Beauty & Personal Care</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 p-6 border-t">
              <button
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-orange-500 font-medium rounded-full w-full sm:w-auto"
                onClick={() => setShowCategoryModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full w-full sm:w-auto"
                onClick={() => {
                  setShowCategoryModal(false);
                  setShowCategorySaveSuccess(true);
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Save Success Modal */}
      {showCategorySaveSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[90%] sm:w-full max-w-md mx-4 relative">
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800"
              onClick={() => setShowCategorySaveSuccess(false)}
            >
              <X className="w-4 h-4" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-orange-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">
                Successfully Saved
              </h2>
              <p className="text-gray-600">The Product has been saved.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="flex-1 py-3 bg-orange-100 hover:bg-orange-200 text-orange-500 font-medium rounded-full"
                onClick={() => setShowCategorySaveSuccess(false)}
              >
                Undo
              </button>
              <button
                className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-full"
                onClick={() => setShowCategorySaveSuccess(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* support and help models */}

      <div
        className={`flex bg-gray-50 ${
          showLogoutModal || showUserProfile || showProductDetails
            ? "backdrop-blur"
            : ""
        } w-full min-h-screen lg:min-h-[1343px]`}
      >
        {/* Sidebar */}
        <div className="hidden lg:block bg-white shadow-sm border-r relative lg:w-[240px] lg:h-[1343px]">

  <div className="p-2 lg:p-6 flex items-center justify-center">
    {/* (Removed) Mobile menu button from sidebar header so it appears in the top-right header instead */}
    {/* Desktop logo */}
    <img
      src="/logo.png"
      alt="SoukLoop"
      style={{ width: "208px", height: "64.5px" }}
      className="hidden lg:block"
    />
  </div>

  {/* Nav */}
  <nav
    className="px-4 space-y-1 hidden lg:block"
    style={{ width: "208px", height: "612px" }}
  >
    {sidebarItems.map((item, index) => (
      <div
        key={index}
        className={`flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors ${
          activeNavItem === item.label
            ? "bg-orange-500 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
        style={{ width: "208px", height: "52px", borderRadius: "16px" }}
        onClick={() => {
          if (item.label === "Help Line") {
            // open modal, do NOT change nav
            setShowHelpLineModal(true);
            return;
          }
          // normal nav
          setActiveNavItem(item.label);

          // reset support UI whenever leaving Support Tickets
          if (item.label !== "Support Tickets") {
            setShowTicketDetail(false);
            setSelectedTicket(null);
            setShowReplyInterface(false);
          }

          // reset Seller details when leaving that section
          if (item.label !== "Seller Verification") {
            setShowSellerDetails(false);
            setSelectedSeller(null);
          }
        }}
      >
        <img
          src={item.icon || "/placeholder.svg"}
          alt=""
          className="w-4 h-4 mr-3"
        />
        {item.label}
      </div>
    ))}
  </nav>

  {/* Logout button (desktop) */}
  <div className="absolute bottom-0 left-4 mb-4 hidden lg:block">
    <div
      className="flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors bg-gray-50 hover:bg-gray-100 text-orange-500"
      style={{ width: "208px", height: "52px", borderRadius: "16px" }}
      onClick={() => setShowLogoutModal(true)}
    >
      <LogOut className="w-4 h-4 mr-3" />
      <span>Log out</span>
    </div>
  </div>
</div>

{/* Mobile Drawer */}
{mobileNavOpen && (
  <div className="fixed inset-0 z-[60] lg:hidden">
    <div
      className="absolute inset-0 bg-black/40"
      onClick={() => setMobileNavOpen(false)}
    />
    <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <img src="/logo.png" alt="SoukLoop" className="h-10 w-auto" />
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
          className="rounded-full p-1 hover:bg-gray-100"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="space-y-1">
        {sidebarItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors ${
              activeNavItem === item.label
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            style={{ borderRadius: "16px" }}
            onClick={() => {
              if (item.label === "Help Line") {
                setShowHelpLineModal(true);
              } else {
                setActiveNavItem(item.label);
                // reset support UI when leaving Support
                if (item.label !== "Support Tickets") {
                  setShowTicketDetail(false);
                  setSelectedTicket(null);
                  setShowReplyInterface(false);
                }
                // reset Seller details when leaving
                if (item.label !== "Seller Verification") {
                  setShowSellerDetails(false);
                  setSelectedSeller(null);
                }
              }
              setMobileNavOpen(false);
            }}
          >
            <img
              src={item.icon || "/placeholder.svg"}
              alt=""
              className="w-4 h-4 mr-3"
            />
            {item.label}
          </div>
        ))}
      </nav>

      <div className="mt-6">
        <button
          onClick={() => {
            setMobileNavOpen(false);
            setShowLogoutModal(true);
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-gray-50 hover:bg-gray-100 text-orange-500 rounded-[16px]"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </div>
  </div>
)}

        {/* Main Content */}
        <div className="flex-1 min-w-0 lg:w/[1200px] lg:h-[1343px]">
          <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 min-w-0">
      <h1 className="text-base sm:text-lg font-medium text-gray-600 truncate">
        Admin Dashboard
      </h1>
    </div>

    <div className="flex items-center space-x-3 sm:space-x-4">
      {/* Notifications */}
      <Bell className="w-5 h-5 text-gray-500" />

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar className="w-8 h-8">
              <img
                src="/icons/admin-avatar.png"
                alt="Admin"
                className="w-8 h-8 rounded-full"
              />
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">Admin</span>
            <ChevronDown className="w-4 h-4 hidden sm:inline" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Mobile-only menu trigger */}
      <button
        type="button"
        aria-label="Open menu"
        aria-controls="mobile-drawer"
        aria-expanded={mobileNavOpen ? "true" : "false"}
        onClick={() => setMobileNavOpen(true)}
        className="sm:hidden rounded-full p-2 hover:bg-gray-100 active:bg-gray-200 transition"
      >
        <Menu className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  </div>
</header>


          <div className="w-full lg:w-[1200px] lg:h-[1343px]">
            {activeNavItem === "Dashboard" && renderDashboard()}
            {activeNavItem === "User Management" && renderUserManagement()}
            {activeNavItem === "Seller Verification" &&
              !showSellerDetails &&
              renderSellerVerification()}
            {activeNavItem === "Seller Verification" &&
              showSellerDetails &&
              renderSellerVerificationDetails()}
            {activeNavItem === "Product Approval/ Moderation" &&
              renderProductApprovalModeration()}
            {activeNavItem === "Reported Items" && renderReportedItems()}
            {activeNavItem === "Category Management" &&
              renderCategoryManagement()}
            {activeNavItem === "Banner/Promotions Management" &&
              renderBannerPromotionsManagement()}
            {activeNavItem === "Transactions & Payouts" &&
              renderTransactionsPayouts()}
            {activeNavItem === "System Settings" && renderSystemSettings()}
            {activeNavItem === "Support Tickets" && (
              <>
                {!showTicketDetail ? (
                  renderSupportTickets()
                ) : (
                  <>
                    {renderTicketDetail()}
                    {showReplyInterface && renderReplyInterface()}
                  </>
                )}
              </>
            )}
          </div>

          {/* Global Modals */}
          {renderHelpLineModal()}

          {/* Assign Modal */}
          {showAssignModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={() => setShowAssignModal(false)}
              />
              <div
                className="relative bg-white shadow-xl"
                style={{
                  width: "437px",
                  height: "652px",
                  borderRadius: "16px",
                }}
              >
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    Available Supporter
                  </h2>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search"
                      className="pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-[373px] h-[52px] rounded-[8px]"
                    />
                  </div>
                </div>

                <div
                  className="p-6 space-y-4 overflow-y-auto"
                  style={{ maxHeight: "400px" }}
                >
                  {supporters.map((supporter) => (
                    <div
                      key={supporter.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={supporter.avatar || "/placeholder.svg"}
                          alt={supporter.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {supporter.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {supporter.team}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setShowAssignModal(false);
                          setShowTaskAssignedModal(true);
                        }}
                        className="bg-orange-100 text-orange-600 font-medium hover:bg-orange-200 transition-colors"
                        style={{
                          width: "120px",
                          height: "42px",
                          borderRadius: "8px",
                        }}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Task Assigned Modal */}
          {showTaskAssignedModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={() => setShowTaskAssignedModal(false)}
              />
              <div
                className="relative bg-white shadow-xl flex flex-col items-center justify-center p-8"
                style={{
                  width: "500px",
                  height: "400px",
                  borderRadius: "16px",
                }}
              >
                <button
                  onClick={() => setShowTaskAssignedModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6">
                  <img
                    src="/checkmark-icon.png"
                    alt="Success"
                    className="w-20 h-20"
                  />
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                  Task Assigned
                </h2>
                <p className="text-gray-600 mb-8 text-center max-w-sm">
                  Task has been successfully transferred and is now under the
                  assigned user's responsibility.
                </p>

                <button
                  onClick={() => setShowTaskAssignedModal(false)}
                  className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors w-[436px] h-14 rounded-[28px]"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Logout Modal */}
          {showLogoutModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={() => setShowLogoutModal(false)}
              />
              <div
                className="relative bg-white shadow-xl flex flex-col items-center justify-center p-8 w-[90%] sm:w-[500px]"
                style={{ height: "auto", borderRadius: "16px" }}
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                    <LogOut className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Are you sure you want to log out?
                </h2>
                <p className="text-gray-600 mb-8 text-center">
                  {"You'll be signed out from your account."}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="bg-gray-100 text-orange-500 font-medium hover:bg-gray-200 transition-colors w-full sm:w-[212px] h-14"
                    style={{ borderRadius: "50px" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      console.log("Logging out...");
                      setShowLogoutModal(false);
                    }}
                    className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors w-full sm:w-[212px] h-14"
                    style={{ borderRadius: "50px" }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Profile Modal */}
          {showUserProfile && selectedUser && (
            <div className="fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={() => setShowUserProfile(false)}
              />
              <div className="absolute right-0 top-0 bg-white shadow-xl w-full lg:w-[761px] h-screen lg:h-[1343px]">
                <button
                  onClick={() => setShowUserProfile(false)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="relative">
                  <img
                    src="/images/user-banner-gradient.png"
                    alt="Banner"
                    className="w-full object-cover"
                    style={{ height: "260px" }}
                  />
                  <div className="absolute left-6 sm:left-8 -bottom-16 sm:-bottom-20">
                    <img
                      src="/images/user-profile-large.png"
                      alt={selectedUser.name}
                      className="rounded-full border-4 border-white object-cover"
                      style={{ width: "120px", height: "120px" }}
                    />
                  </div>
                </div>
                <div className="pt-24 sm:pt-28 px-6 sm:px-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedUser.name}
                  </h1>
                  <div className="mb-4">
                    <span className="text-orange-500 text-sm font-medium">
                      Seller
                    </span>
                  </div>
                  <div className="space-y-2 mb-6">
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <p className="text-gray-600">+11 -12345- 6759</p>
                  </div>
                  <div className="flex items-center space-x-6 mb-8">
                    <div>
                      <span className="font-semibold text-gray-900">4</span>
                      <span className="text-gray-600 ml-1">Followers</span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">12</span>
                      <span className="text-gray-600 ml-1">Following</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                      User_Name_Shop
                    </h2>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-600">
                        <span className="text-gray-900">Sign-up Date:</span> 12
                        Jul 2024
                      </p>
                      <p className="text-gray-600">
                        <span className="text-gray-900">Last Login:</span> 04
                        Aug 2025, 11:34 AM
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center justify-center text-xs font-medium bg-green-100 text-green-800"
                      style={{
                        width: "128px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Active Seller
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success Notification (unchanged for desktop; no structure added) */}
          {activeNavItem === "User Management" && (
            <div
              className="fixed bottom-6 right-6 shadow-lg p-4 flex items-center space-x-3"
              style={{
                width: "400px",
                height: "108px",
                borderRadius: "16px",
                backgroundColor: "#ffe4d4",
              }}
            >
              <img
                src="/icons/tick-icon.png"
                alt="Success"
                style={{ width: "40px", height: "40px" }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {'"Steve Lauda" details updated'}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <button className="text-sm text-orange-500 hover:text-orange-600">
                    Undo
                  </button>
                  <button className="text-sm text-gray-600 hover:text-gray-700">
                    View Profile
                  </button>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <img
                  src="/icons/cross-icon.png"
                  alt="Close"
                  style={{ width: "40px", height: "40px" }}
                />
              </button>
            </div>
          )}

          {/* Approval Modal */}
          {showApprovalModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={() => setShowApprovalModal(false)}
              />
              <div
                className="relative bg-white shadow-xl flex flex-col items-center justify-center p-8 w-[90%] sm:w-[500px]"
                style={{ height: "auto", borderRadius: "16px" }}
              >
                <button
                  onClick={() => setShowApprovalModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src="/icons/approve-icon-large.png"
                  alt="Approved"
                  className="w-20 h-20 mb-6"
                />
                <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
                  Approved
                </h2>
                <p className="text-gray-600 mb-8 text-center">
                  {activeNavItem === "Product Approval/ Moderation"
                    ? "The Product has been approved."
                    : "The Seller Verification has been approved."}
                  <br />
                  The seller will be notified shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="text-orange-500 font-medium hover:opacity-80 transition-colors w-full sm:w-[212px] h-14"
                    style={{ borderRadius: "50px", backgroundColor: "#fff4ec" }}
                  >
                    Undo
                  </button>
                  <button
                    onClick={() => setShowApprovalModal(false)}
                    className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors w-full sm:w-[212px] h-14"
                    style={{ borderRadius: "50px" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rejection Modal */}
          {showRejectionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
                onClick={() => setShowRejectionModal(false)}
              />
              <div
                className="relative bg-white shadow-xl flex flex-col items-center justify-center p-8 w-[90%] sm:w-[500px]"
                style={{ height: "auto", borderRadius: "16px" }}
              >
                <button
                  onClick={() => setShowRejectionModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <img
                  src="/icons/reject-icon.png"
                  alt="Rejected"
                  className="w-20 h-20 mb-6"
                />
                <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
                  Rejected
                </h2>
                <p className="text-gray-600 mb-8 text-center">
                  {activeNavItem === "Product Approval/ Moderation"
                    ? "The Product has been rejected."
                    : "The Seller Verification has been rejected."}
                  <br />
                  The seller will be notified shortly.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="text-orange-500 font-medium hover:opacity-80 transition-colors w-full sm:w-[212px] h-14"
                    style={{ borderRadius: "50px", backgroundColor: "#fff4ec" }}
                  >
                    Undo
                  </button>
                  <button
                    onClick={() => setShowRejectionModal(false)}
                    className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors w-full sm:w-[212px] h-14"
                    style={{ borderRadius: "50px" }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
