"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { useSocket } from '@/components/providers/socket-provider';

/**
 * Listens for real-time account status changes.
 * Handles:
 * 1. Verification Status updates (Approved/Rejected) -> Soft Refresh
 * 2. Account Suspension/Deletion -> Force Logout
 */
export function AccountStatusListener() {
    const { subscribe, isConnected } = useSocket();
    const { data: session, update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session?.user?.id || !isConnected) return;

        const channel = `personal:${session.user.id}`;

        const unsubscribe = subscribe(channel, async (ctx: any) => {
            const data = ctx.data?.data || ctx.data; // Handle nested vs flat structure
            const type = data?.type;

            console.log('[AccountStatus] Received event:', type, data);

            // --- CASE 1: VERIFICATION UPDATES (Refresh Page) ---
            if (
                type?.includes('VERIFICATION') ||
                type?.includes('SELLER_APPROVED') ||
                type === 'VERIFICATION_SUBMITTED' ||
                type === 'VERIFICATION_APPROVED' ||
                type === 'VERIFICATION_REJECTED' ||
                type === 'SESSION_REFRESH'  // <--- Added generic refresh event
            ) {
                // Determine message based on type
                let message = "Your account status has been updated.";
                let icon = "🔔";

                if (type.includes('APPROVED')) {
                    message = "Congratulations! Your seller application was approved.";
                    icon = "🎉";
                } else if (type.includes('REJECTED')) {
                    message = "Update on your seller application.";
                    icon = "📝";
                } else if (type === 'SESSION_REFRESH') {
                    message = "Profile updated. Refreshing...";
                    icon = "🔄";
                }

                // Show Toast
                toast.dismiss(); // Dismiss older toasts to reduce clutter
                toast.success(message, { icon, duration: 5000 });

                // Update Session (in case role changed)
                if (type.includes('APPROVED') || type === 'SESSION_REFRESH') {
                    await update();
                }

                // **CRITICAL:** Soft Refresh the current page to reflect new data
                console.log('[AccountStatus] Triggering router.refresh()');
                router.refresh();
            }

            // --- CASE 2: SUSPENSION / DELETION (Force Logout) ---
            if (
                type === 'USER_SUSPENDED' ||
                type === 'ACCOUNT_SUSPENDED' ||
                type === 'USER_BANNED' ||
                type === 'ACCOUNT_DELETED'
            ) {
                console.warn('[AccountStatus] Critical account status change:', type);

                toast.error("Your account has been suspended or deleted.", {
                    duration: 10000,
                    icon: "🚫"
                });

                // Short delay to let user see the message, then force logout
                setTimeout(async () => {
                    await signOut({ redirect: true, callbackUrl: "/?error=AccountSuspended" });
                }, 2000);
            }
        });

        return unsubscribe;
    }, [session?.user?.id, isConnected, subscribe, router, update]);

    return null;
}
