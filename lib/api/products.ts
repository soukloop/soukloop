'use server'

import { httpGet, type ApiResponse } from '../http'

// Define product type as used by your backend
export interface ProductSummary {
  id: string
  name: string
  price: number
  imageUrl?: string
}

export interface ProductsListResponse {
  items: ProductSummary[]
  total: number
  page: number
  pageSize: number
}

export async function fetchProducts(params: { page?: number; pageSize?: number; q?: string } = {}): Promise<ApiResponse<ProductsListResponse>> {
  const { page = 1, pageSize = 12, q } = params
  return httpGet<ProductsListResponse>(
    '/products',
    { page, pageSize, q },
    { cache: 60 }, // ISR: revalidate every 60s
  )
}

export interface ProductDetail extends ProductSummary {
  description?: string
  images?: string[]
  stock?: number
}

export async function fetchProductById(productId: string): Promise<ApiResponse<ProductDetail>> {
  return httpGet<ProductDetail>(`/products/${productId}`, undefined, { cache: 120 })
}


