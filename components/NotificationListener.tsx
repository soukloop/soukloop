'use client'

import { useEffect, useRef } from 'react'
import { useNotifications } from '@/hooks/useNotifications'
import { useSession, signOut } from 'next-auth/react'
import { useSocket } from '@/components/providers/socket-provider'
import { usePathname, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { checkSuspensionStatus } from '@/features/auth/actions'

export function NotificationListener() {
    const { notifications } = useNotifications()
    const { data: session, status, update } = useSession()

    // Store IDs we've already notified about to prevent duplicates
    const notifiedIdsRef = useRef<Set<string>>(new Set())
    const isFirstMount = useRef(true)

    // Reset verified IDs when auth state changes
    useEffect(() => {
        if (status === 'unauthenticated') {
            notifiedIdsRef.current.clear()
        }

        // Force signout if session is active but user is suspended
        const verifyStatus = async () => {
            if (status === 'authenticated') {
                const isActive = await checkSuspensionStatus()
                if (isActive === false) {
                    console.warn('[NotificationListener] User is suspended (Server Verified). Forcing signout...');
                    await signOut({ callbackUrl: '/', redirect: true });
                }
            }
        }

        verifyStatus()
    }, [status, session])

    useEffect(() => {
        if (!notifications || notifications.length === 0) return

        if (isFirstMount.current) {
            // On first load, mark all current notifications as "seen" 
            // so we don't spam the user with old toasts
            notifications.forEach(n => notifiedIdsRef.current.add(n.id))
            isFirstMount.current = false
            return
        }

        // Find new notifications that we haven't shown a toast for yet
        const newNotifications = notifications.filter(n => !notifiedIdsRef.current.has(n.id))

        // Show toasts for new ones
        newNotifications.forEach(async (notification) => {
            // Add to verified set immediately
            notifiedIdsRef.current.add(notification.id)

            // Map notification type to Sonner toast method
            const t = notification.type as string;
            const isSuccess = t.includes('SUCCESS') ||
                t.includes('APPROVED') ||
                t === 'ACCOUNT_ACTIVATED'
            const isError = t.includes('FAILED') ||
                t.includes('REJECTED') ||
                t === 'ACCOUNT_SUSPENDED'

            // Show toast using Sonner
            if (isError) {
                toast.error(notification.title, { duration: 4000 })
            } else if (isSuccess) {
                toast.success(notification.title, { duration: 4000 })
            } else {
                toast.info(notification.title, { duration: 4000 })
            }

            // Check for critical updates directly from standard notifications too
            const t2 = notification.type as string;
            if (t2 === 'ROLE_UPDATED' ||
                t2 === 'ACCOUNT_ACTIVATED' ||
                t2 === 'ACCOUNT_SUSPENDED' ||
                t2.includes('APPROVED') ||
                t2.includes('REJECTED')
            ) {
                console.log('[NotificationListener] Critical account update received. Verifying status...');
                const isActive = await checkSuspensionStatus();
                if (isActive === false) {
                    console.warn('[NotificationListener] Suspension confirmed. Redirecting...');
                    await signOut({ callbackUrl: '/', redirect: true });
                } else {
                    // Still try to update session for other changes (like role), but don't block
                    await update();
                }
            }
        })
    }, [notifications, update])

    // Socket.io legacy code removed.
    // Use Centrifugo provider for real-time updates.

    return null
}

