import { Button } from "@/components/ui/button";
import { Lock, BadgeCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";

export function SellerDashboardLock() {
    return (
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
            <EcommerceHeader />
            <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 mb-20 mt-10">
                <div className="w-full max-w-2xl text-center space-y-8 bg-white border border-gray-100 shadow-xl rounded-3xl p-8 sm:p-12">

                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 mb-6 relative">
                        <Lock className="h-10 w-10 text-[#E87A3F]" />
                        <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                            <BadgeCheck className="h-8 w-8 text-[#E87A3F] fill-[#E87A3F]/10" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Unlock the Seller Dashboard
                        </h1>
                        <p className="text-lg text-gray-600 max-w-lg mx-auto">
                            The advanced Seller Dashboard is exclusive to Premium sellers. Upgrade today to access powerful analytics and tools to grow your business.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 text-left max-w-md mx-auto space-y-4 border border-gray-100">
                        <h3 className="font-semibold text-gray-900">Premium Benefits:</h3>
                        <ul className="space-y-3">
                            {[
                                "In-Depth Sales & Traffic Analytics",
                                "Unlimited Product Listings",
                                "Promote Listings with Free Credits",
                                "Save Product Drafts",
                                "Verified Premium Seller Badge"
                            ].map((benefit, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild className="h-14 px-8 rounded-full bg-[#E87A3F] text-white hover:bg-[#d96d34] text-base font-semibold shadow-md">
                            <Link href="/pricing">
                                View Premium Plans
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="h-14 px-8 rounded-full border-gray-200 text-gray-700 hover:bg-gray-50 text-base font-medium">
                            <Link href="/">
                                Return to Store
                            </Link>
                        </Button>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}
