import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSocket } from '@/components/providers/socket-provider'
import { useRouter } from 'next/navigation'

// Import all admin query keys
// Users are now Server Components, so we don't need RQ keys for them
import { adminProductsKeys } from './queries/admin/use-admin-products'
import { adminOrdersKeys } from './queries/admin/use-admin-orders'

/**
 * Real-Time Admin Dashboard Sync Hook
 * 
 * Subscribes to Centrifugo events and automatically invalidates React Query cache
 * OR triggers Server Component refresh when admin data changes.
 */
export function useAdminRealtime() {
    const queryClient = useQueryClient()
    const { subscribe, isConnected } = useSocket()
    const router = useRouter()

    useEffect(() => {
        if (!isConnected) {
            console.log('[Admin Realtime] Centrifugo not connected, falling back to polling')
            return
        }

        console.log('[Admin Realtime] Connected - subscribing to admin-updates channel')

        // Subscribe to the public admin updates channel
        const unsubscribe = subscribe('public:admin-updates', (ctx) => {
            const { entity, action, id } = ctx.data

            console.log('[Admin Realtime] Event received:', { entity, action, id })

            // Invalidate appropriate cache based on entity type
            switch (entity) {
                case 'user':
                case 'seller':
                case 'vendor':
                case 'kyc':
                case 'verification':
                    // These are now Server Components.
                    // We need to refresh the current route to re-fetch data on the server.
                    // Ideally, we'd only refresh if we are on a relevant page, but simpler to just refresh.
                    console.log('[Admin Realtime] Refreshing Server Components for:', entity);
                    router.refresh();
                    break

                case 'product':
                    queryClient.invalidateQueries({ queryKey: adminProductsKeys.all })
                    if (id) {
                        queryClient.invalidateQueries({ queryKey: adminProductsKeys.detail(id) })
                    }
                    break

                case 'order':
                    queryClient.invalidateQueries({ queryKey: adminOrdersKeys.all })
                    if (id) {
                        queryClient.invalidateQueries({ queryKey: adminOrdersKeys.detail(id) })
                    }
                    break

                default:
                    // For unknown entities, do a broad refresh + invalidation
                    console.warn('[Admin Realtime] Unknown entity type:', entity)
                    queryClient.invalidateQueries({ queryKey: ['admin'] })
                    router.refresh()
            }
        })

        return () => {
            console.log('[Admin Realtime] Unsubscribing from admin-updates')
            unsubscribe()
        }
    }, [isConnected, subscribe, queryClient, router])
}
