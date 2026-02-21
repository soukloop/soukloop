"use client";

import { useEffect } from 'react';
import { useSocket } from '@/components/providers/socket-provider';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * Listens for role change events from server
 * Handles: USER → SELLER, SELLER → ADMIN, demotions, etc.
 * 
 * Shows notification + auto-redirects to appropriate dashboard
 */
export function RoleChangeListener() {
    const { subscribe, isConnected } = useSocket();
    const { data: session, update } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session?.user?.id || !isConnected) return;

        const unsubscribe = subscribe(
            `user:${session.user.id}:role-changed`,
            async (ctx: any) => {
                const { newRole, oldRole, message, invalidateSession } = ctx.data;

                console.log(`[Role Change] ${oldRole} → ${newRole}`);

                // Show celebration/notification
                const isPromotion = ['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(newRole);

                toast.success(message || `Your role has been updated to ${newRole}`, {
                    duration: 5000,
                    icon: isPromotion ? '🎉' : '🔐',
                    description: isPromotion
                        ? 'Congratulations on your new permissions!'
                        : 'Your permissions have been updated'
                });

                // Wait for user to read notification
                await new Promise(resolve => setTimeout(resolve, 2000));

                if (invalidateSession) {
                    // Demotion - force re-login
                    toast.info('Please log in again with your new permissions', {
                        duration: 3000
                    });

                    setTimeout(() => {
                        window.location.href = '/?auth=login';
                    }, 1000);
                } else {
                    // Promotion or lateral move - refresh session and redirect
                    await update(); // Refresh NextAuth session
                    router.refresh(); // Refresh server components

                    // Redirect to appropriate dashboard
                    if (newRole === 'SELLER') {
                        toast.loading('Redirecting to seller dashboard...');
                        setTimeout(() => router.push('/seller/products'), 500);
                    } else if (['ADMIN', 'SUPER_ADMIN'].includes(newRole)) {
                        toast.loading('Redirecting to admin dashboard...');
                        setTimeout(() => router.push('/admin/dashboard'), 500);
                    } else {
                        // Just refresh current page with new role
                        router.refresh();
                    }
                }
            }
        );

        return unsubscribe;
    }, [session?.user?.id, isConnected, subscribe, update, router]);

    return null; // No UI rendered
}
