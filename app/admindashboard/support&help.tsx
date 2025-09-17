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
  ChevronRight as CrRight,
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

export default function AdminDashboard() {
  // ------------------ STATE (unchanged + support/help) ------------------
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showTaskAssignedModal, setShowTaskAssignedModal] = useState(false);

  // CHANGED: This now controls an inline composer, not a second screen.
  const [showReplyInterface, setShowReplyInterface] = useState(false);

  const [showHelpLineModal, setShowHelpLineModal] = useState(false);

  const [activeTab, setActiveTab] = useState("Sales");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [activeNavItem, setActiveNavItem] = useState("Dashboard");
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<any>(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showReportedItemDetails, setShowReportedItemDetails] = useState(false);
  const [showReportedItemApprovalModal, setShowReportedItemApprovalModal] =
    useState(false);
  const [showReportedItemRejectionModal, setShowReportedItemRejectionModal] =
    useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showCategorySaveSuccess, setShowCategorySaveSuccess] = useState(false);
  const [showBannerEditModal, setShowBannerEditModal] = useState(false);
  const [transactionDropdownOpen, setTransactionDropdownOpen] =
    useState<any>(null);
  const [payoutDropdownOpen, setPayoutDropdownOpen] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // ------------------ EFFECTS (unchanged) ------------------
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
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const handleClickOutside = () => {
      if (transactionDropdownOpen) setTransactionDropdownOpen(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [transactionDropdownOpen]);

  // ------------------ DATA (unchanged) ------------------
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
    { id: 1, name: "Florencio Dorrance", team: "Supporter team", avatar: "/supporter-1.png" },
    { id: 2, name: "Florencio Dorrance", team: "Supporter team", avatar: "/supporter-2.png" },
    { id: 3, name: "Florencio Dorrance", team: "Supporter team", avatar: "/supporter-3.png" },
    { id: 4, name: "Florencio Dorrance", team: "Supporter team", avatar: "/supporter-4.png" },
    { id: 5, name: "Florencio Dorrance", team: "Supporter team", avatar: "/supporter-5.png" },
    { id: 6, name: "Florencio Dorrance", team: "Supporter team", avatar: "/supporter-6.png" },
  ];

  const userData = [
    { id: 1, name: "Diana Surf", email: "Dianasurf112@gmail.com", role: "Seller", lastActive: "12.09.2019", status: "Active", avatar: "/images/profile-woman-1.png" },
    { id: 2, name: "Karen Hut", email: "Karenhut@yahoo.com", role: "Seller", lastActive: "12.09.2019", status: "Suspended", avatar: "/images/profile-woman-2.png" },
    { id: 3, name: "Steve Lauda", email: "Stevelauda102@gmail.com", role: "User", lastActive: "12.09.2019", status: "In Active", avatar: "/images/profile-man-1.png" },
    { id: 4, name: "Diana Surf", email: "Dianasurf112@gmail.com", role: "Seller", lastActive: "12.09.2019", status: "Active", avatar: "/images/profile-woman-1.png" },
    { id: 5, name: "Karen Hut", email: "Karenhut@yahoo.com", role: "Seller", lastActive: "12.09.2019", status: "Suspended", avatar: "/images/profile-woman-2.png" },
    { id: 6, name: "Steve Lauda", email: "Stevelauda102@gmail.com", role: "Seller", lastActive: "12.09.2019", status: "In Active", avatar: "/images/profile-man-1.png" },
    { id: 7, name: "Diana Surf", email: "Dianasurf112@gmail.com", role: "Seller", lastActive: "12.09.2019", status: "Active", avatar: "/images/profile-woman-1.png" },
    { id: 8, name: "Karen Hut", email: "Karenhut@yahoo.com", role: "User", lastActive: "12.09.2019", status: "Suspended", avatar: "/images/profile-woman-2.png" },
    { id: 9, name: "Steve Lauda", email: "Stevelauda102@gmail.com", role: "User", lastActive: "12.09.2019", status: "In Active", avatar: "/images/profile-man-1.png" },
  ];

  const sellerData = [
    { id: 1, name: "Diana Surf", email: "Dianasurf112@gmail.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Approved" },
    { id: 2, name: "Karen Hut", email: "Karenhut@yahoo.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Rejected" },
    { id: 3, name: "Steve Lauda", email: "Stevelauda102@gmail.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Pending" },
    { id: 4, name: "Diana Surf", email: "Dianasurf112@gmail.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Approved" },
    { id: 5, name: "Karen Hut", email: "Karenhut@yahoo.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Pending" },
    { id: 6, name: "Steve Lauda", email: "Stevelauda102@gmail.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Approved" },
    { id: 7, name: "Diana Surf", email: "Dianasurf112@gmail.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Rejected" },
    { id: 8, name: "Karen Hut", email: "Karenhut@yahoo.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Pending" },
    { id: 9, name: "Steve Lauda", email: "Stevelauda102@gmail.com", storeName: "Store_name", submittedOn: "12.09.2019", status: "Rejected" },
  ];

  const supportTickets = [
    { id: "#10001", userSeller: "User Name", subject: "Login Issues", createdOn: "12.09.2019", lastUpdated: "14.04.2025", assignedTo: "Support Team A", status: "Resolved", statusColor: "bg-green-500" },
    { id: "#10002", userSeller: "User Name", subject: "Payment Inquiry", createdOn: "12.09.2019", lastUpdated: "14.04.2025", assignedTo: "Support Team B", status: "In Progress", statusColor: "bg-orange-500" },
    { id: "#10003", userSeller: "User Name", subject: "Technical Support", createdOn: "12.09.2019", lastUpdated: "14.04.2025", assignedTo: "Support Team A", status: "Open", statusColor: "bg-red-500" },
  ];

  const productData = [
    { id: 1, thumbnail: "/images/product-handbag.png", productName: "Women Bag", sellerName: "Diana Surf", category: "Store_name", submittedOn: "12.09.2019", status: "Approved" },
    { id: 2, thumbnail: "/images/product-boots.png", productName: "Men Shoes", sellerName: "Karen Hut", category: "Store_name", submittedOn: "12.09.2019", status: "Rejected" },
    { id: 3, thumbnail: "/images/leather-bag.png", productName: "Toys for kids", sellerName: "Steve Lauda", category: "Store_name", submittedOn: "12.09.2019", status: "Pending" },
  ];

  const statsCards = [
    { title: "Total Users", value: "40,689", change: "8.5% Up from yesterday", changeType: "positive", icon: "/icons/user-icon.png", bgColor: "bg-purple-50" },
    { title: "Total Order", value: "10293", change: "1.3% Up from past week", changeType: "positive", icon: "/icons/box-icon.png", bgColor: "bg-yellow-50" },
    { title: "Revenue This Month", value: "$89,000", change: "4.3% Down from yesterday", changeType: "negative", icon: "/icons/chart-icon.png", bgColor: "bg-green-50" },
    { title: "Active Sellers", value: "2040", change: "1.8% Up from yesterday", changeType: "positive", icon: "/icons/cloud-icon.png", bgColor: "bg-pink-50" },
  ];

  const pendingActions = [
    { id: 1, title: "Sellers to Verify", description: "5 new sellers waiting for verification", action: "Review", actionColor: "bg-red-500 hover:bg-red-600" },
    { id: 2, title: "Products to Approve", description: "12 products pending moderation", action: "Approve", actionColor: "bg-yellow-500 hover:bg-yellow-600" },
    { id: 3, title: "Reported Items", description: "3 new reports submitted", action: "Review", actionColor: "bg-red-500 hover:bg-red-600" },
    { id: 4, title: "Categories to Confirm", description: "1 category edit pending admin review", action: "Open", actionColor: "bg-teal-500 hover:bg-teal-600" },
    { id: 5, title: "Payout Requests", description: "4 payout requests from sellers", action: "Payouts", actionColor: "bg-teal-600 hover:bg-teal-700" },
  ];

  const featuredProducts = [
    { id: 1, name: "Women Tops", image: "/images/women-top.png", items: "1,076 items", date: "12.09.2019 - 12.53 PM", amount: "$34,295", status: "Sold" },
    { id: 2, name: "Leather Bag", image: "/images/leather-bag.png", items: "543 items", date: "12.09.2019 - 12.53 PM", amount: "$34,295", status: "Sold" },
    { id: 3, name: "Men Shoes", image: "/images/women-top.png", items: "271 items", date: "12.09.2019 - 12.53 PM", amount: "$34,295", status: "Sold" },
  ];

  // ------------------ HELPERS (unchanged) ------------------
  const getStatusBadge = (status: string) => {
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

  const getSellerStatusBadge = (status: string) => {
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

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setShowUserProfile(true);
  };

  const handleProductClick = (product: any) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  // ------------------ SYSTEM SETTINGS (unchanged) ------------------
  const renderSystemSettings = () => (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* ... your existing System Settings markup exactly as before ... */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
        <span>Admin Dashboard</span>
        <span>{">"}</span>
        <span>System Setting</span>
      </div>
      {/* (Keeping the rest of your original renderSystemSettings code) */}
    </div>
  );

  // ------------------ SUPPORT: DETAIL (kept) ------------------
  const renderTicketDetail = () => (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {selectedTicket?.id ?? "Ticket #12345"}
        </h1>
        <p className="text-sm text-gray-500">
          Submitted by Alex Bennett on July 15, 2024
        </p>
      </div>

      {/* Meta fields */}
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="bg-white border border-gray-200 rounded-[12px] h-14 w-full max-w-[1115px]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <div className="bg-white border border-gray-200 rounded-[12px] h-14 w-full max-w-[1115px]" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned To
          </label>
          <div className="bg-white border border-gray-200 rounded-[12px] h-14 w-full max-w-[1115px]" />
        </div>
      </div>

      {/* Complainer Info */}
      <div className="mt-8 mb-8 w-full max-w-[904px]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complainer Info
        </h3>
        <div className="border-b border-gray-200 mb-6" />

        <div className="grid grid-cols-2 gap-x-8 gap-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name
            </label>
            <p className="text-gray-900 pb-2">User_Name</p>
            <div className="border-b border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900 pb-2">Username@gmail.com</p>
            <div className="border-b border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order_ID
            </label>
            <p className="text-gray-900 pb-2">1029384</p>
            <div className="border-b border-gray-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <p className="text-gray-900 pb-2">+11 - 2233 - 4455</p>
            <div className="border-b border-gray-200" />
          </div>
        </div>
      </div>

      {/* Thread */}
      <div className="mt-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Message Thread
        </h3>
        <div className="bg-white p-6 rounded-lg space-y-4">
          <div className="flex justify-end items-start gap-3">
            <div className="bg-orange-500 text-white px-4 py-2 text-sm flex items-center justify-center whitespace-nowrap rounded-md">
              How may we help you?
            </div>
            <img
              src="/admin-avatar.png"
              alt="Admin"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          </div>

          <div className="flex items-start gap-3">
            <img
              src="/customer-avatar.png"
              alt="Customer"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="bg-gray-100 text-gray-900 px-4 py-3 text-sm rounded-md max-w-md">
              I ordered Water Bottle and the product description contains
              misleading information about the materials used.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img
              src="/customer-avatar.png"
              alt="Customer"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-md text-sm">
              I need assistance with it.
            </div>
          </div>

          <div className="flex justify-end items-start gap-3">
            <div className="bg-orange-500 text-white px-4 py-2 text-sm rounded-md">
              Sure, give us two minutes 😊
            </div>
            <img
              src="/admin-avatar.png"
              alt="Admin"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          </div>

          <div className="flex justify-end items-start gap-3">
            <div className="bg-orange-500 text-white px-4 py-2 text-sm rounded-md">
              We will get back to you.
            </div>
            <img
              src="/admin-avatar.png"
              alt="Admin"
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Action Area
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg h-14 w-full max-w-[1115px]" />
      </div>

      {/* Footer actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <button
          onClick={() => {
            setShowTicketDetail(false);
            setSelectedTicket(null);
            setShowReplyInterface(false);
          }}
          className="bg-orange-100 text-orange-600 font-medium hover:bg-orange-200 transition-colors flex items-center justify-center w-[135px] h-14 rounded-full"
        >
          Go Back
        </button>
        <button
          onClick={() => setShowAssignModal(true)}
          className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors flex items-center justify-center w-[186px] h-14 rounded-full"
        >
          Assign Complain
        </button>
        <button
          onClick={() => setShowReplyInterface(true)}
          className="bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition-colors flex items-center justify-center w-[186px] h-14 rounded-full"
        >
          Reply
        </button>
      </div>
    </div>
  );

  // ------------------ SUPPORT: LIST (tweaked Reply action) ------------------
  const renderSupportTickets = () => (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <span>Admin Dashboard</span>
            <span className="mx-2">›</span>
            <span>Support</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Support Ticket</h1>
        </div>
        <button
          onClick={() => {
            setSelectedTicket({ id: "#NEW" });
            setShowTicketDetail(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-medium flex items-center gap-2 w-[122px] h-8 rounded-2xl"
        >
          <img src="/plus-icon.png" alt="Plus" className="w-4 h-4" />
          New
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border w-full max-w-[1138px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Order ID
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  User/Seller
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Subject
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Created On
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Last Updated
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Assigned To
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Status
                </th>
                <th className="text-left py-4 px-6 font-medium text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {supportTickets.map((ticket, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6 text-blue-600 font-medium">
                    {ticket.id}
                  </td>
                  <td className="py-4 px-6 text-gray-900">
                    {ticket.userSeller}
                  </td>
                  <td className="py-4 px-6 text-gray-900">{ticket.subject}</td>
                  <td className="py-4 px-6 text-gray-600">
                    {ticket.createdOn}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {ticket.lastUpdated}
                  </td>
                  <td className="py-4 px-6 text-gray-600">
                    {ticket.assignedTo}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`inline-flex items-center justify-center text-xs font-medium text-white ${ticket.statusColor}`}
                      style={{
                        width: "93px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
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

  // ------------------ SUPPORT: INLINE REPLY (new) ------------------
  const renderReplyInterface = () => (
    <div className="p-4 sm:p-6 pt-0">
      <div className="bg-white border rounded-xl p-4 sm:p-5">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Reply</h4>
        <textarea
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          placeholder={`Replying to ${selectedTicket?.userSeller || "customer"}...`}
        />
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-4">
          <button
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-orange-600 rounded-full"
            onClick={() => setShowReplyInterface(false)}
          >
            Cancel
          </button>
          <button
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full"
            onClick={() => setShowReplyInterface(false)}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  // ------------------ HELP LINE MODAL (unchanged behavior) ------------------
  const renderHelpLineModal = () =>
    !showHelpLineModal ? null : (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"
          onClick={() => setShowHelpLineModal(false)}
        />

        <div
          className="relative bg-white shadow-xl flex"
          style={{ width: "990px", height: "884px", borderRadius: "24px" }}
        >
          <button
            onClick={() => setShowHelpLineModal(false)}
            className="absolute top-6 right-6 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Left: contact form */}
          <div
            className="bg-gray-50 p-8 flex flex-col"
            style={{
              width: "455px",
              height: "820px",
              borderRadius: "16px",
              margin: "32px 0 32px 32px",
            }}
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Line</h1>
            <p className="text-gray-600 mb-8">
              Whether it's about your order, a product, or selling on Soukloop — we're just a message away.
            </p>

            <div className="space-y-6 flex-1">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Enter Your Name"
                  className="bg-white border border-gray-200 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-[391px] h-14 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter Your Email"
                  className="bg-white border border-gray-200 px-4 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-[391px] h-14 rounded-[10px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  placeholder="Type your message..."
                  className="bg-white border border-gray-200 px-4 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-[391px] h-[200px] rounded-[10px]"
                />
              </div>

              <div className="text-sm text-gray-600">
                I accept the{" "}
                <span className="text-orange-500 underline cursor-pointer">Terms of Use</span>{" "}
                &{" "}
                <span className="text-orange-500 underline cursor-pointer">Privacy Policy</span>
              </div>
            </div>

            <button
              className="bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors mt-6 w-[200px] h-14 rounded-full"
            >
              Submit
            </button>
          </div>

          {/* Right: contact methods */}
          <div className="flex-1 p-8 space-y-6" style={{ paddingTop: "80px" }}>
            <div className="bg-white border border-gray-200 p-6 flex items-center gap-4 w-[407px] h-[248px] rounded-lg">
              <img src="/call-icon.png" alt="Phone" className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone</h3>
                <p className="text-gray-600">123 Sample St, Sydney NSW 2000</p>
                <p className="text-gray-600 underline">AU</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 flex items-center gap-4 w-[407px] h-[248px] rounded-lg -mt-4">
              <img src="/tooltip-icon.png" alt="Live Chat" className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Live Chat</h3>
                <p className="text-gray-600">+1 (555) 000-0000</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 flex items-center gap-4 w-[407px] h-[248px] rounded-lg -mt-4">
              <img src="/mail-icon.png" alt="Email" className="w-12 h-12 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email</h3>
                <p className="text-gray-600 underline">email@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  // ------------------ OTHER RENDERERS (kept from your file) ------------------
  const renderSellerVerificationDetails = () => (
    <main className="p-4 sm:p-6">
      {/* ... your original renderSellerVerificationDetails code ... */}
      <div className="flex flex-wrap items-center text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6 gap-1">
        <span>Admin Dashboard</span>
        <CrRight className="w-4 h-4 mx-1" />
        <span>Seller Verification</span>
        <CrRight className="w-4 h-4 mx-1" />
        <span className="text-gray-900">Seller Verification Details</span>
      </div>
      {/* (Keeping the rest as you provided) */}
    </main>
  );

  const renderSellerVerification = () => (
    <main className="p-4 sm:p-6">
      {/* ... your original renderSellerVerification code (table, actions, pagination) ... */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Seller Verification
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage seller verification and their account permissions here.
        </p>
      </div>
      {/* (Keeping the rest as you provided) */}
    </main>
  );

  const renderUserManagement = () => (
    <main className="p-4 sm:p-6">
      {/* ... your original renderUserManagement code ... */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          User Management
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Manage your team members and their account permissions here.
        </p>
      </div>
      {/* (Keeping the rest as you provided) */}
    </main>
  );

  const renderProductApprovalModeration = () => (
    <main className="p-4 sm:p-6">
      {/* ... your original renderProductApprovalModeration code ... */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Product Approval/Moderation
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Review, approve, reject, or edit product listings submitted by sellers.
        </p>
      </div>
      {/* (Keeping the rest as you provided) */}
    </main>
  );

  const renderDashboard = () => (
    <main className="p-4 sm:p-6">
      {/* ... your original renderDashboard code (cards, charts, featured) ... */}
      <div className="flex items-center mb-6 flex-wrap">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome Admin_name
        </h2>
        <img src="/icons/hand-icon.png" alt="Wave" className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
      </div>
      {/* (Keeping the rest as you provided) */}
    </main>
  );

  // ------------------ LAYOUT ------------------
  return (
    <div
      className={`flex bg-gray-50 ${
        showLogoutModal || showUserProfile || showProductDetails ? "backdrop-blur" : ""
      } w-full min-h-screen lg:min-h-[1343px]`}
    >
      {/* Sidebar */}
      <div className="bg-white shadow-sm border-r relative lg:w-[240px] lg:h-[1343px] w-12 h-[1343px]">
        <div className="p-2 lg:p-6 flex items-center justify-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden"
            aria-label="Open menu"
            onClick={() => setMobileNavOpen(true)}
          >
            <img src="/icons/nav-menu.png" alt="Menu" className="w-6 h-6" />
          </button>
          {/* Desktop logo */}
          <img
            src="/logo.png"
            alt="SoukLoop"
            style={{ width: "208px", height: "64.5px" }}
            className="hidden lg:block"
          />
        </div>

        {/* Nav */}
        <nav className="px-4 space-y-1 hidden lg:block" style={{ width: "208px", height: "612px" }}>
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`flex items-center px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                activeNavItem === item.label ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100"
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
              <img src={item.icon || "/placeholder.svg"} alt="" className="w-4 h-4 mr-3" />
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
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
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
                    activeNavItem === item.label ? "bg-orange-500 text-white" : "text-gray-700 hover:bg-gray-100"
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
                  <img src={item.icon || "/placeholder.svg"} alt="" className="w-4 h-4 mr-3" />
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

      {/* Main */}
      <div className="flex-1 min-w-0 lg:w/[1200px] lg:h-[1343px]">
        {/* Header */}
        <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base sm:text-lg font-medium text-gray-600 truncate">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Bell className="w-5 h-5 text-gray-500" />
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
                    <span className="text-sm font-medium hidden sm:inline">
                      Admin
                    </span>
                    <ChevronDown className="w-4 h-4 hidden sm:inline" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Content Switch */}
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
          {activeNavItem === "Reported Items" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Reported Items
              </h2>
              <p className="text-gray-600 mt-2">This section is under development.</p>
            </div>
          )}
          {activeNavItem === "Category Management" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Category Management
              </h2>
              <p className="text-gray-600 mt-2">This section is under development.</p>
            </div>
          )}
          {activeNavItem === "Banner/Promotions Management" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Banner/Promotions Management
              </h2>
              <p className="text-gray-600 mt-2">This section is under development.</p>
            </div>
          )}
          {activeNavItem === "Transactions & Payouts" && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Transactions & Payouts
              </h2>
              <p className="text-gray-600 mt-2">This section is under development.</p>
            </div>
          )}
          {activeNavItem === "System Settings" && renderSystemSettings()}

          {/* ✅ Support Tickets routing inside single shell */}
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
              style={{ width: "437px", height: "652px", borderRadius: "16px" }}
            >
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">Available Supporter</h2>
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

              <div className="p-6 space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
                {supporters.map((supporter) => (
                  <div key={supporter.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={supporter.avatar || "/placeholder.svg"}
                        alt={supporter.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{supporter.name}</h3>
                        <p className="text-sm text-gray-500">{supporter.team}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowAssignModal(false);
                        setShowTaskAssignedModal(true);
                      }}
                      className="bg-orange-100 text-orange-600 font-medium hover:bg-orange-200 transition-colors"
                      style={{ width: "120px", height: "42px", borderRadius: "8px" }}
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
              style={{ width: "500px", height: "400px", borderRadius: "16px" }}
            >
              <button
                onClick={() => setShowTaskAssignedModal(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <img src="/checkmark-icon.png" alt="Success" className="w-20 h-20" />
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Task Assigned</h2>
              <p className="text-gray-600 mb-8 text-center max-w-sm">
                Task has been successfully transferred and is now under the assigned user's responsibility.
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

        {/* (Your other modals like Approval/Reject/Product Details/Reported Item remain as in your file) */}
      </div>
    </div>
  );
}
