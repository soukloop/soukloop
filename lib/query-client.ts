import { QueryClient } from '@tanstack/react-query'

/**
 * Global QueryClient instance for React Query
 * 
 * Configuration optimized for admin dashboard with real-time updates:
 * - staleTime: 30s - Data considered fresh for 30 seconds
 * - gcTime: 5min - Unused data cached for 5 minutes before garbage collection
 * - refetchOnWindowFocus: true - Refetch when tab regains focus
 * - refetchOnReconnect: true - Refetch when network reconnects
 * - retry: 1 - Retry failed requests once before giving up
 */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30 * 1000, // 30 seconds
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
            retry: 1,
            // Disable automatic refetching on mount to prevent duplicate requests
            // Centrifugo will handle real-time updates instead
            refetchOnMount: false,
        },
    },
})
