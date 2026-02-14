import { apiGet, apiPost, type ApiResponse } from '../lib/api'
import type { CustomerOrder, VendorOrder, Refund, AddressDto } from '../types/api'

// ===== BUYER ORDERS (CustomerOrder) =====

// Checkout - creates CustomerOrder with nested VendorOrders
export async function checkout(data: {
  shippingAddr: AddressDto
  billingAddr?: AddressDto
  paymentMethod?: string
  notes?: string
}): Promise<ApiResponse<CustomerOrder>> {
  return apiPost<CustomerOrder>('/api/orders/checkout', {
    shippingAddress: data.shippingAddr,
    billingAddress: data.billingAddr || data.shippingAddr,
    paymentMethod: data.paymentMethod || 'cod',
    notes: data.notes
  })
}

// List buyer's CustomerOrders (parent orders with nested vendorOrders)
export async function listOrders(): Promise<ApiResponse<CustomerOrder[]>> {
  const response = await apiGet<{ items: CustomerOrder[] }>('/api/orders')
  return {
    data: response.data?.items ?? null,
    error: response.error
  }
}

// Get a single CustomerOrder by ID
export async function getCustomerOrder(orderId: string): Promise<ApiResponse<CustomerOrder>> {
  return apiGet<CustomerOrder>(`/api/orders/${orderId}`)
}

// ===== VENDOR ORDERS (VendorOrder) =====

// List vendor's sub-orders
export async function listVendorOrders(): Promise<ApiResponse<VendorOrder[]>> {
  const response = await apiGet<any>('/api/vendor/orders')
  const items = Array.isArray(response.data)
    ? response.data
    : response.data?.items ?? []

  return {
    data: items,
    error: response.error
  }
}

// Get a single VendorOrder by ID (for vendor view)
export async function getOrder(orderId: string): Promise<ApiResponse<VendorOrder>> {
  return apiGet<VendorOrder>(`/api/orders/${orderId}`)
}

// ===== REFUNDS =====

export async function refund(orderId: string): Promise<ApiResponse<Refund>> {
  return apiPost<Refund>(`/api/orders/${orderId}/refund`, {})
}

// ===== HELPER FUNCTIONS =====

// Get delivery status text for a CustomerOrder
export function getDeliveryStatusText(order: CustomerOrder): string {
  const vendorOrders = order.vendorOrders || []
  const total = vendorOrders.length
  const delivered = vendorOrders.filter(vo => vo.status === 'DELIVERED').length

  if (total === 0) return 'Processing'
  if (delivered === total) return 'Delivered'
  if (delivered === 0) {
    // Check if any are shipped
    const shipped = vendorOrders.filter(vo => vo.status === 'PAID').length
    if (shipped > 0) return `${shipped} of ${total} Shipped`
    return 'Processing'
  }
  return `${delivered} of ${total} Delivered`
}

// Get overall status for a CustomerOrder
export function getOverallStatus(order: CustomerOrder): 'PENDING' | 'PARTIAL' | 'DELIVERED' | 'CANCELED' {
  const vendorOrders = order.vendorOrders || []
  const total = vendorOrders.length

  if (total === 0) return 'PENDING'

  const delivered = vendorOrders.filter(vo => vo.status === 'DELIVERED').length
  const canceled = vendorOrders.filter(vo => vo.status === 'CANCELED').length

  if (canceled === total) return 'CANCELED'
  if (delivered === total) return 'DELIVERED'
  if (delivered > 0) return 'PARTIAL'
  return 'PENDING'
}
