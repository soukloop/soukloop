"use client";

import { useEffect, useCallback } from "react";
import { signIn, useSession } from "next-auth/react";

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: GoogleOneTapConfig) => void;
                    prompt: (callback?: (notification: PromptNotification) => void) => void;
                    cancel: () => void;
                };
            };
        };
    }
}

interface GoogleOneTapConfig {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: "signin" | "signup" | "use";
}

interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
}

interface PromptNotification {
    isDisplayed: () => boolean;
    isNotDisplayed: () => boolean;
    getNotDisplayedReason: () => string;
    isSkippedMoment: () => boolean;
    getSkippedReason: () => string;
    isDismissedMoment: () => boolean;
    getDismissedReason: () => string;
}

interface GoogleOneTapProps {
    clientId: string;
}

export default function GoogleOneTap({ clientId }: GoogleOneTapProps) {
    // TEMPORARILY DISABLED: Disconnected to prevent FedCM errors until hosting/migration is resolved.
    return null;

    const { status } = useSession();

    const handleCredentialResponse = useCallback(
        async (response: GoogleCredentialResponse) => {
            try {
                // Use NextAuth to sign in with the Google credential
                await signIn("google", {
                    credential: response.credential,
                    callbackUrl: "/",
                });
            } catch (error) {
                console.error("Google One Tap sign-in error:", error);
            }
        },
        []
    );

    useEffect(() => {
        // Only show One Tap if user is not authenticated
        if (status === "authenticated") return;
        if (!clientId || clientId.includes("placeholder")) return;

        // Load Google Identity Services script
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (window.google) {
                window.google.accounts.id.initialize({
                    client_id: clientId,
                    callback: handleCredentialResponse,
                    auto_select: false, // Don't auto-select, let user choose
                    cancel_on_tap_outside: true,
                    context: "signin",
                });

                // Display the One Tap prompt
                window.google.accounts.id.prompt((notification) => {
                    if (notification.isNotDisplayed()) {
                        console.log(
                            "Google One Tap not displayed:",
                            notification.getNotDisplayedReason()
                        );
                    }
                    if (notification.isSkippedMoment()) {
                        console.log(
                            "Google One Tap skipped:",
                            notification.getSkippedReason()
                        );
                    }
                });
            }
        };

        document.head.appendChild(script);

        return () => {
            // Cleanup
            if (window.google) {
                window.google.accounts.id.cancel();
            }
            const existingScript = document.querySelector(
                'script[src="https://accounts.google.com/gsi/client"]'
            );
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [clientId, status, handleCredentialResponse]);

    // This component doesn't render anything - it's just for the One Tap popup
    return null;
}
