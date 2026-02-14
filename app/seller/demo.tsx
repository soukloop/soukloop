"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  XAxis,
  YAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Package,
  Megaphone,
  List,
  ShoppingCart,
  BarChart3,
  Store,
  Wallet,
  Gift,
  MessageCircle,
  Bell,
  HelpCircle,
  User,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Check,
} from "lucide-react";

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [currentView, setCurrentView] = useState("dashboard");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("weekly");
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  // Backend data hooks
  const { data: productsData, isLoading: isLoadingProducts } = useProducts();
  const { addItem: addToCart } = useCart();

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("Active");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleCancel = () => {
    setTitle("");
    setStartDate("");
    setEndDate("");
    setShowStatusModal(false);
  };

  const handleConfirm = () => {
    console.log({ title, startDate, endDate });
    setShowStatusModal(false);
  };

  const [shapeByDateFilter, setShapeByDateFilter] = useState("All");
  const [completedDateFilter, setCompletedDateFilter] = useState("All");
  const [shippingFilter, setShippingFilter] = useState("All");
  const [completedStatusFilter, setCompletedStatusFilter] = useState("All");
  //for edit product model
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [price, setPrice] = useState("$0.00");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");

  //for create offer model
  const [showCreateOfferModal, setShowCreateOfferModal] = useState(false);
  const [discountType, setDiscountType] = useState("percentage");
  const [applyToAllProducts, setApplyToAllProducts] = useState(false);

  //for report user model
  const [showReportUserModal, setShowReportUserModal] = useState(false);
  const [reportForm, setReportForm] = useState({
    name: "",
    email: "",
    category: "",
    description: "",
  });
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  //for payment option model
  const [showPaymentOptionModal, setShowPaymentOptionModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("mastercard");
  const [isPrimary, setIsPrimary] = useState(true);
  const [formData, setFormData] = useState({
    nameOnCard: "",
    cardNumber: "",
    expireDate: "",
    cvc: "",
  });

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [countdown, setCountdown] = useState(59);

  // Handlers
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleConfirmPayment = () => {
    setShowVerificationModal(true);
  };

  const handleVerificationConfirm = () => {
    setShowVerificationModal(false);
    setShowSuccessModal(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    setShowPaymentOptionModal(false);
  };

  const paymentMethods = [
    { id: "mastercard", name: "Master Card", icon: "/icons/card.png" },
    { id: "applepay", name: "Apple Pay", icon: "/icons/visa.png" },
    { id: "wallet", name: "Wallet", icon: "/icons/wallet.png" },
    { id: "bank", name: "Bank Account", icon: "/icons/bank.png" },
  ];

  //for withdrawal pop-ups
  const [withdrawalModal, setWithdrawalModal] = useState<
    null | "confirm" | "success" | "failed"
  >(null);

  //for create new coupon model
  const [showCreateCouponModal, setShowCreateCouponModal] = useState(false);
  const [couponDiscountType, setCouponDiscountType] = useState("percentage");
  const [couponApplyToAllProducts, setCouponApplyToAllProducts] =
    useState(false);

  //for view insights model
  const [showInsightsModal, setShowInsightsModal] = useState(false);

  //for promotions dropdown menu
  const [showPromoMenu, setShowPromoMenu] = useState<number | null>(null);

  //for contact form model
  const [showContactFormModal, setShowContactFormModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    category: "",
    message: "",
    acceptTerms: false,
  });

  //for setup store model
  const [showSetupStoreModal, setShowSetupStoreModal] = useState(false);

  //for live chat model
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);

  //for orders page dropdown menu
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  //for shipping setting model
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showDeliveryService, setShowDeliveryService] = useState(false);
  const [activeTab, setActiveTab] = useState("USPS");
  const [selectedService, setSelectedService] = useState("ground-advantage");
  const [signatureConfirmation, setSignatureConfirmation] = useState(true);
  const [packageValue, setPackageValue] = useState("");
  const [saveAsPreset, setSaveAsPreset] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const chartData = [
    { name: "5k", value: 20 },
    { name: "10k", value: 25 },
    { name: "15k", value: 30 },
    { name: "20k", value: 45 },
    { name: "25k", value: 50 },
    { name: "30k", value: 35 },
    { name: "35k", value: 55 },
    { name: "40k", value: 100 },
    { name: "45k", value: 50 },
    { name: "50k", value: 55 },
    { name: "55k", value: 45 },
    { name: "60k", value: 40 },
  ];

  const sidebarItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Package, label: "Post New Product" },
    { icon: Megaphone, label: "Promotions" },
    { icon: List, label: "Manage Listings" },
    { icon: ShoppingCart, label: "Orders" },
    { icon: BarChart3, label: "Analytics & Stats" },
    { icon: Store, label: "Manage My Shop" },
    { icon: Wallet, label: "Withdraw Earnings" },
    { icon: Gift, label: "Coupons & Offers" },
    { icon: MessageCircle, label: "Customer Chats" },
    { icon: Bell, label: "Notifications" },
    { icon: HelpCircle, label: "Help Line" },
  ];

  const metrics = [
    {
      title: "Total Visitor",
      value: "40,689",
      change: "8.5% Up from yesterday",
      changeType: "up",
      icon: "/images/user-icon.png",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Order",
      value: "10293",
      change: "1.3% Up from past week",
      changeType: "up",
      icon: "/images/crown-icon.png",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Total Sales",
      value: "$89,000",
      change: "4.3% Down from yesterday",
      changeType: "down",
      icon: "/images/chart-icon.png",
      bgColor: "bg-green-50",
    },
    {
      title: "Total Pending",
      value: "2040",
      change: "1.8% Up from yesterday",
      changeType: "up",
      icon: "/images/clock-icon.png",
      bgColor: "bg-orange-50",
    },
  ];

  const orders = [
    {
      id: 1,
      product: "Leather Bag",
      location: "6096 Marjolaine Landing",
      date: "12.09.2019 - 12.53 PM",
      amount: "$34,295",
      status: "Pending",
      image: "/images/product-placeholder.png",
    },
    {
      id: 2,
      product: "Leather Bag",
      location: "6096 Marjolaine Landing",
      date: "12.09.2019 - 12.53 PM",
      amount: "$34,295",
      status: "Returned",
      image: "/images/product-placeholder.png",
    },
  ];

  const photoSlots = [
    { label: "Add a photo", key: "main" },
    { label: "Cover photo", key: "cover" },
    { label: "Front photo", key: "front" },
    { label: "Back photo", key: "back" },
    { label: "Side photo", key: "side" },
    { label: "Label photo", key: "label" },
    { label: "Detail photo", key: "detail" },
    { label: "Flaw photo", key: "flaw" },
  ];

  //post new product
  const PostNewProduct = () => (
    <main className="flex-1" style={{ width: "1200px", height: "1643px" }}>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Seller Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <img
            src="/images/notification-bell.png"
            alt="Notifications"
            className="size-5"
          />
          <img
            src="/images/profile-avatar-header.png"
            alt="Profile"
            className="size-8 rounded-full"
          />
        </div>
      </header>
      <div className="h-full p-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Add a new product
        </h1>
        <p className="mb-8 text-gray-600">
          Share clear info about your product to help it sell faster.
        </p>

        <div className="mb-8">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Upload Photos
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            Add JPEG or PNG format photos
          </p>

          <div className="mb-8 grid grid-cols-4 gap-6">
            {photoSlots.map((slot, index) => (
              <div
                key={index}
                className="flex h-[160px] w-[267px] cursor-pointer flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300"
              >
                <img
                  src="/images/photo-upload-icon.png"
                  alt="Upload"
                  className="mb-2 size-8"
                />
                <span className="text-center text-sm text-gray-600">
                  {slot.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Price
          </label>
          <Input
            placeholder="$0.00"
            className="h-[56px] w-[1104px] rounded-xl"
          />
        </div>

        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Description
          </label>
          <Textarea
            placeholder="Enter product description..."
            className="h-[176px] w-[1104px] resize-none rounded-xl"
          />
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Category
          </label>
          <Select>
            <SelectTrigger className="h-[56px] w-[1104px] rounded-xl">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Condition
          </label>
          <Select>
            <SelectTrigger className="h-[56px] w-[1104px] rounded-xl">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-12">
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Size
          </label>
          <Select>
            <SelectTrigger className="h-[56px] w-[1104px] rounded-xl">
              <SelectValue placeholder="Select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="xs">XS</SelectItem>
              <SelectItem value="s">S</SelectItem>
              <SelectItem value="m">M</SelectItem>
              <SelectItem value="l">L</SelectItem>
              <SelectItem value="xl">XL</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-12">
          <h2 className="mb-8 text-center text-lg font-semibold text-gray-900">
            Upload Video of the Product
          </h2>
          <div className="mb-6 flex h-[232px] w-[1104px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-center">
            <p className="mb-6 text-orange-500">
              Drag and drop or click to upload
            </p>
            <Button className="h-[40px] w-[84px] rounded-[20px] bg-orange-500 text-white hover:bg-orange-600">
              Upload
            </Button>
          </div>

          <div className="max-w-2xl space-y-2 text-sm font-semibold text-gray-600">
            <p>
              • Upload a packing video to earn{" "}
              <span className="font-medium text-orange-500">50 points</span> and
              build customer trust
            </p>
            <p>
              • For more information, please review our{" "}
              <span className="cursor-pointer text-orange-500 hover:underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="cursor-pointer text-orange-500 hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-8">
          <Button className="h-[56px] w-[192px] rounded-[50px] bg-orange-500 text-base font-medium text-white hover:bg-orange-600">
            Add Product
          </Button>
        </div>
      </div>
    </main>
  );

  //withdraw earning
  const WithdrawEarnings = () => {
    return (
      <div className="flex-1" style={{ backgroundColor: "#f9f9f9" }}>
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>
        <div className="p-8">
          <h1 className="mb-8 text-3xl font-extrabold text-gray-900">
            Withdraw Earnings
          </h1>

          <div className="mb-8">
            <h2 className="mb-2 text-lg font-medium text-gray-900">
              Current Balance
            </h2>
            <div className="text-4xl font-bold text-gray-900">$1,234.56</div>
          </div>

          <div
            className="mb-8 rounded-lg py-6 pr-6"
            style={{ backgroundColor: "#f9f9f9" }}
          >
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Withdrawal Amount
            </h2>
            <input
              type="text"
              placeholder="$0.00"
              className="rounded-lg border border-gray-300 bg-white px-4 text-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ width: "448px", height: "56px" }}
            />
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Linked Payment Method
            </h2>
            <div className="mb-4 flex items-center gap-4">
              <img src="/images/bank-icon.png" alt="Bank" className="size-8" />
              <div>
                <div className="font-medium text-gray-900">
                  Account ending in 1234
                </div>
                <div className="text-sm text-gray-600">Bank of America</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                Add Payment Method
              </button>
              <button
                onClick={() => setShowPaymentOptionModal(true)}
                className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="mb-4 text-lg font-medium text-gray-900">
              Transaction Summary
            </h2>
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <div className="grid grid-cols-3 gap-4 border-b border-gray-200 bg-gray-50 px-6 py-4">
                <div className="font-medium text-gray-900">Date</div>
                <div className="font-medium text-gray-900">Amount</div>
                <div className="font-medium text-gray-900">Status</div>
              </div>
              <div className="divide-y divide-gray-200">
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <div className="text-gray-600">07/20/2025</div>
                  <div className="text-gray-900">$500.00</div>
                  <div>
                    <span
                      className="flex items-center justify-center text-sm font-medium text-white"
                      style={{
                        width: "191px",
                        height: "27px",
                        backgroundColor: "#00b69b",
                        borderRadius: "13.5px",
                      }}
                    >
                      Completed
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <div className="text-gray-600">06/15/2025</div>
                  <div className="text-gray-900">$300.00</div>
                  <div>
                    <span
                      className="flex items-center justify-center text-sm font-medium text-white"
                      style={{
                        width: "191px",
                        height: "27px",
                        backgroundColor: "#00b69b",
                        borderRadius: "13.5px",
                      }}
                    >
                      Completed
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 px-6 py-4">
                  <div className="text-gray-600">05/10/2025</div>
                  <div className="text-gray-900">$200.00</div>
                  <div>
                    <span
                      className="flex items-center justify-center text-sm font-medium text-white"
                      style={{
                        width: "191px",
                        height: "27px",
                        backgroundColor: "#00b69b",
                        borderRadius: "13.5px",
                      }}
                    >
                      Completed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-8 text-sm text-black">
            Withdrawals typically process within 1-3 business days. There is a
            minimum withdrawal amount of $10.00.
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setWithdrawalModal("confirm")}
              className="flex items-center justify-center bg-orange-500 font-medium text-white hover:bg-orange-600"
              style={{ width: "144px", height: "56px", borderRadius: "20px" }}
            >
              Withdraw
            </button>
          </div>
        </div>
      </div>
    );
  };

  //coupons & offers
  const CouponsOffers = () => {
    return (
      <main
        className="flex-1 p-8"
        style={{ backgroundColor: "#f9f9f9", height: "calc(1343px - 73px)" }}
      >
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Discount Coupons & Offers
          </h1>
          <button
            type="button"
            onClick={() => setShowCreateCouponModal(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-2 font-medium text-white transition-colors hover:bg-orange-600"
          >
            {/* <img src="/icons/plus-icon.png" alt="Add" className="w-4 h-4" /> */}
            Create New Coupon
          </button>
        </div>

        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Overview</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                Active Offers
              </h3>
              <p className="text-3xl font-bold text-gray-900">12</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                Upcoming Offers
              </h3>
              <p className="text-3xl font-bold text-gray-900">3</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-2 text-sm font-medium text-gray-600">
                Expired Offers
              </h3>
              <p className="text-3xl font-bold text-gray-900">25</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Coupons</h2>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search coupons by name"
                style={{ width: "1106px", height: "48px" }}
                className="rounded-lg border border-gray-300 bg-white pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Coupon Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Discount Type & Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Validity Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Usage Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Summer Sale
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Percentage off - 20%
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Jul 1 - Jul 31, 2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className="inline-flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor: "#00b69b",
                        width: "120px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Active
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    150
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div
                      className="flex items-center justify-center gap-[30px] rounded-lg"
                      style={{
                        width: "96px",
                        height: "32px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <button className="hover:opacity-70">
                        <img
                          src="/images/edit-coupon-icon.png"
                          alt="Edit"
                          className="size-4"
                        />
                      </button>
                      <button className="hover:opacity-70">
                        <img
                          src="/images/delete-coupon-icon.png"
                          alt="Delete"
                          className="size-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Back to School
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Fixed amount - $10
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Aug 15 - Sep 15, 2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className="inline-flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor: "#ffa500",
                        width: "120px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Upcoming
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    0
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div
                      className="flex items-center justify-center gap-[30px] rounded-lg"
                      style={{
                        width: "96px",
                        height: "32px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <button className="hover:opacity-70">
                        <img
                          src="/images/edit-coupon-icon.png"
                          alt="Edit"
                          className="size-4"
                        />
                      </button>
                      <button className="hover:opacity-70">
                        <img
                          src="/images/delete-coupon-icon.png"
                          alt="Delete"
                          className="size-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Holiday Special
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Free shipping
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Dec 1 - Dec 31, 2024
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className="inline-flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor: "#ff4444",
                        width: "120px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Expired
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    200
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div
                      className="flex items-center justify-center gap-[30px] rounded-lg"
                      style={{
                        width: "96px",
                        height: "32px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <button className="hover:opacity-70">
                        <img
                          src="/images/edit-coupon-icon.png"
                          alt="Edit"
                          className="size-4"
                        />
                      </button>
                      <button className="hover:opacity-70">
                        <img
                          src="/images/delete-coupon-icon.png"
                          alt="Delete"
                          className="size-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    New Customer Discount
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Percentage off - 15%
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Jan 1 - Dec 31, 2025
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className="inline-flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor: "#00b69b",
                        width: "120px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Active
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    50
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div
                      className="flex items-center justify-center gap-[30px] rounded-lg"
                      style={{
                        width: "96px",
                        height: "32px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <button className="hover:opacity-70">
                        <img
                          src="/images/edit-coupon-icon.png"
                          alt="Edit"
                          className="size-4"
                        />
                      </button>
                      <button className="hover:opacity-70">
                        <img
                          src="/images/delete-coupon-icon.png"
                          alt="Delete"
                          className="size-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Clearance Event
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Fixed amount - $5
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    Oct 1 - Oct 31, 2024
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className="inline-flex items-center justify-center text-xs font-medium text-white"
                      style={{
                        backgroundColor: "#ffa500",
                        width: "120px",
                        height: "27px",
                        borderRadius: "13.5px",
                      }}
                    >
                      Upcoming
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    75
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div
                      className="flex items-center justify-center gap-[30px] rounded-lg"
                      style={{
                        width: "96px",
                        height: "32px",
                        backgroundColor: "#f9f9f9",
                      }}
                    >
                      <button className="hover:opacity-70">
                        <img
                          src="/images/edit-coupon-icon.png"
                          alt="Edit"
                          className="size-4"
                        />
                      </button>
                      <button className="hover:opacity-70">
                        <img
                          src="/images/delete-coupon-icon.png"
                          alt="Delete"
                          className="size-4"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  };

  //customer chats
  const CustomerChats = () => {
    const [selectedChat, setSelectedChat] = useState("Buyer_Name_Here");

    const contacts = [
      {
        name: "Eusebio Laboy",
        role: "Nursing Assistant",
        avatar: "/images/user-avatar-chat.png",
        online: true,
      },
      {
        name: "Florencio Dorrance",
        role: "Market Development Manager",
        avatar: "/images/agent-avatar-chat.png",
        online: false,
      },
      {
        name: "Benny Spanbauer",
        role: "Area Sales Manager",
        avatar: "/images/user-avatar-chat.png",
        online: false,
      },
      {
        name: "Jamel Eusebio",
        role: "Administrator",
        avatar: "/images/agent-avatar-chat.png",
        online: false,
      },
      {
        name: "Lavern Laboy",
        role: "Account Executive",
        avatar: "/images/user-avatar-chat.png",
        online: false,
      },
      {
        name: "Alfonzo Schuessler",
        role: "Proposal Writer",
        avatar: "/images/agent-avatar-chat.png",
        online: false,
      },
      {
        name: "Daryl Nehls",
        role: "Nursing Assistant",
        avatar: "/images/user-avatar-chat.png",
        online: false,
      },
    ];

    return (
      <div
        className="flex bg-white"
        style={{ width: "1199px", height: "1026px" }}
      >
        <div
          className="flex flex-col border-r border-gray-200"
          style={{ width: "423px", height: "1026px" }}
        >
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Seller Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <img
                src="/images/notification-bell.png"
                alt="Notifications"
                className="size-5"
              />
              <img
                src="/images/profile-avatar-header.png"
                alt="Profile"
                className="size-8 rounded-full"
              />
            </div>
          </header>
          <div className="border-b border-gray-200 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              <button className="flex size-10 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600">
                +
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search name"
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact, index) => (
              <div
                key={index}
                onClick={() => setSelectedChat(contact.name)}
                className={`flex cursor-pointer items-center gap-3 p-4 hover:bg-gray-50 ${selectedChat === contact.name ? "bg-blue-50" : ""
                  }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatar || "/placeholder.svg"}
                    alt={contact.name}
                    className="size-12 rounded-full object-cover"
                  />
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-white bg-green-500"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-gray-900">
                    {contact.name}
                  </h3>
                  <p className="truncate text-sm text-gray-500">
                    {contact.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col"
          style={{ width: "776px", height: "1026px" }}
        >
          <div className="flex items-center justify-between border-b border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <img
                src="/images/user-avatar-chat.png"
                alt="Buyer"
                className="size-10 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">Buyer_Name_Here</h3>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-500">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowCreateOfferModal(true)}
                className="flex items-center justify-center gap-2 border border-orange-500 bg-white text-orange-500 hover:bg-orange-50"
                style={{
                  width: "143px",
                  height: "40px",
                  borderRadius: "50px",
                }}
              >
                <img
                  src="/images/settings-icon.png"
                  alt="Settings"
                  className="size-4"
                />
                Create Offer
              </button>

              <button
                onClick={() => setShowReportUserModal(true)}
                className="flex items-center justify-center gap-2 border border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200"
                style={{
                  width: "143px",
                  height: "40px",
                  borderRadius: "50px",
                }}
              >
                <img
                  src="/images/report-icon.png"
                  alt="Report"
                  className="size-4"
                />
                Report User
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            <div className="flex items-start justify-end gap-3">
              <div className="max-w-md rounded-2xl bg-orange-500 px-4 py-3 text-white">
                <p className="text-sm">How are you?</p>
              </div>
              <img
                src="/images/agent-avatar-chat.png"
                alt="Agent"
                className="size-10 shrink-0 rounded-full"
              />
            </div>

            <div className="flex items-start gap-3">
              <img
                src="/images/user-avatar-chat.png"
                alt="User"
                className="size-10 shrink-0 rounded-full"
              />
              <div className="max-w-md rounded-2xl bg-gray-100 px-4 py-3">
                <p className="text-sm text-gray-900">
                  just ideas for next time
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <img
                src="/images/user-avatar-chat.png"
                alt="User"
                className="size-10 shrink-0 rounded-full"
              />
              <div className="max-w-md rounded-2xl bg-gray-100 px-4 py-3">
                <p className="text-sm text-gray-900">
                  I'll be there in 2 mins ⏰
                </p>
              </div>
            </div>

            <div className="flex items-start justify-end gap-3">
              <div className="max-w-md rounded-2xl bg-orange-500 px-4 py-3 text-white">
                <p className="text-sm">woohoooo</p>
              </div>
              <img
                src="/images/agent-avatar-chat.png"
                alt="Agent"
                className="size-10 shrink-0 rounded-full"
              />
            </div>

            <div className="flex items-start justify-end gap-3">
              <div className="max-w-md rounded-2xl bg-orange-500 px-4 py-3 text-white">
                <p className="text-sm">Haha oh man</p>
              </div>
              <img
                src="/images/agent-avatar-chat.png"
                alt="Agent"
                className="size-10 shrink-0 rounded-full"
              />
            </div>

            <div className="flex items-start justify-end gap-3">
              <div className="max-w-md rounded-2xl bg-orange-500 px-4 py-3 text-white">
                <p className="text-sm">Haha that's terrifying 😱</p>
              </div>
              <img
                src="/images/agent-avatar-chat.png"
                alt="Agent"
                className="size-10 shrink-0 rounded-full"
              />
            </div>

            <div className="flex items-start gap-3">
              <img
                src="/images/user-avatar-chat.png"
                alt="User"
                className="size-10 shrink-0 rounded-full"
              />
              <div className="space-y-2">
                <div className="max-w-md rounded-2xl bg-gray-100 px-4 py-3">
                  <p className="text-sm text-gray-900">aww</p>
                </div>
                <div className="max-w-md rounded-2xl bg-gray-100 px-4 py-3">
                  <p className="text-sm text-gray-900">omg, this is amazing</p>
                </div>
                <div className="max-w-md rounded-2xl bg-gray-100 px-4 py-3">
                  <p className="text-sm text-gray-900">woohoooo 🔥</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <button className="shrink-0">
                <img
                  src="/images/paperclip-icon.png"
                  alt="Attach"
                  className="size-5"
                />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="shrink-0">
                <img
                  src="/images/send-icon.png"
                  alt="Send"
                  className="size-5"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  //promotions
  const Promotions = () => {
    // Use real product data from backend
    const products = productsData?.items || [];

    // Show loading state while products are being fetched
    if (isLoadingProducts) {
      return (
        <main
          className="flex-1 p-8"
          style={{ height: "calc(1343px - 73px)" }}
        >
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Seller Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <img
                src="/images/notification-bell.png"
                alt="Notifications"
                className="size-5"
              />
              <img
                src="/images/profile-avatar-header.png"
                alt="Profile"
                className="size-8 rounded-full"
              />
            </div>
          </header>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </div>
        </main>
      );
    }

    return (
      <main
        className="flex-1 p-8"
        style={{ height: "calc(1343px - 73px)" }}
      >
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
            >
              {/* Product Image */}
              <div className="relative p-4">
                <img
                  src="/placeholder.svg"
                  alt={product.title}
                  className="h-56 w-full rounded-lg object-cover"
                />

                {/* Top Right Icons */}
                <div className="absolute right-6 top-6 flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => setShowEditProductModal(true)}
                    className="flex items-center justify-center bg-white shadow-sm hover:opacity-75"
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "83.33px",
                    }}
                  >
                    <img
                      src="/images/edit-promo-icon.png"
                      alt="Edit"
                      className="size-4"
                    />
                  </button>

                  {/* Dot Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowPromoMenu(showPromoMenu === index ? null : index)
                      }
                      className="rounded-full p-2 hover:bg-gray-100"
                    >
                      <img
                        src="/icons/dot-menu.png"
                        alt="Menu"
                        className="size-5"
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {showPromoMenu === index && (
                      <div className="absolute right-0 z-50 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg">
                        <button
                          onClick={() => {
                            console.log("Mark as Sold clicked");
                            setShowPromoMenu(null);
                          }}
                          className="w-full rounded-t-lg px-4 py-2 text-left font-medium text-orange-600 hover:bg-gray-50"
                        >
                          Mark as Sold
                        </button>

                        <button
                          onClick={() => {
                            console.log("Delete Product clicked");
                            setShowPromoMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Delete Product
                        </button>

                        <button
                          onClick={() => {
                            console.log("Deactivate Product clicked");
                            setShowPromoMenu(null);
                          }}
                          className="w-full rounded-b-lg px-4 py-2 text-left font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Deactivate Product
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <p className="mb-2 text-sm text-gray-500">4 days ago</p>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-900">
                      ${(product.priceCents / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ${((product.priceCents * 1.5) / 100).toFixed(2)}
                    </span>
                  </div>
                  <img
                    src="/images/heart-icon.png"
                    alt="Favorite"
                    className="size-6"
                  />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {product.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {product.description || "No description available"}
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowInsightsModal(true)}
                    className="rounded-full bg-gray-100 px-4 py-2 text-orange-600"
                  >
                    View Insights
                  </button>

                  <button
                    onClick={() => addToCart(product.id, 1, {
                      id: product.id,
                      name: product.title,
                      price: product.priceCents / 100,
                      images: [{ url: product.image }],
                    })}
                    className="bg-orange-500 font-medium text-white hover:bg-orange-600"
                    style={{
                      width: "162px",
                      height: "48px",
                      borderRadius: "8px",
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  };

  //manage listing
  const ManageListings = () => (
    <main
      className="flex-1 p-8"
      style={{ height: "calc(1343px - 73px)" }}
    >
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Seller Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <img
            src="/images/notification-bell.png"
            alt="Notifications"
            className="size-5"
          />
          <img
            src="/images/profile-avatar-header.png"
            alt="Profile"
            className="size-8 rounded-full"
          />
        </div>
      </header>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Listings</h1>
      </div>

      {/* Table Container */}
      <div className="rounded-lg bg-white shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-6 border-b border-gray-200 px-6 py-4 text-sm font-medium text-gray-600">
          <div>Image</div>
          <div>Product Name</div>
          <div>Category</div>
          <div>Price</div>
          <div>Action</div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {[
            { price: "$690.00" },
            { price: "$190.00" },
            { price: "$640.00" },
            { price: "$400.00" },
            { price: "$420.00" },
            { price: "$190.00" },
            { price: "$640.00" },
          ].map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-5 items-center gap-6 px-6 py-4"
            >
              {/* Image */}
              <div>
                <img
                  src="/images/featured-product.png"
                  alt="Premium Leather Bag"
                  className="size-16 rounded-lg object-cover"
                />
              </div>

              {/* Product Name */}
              <div>
                <span className="text-sm font-medium text-gray-900">
                  Premium Leather Bag
                </span>
              </div>

              {/* Category */}
              <div>
                <span className="text-sm text-gray-600">Handbags</span>
              </div>

              {/* Price */}
              <div>
                <span className="text-sm font-medium text-gray-900">
                  {item.price}
                </span>
              </div>

              {/* Action */}
              <div
                className="flex items-center justify-center gap-2 rounded bg-gray-100"
                style={{ width: "96px", height: "32px" }}
              >
                <button
                  onClick={() => setShowEditProductModal(true)}
                  className="rounded p-1 hover:bg-gray-200"
                >
                  <img
                    src="/images/edit-icon.png"
                    alt="Edit"
                    className="size-4"
                  />
                </button>
                <button className="rounded p-1 hover:bg-gray-200">
                  <img
                    src="/images/delete-icon.png"
                    alt="Delete"
                    className="size-4"
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4">
          <p className="text-sm text-gray-600">Showing 1-09 of 78</p>
        </div>
      </div>
    </main>
  );

  //orders
  const Orders = () => (
    <div className="flex-1" style={{ height: "calc(1343px - 73px)" }}>
      <header className="flex items-center justify-between border-b bg-white px-8 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Seller Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <img
            src="/images/notification-bell.png"
            alt="Notifications"
            className="size-5"
          />
          <img
            src="/images/profile-avatar-header.png"
            alt="Profile"
            className="size-8 rounded-full"
          />
        </div>
      </header>
      <div className="px-8 py-6">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome Seller_name
        </h2>
      </div>

      <div className="flex" style={{ height: "calc(100% - 100px)" }}>
        {/* Left Sidebar Filters */}
        <div
          className="border-r border-gray-200 bg-white"
          style={{ width: "242px", height: "1226px" }}
        >
          <div className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Filters
            </h3>
            <p className="mb-6 text-sm text-gray-600">Showing 0 of 100</p>

            {/* Shape by date section - 242px x 307px */}
            <div
              className="mb-6 border-b border-gray-200 pb-6"
              style={{ width: "242px", height: "307px" }}
            >
              <h4 className="mb-4 text-sm font-medium text-gray-900">
                shape by date
              </h4>
              <div className="space-y-3">
                {[
                  { label: "All" },
                  { label: "Overdue" },
                  { label: "Today" },
                  { label: "Tomorrow" },
                  { label: "Within a week" },
                  { label: "No estimate" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border-2 ${shapeByDateFilter === option.label
                          ? "border-orange-500"
                          : "border-gray-300"
                        }`}
                      onClick={() => setShapeByDateFilter(option.label)}
                    >
                      {shapeByDateFilter === option.label && (
                        <div className="size-2 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                    <span
                      className="text-sm text-gray-700"
                      onClick={() => setShapeByDateFilter(option.label)}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Completed Date section - 242px x 247px */}
            <div
              className="mb-6 border-b border-gray-200 pb-6"
              style={{ width: "242px", height: "247px" }}
            >
              <h4 className="mb-4 text-sm font-medium text-gray-900">
                Completed Date
              </h4>
              <div className="space-y-3">
                {[
                  { label: "All" },
                  { label: "Last 3 days" },
                  { label: "Last 30 days" },
                  { label: "Last 60 days" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border-2 ${completedDateFilter === option.label
                          ? "border-orange-500"
                          : "border-gray-300"
                        }`}
                      onClick={() => setCompletedDateFilter(option.label)}
                    >
                      {completedDateFilter === option.label && (
                        <div className="size-2 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                    <span
                      className="text-sm text-gray-700"
                      onClick={() => setCompletedDateFilter(option.label)}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Shipping section - 242px x 207px */}
            <div
              className="mb-6 border-b border-gray-200 pb-6"
              style={{ width: "242px", height: "207px" }}
            >
              <h4 className="mb-4 text-sm font-medium text-gray-900">
                Shipping
              </h4>
              <div className="space-y-3">
                {[
                  { label: "All" },
                  { label: "Refunded" },
                  { label: "Purchased" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border-2 ${shippingFilter === option.label
                          ? "border-orange-500"
                          : "border-gray-300"
                        }`}
                      onClick={() => setShippingFilter(option.label)}
                    >
                      {shippingFilter === option.label && (
                        <div className="size-2 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                    <span
                      className="text-sm text-gray-700"
                      onClick={() => setShippingFilter(option.label)}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Completed Status section - 242px x 287px */}
            <div style={{ width: "242px", height: "287px" }}>
              <h4 className="mb-4 text-sm font-medium text-gray-900">
                Completed Status
              </h4>
              <div className="space-y-3">
                {[
                  { label: "All" },
                  { label: "Pre-transit" },
                  { label: "In transit" },
                  { label: "Delivered" },
                  { label: "cancelled" },
                ].map((option, index) => (
                  <label
                    key={index}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    <div
                      className={`flex size-4 items-center justify-center rounded-full border-2 ${completedStatusFilter === option.label
                          ? "border-orange-500"
                          : "border-gray-300"
                        }`}
                      onClick={() => setCompletedStatusFilter(option.label)}
                    >
                      {completedStatusFilter === option.label && (
                        <div className="size-2 rounded-full bg-orange-500"></div>
                      )}
                    </div>
                    <span
                      className="text-sm text-gray-700"
                      onClick={() => setCompletedStatusFilter(option.label)}
                    >
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8" style={{ width: "860px" }}>
          {/* Filter Tabs Header */}
          <div className="mb-8" style={{ width: "860px", height: "66px" }}>
            <div className="flex gap-6 border-b border-gray-200">
              <button className="border-b-2 border-orange-500 pb-3 text-sm font-medium text-orange-500">
                New Orders (2)
              </button>
              <button className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                In Progress (3)
              </button>
              <button className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                Delivered (15)
              </button>
              <button className="pb-3 text-sm font-medium text-gray-600 hover:text-gray-900">
                Returned (1)
              </button>
            </div>
          </div>

          {/* Orders List */}
          <div className="space-y-6">
            {/* Products before Today heading */}
            <div>
              {[1, 2].map((item) => (
                <div
                  key={`pre-${item}`}
                  className="border border-t-0 border-gray-200 bg-white first:rounded-t-lg first:border-t last:rounded-b-lg"
                  style={{ width: "860px", height: "148px" }}
                >
                  <div className="flex h-full items-start p-6">
                    {/* Product Info Section */}
                    <div
                      className="flex items-start gap-4"
                      style={{ width: "238px", height: "96px" }}
                    >
                      <img
                        src="/images/featured-product.png"
                        alt="Premium Leather Bag"
                        className="size-16 shrink-0 rounded-lg object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="mb-1 truncate font-semibold text-gray-900">
                          Premium Leather Bag
                        </h4>
                        <p className="mb-1 text-sm text-gray-600">
                          Quantity: 2
                        </p>
                        <p className="text-sm text-gray-600">
                          Size: Small kid clothing size
                        </p>
                      </div>
                    </div>

                    {/* Ship Today Section - positioned higher with more spacing */}
                    <div
                      className="ml-16 mt-2"
                      style={{ width: "135px", height: "72px" }}
                    >
                      <p className="mb-1 text-sm font-medium text-gray-900">
                        Ship today
                      </p>
                      <p className="mb-1 text-sm text-gray-600">
                        Ordered Jul 30,2025
                      </p>
                      <p className="text-sm text-gray-600">
                        Standard Shipping [$0.00]
                      </p>
                    </div>

                    {/* Ship To Section - positioned higher with more spacing */}
                    <div
                      className="ml-8 mt-2"
                      style={{ width: "141px", height: "72px" }}
                    >
                      <p className="mb-1 text-sm font-medium text-gray-900">
                        Ship to
                      </p>
                      <p className="mb-1 text-sm text-gray-600">buyer_name</p>
                      <p className="text-sm text-gray-600">
                        Buyer address e.g. California
                      </p>
                    </div>

                    {/* Icons Section */}
                    <div
                      className="ml-auto flex flex-col items-center justify-center gap-2"
                      ref={menuRef}
                      style={{ width: "44px", height: "100px" }}
                    >
                      {/* Shipping Button */}
                      <button
                        onClick={() => setShowShippingModal(true)}
                        className="rounded-full p-2 transition hover:bg-gray-100"
                      >
                        <img
                          src="/images/shipping-icon2.png"
                          alt="Shipping"
                          className="h-8 w-12"
                        />
                      </button>

                      {/* Message Button */}
                      <button className="rounded-full p-2 transition hover:bg-gray-100">
                        <img
                          src="/images/message-icon.png"
                          alt="Message"
                          className="size-6"
                        />
                      </button>

                      {/* More Options (3 Dots) Button */}
                      <button
                        onClick={() =>
                          setOpenMenu(openMenu === item ? null : item)
                        }
                        className="rounded-full p-2 transition hover:bg-gray-100"
                      >
                        <img
                          src="/images/three-dots-icon.png"
                          alt="More options"
                          className="size-6"
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenu === item && (
                        <div
                          className="absolute right-0 z-50 mt-2 border border-gray-200 shadow-lg"
                          style={{
                            width: "272px",
                            borderRadius: "8px",
                            padding: "16px",
                            backgroundColor: "#fff",
                          }}
                        >
                          {/* Menu Items */}
                          <button
                            onClick={() => console.log("Print clicked")}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                          >
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_3022313-rbEvWv45c8bvpYKPQuauBYp0gAdreP.png"
                              alt="Print"
                              className="size-5"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              Print
                            </span>
                          </button>

                          <button
                            onClick={() => console.log("Mark as gift clicked")}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                          >
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_66834-rwMVqbaCT65bjt6rYTd4lnTfhT0OlV.png"
                              alt="Gift"
                              className="size-5"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              Mark as Gift
                            </span>
                          </button>

                          <div className="my-2 border-t"></div>

                          <button
                            onClick={() => console.log("Cancel Order clicked")}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                          >
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_4655171-vwu3WJu6YjDZQRrRBfZj06v9wouHEk.png"
                              alt="Cancel"
                              className="size-5"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              Cancel Order
                            </span>
                          </button>

                          <button
                            onClick={() => console.log("Refund clicked")}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                          >
                            <img
                              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_3427751-7GAx02s6GBH6NQ6a0W8oT7Sp9grBJy.png"
                              alt="Refund"
                              className="size-5"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              Refund Money
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Today Section */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Today
              </h3>
              <div>
                {[1, 2].map((item) => (
                  <div
                    key={`today-${item}`}
                    className="border border-t-0 border-gray-200 bg-white first:rounded-t-lg first:border-t last:rounded-b-lg"
                    style={{ width: "860px", height: "148px" }}
                  >
                    <div className="flex h-full items-start p-6">
                      {/* Product Info Section */}
                      <div
                        className="flex items-start gap-4"
                        style={{ width: "238px", height: "96px" }}
                      >
                        <img
                          src="/images/featured-product.png"
                          alt="Premium Leather Bag"
                          className="size-16 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="mb-1 truncate font-semibold text-gray-900">
                            Premium Leather Bag
                          </h4>
                          <p className="mb-1 text-sm text-gray-600">
                            Quantity: 2
                          </p>
                          <p className="text-sm text-gray-600">
                            Size: Small kid clothing size
                          </p>
                        </div>
                      </div>

                      {/* Ship Today Section - positioned higher with more spacing */}
                      <div
                        className="ml-16 mt-2"
                        style={{ width: "135px", height: "72px" }}
                      >
                        <p className="mb-1 text-sm font-medium text-gray-900">
                          Ship today
                        </p>
                        <p className="mb-1 text-sm text-gray-600">
                          Ordered Jul 30,2025
                        </p>
                        <p className="text-sm text-gray-600">
                          Standard Shipping [$0.00]
                        </p>
                      </div>

                      {/* Ship To Section - positioned higher with more spacing */}
                      <div
                        className="ml-8 mt-2"
                        style={{ width: "141px", height: "72px" }}
                      >
                        <p className="mb-1 text-sm font-medium text-gray-900">
                          Ship to
                        </p>
                        <p className="mb-1 text-sm text-gray-600">buyer_name</p>
                        <p className="text-sm text-gray-600">
                          Buyer address e.g. California
                        </p>
                      </div>

                      {/* Icons Section */}
                      <div
                        className="ml-auto flex flex-col items-center justify-center gap-2"
                        style={{ width: "44px", height: "100px" }}
                      >
                        {/* Shipping Button */}
                        <button
                          onClick={() => setShowShippingModal(true)}
                          className="rounded-full p-2 transition hover:bg-gray-100"
                        >
                          <img
                            src="/images/shipping-icon2.png"
                            alt="Shipping"
                            className="h-8 w-12"
                          />
                        </button>

                        {/* Message Button */}
                        <button className="rounded-full p-2 transition hover:bg-gray-100">
                          <img
                            src="/images/message-icon.png"
                            alt="Message"
                            className="size-6"
                          />
                        </button>

                        {/* More Options (3 Dots) Button */}
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === item ? null : item)
                          }
                          className="rounded-full p-2 transition hover:bg-gray-100"
                        >
                          <img
                            src="/images/three-dots-icon.png"
                            alt="More options"
                            className="size-6"
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenu === item && (
                          <div
                            className="absolute right-0 z-50 mt-2 border border-gray-200 shadow-lg"
                            style={{
                              width: "272px",
                              borderRadius: "8px",
                              padding: "16px",
                              backgroundColor: "#fff",
                            }}
                          >
                            {/* Menu Items */}
                            <button
                              onClick={() => console.log("Print clicked")}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_3022313-rbEvWv45c8bvpYKPQuauBYp0gAdreP.png"
                                alt="Print"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Print
                              </span>
                            </button>

                            <button
                              onClick={() =>
                                console.log("Mark as gift clicked")
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_66834-rwMVqbaCT65bjt6rYTd4lnTfhT0OlV.png"
                                alt="Gift"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Mark as Gift
                              </span>
                            </button>

                            <div className="my-2 border-t"></div>

                            <button
                              onClick={() =>
                                console.log("Cancel Order clicked")
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_4655171-vwu3WJu6YjDZQRrRBfZj06v9wouHEk.png"
                                alt="Cancel"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Cancel Order
                              </span>
                            </button>

                            <button
                              onClick={() => console.log("Refund clicked")}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_3427751-7GAx02s6GBH6NQ6a0W8oT7Sp9grBJy.png"
                                alt="Refund"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Refund Money
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Week Section */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Last Week
              </h3>
              <div>
                {[1, 2].map((item) => (
                  <div
                    key={`week-${item}`}
                    className="border border-t-0 border-gray-200 bg-white first:rounded-t-lg first:border-t last:rounded-b-lg"
                    style={{ width: "860px", height: "148px" }}
                  >
                    <div className="flex h-full items-start p-6">
                      {/* Product Info Section */}
                      <div
                        className="flex items-start gap-4"
                        style={{ width: "238px", height: "96px" }}
                      >
                        <img
                          src="/images/featured-product.png"
                          alt="Premium Leather Bag"
                          className="size-16 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <h4 className="mb-1 truncate font-semibold text-gray-900">
                            Premium Leather Bag
                          </h4>
                          <p className="mb-1 text-sm text-gray-600">
                            Quantity: 2
                          </p>
                          <p className="text-sm text-gray-600">
                            Size: Small kid clothing size
                          </p>
                        </div>
                      </div>

                      {/* Ship Today Section - positioned higher with more spacing */}
                      <div
                        className="ml-16 mt-2"
                        style={{ width: "135px", height: "72px" }}
                      >
                        <p className="mb-1 text-sm font-medium text-gray-900">
                          Ship today
                        </p>
                        <p className="mb-1 text-sm text-gray-600">
                          Ordered Jul 30,2025
                        </p>
                        <p className="text-sm text-gray-600">
                          Standard Shipping [$0.00]
                        </p>
                      </div>

                      {/* Ship To Section - positioned higher with more spacing */}
                      <div
                        className="ml-8 mt-2"
                        style={{ width: "141px", height: "72px" }}
                      >
                        <p className="mb-1 text-sm font-medium text-gray-900">
                          Ship to
                        </p>
                        <p className="mb-1 text-sm text-gray-600">buyer_name</p>
                        <p className="text-sm text-gray-600">
                          Buyer address e.g. California
                        </p>
                      </div>

                      {/* Icons Section */}
                      <div
                        className="ml-auto flex flex-col items-center justify-center gap-2"
                        style={{ width: "44px", height: "100px" }}
                      >
                        {/* Shipping Button */}
                        <button
                          onClick={() => setShowShippingModal(true)}
                          className="rounded-full p-2 transition hover:bg-gray-100"
                        >
                          <img
                            src="/images/shipping-icon2.png"
                            alt="Shipping"
                            className="h-8 w-12"
                          />
                        </button>

                        {/* Message Button */}
                        <button className="rounded-full p-2 transition hover:bg-gray-100">
                          <img
                            src="/images/message-icon.png"
                            alt="Message"
                            className="size-6"
                          />
                        </button>

                        {/* More Options (3 Dots) Button */}
                        <button
                          onClick={() =>
                            setOpenMenu(openMenu === item ? null : item)
                          }
                          className="rounded-full p-2 transition hover:bg-gray-100"
                        >
                          <img
                            src="/images/three-dots-icon.png"
                            alt="More options"
                            className="size-6"
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenu === item && (
                          <div
                            className="absolute right-0 z-50 mt-2 border border-gray-200 shadow-lg"
                            style={{
                              width: "272px",
                              borderRadius: "8px",
                              padding: "16px",
                              backgroundColor: "#fff",
                            }}
                          >
                            {/* Menu Items */}
                            <button
                              onClick={() => console.log("Print clicked")}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_3022313-rbEvWv45c8bvpYKPQuauBYp0gAdreP.png"
                                alt="Print"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Print
                              </span>
                            </button>

                            <button
                              onClick={() =>
                                console.log("Mark as gift clicked")
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_66834-rwMVqbaCT65bjt6rYTd4lnTfhT0OlV.png"
                                alt="Gift"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Mark as Gift
                              </span>
                            </button>

                            <div className="my-2 border-t"></div>

                            <button
                              onClick={() =>
                                console.log("Cancel Order clicked")
                              }
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_4655171-vwu3WJu6YjDZQRrRBfZj06v9wouHEk.png"
                                alt="Cancel"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Cancel Order
                              </span>
                            </button>

                            <button
                              onClick={() => console.log("Refund clicked")}
                              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 hover:bg-gray-100"
                            >
                              <img
                                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/fi_3427751-7GAx02s6GBH6NQ6a0W8oT7Sp9grBJy.png"
                                alt="Refund"
                                className="size-5"
                              />
                              <span className="text-sm font-medium text-gray-900">
                                Refund Money
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-between pb-8">
            <Button variant="ghost" size="sm" className="text-gray-400">
              <ChevronLeft className="mr-1 size-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-orange-500 text-white hover:bg-orange-600"
              >
                1
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                2
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                3
              </Button>
              <span className="px-2 text-gray-400">...</span>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                67
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900"
              >
                68
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900"
            >
              Next
              <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  //analytics & stats
  const AnalyticsStats = () => {
    const revenueData = [
      { name: "5k", Sales: 25, Profit: 35 },
      { name: "10k", Sales: 30, Profit: 45 },
      { name: "15k", Sales: 28, Profit: 50 },
      { name: "20k", Sales: 35, Profit: 42 },
      { name: "25k", Sales: 55, Profit: 48 },
      { name: "30k", Sales: 45, Profit: 52 },
      { name: "35k", Sales: 40, Profit: 58 },
      { name: "40k", Sales: 85, Profit: 75 },
      { name: "45k", Sales: 50, Profit: 65 },
      { name: "50k", Sales: 65, Profit: 70 },
      { name: "55k", Sales: 60, Profit: 85 },
      { name: "60k", Sales: 55, Profit: 90 },
    ];

    return (
      <main
        className="flex-1 p-8"
        style={{ height: "calc(1343px - 73px)" }}
      >
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>
        <div className="mb-8">
          <h2 className="mb-8 text-3xl font-bold text-gray-900">
            Welcome Seller_name
          </h2>
        </div>

        <div className="mb-8">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">Revenue</h3>
            <Button
              variant="outline"
              className="border-gray-200 bg-white text-sm"
            >
              October <ChevronDown className="ml-1 size-4" />
            </Button>
          </div>

          <div
            className="rounded-lg bg-white shadow-sm"
            style={{ width: "1138px", height: "478px" }}
          >
            <div className="h-full p-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#9CA3AF" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Profit"
                    stroke="none"
                    fill="#bfdbfe"
                    fillOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="Sales"
                    stroke="none"
                    fill="#ea580c"
                    fillOpacity={0.9}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: "20px" }}
                    formatter={(value) => (
                      <span style={{ color: "#6B7280", fontSize: "14px" }}>
                        {value}
                      </span>
                    )}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Customers Section */}
          <div className="h-[365px] w-[360px] rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              Customers
            </h3>

            <div className="flex flex-col items-center">
              {/* Donut Chart */}
              <div className="relative mb-8 size-40">
                <svg viewBox="0 0 160 160" className="size-full">
                  {/* Background circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#fed7aa"
                    strokeWidth="20"
                  />
                  {/* Orange segment for repeated customers */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="20"
                    strokeDasharray="25 350"
                    strokeDashoffset="0"
                    transform="rotate(-90 80 80)"
                  />
                </svg>
              </div>

              {/* Statistics */}
              <div className="flex w-full items-center justify-between">
                <div className="text-center">
                  <div className="mb-1 text-2xl font-bold text-gray-900">
                    34,249
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="size-3 rounded-full bg-orange-200"></div>
                    <span>New Customers</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="mb-1 text-2xl font-bold text-gray-900">
                    1420
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="size-3 rounded-full bg-orange-600"></div>
                    <span>Repeated</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Product Section */}
          <div className="h-[365px] w-[360px] rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              Featured Product
            </h3>

            <div className="relative flex h-full items-center justify-center">
              {/* Left arrow */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute left-0 top-1/2 z-10 -translate-y-1/2 p-2 hover:bg-gray-100"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {/* Product content */}
              <div className="mb-[50px] flex flex-col items-center text-center">
                <div className="mb-4 h-[200px] w-[167px] overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src="/images/featured-product.png"
                    alt="Premium Leather Bag"
                    className="size-full object-cover"
                  />
                </div>
                <h4 className="mb-2 font-medium text-gray-900">
                  Premium Leather Bag
                </h4>
                <p className="text-lg font-semibold text-orange-500">$89.00</p>
              </div>

              {/* Right arrow */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 z-10 -translate-y-1/2 p-2 hover:bg-gray-100"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Sales Analytics Section */}
          <div className="h-[365px] w-[360px] rounded-lg bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-semibold text-gray-900">
              Sales Analytics
            </h3>

            <div className="relative h-64 w-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 flex h-full flex-col justify-between py-4 text-xs text-gray-400">
                <span>100</span>
                <span>75</span>
                <span>50</span>
                <span>25</span>
                <span>0</span>
              </div>

              {/* Chart area */}
              <div className="relative ml-8 h-full">
                <svg viewBox="0 0 280 200" className="size-full">
                  {/* Blue line */}
                  <path
                    d="M0,160 L56,120 L112,100 L168,140 L224,80 L280,20"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Teal line */}
                  <path
                    d="M0,180 L56,140 L112,120 L168,160 L224,100 L280,40"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  {/* Data points */}
                  <circle cx="280" cy="20" r="4" fill="#3b82f6" />
                  <circle cx="280" cy="40" r="4" fill="#14b8a6" />
                </svg>
              </div>

              {/* X-axis labels */}
              <div className="ml-8 mt-2 flex justify-between text-xs text-gray-400">
                <span>2015</span>
                <span>2016</span>
                <span>2017</span>
                <span>2018</span>
                <span>2019</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  };

  //manage my shop
  const ManageMyShop = () => {
    return (
      <div
        className="flex-1 p-8"
        style={{ height: "calc(1343px - 73px)" }}
      >
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            Manage My Shop
          </h1>
          <p className="text-gray-600">
            Update your shop details to attract more customers.
          </p>
        </div>

        {/* Banner Section */}
        <div className="relative mb-8 mt-0">
          <img
            src="/images/shop-banner.png"
            alt="Shop Banner"
            className="h-64 w-full rounded-lg object-cover"
          />
          <div className="absolute left-8 top-1/2 -translate-y-1/2">
            <div className="relative ml-[-32px] mr-0 mt-[170px]">
              <img
                src="/images/profile-avatar.png"
                alt="Profile"
                className="size-24 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Shop Details Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Shop Details
          </h2>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Shop Name
            </label>
            <input
              type="text"
              placeholder="Haneen Al Saifi"
              className="w-full border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ height: "56px", borderRadius: "12px" }}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Your one-stop online store for quality products, great deals, and fast delivery—shop smart, shop easy!"
              className="w-full resize-none border border-gray-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ height: "100px", borderRadius: "12px" }}
            />
          </div>
        </div>

        {/* Shop Location Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Shop Location
          </h2>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              placeholder="123 Commerce Ave, Suite 204, Austin, USA"
              className="w-full border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ height: "56px", borderRadius: "12px" }}
            />
          </div>

          <div className="flex justify-end">
            <button
              className="bg-gray-100 font-medium text-gray-700 hover:bg-gray-200"
              style={{ width: "203px", height: "48px", borderRadius: "50px" }}
            >
              Use My Location
            </button>
          </div>
        </div>

        {/* Social Media & Website Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Social Media & Website (Optional)
          </h2>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Website
            </label>
            <input
              type="text"
              placeholder="Paste your website link"
              className="w-full border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ height: "56px", borderRadius: "12px" }}
            />
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Social Media Link
            </label>
            <input
              type="text"
              placeholder="Paste your website link"
              className="w-full border border-gray-300 bg-white px-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ height: "56px", borderRadius: "12px" }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            className="bg-gray-100 font-medium text-gray-700 hover:bg-gray-200"
            style={{ width: "173px", height: "56px", borderRadius: "50px" }}
          >
            Cancel
          </button>
          <button
            className="bg-orange-500 font-medium text-white hover:bg-orange-600"
            style={{ width: "173px", height: "56px", borderRadius: "50px" }}
          >
            Save
          </button>
        </div>
      </div>
    );
  };

  //notifications
  const Notifications = () => {
    const [activeTab, setActiveTab] = useState("All");

    const tabs = [
      "All",
      "Orders",
      "Payments",
      "System",
      "Promotions",
      "Reviews",
    ];

    const notifications = [
      {
        id: 1,
        type: "Order Update",
        subtitle: "Order Shipped",
        message: "Your order #12345 has been shipped.",
        time: "2 hours ago",
        icon: "/images/order-icon.png",
      },
      {
        id: 2,
        type: "System Notification",
        subtitle: "System Update",
        message: "A new system update is available.",
        time: "1 day ago",
        icon: "/images/system-icon.png",
      },
      {
        id: 3,
        type: "Promotion Alert",
        subtitle: "Promotion Started",
        message: "Your promotion 'Summer Sale' is now live.",
        time: "2 days ago",
        icon: "/images/promotion-icon.png",
      },
      {
        id: 4,
        type: "Review Received",
        subtitle: "New Review",
        message: "A customer left a review for your product.",
        time: "3 days ago",
        icon: "/images/review-icon.png",
      },
      {
        id: 5,
        type: "Order Update",
        subtitle: "Order Cancelled",
        message: "Your order #98765 has been cancelled.",
        time: "4 hours ago",
        icon: "/images/order-icon.png",
      },
      {
        id: 6,
        type: "System Notification",
        subtitle: "System Maintenance",
        message: "A new system maintenance is scheduled.",
        time: "6 days ago",
        icon: "/images/system-icon.png",
      },
      {
        id: 7,
        type: "Promotion Alert",
        subtitle: "Promotion Ended",
        message: "Your promotion 'Winter Discount' has ended.",
        time: "7 days ago",
        icon: "/images/promotion-icon.png",
      },
      {
        id: 8,
        type: "Review Received",
        subtitle: "Negative Review",
        message: "A customer left a negative review for your product.",
        time: "8 days ago",
        icon: "/images/review-icon.png",
      },
    ];

    return (
      <div className="flex-1 p-8" style={{ backgroundColor: "#f9f9f9" }}>
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Notifications
          </h1>
          <p className="text-gray-600">
            Stay updated with the latest from your shop
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 rounded-lg bg-white p-6">
          <div className="flex gap-8 border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-1 pb-4 text-sm font-medium transition-colors ${activeTab === tab
                    ? "text-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-orange-500"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="rounded-lg bg-white">
          {notifications.map((notification, index) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-6 ${index !== notifications.length - 1
                  ? "border-b border-gray-100"
                  : ""
                }`}
            >
              <div className="shrink-0">
                <img
                  src={notification.icon || "/placeholder.svg"}
                  alt={notification.type}
                  className="size-12"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="mb-1 text-base font-semibold text-gray-900">
                      {notification.type}
                    </h3>
                    <p className="mb-1 text-sm font-medium text-gray-700">
                      {notification.subtitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {notification.message}
                    </p>
                  </div>
                  <span className="ml-4 whitespace-nowrap text-sm text-gray-500">
                    {notification.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  //help line
  const HelpLine = () => {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const quickAccessItems = [
      { icon: "/images/help-list-icon.png", title: "Product Listings" },
      { icon: "/images/help-cube-icon.png", title: "Orders & Shipping" },
      { icon: "/images/help-card-icon.png", title: "Payments & Withdrawals" },
      { icon: "/images/help-user-icon.png", title: "Account & Profile" },
      { icon: "/images/help-gift-icon.png", title: "Rewards & Promotions" },
      { icon: "/images/help-chart-icon.png", title: "Dashboard Tools" },
      {
        icon: "/images/help-document-icon.png",
        title: "Policies & Guidelines",
      },
    ];

    const faqs = [
      "How to list a product?",
      "What are the shipping options?",
      "How do I withdraw my earnings?",
      "How to update my profile?",
      "What are the current promotions?",
    ];

    const tickets = [
      {
        id: "#12345",
        subject: "Issue with product listing",
        status: "Open",
        lastUpdated: "2023-09-20",
        statusColor: "bg-gray-100 text-gray-700",
      },
      {
        id: "#67890",
        subject: "Payment withdrawal delay",
        status: "Resolved",
        lastUpdated: "2023-09-15",
        statusColor: "bg-green-100 text-green-700",
      },
      {
        id: "#11223",
        subject: "Account verification",
        status: "In Progress",
        lastUpdated: "2023-09-10",
        statusColor: "bg-yellow-100 text-yellow-700",
      },
    ];

    return (
      <main
        className="flex-1 p-8"
        style={{ height: "calc(1343px - 73px)" }}
      >
        <header className="flex items-center justify-between border-b bg-white px-8 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <img
              src="/images/notification-bell.png"
              alt="Notifications"
              className="size-5"
            />
            <img
              src="/images/profile-avatar-header.png"
              alt="Profile"
              className="size-8 rounded-full"
            />
          </div>
        </header>
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            How can we help you?
          </h1>
          <div className="relative" style={{ width: "1134px" }}>
            <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search help topics"
              className="border border-gray-300 bg-white pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              style={{ width: "1134px", height: "48px", borderRadius: "4px" }}
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900">Quick Access</h2>
          <div className="space-y-6">
            {/* First row - 5 items */}
            <div className="flex gap-6">
              {quickAccessItems.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex cursor-pointer flex-col items-center justify-center border border-gray-200 bg-white text-center transition-shadow hover:shadow-md"
                  style={{
                    width: "217.6px",
                    height: "110px",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={item.icon || "/placeholder.svg"}
                    alt={item.title}
                    className="mb-2 size-12"
                  />
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
            {/* Second row - 2 items, left aligned */}
            <div className="flex gap-6">
              {quickAccessItems.slice(5, 7).map((item, index) => (
                <div
                  key={index + 5}
                  className="flex cursor-pointer flex-col items-center justify-center border border-gray-200 bg-white text-center transition-shadow hover:shadow-md"
                  style={{
                    width: "217.6px",
                    height: "110px",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={item.icon || "/placeholder.svg"}
                    alt={item.title}
                    className="mb-2 size-12"
                  />
                  <h3 className="text-sm font-medium text-gray-900">
                    {item.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 bg-white"
                style={{ width: "1134px", borderRadius: "12px" }}
              >
                <button
                  onClick={() =>
                    setExpandedFAQ(expandedFAQ === index ? null : index)
                  }
                  className="flex w-full items-center justify-between px-6 text-left hover:bg-gray-50"
                  style={{ height: "53px", borderRadius: "12px" }}
                >
                  <span className="font-medium text-gray-900">{faq}</span>
                  <ChevronDown
                    className={`size-5 text-gray-400 transition-transform ${expandedFAQ === index ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-4 text-gray-600">
                    <p>
                      This is the answer to the frequently asked question. More
                      detailed information would be provided here.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Contact Support
          </h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowLiveChatModal(true)}
              className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
            >
              Live Chat
            </button>

            <button
              onClick={() => setShowContactFormModal(true)}
              className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
            >
              Contact Form
            </button>

            <button
              onClick={() => setShowSetupStoreModal(true)}
              className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
            >
              How to setup store
            </button>
          </div>
        </div>

        {/* Ticket Status */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Your Ticket Status
          </h2>
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Ticket ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Last Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {tickets.map((ticket, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {ticket.id}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {ticket.subject}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center text-xs font-semibold ${ticket.statusColor}`}
                        style={{
                          width: "157px",
                          height: "32px",
                          borderRadius: "16px",
                        }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {ticket.lastUpdated}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  };

  const handleNavigation = (label: string) => {
    const navigationMap: { [key: string]: string } = {
      Dashboard: "dashboard",
      "Post New Product": "postNewProduct",
      Promotions: "promotions",
      "Manage Listings": "manageListings",
      Orders: "orders",
      "Analytics & Stats": "analytics",
      "Manage My Shop": "manageMyShop",
      "Withdraw Earnings": "withdrawEarnings",
      "Coupons & Offers": "couponsOffers",
      "Customer Chats": "customerChats",
      Notifications: "notifications",
      "Help Line": "helpLine",
    };

    setCurrentView(navigationMap[label] as any);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="flex w-64 flex-col border-r bg-white">
        <div className="p-6">
          <img src="/images/logo.png" alt="SoukLoop" className="h-8" />
        </div>

        <nav className="flex-1 px-4">
          {sidebarItems.map((item, index) => (
            <div key={index} className="mb-1">
              <button
                onClick={() => handleNavigation(item.label)}
                className={`flex h-[52px] w-[208px] items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors ${(item.label === "Dashboard" && currentView === "dashboard") ||
                    (item.label === "Post New Product" &&
                      currentView === "postNewProduct") ||
                    (item.label === "Promotions" &&
                      currentView === "promotions") ||
                    (item.label === "Manage Listings" &&
                      currentView === "manageListings") ||
                    (item.label === "Orders" && currentView === "orders") ||
                    (item.label === "Analytics & Stats" &&
                      currentView === "analytics") ||
                    (item.label === "Manage My Shop" &&
                      currentView === "manageMyShop") ||
                    (item.label === "Withdraw Earnings" &&
                      currentView === "withdrawEarnings") ||
                    (item.label === "Coupons & Offers" &&
                      currentView === "couponsOffers") ||
                    (item.label === "Customer Chats" &&
                      currentView === "customerChats") ||
                    (item.label === "Notifications" &&
                      currentView === "notifications") ||
                    (item.label === "Help Line" && currentView === "helpLine")
                    ? "bg-orange-500 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                  }`}
              >
                <item.icon className="size-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </div>
          ))}
          <div className="mb-1">
            <button className="flex h-[52px] w-[208px] items-center gap-3 rounded-2xl bg-orange-50 px-4 py-3 text-orange-500 transition-colors hover:bg-orange-100">
              <User className="size-5" />
              <span className="text-sm font-medium">Log out</span>
            </button>
          </div>
        </nav>

        <div className="p-4 pt-8">
          <div className="relative rounded-2xl bg-orange-500 p-4 text-center text-white">
            <div className="absolute -top-6 left-1/2 flex size-12 -translate-x-1/2 items-center justify-center rounded-full bg-white">
              <img
                src="/images/crown-icon.png"
                alt="Crown"
                className="size-6"
              />
            </div>
            <div className="pt-6">
              <h3 className="mb-2 font-semibold">Maximize Your Productivity</h3>
              <p className="mb-6 text-sm leading-relaxed opacity-90">
                Boost Your Business with Unlimited Listings and Features
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="w-full rounded-lg bg-white py-2 text-sm font-medium text-black transition-colors hover:bg-gray-50"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*Dashboard */}
      {/* Main Content */}
      {currentView === "dashboard" && (
        <div className="flex-1" style={{ backgroundColor: "#f9f9f9" }}>
          <header className="flex items-center justify-between border-b bg-white px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              Seller Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <img
                src="/images/notification-bell.png"
                alt="Notifications"
                className="size-5"
              />
              <img
                src="/images/profile-avatar-header.png"
                alt="Profile"
                className="size-8 rounded-full"
              />
            </div>
          </header>

          <div className="p-8">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome Seller_name 👋
              </h1>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="rounded-lg bg-orange-500 px-4 py-2 font-medium text-white hover:bg-orange-600"
                >
                  {currentStatus} ✓
                </button>

                {/* Status Dropdown */}
                {showStatusDropdown && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
                    <button
                      onClick={() => {
                        setCurrentStatus("Active");
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${currentStatus === "Active"
                          ? "font-medium text-orange-500"
                          : "text-gray-700"
                        }`}
                    >
                      Active
                    </button>

                    {[
                      "Vacation Mode",
                      "Temporarily Disable",
                      "Deactivate Account",
                    ].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setCurrentStatus(status);
                          setShowStatusDropdown(false);
                          setShowStatusModal(true); // Show modal for these
                        }}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-50 ${currentStatus === status
                            ? "font-medium text-orange-500"
                            : "text-gray-700"
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8 grid grid-cols-4 gap-6">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white p-6"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div
                      className={`size-12 ${metric.bgColor} flex items-center justify-center rounded-lg`}
                    >
                      <img
                        src={metric.icon || "/placeholder.svg"}
                        alt={metric.title}
                        className="size-6"
                      />
                    </div>
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-gray-600">
                    {metric.title}
                  </h3>
                  <p className="mb-2 text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-sm ${metric.changeType === "up"
                          ? "text-green-600"
                          : "text-red-600"
                        }`}
                    >
                      {metric.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sales Details
                </h2>
                <select className="rounded-lg border border-gray-300 px-3 py-1 text-sm">
                  <option>October</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#f97316"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Orders Details
                </h2>
                <select className="rounded-lg border border-gray-300 px-3 py-1 text-sm">
                  <option>October</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Product Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Date - Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src="/images/leather-bag.png"
                              alt="Product"
                              className="mr-3 size-10 rounded-lg"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {order.product}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {order.location}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {order.date}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                          {order.amount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                              }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentView === "postNewProduct" && <PostNewProduct />}
      {currentView === "withdrawEarnings" && <WithdrawEarnings />}
      {currentView === "couponsOffers" && <CouponsOffers />}
      {currentView === "customerChats" && <CustomerChats />}
      {currentView === "promotions" && <Promotions />}
      {currentView === "manageListings" && <ManageListings />}
      {currentView === "orders" && <Orders />}
      {currentView === "analytics" && <AnalyticsStats />}
      {currentView === "manageMyShop" && <ManageMyShop />}
      {currentView === "notifications" && <Notifications />}
      {currentView === "helpLine" && <HelpLine />}

      {/* MODAL: Edit Product Details */}
      {showEditProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-lg md:p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowEditProductModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-2 text-3xl font-bold text-black">
                Edit product details
              </h1>
              <p className="text-gray-500">
                Share clear info about your product to help it sell faster.
              </p>
            </div>

            {/* Product Image with Edit Icon */}
            <div className="relative mb-8">
              <div className="overflow-hidden rounded-2xl">
                <img
                  src="/images/handbag-cover.png"
                  alt="White handbag with butterfly decoration"
                  className="h-80 w-full object-cover"
                />
              </div>
              {/* Edit Icon Overlay */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -translate-y-4 translate-x-2">
                <img
                  src="/images/edit-icon.png"
                  alt="Edit"
                  className="size-8"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Price and Size Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Price
                  </label>
                  <Input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="h-[56px] w-full rounded-[12px] border border-gray-200 bg-white px-4 text-gray-500 md:w-[380.5px]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Size
                  </label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="h-[56px] w-full rounded-[12px] border border-gray-200 bg-white px-4 text-gray-500 md:w-[380.5px] [&>svg]:hidden">
                      <SelectValue
                        placeholder="Select size"
                        className="text-gray-500"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-black">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-32 w-full resize-none rounded-lg border border-gray-200 bg-white p-4"
                  placeholder=""
                />
              </div>

              {/* Category and Condition Row */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-[56px] w-full rounded-[12px] border border-gray-200 bg-white px-4 md:w-[380.5px] [&>svg]:hidden">
                      <SelectValue
                        placeholder="Select category"
                        className="text-gray-500"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bags">Bags</SelectItem>
                      <SelectItem value="clothing">Clothing</SelectItem>
                      <SelectItem value="shoes">Shoes</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black">
                    Condition
                  </label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger className="h-[56px] w-full rounded-[12px] border border-gray-200 bg-white px-4 md:w-[380.5px] [&>svg]:hidden">
                      <SelectValue
                        placeholder="Select condition"
                        className="text-gray-500"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like-new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Upload Video Section */}
              <div className="mt-12">
                <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                  <h3 className="mb-2 text-lg font-semibold text-black">
                    Upload Video of the Product
                  </h3>
                  <p className="mb-6 text-gray-500">
                    Drag and drop or click to upload
                  </p>
                  <Button
                    variant="outline"
                    className="h-[52px] rounded-[50px] border-orange-500 bg-orange-500 px-8 text-white hover:bg-orange-600"
                  >
                    Upload
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-12 flex justify-end gap-4 pt-6">
                <Button
                  variant="outline"
                  className="h-[52px] rounded-[50px] border-gray-200 bg-transparent px-8 text-orange-500 hover:bg-gray-50"
                  onClick={() => setShowEditProductModal(false)}
                >
                  Cancel
                </Button>
                <Button className="h-[52px] rounded-[50px] bg-orange-500 px-8 text-white hover:bg-orange-600">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* upgrade model */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-md rounded-2xl bg-white p-8 text-center">
            <div className="mb-6 flex items-center justify-center">
              <img
                src="/images/crown-icon.png"
                alt="Crown"
                className="size-16"
              />
            </div>

            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Upgrade your plan to unlock editing
            </h2>

            <p className="mb-8 leading-relaxed text-gray-600">
              Upgrade to a higher plan to gain full access to edit and customize
              your profile, helping you showcase your products or services more
              effectively.
            </p>

            {/* Upgrade Now → close this and open the next modal */}
            <button
              onClick={() => {
                setShowUpgradeModal(false);
                setShowUpgradePlanModal(true);
              }}
              className="w-full rounded-full bg-orange-500 py-4 font-medium text-white transition-colors hover:bg-orange-600"
            >
              Upgrade Now
            </button>

            {/* Close button */}
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {showUpgradePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-8">
            {/* Close button */}
            <button
              onClick={() => setShowUpgradePlanModal(false)}
              className="absolute right-4 top-4 flex size-8 items-center justify-center text-gray-400 hover:text-gray-600"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-2 flex items-center justify-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Upgrade To</h1>
              <img
                src="/images/pro-badge.png"
                alt="PRO"
                className="h-8 w-20 object-contain"
              />
            </div>
            <p className="mb-8 text-center text-lg text-gray-700">
              Get Unlimited Access to all Features
            </p>

            {/* Plans (same as before) */}
            <div className="mb-6 space-y-3">
              {[
                {
                  id: "weekly",
                  title: "Feature 1 Ad Weekly",
                  description: "Reach up to 4 times more buyers",
                  price: "$4.99",
                },
                {
                  id: "14days",
                  title: "Feature 1 Ad 14 Days",
                  description: "Reach up to 6 times more buyers",
                  price: "$9.99",
                },
                {
                  id: "30days",
                  title: "Feature 1 Ad 30 Days",
                  description: "Reach up to 8 times more buyers",
                  price: "$29.99",
                },
              ].map((plan) => (
                <label
                  key={plan.id}
                  className={`block cursor-pointer rounded-2xl border-2 p-4 transition-colors ${selectedPlan === plan.id
                      ? "border-[#E55A3C] bg-[#FFF5F3]"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={selectedPlan === plan.id}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="size-5 border-2 border-gray-300 text-[#E55A3C] focus:ring-2 focus:ring-[#E55A3C]"
                      />
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {plan.title}
                        </h3>
                        <p className="text-gray-600">{plan.description}</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">
                      {plan.price}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <p className="mb-8 text-center text-gray-600">
              No Commitment. Cancel Anytime.
            </p>

            {/* Proceed to Payment */}
            <button
              onClick={() => {
                setShowUpgradePlanModal(false);
                setShowPaymentModal(true); // if you have payment modal next
              }}
              className="w-full rounded-[50px] bg-[#E55A3C] py-4 text-lg font-semibold text-white transition-colors hover:bg-[#D14B2F]"
              style={{ height: "56px" }}
            >
              Continue to Payment
            </button>
          </div>
        </div>
      )}

      {/* create offer model */}
      {showCreateOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-sm">
            <button
              onClick={() => setShowCreateOfferModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h1 className="mb-8 text-3xl font-bold text-black">
              Create a discount offer
            </h1>

            <div className="mb-6 space-y-6">
              {/* Discount Title */}
              <div className="space-y-2">
                <Label
                  htmlFor="discount-title"
                  className="text-base text-gray-700"
                >
                  Discount title
                </Label>
                <Input
                  id="discount-title"
                  placeholder="e.g. Summer Sale"
                  className="h-14 w-full rounded-xl border-gray-200 text-base text-gray-500"
                />
              </div>

              {/* Discount Type Toggle */}
              <div className="flex gap-4">
                <Button
                  variant={
                    discountType === "percentage" ? "default" : "outline"
                  }
                  onClick={() => setDiscountType("percentage")}
                  className="h-12 rounded-xl px-6 text-base"
                >
                  Percentage
                </Button>
                <Button
                  variant={discountType === "fixed" ? "default" : "outline"}
                  onClick={() => setDiscountType("fixed")}
                  className="h-12 rounded-xl px-6 text-base"
                >
                  Fixed amount
                </Button>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label
                  htmlFor="discount-value"
                  className="text-base text-gray-700"
                >
                  Discount value
                </Label>
                <Input
                  id="discount-value"
                  placeholder="e.g. 10"
                  className="h-14 w-full rounded-xl border-gray-200 text-base text-gray-500"
                />
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="start-date"
                    className="text-base text-gray-700"
                  >
                    Start date
                  </Label>
                  <Input
                    id="start-date"
                    placeholder="MM/DD/YYYY"
                    className="h-14 w-full rounded-xl border-gray-200 text-base text-gray-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-base text-gray-700">
                    End date
                  </Label>
                  <Input
                    id="end-date"
                    placeholder="MM/DD/YYYY"
                    className="h-14 w-full rounded-xl border-gray-200 text-base text-gray-500"
                  />
                </div>
              </div>

              {/* Eligible Products */}
              <div className="space-y-2">
                <Label className="text-base text-gray-700">
                  Eligible products
                </Label>
                <Select>
                  <SelectTrigger className="h-14 w-full rounded-xl border-gray-200 text-base text-gray-500">
                    <SelectValue placeholder="Select products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product1">Product 1</SelectItem>
                    <SelectItem value="product2">Product 2</SelectItem>
                    <SelectItem value="product3">Product 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <Label
                  htmlFor="usage-limit"
                  className="text-base text-gray-700"
                >
                  Usage limit (optional)
                </Label>
                <Input
                  id="usage-limit"
                  placeholder="e.g. 100"
                  className="h-14 w-full rounded-xl border-gray-200 text-base text-gray-500"
                />
              </div>

              {/* Apply to all products toggle */}
              <div className="flex items-center justify-between py-2">
                <Label className="text-base text-gray-700">
                  Apply to all products
                </Label>
                <Switch
                  checked={applyToAllProducts}
                  onCheckedChange={setApplyToAllProducts}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateOfferModal(false)}
                className="h-[48px] w-[125px] rounded-full border-gray-200 bg-transparent text-base text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button className="h-[48px] rounded-full bg-orange-500 text-base text-white hover:bg-orange-600">
                Send Offer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* report user model */}
      {showReportUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-8 shadow-sm">
            {/* Close */}
            <button
              onClick={() => setShowReportUserModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                Report Issue
              </h1>
              <p className="text-sm text-gray-600">
                Report any issue about an order, product, or seller and upload
                details for review.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowSuccessPopup(true);
              }}
              className="space-y-6"
            >
              {/* Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-900"
                >
                  Name
                </Label>
                <Input
                  id="name"
                  value={reportForm.name}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, name: e.target.value })
                  }
                  placeholder="Enter Your Name"
                  className="h-14 rounded-xl border-gray-200"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-900"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={reportForm.email}
                  onChange={(e) =>
                    setReportForm({ ...reportForm, email: e.target.value })
                  }
                  placeholder="Enter Your Email"
                  className="h-14 rounded-xl border-gray-200"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Issue Category
                </Label>
                <Select
                  value={reportForm.category}
                  onValueChange={(val) =>
                    setReportForm({ ...reportForm, category: val })
                  }
                >
                  <SelectTrigger className="h-14 w-full rounded-xl border-gray-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="product">Product Issue</SelectItem>
                    <SelectItem value="payment">Payment Issue</SelectItem>
                    <SelectItem value="user">User Issue</SelectItem>
                    <SelectItem value="delivery">Delivery Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Describe Your Issue
                </Label>
                <Textarea
                  value={reportForm.description}
                  onChange={(e) =>
                    setReportForm({
                      ...reportForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Type your message..."
                  className="min-h-[120px] resize-none rounded-xl border-gray-200"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Upload Image (Optional)
                </Label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setUploadedImages((prev) => [...prev, ...files]);
                  }}
                  className="block w-full text-sm text-gray-500"
                />
                {uploadedImages.length > 0 && (
                  <ul className="space-y-1 text-sm text-gray-600">
                    {uploadedImages.map((file, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between rounded bg-gray-50 p-2"
                      >
                        {file.name}
                        <button
                          type="button"
                          onClick={() =>
                            setUploadedImages((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowReportUserModal(false)}
                  className="h-12 flex-1 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-12 flex-1 rounded-full bg-orange-500 text-white hover:bg-orange-600"
                >
                  Submit
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-8 text-center">
            <button
              onClick={() => setShowSuccessPopup(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <div className="mb-6">
              <Check className="mx-auto size-12 text-orange-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              Report Submitted
            </h2>
            <p className="mb-6 text-gray-600">
              Your report has been submitted successfully. Our team will review
              it shortly.
            </p>
            <Button
              onClick={() => setShowSuccessPopup(false)}
              className="h-12 w-full rounded-full bg-orange-500 text-white hover:bg-orange-600"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* payment option model */}
      {showPaymentOptionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-gray-200 bg-white p-8">
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentOptionModal(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <div className="mb-0 w-[960px] rounded-2xl border-0 bg-white p-0 shadow-none">
              <h1 className="mb-8 text-2xl font-semibold text-gray-900">
                Payment Option
              </h1>

              <div className="mb-8 grid grid-cols-4 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`
                relative cursor-pointer rounded-xl border-2 p-6 transition-all
                ${selectedMethod === method.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300"
                      }
              `}
                  >
                    <div className="flex flex-col items-center space-y-3 text-center">
                      <div className="flex size-8 items-center justify-center">
                        <Image
                          src={method.icon || "/placeholder.svg"}
                          alt={method.name}
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {method.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 space-y-6">
                <div>
                  <Label
                    htmlFor="nameOnCard"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Name on Card
                  </Label>
                  <Input
                    id="nameOnCard"
                    value={formData.nameOnCard}
                    onChange={(e) =>
                      handleInputChange("nameOnCard", e.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="cardNumber"
                    className="mb-2 block text-sm font-medium text-gray-900"
                  >
                    Card Number
                  </Label>
                  <Input
                    id="cardNumber"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      handleInputChange("cardNumber", e.target.value)
                    }
                    className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="expireDate"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      Expire Date
                    </Label>
                    <Input
                      id="expireDate"
                      placeholder="DD/YY"
                      value={formData.expireDate}
                      onChange={(e) =>
                        handleInputChange("expireDate", e.target.value)
                      }
                      className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="cvc"
                      className="mb-2 block text-sm font-medium text-gray-900"
                    >
                      CVC
                    </Label>
                    <Input
                      id="cvc"
                      value={formData.cvc}
                      onChange={(e) => handleInputChange("cvc", e.target.value)}
                      className="h-12 w-full rounded-lg border border-gray-200 px-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4 flex items-center space-x-3">
                <Switch
                  id="primary-payment"
                  checked={isPrimary}
                  onCheckedChange={setIsPrimary}
                  className="data-[state=checked]:bg-orange-500"
                />
                <Label
                  htmlFor="primary-payment"
                  className="text-sm font-medium text-gray-900"
                >
                  Set as Primary Payment Method
                </Label>
              </div>

              <div className="mb-8">
                <p className="flex items-start text-sm text-gray-600">
                  <span className="mr-2 text-orange-500">•</span>
                  We will send you an order details to your email after the
                  successfull payment
                </p>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  variant="outline"
                  className="h-14 w-[297px] rounded-lg border-orange-200 bg-orange-50 text-orange-500 hover:border-orange-300 hover:bg-orange-100"
                  onClick={() => setShowPaymentOptionModal(false)}
                >
                  Discard
                </Button>
                <Button
                  className="h-14 w-[297px] rounded-lg bg-orange-500 text-white hover:bg-orange-600"
                  onClick={handleConfirmPayment}
                >
                  Confirm Payment Option
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex h-[320px] w-[600px] flex-col rounded-2xl bg-white p-8">
            <h2 className="mb-2 text-3xl font-bold text-black">
              Enter 6-Digit Code
            </h2>
            <p className="mb-6 text-gray-600">
              Enter the 6-digit code sent to info*****gmail.com
            </p>

            <div className="mb-4 flex justify-center gap-4">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  className="size-16 rounded-xl border-2 border-gray-200 text-center text-2xl font-semibold focus:border-orange-500 focus:outline-none"
                  maxLength={1}
                />
              ))}
            </div>

            <p className="mb-4 text-sm text-gray-500">
              Resend code in 00:{countdown.toString().padStart(2, "0")}
            </p>

            <Button
              className="mx-auto h-14 w-[536px] rounded-[100px] bg-orange-500 text-lg font-semibold text-white hover:bg-orange-600"
              onClick={handleVerificationConfirm}
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

      {/* {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="w-[500px] h-[402px] bg-white rounded-2xl p-8 relative flex flex-col items-center">
            <button
              onClick={handleCloseSuccess}
              className="absolute top-6 right-6 w-8 h-8 bg-black rounded-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
            >
              ×
            </button>

            <Image
              src="/icons/success-check.png"
              alt="Success"
              width={96}
              height={96}
              className="object-contain mb-8 mt-4"
            />

            <h2 className="text-4xl font-bold text-black mb-6 text-center">
              Product Uploaded
            </h2>

            <p className="text-gray-600 text-center text-lg leading-relaxed mb-12 px-4">
              Your product has been submitted for review and will be published
              automatically once verified
            </p>

            <div className="flex gap-4 w-full px-4 py-0 pt-0 mt-[-20px] mb-0 pb-0">
              <Button
                variant="outline"
                className="flex-1 h-14 rounded-[100px] text-orange-500 border-orange-200 bg-orange-50 hover:bg-orange-100 hover:border-orange-300 text-lg font-semibold"
              >
                View Products
              </Button>
              <Button className="flex-1 h-14 rounded-[100px] bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold">
                Add More
              </Button>
            </div>
          </div>
        </div>
      )} */}

      {/* withdrawal pop-ups model */}
      {withdrawalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative h-[420px] w-full max-w-lg rounded-3xl bg-white p-8">
            {/* Close button */}
            <button
              onClick={() => setWithdrawalModal(null)}
              className="absolute right-6 top-6 transition-opacity hover:opacity-80"
            >
              <img
                src={
                  withdrawalModal === "failed"
                    ? "/icons/close-icon.png"
                    : "/icons/close-icon-new.png"
                }
                alt="Close"
                className="size-8"
              />
            </button>

            <div className="mt-4 flex flex-col items-center text-center">
              {/* Icon */}
              <div className="mb-8">
                {withdrawalModal === "confirm" && (
                  <img
                    src="/icons/download-icon.png"
                    alt="Confirm"
                    className="size-20"
                  />
                )}
                {withdrawalModal === "success" && (
                  <img
                    src="/icons/checkmark-icon.png"
                    alt="Success"
                    className="size-20"
                  />
                )}
                {withdrawalModal === "failed" && (
                  <img
                    src="/icons/warning-icon.png"
                    alt="Failed"
                    className="size-20"
                  />
                )}
              </div>

              {/* Title */}
              <h2 className="mb-6 text-4xl font-bold text-black">
                {withdrawalModal === "confirm" && "Confirm Withdrawal"}
                {withdrawalModal === "success" && "Thank You"}
                {withdrawalModal === "failed" && "Withdrawal Failed!"}
              </h2>

              {/* Description */}
              {withdrawalModal === "confirm" && (
                <p className="mb-8 px-4 text-lg leading-relaxed text-gray-700">
                  You're withdrawing <b>$500.00</b> to your Bank of America
                  account ending in 1234. Processing takes 1–3 business days.
                  Proceed?
                </p>
              )}

              {withdrawalModal === "success" && (
                <p className="mb-12 px-4 text-lg leading-relaxed text-gray-700">
                  Payment successful! Please check your email for confirmation.
                  You're all set to enjoy the experience!
                </p>
              )}

              {withdrawalModal === "failed" && (
                <p className="mb-12 px-4 text-lg leading-relaxed text-gray-700">
                  Something went wrong. Please check your details and try again.
                </p>
              )}

              {/* Buttons */}
              {withdrawalModal === "confirm" && (
                <div className="flex w-full gap-4 px-4">
                  <button
                    onClick={() => setWithdrawalModal(null)}
                    className="rounded-full bg-gray-100 font-semibold text-orange-600 transition-colors hover:bg-gray-200"
                    style={{
                      width: "212px",
                      height: "56px",
                      fontSize: "18px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setWithdrawalModal("success")} // or "failed"
                    className="rounded-full bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700"
                    style={{
                      width: "212px",
                      height: "56px",
                      fontSize: "18px",
                    }}
                  >
                    Withdraw
                  </button>
                </div>
              )}

              {withdrawalModal === "success" && (
                <div className="flex w-full justify-center">
                  <button
                    onClick={() => setWithdrawalModal(null)}
                    className="bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700"
                    style={{
                      width: "436px",
                      height: "56px",
                      borderRadius: "50px",
                      fontSize: "18px",
                    }}
                  >
                    Done
                  </button>
                </div>
              )}

              {withdrawalModal === "failed" && (
                <div className="flex w-full justify-center">
                  <button
                    onClick={() => setWithdrawalModal("confirm")}
                    className="bg-orange-600 font-semibold text-white transition-colors hover:bg-orange-700"
                    style={{
                      width: "436px",
                      height: "56px",
                      borderRadius: "50px",
                      fontSize: "18px",
                    }}
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* create new coupon model */}
      {showCreateCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setShowCreateCouponModal(false)}
              className="absolute right-6 top-6 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            <h1 className="mb-2 text-3xl font-bold text-black">
              Create New Coupon
            </h1>

            <form className="space-y-1">
              {/* Discount Title */}
              <div className="space-y-1">
                <Label
                  htmlFor="discount-title"
                  className="text-base font-medium text-black"
                >
                  Discount title
                </Label>
                <Input
                  id="discount-title"
                  placeholder="e.g. Summer Sale"
                  className="h-12 border-gray-300 text-base placeholder:text-gray-400"
                />
              </div>

              {/* Discount Type Radio Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={`flex h-10 items-center gap-3 rounded-full border-2 px-4 py-1 transition-colors ${discountType === "percentage"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border-2 ${discountType === "percentage"
                        ? "border-orange-500"
                        : "border-gray-300"
                      }`}
                  >
                    {discountType === "percentage" && (
                      <div className="size-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <span className="text-base font-medium text-black">
                    Percentage
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={`flex h-10 items-center gap-3 rounded-full border-2 px-4 py-1 transition-colors ${discountType === "fixed"
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-300 bg-white"
                    }`}
                >
                  <div
                    className={`flex size-4 items-center justify-center rounded-full border-2 ${discountType === "fixed"
                        ? "border-orange-500"
                        : "border-gray-300"
                      }`}
                  >
                    {discountType === "fixed" && (
                      <div className="size-2 rounded-full bg-orange-500" />
                    )}
                  </div>
                  <span className="text-base font-medium text-black">
                    Fixed amount
                  </span>
                </button>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <Label
                  htmlFor="discount-value"
                  className="text-base font-medium text-black"
                >
                  Discount value
                </Label>
                <Input
                  id="discount-value"
                  placeholder="e.g. 10"
                  className="h-12 border-gray-300 text-base placeholder:text-gray-400"
                />
              </div>

              {/* Date Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="start-date"
                    className="text-base font-medium text-black"
                  >
                    Start date
                  </Label>
                  <Input
                    id="start-date"
                    placeholder="MM/DD/YYYY"
                    className="h-12 border-gray-300 text-base placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="end-date"
                    className="text-base font-medium text-black"
                  >
                    End date
                  </Label>
                  <Input
                    id="end-date"
                    placeholder="MM/DD/YYYY"
                    className="h-12 border-gray-300 text-base placeholder:text-gray-400"
                  />
                </div>
              </div>

              {/* Eligible Products */}
              <div className="space-y-2">
                <Label className="text-base font-medium text-black">
                  Eligible products
                </Label>
                <Select>
                  <SelectTrigger className="h-12 border-gray-300 text-base">
                    <SelectValue
                      placeholder="Select products"
                      className="text-gray-400"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="category1">Category 1</SelectItem>
                    <SelectItem value="category2">Category 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Usage Limit */}
              <div className="space-y-2">
                <Label
                  htmlFor="usage-limit"
                  className="text-base font-medium text-black"
                >
                  Usage limit (optional)
                </Label>
                <Input
                  id="usage-limit"
                  placeholder="e.g. 100"
                  className="h-12 border-gray-300 text-base placeholder:text-gray-400"
                />
              </div>

              {/* Apply to All Products Toggle */}
              <div className="flex items-center justify-between ">
                <Label
                  htmlFor="apply-all"
                  className="text-base font-medium text-black"
                >
                  Apply to all products
                </Label>
                <Switch
                  id="apply-all"
                  checked={applyToAllProducts}
                  onCheckedChange={setApplyToAllProducts}
                  className="data-[state=checked]:bg-orange-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateCouponModal(false)}
                  className="h-[46px] w-[112px] rounded-[50px] border-orange-200 bg-orange-50/50 text-base font-medium text-orange-600 hover:bg-orange-50"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-[46px] w-[112px] rounded-[50px] bg-orange-500 text-base font-medium text-white hover:bg-orange-600"
                >
                  Send Offer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Insights Modal */}
      {showInsightsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex h-[90vh] w-full max-w-5xl flex-col overflow-y-auto rounded-2xl bg-stone-50 p-6 font-sans shadow-lg sm:p-8">
            {/* Close button */}
            <button
              onClick={() => setShowInsightsModal(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Header */}
            <h1 className="mb-6 text-2xl font-bold text-gray-900 sm:mb-8 sm:text-3xl">
              Overview
            </h1>

            {/* Metrics Grid */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:mb-8 sm:grid-cols-4 sm:gap-6">
              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-2 text-sm text-gray-600">Views</div>
                <div className="text-xl font-bold text-gray-900 sm:text-3xl">
                  1,200
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-2 text-sm text-gray-600">Clicks</div>
                <div className="text-xl font-bold text-gray-900 sm:text-3xl">
                  174
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-2 text-sm text-gray-600">Add to Cart</div>
                <div className="text-xl font-bold text-gray-900 sm:text-3xl">
                  09
                </div>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-2 text-sm text-gray-600">Purchases</div>
                <div className="text-xl font-bold text-gray-900 sm:text-3xl">
                  01
                </div>
              </div>
            </div>

            {/* Chart Section */}
            <div className="mb-6 flex flex-1 flex-col rounded-xl bg-white p-4 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center justify-between sm:mb-6">
                <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                  View Over Time
                </h2>
                <div className="relative">
                  <select className="appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-orange-500 sm:px-4">
                    <option>January</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              {/* Chart Container */}
              <div className="min-h-[200px] w-full flex-1 sm:min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f4a58a"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#f4a58a"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      dy={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#9ca3af" }}
                      domain={[0, 100]}
                      ticks={[20, 40, 60, 80, 100]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#f4a58a"
                      strokeWidth={0}
                      fill="url(#colorGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-auto flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => setShowInsightsModal(false)}
                className="flex-1 rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 sm:py-4"
              >
                Go Back
              </button>
              <button className="flex-1 rounded-xl bg-orange-500 px-6 py-3 font-medium text-white transition-colors hover:bg-orange-600 sm:py-4">
                Boost Ad
              </button>
            </div>
          </div>
        </div>
      )}

      {/* contact form model */}
      {/* Contact Form Modal */}
      {showContactFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8 shadow-lg">
            {/* Close Button */}
            <button
              onClick={() => setShowContactFormModal(false)}
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-black text-white transition-colors hover:bg-gray-800"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-8">
              <h1 className="mb-4 text-3xl font-bold text-black">Contact Us</h1>
              <p className="text-base text-gray-600">
                Whether it's about your order, a product, or selling on Soukloop
                — we're just a message away.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setShowSuccessPopup(true);
              }}
            >
              {/* Name Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-black">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter Your Name"
                  value={contactForm.name}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, name: e.target.value })
                  }
                  className="h-12 border-gray-300 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Email Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-black">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter Your Email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="h-12 border-gray-300 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Category Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-black">
                  Issue Category
                </label>
                <Select
                  value={contactForm.category}
                  onValueChange={(value) =>
                    setContactForm({ ...contactForm, category: value })
                  }
                >
                  <SelectTrigger className="h-12 border-gray-300 bg-white text-gray-400">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order">Order Issue</SelectItem>
                    <SelectItem value="product">Product Question</SelectItem>
                    <SelectItem value="selling">Selling on Soukloop</SelectItem>
                    <SelectItem value="technical">Technical Support</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Message Field */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-medium text-black">
                  Message
                </label>
                <Textarea
                  placeholder="Type your message..."
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({
                      ...contactForm,
                      message: e.target.value,
                    })
                  }
                  className="min-h-[120px] resize-none border-gray-300 bg-white placeholder:text-gray-400"
                />
              </div>

              {/* Terms Checkbox */}
              <div className="mb-6 flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={contactForm.acceptTerms}
                  onCheckedChange={(checked) =>
                    setContactForm({
                      ...contactForm,
                      acceptTerms: checked as boolean,
                    })
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm leading-relaxed text-gray-700"
                >
                  I accept the{" "}
                  <a
                    href="#"
                    className="text-orange-500 underline hover:text-orange-600"
                  >
                    Terms of Use
                  </a>{" "}
                  &{" "}
                  <a
                    href="#"
                    className="text-orange-500 underline hover:text-orange-600"
                  >
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="h-[48px] w-[180px] rounded-full bg-orange-500 text-base font-medium text-white hover:bg-orange-600"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Setup Store Modal */}
      {showSetupStoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-8 shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setShowSetupStoreModal(false)}
              className="absolute right-6 top-6 text-2xl text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Title */}
            <h1 className="mb-4 text-3xl font-bold text-gray-900">
              How to set up your Soukloop store
            </h1>
            <p className="mb-8 text-gray-600">
              Setting up your store is the first step to reaching millions of
              potential customers. Follow these steps to get started:
            </p>

            {/* Steps */}
            <div className="space-y-8">
              {[
                {
                  step: "Step 1: Create your account",
                  desc: "If you don't already have a ShopSpot account, you'll need to create one. Go to the ShopSpot homepage and click Sign Up in the top right corner. Follow the prompts to enter your email address, create a password, and provide your basic information.",
                },
                {
                  step: "Step 2: Choose your store name",
                  desc: "Your store name is how customers will identify your shop. Choose a name that is memorable, relevant to your products, and not already in use by another seller. You can check the availability of your desired store name during the setup process.",
                },
                {
                  step: "Step 3: Set up your payment information",
                  desc: "To receive payments for your sales, you'll need to provide your payment information. This typically includes your bank account details and any other required financial information. ShopSpot uses secure payment processing to ensure the safety of your transactions.",
                },
                {
                  step: "Step 4: Add your products",
                  desc: "Once your account and payment information are set up, you can start adding your products. For each product, you'll need to provide a title, description, price, and high-quality images. Be sure to categorize your products appropriately to make them easy for customers to find.",
                },
                {
                  step: "Step 5: Set up your shipping options",
                  desc: "Determine your shipping costs and methods. You can offer free shipping, charge a flat rate, or calculate shipping costs based on the customer's location and the weight of the items. Clearly communicate your shipping policies to avoid any confusion.",
                },
                {
                  step: "Step 6: Customize your store",
                  desc: "Personalize your store by adding a banner image, a store logo, and a brief 'About Us' section. This helps create a unique brand identity and builds trust with your customers.",
                },
                {
                  step: "Step 7: Launch your store",
                  desc: "After completing all the previous steps, you're ready to launch your store. Review all your information to ensure accuracy, and then click the 'Launch Store' button. Your store will now be visible to customers on ShopSpot.",
                },
                {
                  step: "Step 8: Promote your store",
                  desc: "To attract customers, promote your store through social media, email marketing, and other channels. Consider running promotions or offering discounts to encourage initial sales.",
                },
                {
                  step: "Step 9: Manage your store",
                  desc: "Regularly update your product listings, respond to customer inquiries promptly, and fulfill orders efficiently. Monitor your sales and customer feedback to identify areas for improvement.",
                },
                {
                  step: "Step 10: Stay informed",
                  desc: "Keep up-to-date with ShopSpot's policies, features, and best practices. This will help you optimize your store's performance and provide the best possible experience for your customers.",
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <h2 className="mb-2 text-xl font-bold text-gray-900">
                    {item.step}
                  </h2>
                  <p className="text-gray-700">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Feedback Section */}
            <div className="mt-12 border-t pt-8">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Was this helpful?
              </h3>
              <div className="mb-6 flex items-center gap-4">
                <button className="flex items-center gap-2 text-gray-600 hover:text-orange-500">
                  👍 <span>123</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-red-500">
                  👎 <span>45</span>
                </button>
              </div>
              <button
                className="rounded-full bg-orange-500 px-6 py-3 font-medium text-white hover:bg-orange-600"
                onClick={() => {
                  setShowSetupStoreModal(false);
                  setCurrentView("liveChat");
                }}
              >
                Still need help?
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Modal */}
      {showLiveChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-lg">
            {/* Close button */}
            <button
              onClick={() => setShowLiveChatModal(false)}
              className="absolute right-4 top-4 text-2xl text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>

            {/* Ticket Header */}
            <div className="border-b p-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Ticket #12345
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Submitted by Alex Bennett on July 15, 2024
              </p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 space-y-6 overflow-y-auto px-6 pt-6">
              {/* First Message - Agent Welcome */}
              <div className="flex items-start justify-end gap-4">
                <div className="max-w-lg rounded-2xl bg-orange-500 px-6 py-4 text-white">
                  <p className="text-sm leading-relaxed">How may I help you?</p>
                </div>
                <img
                  src="/images/agent-avatar-chat.png"
                  alt="Agent"
                  className="size-10 shrink-0 rounded-full"
                />
              </div>

              {/* User Messages */}
              <div className="flex items-start gap-4">
                <img
                  src="/images/user-avatar-chat.png"
                  alt="User"
                  className="size-10 shrink-0 rounded-full"
                />
                <div className="space-y-3">
                  <div className="max-w-lg rounded-2xl bg-gray-100 px-6 py-4">
                    <p className="text-sm leading-relaxed text-gray-900">
                      There's an issue with my product listing not showing
                      correctly. Kindly look into it and advise. Thanks!
                    </p>
                  </div>
                  <div className="max-w-lg rounded-2xl bg-gray-100 px-6 py-4">
                    <p className="text-sm leading-relaxed text-gray-900">
                      I need assistance with it.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agent Response Messages */}
              <div className="flex items-start justify-end gap-4">
                <div className="flex flex-col items-end space-y-3">
                  <div className="max-w-lg rounded-2xl bg-orange-500 px-6 py-4 text-white">
                    <p className="text-sm leading-relaxed">
                      Sure, give us two minutes 😊
                    </p>
                  </div>
                  <div className="max-w-lg rounded-2xl bg-orange-500 px-6 py-4 text-white">
                    <p className="text-sm leading-relaxed">
                      We will get back to you.
                    </p>
                  </div>
                </div>
                <img
                  src="/images/agent-avatar-chat.png"
                  alt="Agent"
                  className="size-10 shrink-0 rounded-full"
                />
              </div>
            </div>

            {/* Message Input Area */}
            <div className="flex items-center gap-3 border-t p-4">
              <button className="shrink-0">
                <img
                  src="/images/paperclip-icon.png"
                  alt="Attach"
                  className="size-5"
                />
              </button>
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button className="shrink-0">
                <img
                  src="/images/send-icon.png"
                  alt="Send"
                  className="size-5"
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* shipping setting model */}
      {showShippingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          {/* SHIPPING SETTINGS POPUP */}
          {!showDeliveryService && (
            <div className="flex h-[650px] w-[986px] flex-col rounded-2xl bg-white shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order 1 of 1 – Delivery Info
                </h2>
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="flex size-8 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-1 gap-8 overflow-y-auto p-4">
                {/* Left Column */}
                <div className="flex-1 space-y-5">
                  <div>
                    <div className="mb-2 flex items-center gap-3">
                      <span className="font-medium text-gray-900">
                        Shipping from 420 Birmingham Block A Sec
                      </span>
                      <button className="h-8 rounded-full border bg-transparent px-4 text-sm">
                        Edit
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      This is when your package will be handed over to the
                      carrier.
                    </p>
                  </div>

                  {/* Apply to All */}
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 text-orange-500"
                      defaultChecked
                    />
                    <span className="font-medium text-gray-900">
                      Apply date to all
                    </span>
                  </label>

                  {/* Shipping Date */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">
                      Shipping Date
                    </label>
                    <select className="h-12 w-full rounded-lg border-gray-200">
                      <option>August 1, 2025</option>
                      <option>August 2, 2025</option>
                      <option>August 3, 2025</option>
                    </select>
                  </div>

                  {/* Package Type */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">
                      Package Type
                    </label>
                    <select className="h-12 w-full rounded-lg border-gray-200">
                      <option>Thin Envelope</option>
                      <option>Thick Envelope</option>
                      <option>Small Box</option>
                      <option>Medium Box</option>
                    </select>
                  </div>

                  {/* Package Weight */}
                  <div className="space-y-2">
                    <label className="font-medium text-gray-900">
                      Package weight
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="00"
                        className="h-14 w-[260px] rounded-lg border text-center"
                      />
                      <span className="mt-4">lb</span>
                      <input
                        type="number"
                        placeholder="00"
                        className="h-14 w-[260px] rounded-lg border text-center"
                      />
                      <span className="mt-4">oz</span>
                    </div>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-3 gap-4">
                    {["Length", "Width", "Height"].map((dim) => (
                      <div key={dim}>
                        <label className="font-medium text-gray-900">
                          {dim}
                        </label>
                        <div className="flex items-center">
                          <input
                            type="number"
                            placeholder="00"
                            className="h-12 w-full rounded-lg border text-center"
                          />
                          <span className="ml-2 text-gray-600">in</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div className="w-80 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Note to buyer
                    </h3>
                    <textarea
                      placeholder="Write Note"
                      className="h-20 w-full resize-none rounded-lg border p-2"
                    ></textarea>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <div className="mb-4 flex gap-3">
                      <img
                        src="/images/leather-bag.png"
                        className="size-16 rounded-lg object-cover"
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Premium Leather Bag
                        </h4>
                        <p className="text-sm text-gray-600">Quantity: 2</p>
                        <p className="text-sm text-gray-600">
                          Size: Small kid clothing size
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      Ordered Jul 30, 2025
                    </p>
                    <p className="text-sm text-gray-600">
                      Standard Shipping ($0.00)
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-3 border-t p-6">
                <button
                  onClick={() => setShowShippingModal(false)}
                  className="rounded-full border border-orange-500 px-6 py-2 text-orange-500 hover:bg-orange-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowDeliveryService(true)}
                  className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600"
                >
                  Select Delivery Service
                </button>
              </div>
            </div>
          )}

          {/* DELIVERY SERVICE POPUP */}
          {showDeliveryService && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
              <div className="h-[585px] w-[540px] overflow-y-auto rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Delivery Service
                  </h2>
                  <button
                    onClick={() => setShowDeliveryService(false)}
                    className="flex size-8 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-800"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-8">
                  {/* Service Tabs */}
                  <div className="mb-6 flex gap-2">
                    <button
                      onClick={() => setActiveTab("USPS")}
                      className={`font-medium transition-colors ${activeTab === "USPS"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      style={{
                        width: "95px",
                        height: "32px",
                        borderRadius: "16px",
                      }}
                    >
                      USPS
                    </button>
                    <button
                      onClick={() => setActiveTab("UPS")}
                      className={`font-medium transition-colors ${activeTab === "UPS"
                          ? "bg-orange-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      style={{
                        width: "95px",
                        height: "32px",
                        borderRadius: "16px",
                      }}
                    >
                      UPS
                    </button>
                  </div>

                  {/* Service Options */}
                  <div className="space-y-2">
                    {/* USPS Ground Advantage */}
                    <div className="rounded-lg border bg-white p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-service"
                            value="ground-advantage"
                            checked={selectedService === "ground-advantage"}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="size-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="font-medium text-gray-900">
                            USPS Ground Advantage
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            $8.24
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            $16.65
                          </div>
                          <div className="text-sm text-gray-600">
                            with cubic pricing discount
                          </div>
                        </div>
                      </div>
                      <ul className="ml-7 space-y-1 text-sm text-gray-600">
                        <li>
                          • Slowest Estimated delivery Jul 30 – Aug 2{" "}
                          <span className="text-orange-500">
                            (Buyer expects Jul 30 – Aug 1)
                          </span>
                        </li>
                        <li>
                          • Includes insurance up to $100.00 • Free tracking
                        </li>
                      </ul>

                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <h4 className="mb-3 font-medium text-gray-900">
                          Additional services
                        </h4>
                        <div className="mb-4 flex items-center space-x-2">
                          <Checkbox
                            id="signature"
                            checked={signatureConfirmation}
                            onCheckedChange={(checked) => setSignatureConfirmation(checked === true)}
                            className="data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-500"
                          />
                          <label htmlFor="signature" className="text-gray-900">
                            Signature confirmation
                          </label>
                        </div>

                        <div>
                          <label className="mb-2 block font-medium text-gray-900">
                            Package value to insure:
                          </label>
                          <Input
                            type="text"
                            placeholder="Enter Value"
                            value={packageValue}
                            onChange={(e) => setPackageValue(e.target.value)}
                            className="mb-2 h-12 w-full rounded-lg border-gray-200 bg-gray-50"
                          />
                          <p className="text-sm text-gray-600">
                            Insurance is provided through Shipsurance.{" "}
                            <span className="cursor-pointer text-blue-600 underline">
                              [Coverage Terms]
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* USPS Priority Mail */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-service"
                            value="priority-mail"
                            checked={selectedService === "priority-mail"}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="size-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="font-medium text-gray-900">
                            USPS Priority Mail
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            $12.27
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            $16.65
                          </div>
                          <div className="text-sm text-gray-600">
                            (26% off retail)
                          </div>
                        </div>
                      </div>
                      <ul className="ml-7 space-y-1 text-sm text-gray-600">
                        <li>• Faster Estimated delivery Jul 30 – Jul 31</li>
                        <li>
                          • Includes insurance up to $100.00 • Free tracking
                        </li>
                      </ul>
                    </div>

                    {/* USPS Priority Mail Express */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-service"
                            value="priority-express"
                            checked={selectedService === "priority-express"}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="size-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="font-medium text-gray-900">
                            USPS Priority Mail Express
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            $55.90
                          </div>
                          <div className="text-sm text-gray-500 line-through">
                            $65.00
                          </div>
                          <div className="text-sm text-gray-600">
                            (14% off retail)
                          </div>
                        </div>
                      </div>
                      <ul className="ml-7 space-y-1 text-sm text-gray-600">
                        <li>• Fastest Estimated delivery Jul 30 – Jul 31</li>
                        <li>
                          • Includes insurance up to $100.00 • Free tracking
                        </li>
                      </ul>
                    </div>

                    {/* USPS Media Mail */}
                    <div className="rounded-lg border p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping-service"
                            value="media-mail"
                            checked={selectedService === "media-mail"}
                            onChange={(e) => setSelectedService(e.target.value)}
                            className="size-4 border-gray-300 text-orange-500 focus:ring-orange-500"
                          />
                          <span className="font-medium text-gray-900">
                            USPS Media Mail
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            $5.22
                          </div>
                        </div>
                      </div>
                      <ul className="ml-7 space-y-1 text-sm text-gray-600">
                        <li>
                          • Slowest Estimated delivery Jul 30 – Aug 2 (Buyer
                          expects Jul 30 – Aug 1)
                        </li>
                        <li>• Insurance not included • Free tracking</li>
                      </ul>
                    </div>
                  </div>

                  {/* Save as Preset */}
                  <div className="mt-8 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="mb-2 font-semibold text-gray-900">
                          Save as Preset
                        </h3>
                        <p className="text-sm text-gray-600">
                          Save this configuration as a preset for future orders
                        </p>
                      </div>
                      <button
                        onClick={() => setSaveAsPreset(!saveAsPreset)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${saveAsPreset ? "bg-orange-500" : "bg-gray-200"
                          }`}
                      >
                        <span
                          className={`inline-block size-4 rounded-full bg-white transition-transform${saveAsPreset ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t p-6">
                  <button
                    onClick={() => setShowDeliveryService(false)}
                    className="rounded-full border border-orange-500 px-6 py-2 text-orange-500 hover:bg-orange-50"
                  >
                    Cancel
                  </button>
                  <button className="rounded-full bg-orange-500 px-6 py-2 text-white hover:bg-orange-600">
                    Review
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Seller Account Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative h-[416px] w-[644px] rounded-2xl bg-gray-50 p-12 pt-[22px] shadow-lg">
            {/* Header */}
            <h1 className="mb-8 text-4xl font-bold text-black">
              Seller Account Status
            </h1>

            {/* Title Field */}
            <div className="mb-8">
              <label className="mb-3 block text-lg font-medium text-black">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Christmas Holidays"
                className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-600 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Date Fields */}
            <div className="mb-8 flex gap-6">
              <div className="flex-1">
                <label className="mb-3 block text-lg font-medium text-black">
                  Start date
                </label>
                <input
                  type="text"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-600 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="flex-1">
                <label className="mb-3 block text-lg font-medium text-black">
                  End date
                </label>
                <input
                  type="text"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="MM/DD/YYYY"
                  className="h-14 w-full rounded-xl border border-gray-200 bg-white px-4 text-gray-600 placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleCancel}
                className="h-12 w-[125px] rounded-[50px] bg-gray-100 font-medium text-orange-500 transition-colors hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="h-12 w-[125px] rounded-[50px] bg-orange-500 font-medium text-white transition-colors hover:bg-orange-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

