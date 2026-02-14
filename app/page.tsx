import { Suspense } from 'react';
import { SuspendedUserToast } from "@/components/auth/SuspendedUserToast"
import LandingPageContent from "@/components/landing/LandingPageContent"
import LandingSkeleton from "@/components/skeletons/LandingSkeleton"

export const revalidate = 3600; // Revalidate every hour

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1920px] bg-white">
      <Suspense fallback={null}>
        <SuspendedUserToast />
      </Suspense>
      <Suspense fallback={<LandingSkeleton />}>
        <LandingPageContent />
      </Suspense>
    </div>
  )
}
