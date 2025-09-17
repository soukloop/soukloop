"use client"

import { useState } from "react"
import EcommerceHeader from "@/components/ecommerce-header"
import CoverSection from "../sellerprofile/components/cover-section"
import SellerProfile from "../sellerprofile/components/seller-profile"
import ProductFilters from "../sellerprofile/components/product-filters"
import ProductGrid from "../sellerprofile/components/product-grid"
import FooterSection from "../sellerprofile/components/footer-section"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"all" | "sold">("all")

  return (
    <div className="min-h-screen bg-white">
      <EcommerceHeader />
      <CoverSection />
      <SellerProfile />
      <ProductFilters activeTab={activeTab} onTabChange={setActiveTab} />
      <ProductGrid activeTab={activeTab} />
      <FooterSection />
    </div>
  )
}
