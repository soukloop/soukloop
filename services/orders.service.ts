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
  const status = getOverallStatus(order as any);

  // Custom mapping for Title Case display
  const statusMap: Record<string, string> = {
    'PENDING': 'Pending',
    'PARTIAL': 'Partial Progress',
    'DELIVERED': 'Delivered',
    'SHIPPED': 'Shipped',
    'PROCESSING': 'Processing',
    'CANCELED': 'Canceled',
    'REFUNDED': 'Refunded',
    'PAID': 'Paid'
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

// Get overall status for a CustomerOrder or a single VendorOrder
export function getOverallStatus(order: any): 'PENDING' | 'PARTIAL' | 'DELIVERED' | 'CANCELED' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'REFUNDED' {
  // If it's a single order (VendorOrder) and doesn't have multiple vendorOrders under it, use its own status
  if (order.status && (!order.vendorOrders || order.vendorOrders.length === 0)) {
    return order.status.toUpperCase() as any;
  }

  const vendorOrders = order.vendorOrders || []
  const total = vendorOrders.length

  if (total === 0) return (order.status?.toUpperCase() as any) || 'PENDING'

  // Granular check for multiple shipments
  const statuses = vendorOrders.map((vo: any) => vo.status.toUpperCase());
  const uniqueStatuses = Array.from(new Set(statuses));

  // If all shipments have the EXACT same status, use that as the overall status
  if (uniqueStatuses.length === 1) {
    return uniqueStatuses[0] as any;
  }

  const delivered = vendorOrders.filter((vo: any) => vo.status === 'DELIVERED').length
  const canceled = vendorOrders.filter((vo: any) => vo.status === 'CANCELED').length
  const shipped = vendorOrders.filter((vo: any) => vo.status === 'SHIPPED').length

  if (canceled === total) return 'CANCELED'
  if (delivered === total) return 'DELIVERED'

  // Mixed state: if any are delivered or shipped, it's at least Partial
  if (delivered > 0 || shipped > 0) return 'PARTIAL'

  // Default to PENDING if nothing is moving yet
  return 'PENDING'
}
