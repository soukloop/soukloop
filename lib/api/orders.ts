'use server'

import { httpGet, httpPost, httpPatch, type ApiResponse } from '../http'

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  productId: string
  quantity: number
  price: number
  name: string
}

export interface CreateOrderRequest {
  items: Omit<OrderItem, 'name'>[]
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export interface UpdateOrderStatusRequest {
  status: Order['status']
  trackingNumber?: string
}

export async function fetchOrders(params: { 
  userId?: string
  status?: Order['status']
  page?: number
  pageSize?: number 
} = {}): Promise<ApiResponse<{ items: Order[]; total: number; page: number; pageSize: number }>> {
  const { userId, status, page = 1, pageSize = 10 } = params
  return httpGet<{ items: Order[]; total: number; page: number; pageSize: number }>(
    '/orders',
    { userId, status, page, pageSize },
    { cache: 30 }
  )
}

export async function fetchOrderById(orderId: string): Promise<ApiResponse<Order>> {
  return httpGet<Order>(`/orders/${orderId}`, undefined, { cache: 60 })
}

export async function createOrder(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
  return httpPost<Order>('/orders', orderData)
}

export async function updateOrderStatus(orderId: string, updates: UpdateOrderStatusRequest): Promise<ApiResponse<Order>> {
  return httpPatch<Order>(`/orders/${orderId}/status`, updates)
}
