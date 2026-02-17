import useSWR from 'swr'
import { useAuth } from './useAuth'
import type { Product, Order } from '../types/api'
import { isAtLeastSeller } from '@/lib/roles'

// ===== SIMPLIFIED SELLER HOOK (No Vendor Table) =====
// Uses User role directly instead of separate Vendor table
export function useVendor() {
  const { user, refreshSession } = useAuth()

  // Check if user has at least the Seller hierarchy level
  const isSeller = isAtLeastSeller(user?.role);

  // My products query (seller's own products)
  const { data: myProductsData, error: productsError, isLoading: isLoadingProducts, mutate: mutateProducts } = useSWR(
    isSeller && user?.id ? `/api/products?userId=${user.id}` : null,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch products')
      const data = await res.json()
      return data.items || []
    }
  )

  // My orders query (orders for seller's products)
  const { data: myOrdersData, error: ordersError, isLoading: isLoadingOrders, mutate: mutateOrders } = useSWR(
    isSeller ? '/api/orders?role=seller' : null,
    async (url) => {
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch orders')
      const data = await res.json()
      return data.items || []
    }
  )

  // Enable seller function - Simply changes user role to SELLER
  // This is permanent and cannot be reversed
  const enableSellerAction = async () => {
    try {
      const res = await fetch('/api/user/become-seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to become seller')
      }

      // Refresh session to get updated role
      await refreshSession()
      return true
    } catch (error) {
      console.error('Enable seller error:', error)
      throw error
    }
  }

  return {
    // Seller status
    isSeller,

    // Enable seller (formerly enableVendor)
    enableSeller: enableSellerAction,
    enableVendor: enableSellerAction, // Backward compatibility

    // My products
    myProducts: myProductsData,
    isLoadingProducts,
    isErrorProducts: !!productsError,
    productsError,

    // My orders
    myOrders: myOrdersData,
    isLoadingOrders,
    isErrorOrders: !!ordersError,
    ordersError,

    // Refresh functions
    refreshProducts: mutateProducts,
    refreshOrders: mutateOrders,

    // Combined states
    isAnyLoading: isLoadingProducts || isLoadingOrders,

    // Legacy compatibility (vendorProfile is now just user profile)
    vendorProfile: user ? {
      id: user.id,
      userId: user.id,
      createdAt: new Date().toISOString()
    } : null,
    isLoadingProfile: false,
    isErrorProfile: false
  }
}

// ===== SELLER ANALYTICS UTILITY =====
export function createVendorAnalytics(myProducts?: Product[], myOrders?: Order[]) {
  const getTotalProducts = () => myProducts?.length || 0
  const getActiveProducts = () => myProducts?.filter(p => p.isActive).length || 0
  const getTotalOrders = () => myOrders?.length || 0
  const getPendingOrders = () => myOrders?.filter(o => o.status === 'PENDING').length || 0
  const getFulfilledOrders = () => myOrders?.filter(o => o.status === 'FULFILLED').length || 0
  const getTotalRevenue = () => {
    if (!myOrders) return 0
    return myOrders
      .filter(o => o.status === 'FULFILLED')
      .reduce((total, order) => total + order.total, 0)
  }
  const getAverageOrderValue = () => {
    const fulfilledOrders = myOrders?.filter(o => o.status === 'FULFILLED') || []
    if (fulfilledOrders.length === 0) return 0
    return getTotalRevenue() / fulfilledOrders.length
  }

  const getLowStockProducts = (threshold: number = 10) => {
    return myProducts?.filter(p => p.stock < threshold) || []
  }

  const getRecentOrders = (limit: number = 5) => {
    if (!myOrders) return []
    return myOrders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)
  }

  const getOrdersByStatus = (status: Order['status']) => {
    return myOrders?.filter(o => o.status === status) || []
  }

  return {
    getTotalProducts,
    getActiveProducts,
    getTotalOrders,
    getPendingOrders,
    getFulfilledOrders,
    getTotalRevenue,
    getAverageOrderValue,
    getLowStockProducts,
    getRecentOrders,
    getOrdersByStatus
  }
}

// Backward compatibility wrapper
export function useVendorAnalytics() {
  const { myProducts, myOrders } = useVendor()
  return createVendorAnalytics(myProducts || undefined, myOrders || undefined)
}

// ===== SELLER DASHBOARD HOOK =====
export function useVendorDashboard() {
  const {
    myProducts,
    myOrders,
    isLoadingProducts,
    isLoadingOrders,
    isSeller
  } = useVendor()

  const analytics = createVendorAnalytics(myProducts || undefined, myOrders || undefined)

  const isLoading = isLoadingProducts || isLoadingOrders

  return {
    isSeller,
    totalProducts: analytics.getTotalProducts(),
    activeProducts: analytics.getActiveProducts(),
    totalOrders: analytics.getTotalOrders(),
    pendingOrders: analytics.getPendingOrders(),
    fulfilledOrders: analytics.getFulfilledOrders(),
    totalRevenue: analytics.getTotalRevenue(),
    averageOrderValue: analytics.getAverageOrderValue(),
    products: myProducts || [],
    orders: myOrders || [],
    lowStockProducts: analytics.getLowStockProducts(),
    recentOrders: analytics.getRecentOrders(),
    isLoading
  }
}
