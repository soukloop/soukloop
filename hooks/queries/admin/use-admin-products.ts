import { useQuery } from '@tanstack/react-query'

const fetcher = (url: string) => fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch')
    return res.json()
})

/**
 * Hook to fetch all products for admin dashboard
 */
export function useAdminProducts() {
    return useQuery({
        queryKey: adminProductsKeys.all,
        queryFn: () => fetcher('/api/admin?type=products'),
    })
}

/**
 * Hook to fetch single product detail with all related data
 * Includes chats, reviews, and reports tabs
 */
export function useAdminProductDetail(productId: string) {
    return useQuery({
        queryKey: adminProductsKeys.detail(productId),
        queryFn: () => fetcher(`/api/admin/products/${productId}`),
        enabled: !!productId,
    })
}

/**
 * Centralized query keys for products
 */
export const adminProductsKeys = {
    all: ['admin', 'products'] as const,
    detail: (id: string) => ['admin', 'products', id] as const,
}
