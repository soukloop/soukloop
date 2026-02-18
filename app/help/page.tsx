import { auth } from "@/auth"
import EcommerceHeader from "@/components/ecommerce-header"
import FooterSection from "@/components/footer-section"
import { SupportForm } from "./components/SupportForm"
import { TicketList } from "./components/TicketList"

export const metadata = {
    title: "Help Center - SoukLoop",
    description: "Get support for your orders and account",
}

export default async function HelpPage() {
    const session = await auth()
    const user = session?.user

    return (
        <div className="min-h-screen bg-white sm:mt-[-9rem] mt-[-6.2rem]">
            <EcommerceHeader />

            <main className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-10 text-center">
                        <h1 className="mb-4 text-4xl font-bold text-gray-900">Help Center</h1>
                        <p className="text-lg text-gray-600">
                            Need assistance? Fill out the form below and we&apos;ll get back to you shortly.
                        </p>
                    </div>

                    <div className="rounded-2xl border bg-white p-6 shadow-sm sm:p-10">
                        <SupportForm
                            user={user ? { name: user.name, email: user.email } : undefined}
                        />
                    </div>

                    {/* Only show Ticket History if user is logged in */}
                    {user?.id && <TicketList userId={user.id} />}
                </div>
            </main>

            <FooterSection />
        </div>
    )
}
