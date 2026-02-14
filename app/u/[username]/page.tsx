import EcommerceHeader from "@/components/ecommerce-header"
import UserProfileSection from "@/app/profile/components/user-profile-section"
import FooterSection from "@/components/footer-section"
import { getProfilePayload } from "@/src/features/user/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;
    const profileData = await getProfilePayload(username);

    if (!profileData) {
        redirect("/?auth=login");
    }

    return (
        <div className="min-h-screen bg-white">
            <EcommerceHeader />
            <main className="min-h-[70vh]">
                <Suspense fallback={
                    <div className="flex h-[70vh] items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-[#E87A3F]" />
                    </div>
                }>
                    <UserProfileSection initialData={profileData} />
                </Suspense>
            </main>
            <FooterSection />
        </div>
    )
}
