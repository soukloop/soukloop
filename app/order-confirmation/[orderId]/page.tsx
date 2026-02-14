import { auth } from "@/auth";
import { redirect } from "next/navigation";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import ProgressSteps from "@/app/cart/components/progress-steps";
import OrderCompletePage from "@/app/cart/components/order-complete-page";

export default async function OrderConfirmationPage(props: { params: Promise<{ orderId: string }> }) {
    const params = await props.params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect(`/api/auth/signin?callbackUrl=/order-confirmation/${params.orderId}`);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <EcommerceHeader />

            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                {/* Step 3: Order Complete */}
                <ProgressSteps currentStep={3} />

                {/* Reusing the exact same component for visual consistency */}
                <OrderCompletePage orderId={params.orderId} />
            </div>

            <FooterSection />
        </div>
    );
}
