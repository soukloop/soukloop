import { apiGet, apiPost, type ApiResponse } from '../lib/api'
import type { Vendor, Product, Order } from '../types/api'

// Vendors service functions
export async function enableVendor(storeName: string): Promise<ApiResponse<Vendor>> {
  return apiPost<Vendor>('/api/vendor/enable', { storeName })
}

export async function myProducts(): Promise<ApiResponse<Product[]>> {
  return apiGet<Product[]>('/api/vendor/products')
}

export async function myOrders(): Promise<ApiResponse<Order[]>> {
  return apiGet<Order[]>('/api/vendor/orders')
}

// Example usage:
/*
// Enable vendor account
const { data: vendor, error: enableError } = await enableVendor('My Awesome Store')

if (enableError) {
  console.error('Failed to enable vendor account:', enableError.message)
} else {
  console.log('Vendor account enabled:', vendor?.storeName)
  console.log('Vendor ID:', vendor?.id)
  console.log('Status:', vendor?.isActive ? 'Active' : 'Inactive')
}

// Get vendor's products
const { data: products, error: productsError } = await myProducts()

if (productsError) {
  console.error('Failed to fetch vendor products:', productsError.message)
} else {
  console.log(`Found ${products?.length} products`)
  products?.forEach(product => {
    console.log(`- ${product.name}: $${product.price} (Stock: ${product.stock})`)
  })
}

// Get vendor's orders
const { data: orders, error: ordersError } = await myOrders()

if (ordersError) {
  console.error('Failed to fetch vendor orders:', ordersError.message)
} else {
  console.log(`Found ${orders?.length} orders`)
  orders?.forEach(order => {
    console.log(`- Order ${order.id}: ${order.status} - $${order.total}`)
    console.log(`  Items: ${order.items.length}`)
    console.log(`  Customer: ${order.userId}`)
  })
}

// Complete vendor setup workflow
export async function setupVendorWorkflow(storeName: string) {
  try {
    // Step 1: Enable vendor account
    const { data: vendor, error: enableError } = await enableVendor(storeName)
    
    if (enableError) {
      throw new Error(`Vendor setup failed: ${enableError.message}`)
    }
    
    console.log('Vendor account created successfully:', vendor?.storeName)
    
    // Step 2: Get initial products (should be empty for new vendor)
    const { data: products, error: productsError } = await myProducts()
    
    if (productsError) {
      console.warn('Could not fetch products:', productsError.message)
    } else {
      console.log(`Initial products count: ${products?.length || 0}`)
    }
    
    // Step 3: Get initial orders (should be empty for new vendor)
    const { data: orders, error: ordersError } = await myOrders()
    
    if (ordersError) {
      console.warn('Could not fetch orders:', ordersError.message)
    } else {
      console.log(`Initial orders count: ${orders?.length || 0}`)
    }
    
    return vendor
  } catch (error) {
    console.error('Vendor setup workflow failed:', error)
    throw error
  }
}

// Vendor dashboard data aggregation
export async function getVendorDashboard() {
  try {
    const [productsResult, ordersResult] = await Promise.all([
      myProducts(),
      myOrders()
    ])
    
    const products = productsResult.data || []
    const orders = ordersResult.data || []
    
    // Calculate dashboard metrics
    const totalProducts = products.length
    const activeProducts = products.filter(p => p.isActive).length
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0)
    
    const dashboard = {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      recentOrders: orders.slice(0, 5), // Last 5 orders
      lowStockProducts: products.filter(p => p.stock < 10) // Products with low stock
    }
    
    console.log('Vendor Dashboard:', dashboard)
    return dashboard
  } catch (error) {
    console.error('Failed to get vendor dashboard:', error)
    throw error
  }
}

// Vendor analytics example
export async function getVendorAnalytics() {
  const { data: orders, error } = await myOrders()
  
  if (error) {
    console.error('Failed to fetch orders for analytics:', error.message)
    return null
  }
  
  if (!orders) return null
  
  // Calculate analytics
  const analytics = {
    totalOrders: orders.length,
    ordersByStatus: orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1
      return acc
    }, {} as Record<string, number>),
    monthlyRevenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((acc, order) => {
        const month = new Date(order.createdAt).toISOString().slice(0, 7) // YYYY-MM
        acc[month] = (acc[month] || 0) + order.total
        return acc
      }, {} as Record<string, number>),
    averageOrderValue: orders.length > 0 
      ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length 
      : 0
  }
  
  console.log('Vendor Analytics:', analytics)
  return analytics
}
*/
