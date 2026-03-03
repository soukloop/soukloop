'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function AuthListenerInner() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const authParam = searchParams?.get('auth');
        const errorParam = searchParams?.get('error');

        // 1. Handle Login Modal Trigger
        if (authParam === 'login') {
            window.dispatchEvent(new CustomEvent('open-auth-modal'));

            // Clean URL
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('auth');
            router.replace(newUrl.pathname + newUrl.search + newUrl.hash, { scroll: false });
        }

        // 2. Handle Force Signout Errors (SessionExpired, AccountSuspended)
        if (errorParam) {
            import('next-auth/react').then(({ signOut }) => {
                console.log('[AuthListener] Error detected, forcing signout:', errorParam);

                // Professional UX: Notify user why they are being logged out
                import('sonner').then(({ toast }) => {
                    const messages: Record<string, string> = {
                        SessionExpired: "Your session has expired. Please log in again.",
                        AccountSuspended: "Your account has been suspended.",
                        AccountDeleted: "Your account no longer exists.",
                        Default: "Authentication error. Please log in again."
                    };

                    toast.error("Session Terminated", {
                        description: messages[errorParam] || messages.Default,
                        duration: 5000,
                    });
                });

                signOut({ redirect: true, callbackUrl: '/?auth=login' });
            });
        }
    }, [searchParams, router]);

    return null;
}

export default function AuthParamsListener() {
    return (
        <Suspense fallback={null}>
            <AuthListenerInner />
        </Suspense>
    );
}
