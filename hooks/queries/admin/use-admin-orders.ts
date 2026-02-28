import { useQuery } from '@tanstack/react-query'

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
})

/**
 * Hook to fetch all orders for admin dashboard
 */
export function useAdminOrders() {
    return useQuery({
        queryKey: adminOrdersKeys.all,
        queryFn: () => fetcher('/api/admin/orders?limit=50'),
    })
}

/**
 * Centralized query keys for orders
 */
export const adminOrdersKeys = {
    all: ['admin', 'orders'] as const,
    detail: (id: string) => ['admin', 'orders', id] as const,
}
