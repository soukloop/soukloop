"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { useSocket } from '@/components/providers/socket-provider';
import { useSession } from 'next-auth/react';

/**
 * Listens for session invalidation events from server
 * Handles: account deletion, suspension, password changes, role changes
 * 
 * Place in root layout to enable global session invalidation handling
 */
export function SessionInvalidationListener() {
    const { subscribe, isConnected } = useSocket();
    const { data: session } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (!session?.user?.id || !isConnected) return;

        // Listen for session invalidation events
        const unsubscribe = subscribe(
            `user:${session.user.id}:session-invalidated`,
            async (ctx: any) => {
                const { reason, message, requireReauth } = ctx.data;

                console.log('[Session] Invalidation received:', reason);

                // Show notification to user
                toast.error(message || reason || 'Your session has been terminated', {
                    duration: 5000,
                    icon: '🔒',
                    description: requireReauth ? 'Please log in again' : undefined
                });

                // Wait 2 seconds so user can read the message
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Sign out and redirect to login
                await signOut({ redirect: false });
                router.push('/?auth=login');
            }
        );

        return unsubscribe;
    }, [session?.user?.id, isConnected, subscribe, router]);

    return null; // No UI rendered
}
