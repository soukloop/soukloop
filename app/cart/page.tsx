"use client"

import { useState } from "react"
import Header from "../cart/components/header"
import CartPage from "../cart/components/cart-page"
import CheckoutPage from "../cart/components/checkout-page"
import OrderCompletePage from "../cart/components/order-complete-page"
import FooterSection from "../cart/components/footer-section"
import ProgressSteps from "../cart/components/progress-steps"

export default function CartFlowPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3))
  const handleStepChange = (step: number) => setCurrentStep(step)

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <CartPage onNext={handleNextStep} />
      case 2:
        return <CheckoutPage onNext={handleNextStep} />
      case 3:
        return <OrderCompletePage />
      default:
        return <CartPage onNext={handleNextStep} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Progress shown ONCE at the top */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <ProgressSteps currentStep={currentStep} onStepChange={handleStepChange} />
      </div>

      {/* Current step content */}
      {renderCurrentStep()}

      <FooterSection />
    </div>
  )
}
