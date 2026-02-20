"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
    Store,
    TrendingUp,
    Users,
    Package,
    DollarSign,
    ArrowRight,
    CheckCircle2,
    Loader2,
    Sparkles
} from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { motion, AnimatePresence } from "framer-motion";

/**
 * BecomeSellerCTA - Universal component shown to non-sellers on seller-only pages
 * Directly transforms user to seller with a single click - no additional forms needed
 */
export default function BecomeSellerCTA() {
    const router = useRouter();
    const { data: session, update: updateSession } = useSession();
    const { enableSeller } = useVendor();

    const [isTransforming, setIsTransforming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleBecomeSeller = async () => {
        if (!session?.user) {
            // Not logged in - redirect to login
            window.dispatchEvent(new Event('open-auth-modal'));
            return;
        }

        // Direct to the new form page
        try {
            setIsTransforming(true);
            router.push("/become-a-seller/form");
        } catch (error) {
            console.error("Navigation error:", error);
            setIsTransforming(false);
        }
    };

    const benefits = [
        {
            icon: Package,
            title: "Easy Product Listing",
            description: "List unlimited products with our intuitive dashboard"
        },
        {
            icon: DollarSign,
            title: "Secure Payments",
            description: "Get paid securely with multiple payment options"
        },
        {
            icon: TrendingUp,
            title: "Seller Analytics",
            description: "Track your sales, orders, and revenue in real-time"
        },
        {
            icon: Users,
            title: "Reach Millions",
            description: "Connect with thousands of active buyers instantly"
        }
    ];

    const features = [
        "12% service fee on successful sales",
        "No setup or listing fees",
        "24/7 seller support",
        "Advanced inventory management",
        "Built-in marketing tools",
        "Real-time order tracking",
        "Instant withdrawal to your bank"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">

                {/* Success Animation Overlay */}
                <AnimatePresence>
                    {showSuccess && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="rounded-3xl bg-white p-12 text-center shadow-2xl"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: 360 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className="mx-auto mb-6 flex size-24 items-center justify-center rounded-full bg-green-100"
                                >
                                    <CheckCircle2 className="size-12 text-green-600" />
                                </motion.div>
                                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                                    Welcome, Seller! 🎉
                                </h2>
                                <p className="text-gray-600">
                                    Redirecting to your seller dashboard...
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Hero Section */}
                <div className="mx-auto max-w-4xl text-center">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-[#E87A3F] to-[#F97316] shadow-lg">
                        <Store className="size-10 text-white" />
                    </div>

                    {/* Headline */}
                    <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                        Start Selling on <span className="text-[#E87A3F]">Soukloop</span> Today!
                    </h1>

                    {/* Subtext */}
                    <p className="mb-8 text-lg text-gray-600 sm:text-xl">
                        Join thousands of successful sellers and turn your products into profit.
                        Complete our quick verification process to ensure a safe marketplace for everyone.
                    </p>

                    {/* CTA Button */}
                    <Button
                        onClick={handleBecomeSeller}
                        disabled={isTransforming}
                        size="lg"
                        className="group h-16 rounded-full bg-gradient-to-r from-[#E87A3F] to-[#F97316] px-10 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl disabled:opacity-70"
                    >
                        {isTransforming ? (
                            <>
                                <Loader2 className="mr-2 size-5 animate-spin" />
                                Initializing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 size-5" />
                                Start Seller Verification
                                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </Button>

                    <p className="mt-4 text-sm text-gray-500">
                        Secure Process • Human Review • Priority Support
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="mx-auto mt-16 max-w-6xl">
                    <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">
                        Why Sell on Soukloop?
                    </h2>

                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {benefits.map((benefit, index) => {
                            const Icon = benefit.icon;
                            return (
                                <div
                                    key={index}
                                    className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:border-[#E87A3F] hover:shadow-md"
                                >
                                    <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-orange-100 text-[#E87A3F] transition-colors group-hover:bg-[#E87A3F] group-hover:text-white">
                                        <Icon className="size-6" />
                                    </div>
                                    <h3 className="mb-2 text-lg font-bold text-gray-900">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {benefit.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Features List */}
                <div className="mx-auto mt-16 max-w-4xl">
                    <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12">
                        <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
                            Everything You Need to Succeed
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-500" />
                                    <span className="text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="mt-10 text-center">
                            <Button
                                onClick={handleBecomeSeller}
                                disabled={isTransforming}
                                size="lg"
                                className="h-12 rounded-full bg-[#E87A3F] px-8 font-semibold text-white shadow-md transition-all hover:bg-[#d96d34] hover:shadow-lg"
                            >
                                {isTransforming ? (
                                    <Loader2 className="size-5 animate-spin" />
                                ) : (
                                    "Get Started Now"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Testimonial */}
                <div className="mx-auto mt-16 max-w-3xl text-center">
                    <div className="rounded-2xl bg-gradient-to-r from-orange-50 to-orange-100 p-8">
                        <p className="mb-4 text-lg italic text-gray-700">
                            "Soukloop made it incredibly easy to start my online business.
                            Within a week, I made my first sale, and now I'm earning consistently every month!"
                        </p>
                        <div className="flex items-center justify-center gap-3">
                            <div className="size-12 rounded-full bg-gray-300" />
                            <div className="text-left">
                                <p className="font-semibold text-gray-900">Sarah Johnson</p>
                                <p className="text-sm text-gray-600">Fashion Seller</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Link */}
                <div className="mx-auto mt-12 max-w-2xl text-center">
                    <p className="text-gray-600">
                        Have questions?{" "}
                        <a
                            href="/faqs"
                            className="font-semibold text-[#E87A3F] hover:underline"
                        >
                            Check out our FAQs
                        </a>
                        {" "}or{" "}
                        <a
                            href="/contact-us"
                            className="font-semibold text-[#E87A3F] hover:underline"
                        >
                            contact our support team
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
