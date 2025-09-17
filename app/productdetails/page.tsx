"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Star,
  Heart,
  ShoppingCart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
  Check,
  ChevronDown,
  Info,
  User,
  X,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ProductPage() {
  const [selectedSize, setSelectedSize] = useState("Small");
  const [quantity, setQuantity] = useState(5);
  const [activeTab, setActiveTab] = useState("Description");
  const [currentImageIndex, setCurrentImageIndex] = useState(-1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sizes = ["Small", "Medium", "Large", "Extra Large", "XXL"];
  const productImages = [
    "/images/product-thumb-1.png",
    "/images/product-thumb-2.png",
    "/images/product-thumb-3.png",
    "/images/product-thumb-4.png",
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const similarProducts = [
    {
      id: 1,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-1.png",
    },
    {
      id: 2,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-2.png",
    },
    {
      id: 3,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-3.png",
    },
    {
      id: 4,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-4.png",
    },
    {
      id: 5,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-5.png",
    },
    {
      id: 6,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-6.png",
    },
    {
      id: 7,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-1.png",
    },
    {
      id: 8,
      name: "TDX Strikers",
      price: 675.0,
      image: "/images/similar-2.png",
    },
  ];

  const productFeatures = [
    "Comfortable",
    "Silk-soft",
    "Stretchable",
    "Washable",
    "Skinfriendly",
    "Antibacterial",
    "Quickly",
    "Seamless",
    "Moisturewicking",
    "Comfylike",
    "Shrinkproof",
    "Softtouch",
    "Featherlight",
    "Abrasion",
    "Stretchable",
  ];

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let scrollAmount = 0;
    const scrollStep = 1; // pixels per frame
    const interval = setInterval(() => {
      if (container) {
        container.scrollLeft += scrollStep;
        scrollAmount += scrollStep;

        // if reached the end, reset
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          container.scrollLeft = 0;
          scrollAmount = 0;
        }
      }
    }, 20); // speed: smaller = faster

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
              <a href="#" className="hover:opacity-80">
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
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-lg bg-transparent"
              >
                <Heart className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 rounded-lg bg-transparent"
              >
                <User className="h-6 w-6" />
              </Button>
              <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white px-4 sm:px-6 text-sm sm:text-base font-semibold h-10 sm:h-11 w-[100px] sm:w-[135px] rounded-3xl">
                Sell
              </Button>
            </div>

            {/* Mobile Icons (outside dropdown) */}
            <div className="flex sm:hidden items-center space-x-2">
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
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-lg bg-transparent"
              >
                <Heart className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-lg bg-transparent"
              >
                <User className="h-6 w-6" />
              </Button>

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
              >
                Log in / Sign up
              </Button>

              <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white px-6 text-base font-semibold h-11 rounded-3xl">
                Sell
              </Button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Product Images */}
            <div className="space-y-5 w-full">
              <div
                className="relative w-full h-[280px] sm:h-[360px] md:h-[420px] lg:w-[614px] lg:h-[512px] mx-auto"
                onClick={() => setCurrentImageIndex(-1)}
              >
                <Image
                  src={
                    currentImageIndex >= 0
                      ? productImages[currentImageIndex]
                      : "/images/reading-lifestyle.png"
                  }
                  alt="Person reading book in casual lifestyle setting"
                  fill
                  className="object-cover rounded-lg"
                  style={{ transformOrigin: "center" }}
                  priority
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 bg-white/80 hover:bg-white w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-md"
                  onClick={() => setIsModalOpen(true)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                    />
                  </svg>
                </Button>
              </div>

              {/* Zoom Modal */}
              {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                  />
                  <div className="relative z-10 max-w-4xl max-h-[90vh] p-4">
                    <div className="relative">
                      <Image
                        src={
                          currentImageIndex >= 0
                            ? productImages[currentImageIndex]
                            : "/images/reading-lifestyle.png"
                        }
                        alt="Person reading book in casual lifestyle setting - Zoomed"
                        width={1200}
                        height={1000}
                        className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
                        priority
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/90 hover:bg-white w-9 h-9 sm:w-10 sm:h-10 rounded-full shadow-lg"
                        onClick={() => setIsModalOpen(false)}
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-center items-center gap-3 sm:gap-4 w-full max-w-[614px] mx-auto relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white w-8 h-8 -translate-x-4"
                  onClick={() =>
                    setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
                  }
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex justify-center gap-3 sm:gap-4">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-20 h-16 sm:w-28 sm:h-[92px] md:w-32 md:h-[115px] rounded-lg overflow-hidden border-2 ${
                        index === currentImageIndex
                          ? "border-orange-500"
                          : "border-gray-200"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Product ${index + 1}`}
                        width={128}
                        height={115}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white w-8 h-8 translate-x-4"
                  onClick={() =>
                    setCurrentImageIndex(
                      Math.min(productImages.length - 1, currentImageIndex + 1)
                    )
                  }
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6 flex-1">
              {/* Breadcrumb */}
              <nav className="text-sm text-gray-600 flex items-center flex-wrap gap-x-2 gap-y-2">
                <a href="#" className="hover:text-gray-800">
                  Home
                </a>
                <span className="text-gray-400">›</span>
                <a href="#" className="hover:text-gray-800">
                  Product
                </a>
                <span className="text-gray-400">›</span>
                <a href="#" className="hover:text-gray-800">
                  Casual wear
                </a>
                <span className="text-gray-400">›</span>
                <span className="text-[#E87A3F] font-medium">
                  Product detail
                </span>
              </nav>

              <div className="flex items-center justify-between border py-2.5 px-2.5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    S
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Posted by</div>
                    <div className="font-medium text-gray-900">
                      Seller_Name_Here
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                  Premium Leather Bag
                </h1>
                <p className="text-gray-600">Handbag</p>
              </div>
              <div className="border-b border-gray-200"></div>

              {/* Pricing and Rating */}
              <div className="flex items-start space-x-6">
                <div className="flex flex-col">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                    $71.56
                  </div>
                  <div className="text-base sm:text-lg text-gray-500 line-through">
                    $71.56
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-500 font-medium">4.8</span>
                    </div>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <MessageCircle className="w-4 h-4" />
                      <span className="text-sm">67 Reviews</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-bold">93%</span> of buyers have
                    recommended this.
                  </div>
                </div>
              </div>
              <div className="border-b border-gray-200"></div>

              {/* Size Selection */}
              <div>
                <h3 className="font-medium mb-3 text-gray-900">
                  Choose a Size
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {sizes.map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="radio"
                        name="size"
                        value={size}
                        checked={selectedSize === size}
                        onChange={() => setSelectedSize(size)}
                        className="sr-only"
                      />
                      <div
                        className={`rounded-lg cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap px-3 sm:px-4 h-10 sm:h-[40px] ${
                          selectedSize === size
                            ? "bg-orange-50 text-orange-600"
                            : "border border-gray-300 hover:border-gray-400 bg-white text-gray-700"
                        }`}
                        style={{ minWidth: "100px" }}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center mr-2 ${
                            selectedSize === size
                              ? "border-orange-500 bg-orange-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedSize === size && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm">{size}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity and Wishlist */}
              <div className="flex items-center gap-3 sm:space-x-4 flex-wrap">
                <div className="flex items-center border border-gray-300 rounded-lg bg-white w-full sm:w-[225px] h-12 sm:h-14">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                  >
                    −
                  </button>
                  <span className="flex-1 h-full flex items-center justify-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-full flex items-center justify-center hover:bg-gray-100 text-gray-600"
                  >
                    +
                  </button>
                </div>
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 bg-white border-gray-300 w-full sm:w-[234px] h-12 sm:h-14"
                >
                  <Heart className="w-4 h-4" />
                  <span>Add to wish List</span>
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row gap-3">
                <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full flex items-center justify-center space-x-2 flex-1 h-12 sm:h-14">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-medium">Add To Cart</span>
                </Button>

                <Button
                  variant="outline"
                  className="flex items-center justify-center space-x-2 bg-white border-gray-300 text-[#E87A3F] hover:bg-orange-50 flex-1 sm:flex-none sm:w-[292px] h-12 sm:h-14 rounded-full"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Message Seller</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="border-b overflow-x-auto">
            <nav className="flex space-x-6 sm:space-x-8 min-w-max">
              {["Description", "Reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "Description" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-4">
                    About Product
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {productFeatures.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100 text-gray-700"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-4">
                    Product Description
                  </h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Gender:</span> Women
                    </p>
                    <p>
                      <span className="font-medium">Category:</span> Clothing
                    </p>
                    <p>
                      <span className="font-medium">Outfit Type:</span> Eastern
                      Ready to wear
                    </p>
                    <p>
                      <span className="font-medium">Sub-Category:</span> Co Ord
                      Sets
                    </p>
                    <p>
                      <span className="font-medium">Bottom Style:</span>{" "}
                      Straight Trouser
                    </p>
                    <p>
                      <span className="font-medium">Color Type:</span> Ivory
                    </p>
                    <p>
                      <span className="font-medium">Lining Attached:</span> No
                      Lining
                    </p>
                    <p>
                      <span className="font-medium">Number of Pieces:</span> 2
                      Piece - Top & Bottom
                    </p>
                    <p>
                      <span className="font-medium">Product Type:</span>{" "}
                      Daily/Basic Wear
                    </p>
                    <p>
                      <span className="font-medium">Season:</span> Summer Wear
                    </p>
                    <p>
                      <span className="font-medium">Shirt Fabric:</span> Lawn
                    </p>
                    <p>
                      <span className="font-medium">Top Fit:</span> Regular Fit
                    </p>
                    <p>
                      <span className="font-medium">Top Style:</span> V-Neck
                      Shirt
                    </p>
                    <p>
                      <span className="font-medium">Trouser Fabric:</span> Lawn
                    </p>
                    <p>
                      <span className="font-medium">Work Technique:</span>{" "}
                      Embroidered
                    </p>
                    <p>
                      <span className="font-medium">
                        Additional Description:
                      </span>{" "}
                      Denali - Classy 2 Pcs outfit including shirt and plazzo
                      pants with applique work looks chic in monochrome colors.
                    </p>
                    <p>
                      <span className="font-medium">Disclaimer:</span> Actual
                      product color may vary slightly from the image.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Reviews" && (
              <div className="space-y-8">
                {/* Seller Previous Feedback */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-6">
                    Seller Previous Feedback
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Overall Rating */}
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 mb-2">
                        4.8
                      </div>
                      <div className="flex justify-center mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        Product Rating
                      </div>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="space-y-2">
                      {[
                        { stars: 5, percentage: 70 },
                        { stars: 4, percentage: 16 },
                        { stars: 3, percentage: 8 },
                        { stars: 2, percentage: 4 },
                        { stars: 1, percentage: 2 },
                      ].map((rating) => (
                        <div
                          key={rating.stars}
                          className="flex items-center space-x-3"
                        >
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= rating.stars
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-400 h-2 rounded-full"
                              style={{ width: `${rating.percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-sm text-gray-600 w-8">
                            {rating.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual Reviews */}
                  <div className="space-y-6">
                    {/* Review 1 */}
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          JC
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                Jennifer Cane
                              </div>
                              <div className="text-sm text-gray-500">
                                3 days ago
                              </div>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            Super Product
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            Contrary to popular belief, Lorem Ipsum is not
                            simply random text. It has roots in a piece of
                            classical Latin literature from 45 BC, making it
                            over 2000 years old. Richard McClintock, a Latin
                            professor at Hampden-Sydney College.
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                              <span>👍</span>
                              <span>Yes</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                              <span>👎</span>
                              <span>No</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review 2 */}
                    <div className="border-b border-gray-200 pb-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                          JG
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="font-medium text-gray-900">
                                Jorgina Goodwin
                              </div>
                              <div className="text-sm text-gray-500">
                                4 days ago
                              </div>
                            </div>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="w-4 h-4 fill-yellow-400 text-yellow-400"
                                />
                              ))}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 mb-1">
                            The best product is satisfied
                          </div>
                          <p className="text-sm text-gray-700 mb-3">
                            Contrary to popular belief, Lorem Ipsum is not
                            simply random text. It has roots in a piece of
                            classical Latin literature from 45 BC, making it
                            over 2000 years old. Richard McClintock, a Latin
                            professor at Hampden-Sydney College.
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                              <span>👍</span>
                              <span>Yes</span>
                            </button>
                            <button className="flex items-center space-x-1 text-gray-500 hover:text-gray-700">
                              <span>👎</span>
                              <span>No</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* View All Reviews Button */}
                  <div className="text-center mt-6">
                    <button className="text-orange-500 hover:text-orange-600 font-medium">
                      View All Reviews
                    </button>
                  </div>
                </div>

                {/* Write a Review Section */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-bold mb-6">
                    Write a Review
                  </h3>

                  <div className="space-y-4">
                    {/* Rating */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        How is this Product?
                      </label>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            className="text-gray-300 hover:text-yellow-400"
                          >
                            <Star className="w-6 h-6" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Title
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Give your review a title"
                      />
                    </div>

                    {/* Guest Products */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Guest Products
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Product name"
                      />
                    </div>

                    {/* Review Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review Content
                      </label>
                      <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="It is a long established fact that a reader will be distracted by the readable content of a page..."
                      ></textarea>
                    </div>

                    {/* Submit Button */}
                    <div>
                      <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white px-8 py-2 rounded-md">
                        Submit Review
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar Items */}
      <div className="bg-white py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-6">
          Similar Items You Might Also Like
        </h2>
        <div className="relative">
          {/* Auto smooth scroller */}
          <div
            ref={scrollRef}
            className="overflow-x-auto scroll-smooth scrollbar-hide"
          >
            <div className="flex gap-4 pb-4 w-max">
              {similarProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group cursor-pointer flex-shrink-0 w-[180px] sm:w-[200px] h-[320px] sm:h-[336px]"
                >
                  <CardContent className="p-4 h-full flex flex-col">
                    {/* Image container */}
                    <div className="relative mb-3 flex-shrink-0 w-full h-[160px] sm:h-[200px]">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="w-full h-full object-cover rounded-lg"
                        priority={false}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-2 right-2 bg-white hover:bg-white w-6 h-6 rounded-full shadow-sm border border-gray-200"
                      >
                        <Heart className="w-4 h-4 text-gray-600" />
                      </Button>
                    </div>
                    {/* Text content */}
                    <div className="text-center flex-grow flex flex-col justify-center">
                      <div className="font-bold">${product.price.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">{product.name}</div>
                      <div className="text-xs text-gray-500">
                        5 types of shoes available
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Scroll indicators (manual control still works) */}
          <div className="flex justify-center mt-4 space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full bg-transparent"
              onClick={() => {
                scrollRef.current?.scrollBy({ left: -200, behavior: "smooth" });
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="w-8 h-8 rounded-full bg-transparent"
              onClick={() => {
                scrollRef.current?.scrollBy({ left: 200, behavior: "smooth" });
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    />
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-1.5 bg-white rounded-full"></div>
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
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Home
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">
                SUPPORT
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Help & Support
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-700 hover:text-[#E87A3F] transition-colors text-sm"
                  >
                    Help
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-black font-bold text-sm uppercase tracking-wider mb-4">
                NEWSLETTER
              </h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#E87A3F] focus:border-[#E87A3F] bg-white w-full sm:w-[304px] h-[46px]"
                />
                <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white text-sm font-medium rounded-md border border-[#E87A3F] w-full sm:w-[149px] h-[46px]">
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
        <div className="bg-[#E87A3F] py-4 sm:py-6">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-white text-[11px] sm:text-xs">
                <span>Copyright © 2023 3legant. All rights reserved</span>
                <div className="flex items-center gap-4">
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:underline">
                    Terms & Conditions
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-2">
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
    </div>
  );
}
