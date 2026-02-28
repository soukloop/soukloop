"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import CartPage from "./cart-page";
import CheckoutPage from "./checkout-page";
import OrderCompletePage from "./order-complete-page";
import { Address } from "@prisma/client";
import { CartHydration } from "./cart-hydration";
// ... imports

import { SWRConfig } from "swr";
import ProgressSteps from "./progress-steps";

interface CartFlowProps {
    savedAddresses?: Address[];
    initialCartData?: any;
}

export default function CartFlow({ savedAddresses = [], initialCartData }: CartFlowProps) {
    const searchParams = useSearchParams();
    const initialOrderId = searchParams?.get("orderId");
    const isCanceled = searchParams?.get("canceled") === "true";

    const [currentStep, setCurrentStep] = useState(initialOrderId ? 3 : isCanceled ? 2 : 1);
    const [appliedPromo, setAppliedPromo] = useState<{
        code: string;
        couponId: string;
        vendorId: string;
        discountType: string;
        discountValue: number;
        minOrderValue: number | null;
    } | null>(null);
    const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);


    // Scroll to top when step changes
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [currentStep]);

    // Shipping State
    const [shippingMethodId, setShippingMethodId] = useState("free");
    const getShippingCost = (methodId: string) => {
        switch (methodId) {
            case "express": return 1500;
            case "pickup": return 2100;
            default: return 0;
        }
    };
    const shippingCost = getShippingCost(shippingMethodId);

    const handleNextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3)); // Allow going to step 3 (Order Complete)
    const handleStepChange = (step: number) => setCurrentStep(step);
    const handlePrevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <CartPage
                        onNext={handleNextStep}
                        shippingMethodId={shippingMethodId}
                        setShippingMethodId={setShippingMethodId}
                        shippingCost={shippingCost}
                        initialCartData={initialCartData}
                        appliedPromo={appliedPromo}
                        setAppliedPromo={setAppliedPromo}
                        isRedeemingPoints={isRedeemingPoints}
                        setIsRedeemingPoints={setIsRedeemingPoints}
                    />

                );
            case 2:
                return (
                    <CheckoutPage
                        onNext={handleNextStep}
                        onBack={handlePrevStep}
                        shippingCost={shippingCost}
                        shippingMethodId={shippingMethodId}
                        savedAddresses={savedAddresses}
                        appliedPromo={appliedPromo}
                        setAppliedPromo={setAppliedPromo}
                        isRedeemingPoints={isRedeemingPoints}
                        setIsRedeemingPoints={setIsRedeemingPoints}
                    />

                );
            case 3:
                return <OrderCompletePage />;
            default:
                return (
                    <CartPage
                        onNext={handleNextStep}
                        shippingMethodId={shippingMethodId}
                        setShippingMethodId={setShippingMethodId}
                        shippingCost={shippingCost}
                        initialCartData={initialCartData}
                    />
                );
        }
    };

    return (
        <SWRConfig
            value={{
                fallback: {
                    "/api/cart": initialCartData,
                },
            }}
        >
            <CartHydration initialCartData={initialCartData} />
            <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8 pb-20">
                {/* Progress Steps (State driven) */}
                <ProgressSteps currentStep={currentStep} />

                {/* Current step content */}
                {renderCurrentStep()}
            </div>
        </SWRConfig>
    );
}
