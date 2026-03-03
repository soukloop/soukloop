"use client";

import { useSearchParams, useRouter } from "next/navigation";
import NewPasswordPopup from "@/components/auth/new-password-popup";
import { useEffect, useState } from "react";

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isValidLink, setIsValidLink] = useState(false);

    useEffect(() => {
        const token = searchParams?.get("token");
        const email = searchParams?.get("email");

        if (!token || !email) {
            // Invalid link - redirect to login after a moment or show error
            // For now, let the component handle the error display
            setIsValidLink(false);
        } else {
            setIsValidLink(true);
        }
    }, [searchParams]);

    // We mount the popup always open, as this is a dedicated page
    // The popup component itself will handle the logic of reading params and submitting
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
            <NewPasswordPopup
                isOpen={true}
                onClose={() => router.push('/signin')}
                onBackToVerificationCode={() => router.push('/signin')}
            />
        </main>
    );
}
