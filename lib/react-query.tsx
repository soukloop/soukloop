'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ReactNode, useState } from 'react'

interface ReactQueryProviderProps {
  children: ReactNode
}

export function ReactQueryProvider({ children }: ReactQueryProviderProps) {
  // Create a client inside the component to avoid serialization issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000, // 30 seconds
        retry: 2,
        refetchOnWindowFocus: true
      },
      mutations: {
        retry: 1 // Mutations typically don't retry as aggressively as queries
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Enable React Query Devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false} // Set to true to open by default
        />
      )}
    </QueryClientProvider>
  )
}

// Centralized query keys for better type safety and organization
export const queryKeys = {
  auth: ['auth'],
  products: ['products'],
  cart: ['cart'],
  orders: ['orders'],
  vendor: ['vendor'],
  reviews: ['reviews'],
  notifications: ['notifications'],
  conversations: ['conversations'],
  messages: (conversationId: string) => ['messages', conversationId],
}

// Utility functions for common cache operations
// Note: These functions should be used within components that have access to QueryClient
export const createQueryUtils = (queryClient: QueryClient) => ({
  invalidateAll: () => queryClient.invalidateQueries(),
  invalidateAuth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth }),
  invalidateProducts: () => queryClient.invalidateQueries({ queryKey: queryKeys.products }),
  invalidateCart: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart }),
  invalidateOrders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
  invalidateVendor: () => queryClient.invalidateQueries({ queryKey: queryKeys.vendor }),
  invalidateReviews: (productId?: string) => queryClient.invalidateQueries({ queryKey: productId ? queryKeys.reviews.concat(productId) : queryKeys.reviews }),
  invalidateNotifications: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  invalidateConversations: () => queryClient.invalidateQueries({ queryKey: queryKeys.conversations }),
  invalidateMessages: (conversationId: string) => queryClient.invalidateQueries({ queryKey: queryKeys.messages(conversationId) }),

  setQueryData: queryClient.setQueryData,
  getQueryData: queryClient.getQueryData,
  removeQueries: queryClient.removeQueries,
})

// Prefetching utilities
export const prefetchUtils = {
  prefetchSession: async () => {
    // Assuming auth.service.getSession exists and returns ApiResponse<User>
    // await queryClient.prefetchQuery({
    //   queryKey: queryKeys.auth,
    //   queryFn: async () => {
    //     const { data, error } = await authService.getSession();
    //     if (error) throw new Error(error.message);
    //     return data;
    //   },
    // });
  },
  // Add other prefetch functions as needed
}

// Development utilities (optional, for debugging)
export const createDevUtils = (queryClient: QueryClient) => ({
  clearAllCaches: () => {
    if (process.env.NODE_ENV === 'development') {
      queryClient.clear()
      console.log('All React Query caches cleared.')
    }
  },
  logCacheState: () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('React Query Cache State:', queryClient.getQueryCache().getAll())
    }
  },
  getCacheSize: () => {
    if (process.env.NODE_ENV === 'development') {
      return queryClient.getQueryCache().getAll().length
    }
    return 0
  }
})
