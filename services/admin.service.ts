import { apiGet, apiPatch, type ApiResponse } from '../lib/api'

// ===== ADMIN PRODUCTS =====
export interface AdminProduct {
  id: string
  title: string
  priceCents: number
  stock: number
  isActive: boolean
  createdAt: string
  vendor: {
    id: string
    storeName: string
    userId: string
  }
}

export async function listAdminProducts(): Promise<ApiResponse<AdminProduct[]>> {
  return apiGet<AdminProduct[]>('/api/admin?type=products')
}

export async function moderateProduct(
  productId: string, 
  action: 'approve' | 'reject',
  reason?: string
): Promise<ApiResponse<{ success: boolean; message: string; product: AdminProduct }>> {
  return apiPatch(`/api/admin`, { type: 'product', productId, action, reason })
}

// ===== ADMIN VENDORS =====
export interface AdminVendor {
  id: string
  storeName: string
  slug: string
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  isActive: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  _count: {
    products: number
    orders: number
  }
}

export interface AdminVendorsResponse {
  vendors: AdminVendor[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  stats: {
    totalVendors: number
    activeVendors: number
    kycCounts: Record<string, number>
  }
}

export async function listAdminVendors(params?: {
  page?: number
  limit?: number
  kycStatus?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}): Promise<ApiResponse<AdminVendorsResponse>> {
  const queryParams = new URLSearchParams()
  queryParams.set('type', 'vendors')
  if (params?.kycStatus) queryParams.set('kycStatus', params.kycStatus)
  
  const url = `/api/admin?${queryParams.toString()}`
  return apiGet<AdminVendorsResponse>(url)
}

export async function updateVendorKyc(
  vendorId: string,
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED',
  reason?: string
): Promise<ApiResponse<{ success: boolean; message: string; vendor: AdminVendor }>> {
  return apiPatch('/api/admin', { type: 'vendor', vendorId, kycStatus, reason })
}
