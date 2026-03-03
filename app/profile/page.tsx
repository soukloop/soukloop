import EcommerceHeader from "@/components/ecommerce-header"
import UserProfileSection from "./components/user-profile-section"
import FooterSection from "@/components/footer-section"
import { getProfilePayload } from "@/src/features/user/queries"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const profileData = await getProfilePayload(id);

  if (!profileData) {
    redirect("/?auth=login");
  }

  // Redirect to professional URL if accessed via /profile?id=...
  if (id && (profileData.user as any).username && id !== (profileData.user as any).username) {
    redirect(`/u/${(profileData.user as any).username}`);
  }

  return (
    <div className="min-h-screen bg-white sm:mt-[-8.5rem] mt-[-6.2rem]">
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
