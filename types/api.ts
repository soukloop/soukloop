// Ecommerce API TypeScript interfaces and types

// ===== ENUMS =====
export type Role = 'USER' | 'SELLER' | 'ADMIN' | 'SUPER_ADMIN'
export type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type OrderStatus = 'PENDING' | 'PAID' | 'DELIVERED' | 'CANCELED' | 'REFUNDED' | 'PROCESSING' | 'SHIPPED'
export type PaymentProvider = 'STRIPE' | 'PAYPAL' | 'COINBASE'
export type PaymentStatus = 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
// NotificationType is defined in the NOTIFICATIONS section below

// ===== UTILITY TYPES =====
export type ApiResponse<T> = {
  data: T | null
  error: { code: string; message: string } | null
}

// ===== DTOs =====
export interface CreateMessageDto {
  conversationId: string
  body: string
  mediaUrl?: string
}

export interface CreateReviewDto {
  productId: string
  rating: number
  comment?: string
}

// ===== USER & AUTHENTICATION =====
export interface User {
  id: string
  email: string
  username: string
  name?: string | null
  image?: string | null
  roles: Role[]
  role?: Role
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  userId: string
  fullName?: string
  avatarUrl?: string
  bio?: string
}

// ===== ADDRESSES =====
export interface Address {
  id: string
  userId: string
  line1: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// ===== VENDORS =====
export interface Vendor {
  id: string
  userId: string
  slug: string
  kycStatus: KycStatus
  commissionBps: number // Commission in basis points (e.g., 250 = 2.5%)
  createdAt: string
  user?: {
    name: string | null
    email: string
  }
}

// ===== PRODUCTS =====
export interface Product {
  id: string
  vendorId: string
  title: string
  name: string
  description?: string
  priceCents: number
  stock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  alt?: string
}

export interface ProductsListResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ===== CART =====
export interface Cart {
  id: string
  userId: string
  items: CartItem[]
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  priceCents: number
  vendorId: string
}

// ===== ORDERS =====

// Parent order for customer (buyer-facing) - groups multiple vendor orders
export interface CustomerOrder {
  id: string
  userId: string
  orderNumber: string  // e.g., ORD-2026-0001
  totalAmount: number
  shippingAddress: AddressDto | Record<string, unknown>
  billingAddress: AddressDto | Record<string, unknown>
  notes?: string
  createdAt: string
  updatedAt?: string
  vendorOrders: VendorOrder[]  // Child orders per vendor
  // Computed fields for display
  deliveredCount?: number    // Number of vendor orders delivered
  totalShipments?: number    // Total number of vendor orders
}

// Vendor sub-order (vendor-facing) - linked to parent CustomerOrder
export interface VendorOrder {
  id: string
  customerOrderId?: string  // Link to parent CustomerOrder
  userId: string
  vendorId: string
  orderNumber: string
  status: OrderStatus
  subtotal: number
  tax: number
  shipping: number
  total: number
  currency: string
  shippingAddress: AddressDto | Record<string, unknown>
  billingAddress: AddressDto | Record<string, unknown>
  notes?: string
  trackingNumber?: string
  carrier?: string
  shippedAt?: string
  deliveredAt?: string
  estimatedDelivery?: string
  createdAt: string
  updatedAt?: string
  items: OrderItem[]
  vendor?: Vendor
}

// Alias for backwards compatibility
export type Order = VendorOrder

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  title: string
  quantity: number
  priceCents: number
  price?: number
  vendorId: string
  product?: Product & { images: ProductImage[] }
  listing?: { images: ProductImage[] }
}

export interface AddressDto {
  firstName: string
  lastName: string
  company?: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
}

// ===== PAYMENTS =====
export interface Payment {
  id: string
  orderId: string
  provider: PaymentProvider
  providerRef: string
  status: PaymentStatus
  amountCents: number
  currency: string
  createdAt: string
}

// ===== REFUNDS =====
export interface Refund {
  id: string
  orderId: string
  amountCents: number
  provider: PaymentProvider
  providerRef?: string
  status: 'pending' | 'approved' | 'rejected' | 'processed'
  createdAt: string
}

// ===== REVIEWS =====
export interface Review {
  id: string
  productId: string
  userId: string
  rating: number
  comment?: string
  isVerified: boolean
  createdAt: string
}

// ===== NOTIFICATIONS =====
// NotificationType - matches lib/notifications/types.ts
export type NotificationType =
  | 'ORDER_PLACED'
  | 'ORDER_CONFIRMED'
  | 'ORDER_PROCESSING'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'ORDER_CANCELLED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'REFUND_REQUESTED'
  | 'REFUND_PROCESSED'
  | 'KYC_SUBMITTED'
  | 'KYC_APPROVED'
  | 'KYC_REJECTED'
  | 'KYC_INFO_NEEDED'
  | 'PRODUCT_APPROVED'
  | 'PRODUCT_REJECTED'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'NEW_MESSAGE'
  | 'NEW_REVIEW'
  | 'NEW_FOLLOWER'
  | 'NEW_KYC_SUBMISSION'
  | 'NEW_SUPPORT_TICKET'
  | 'NEW_REPORT'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'POINTS_EARNED'
  | 'PAYOUT_PROCESSED'

export interface Notification {
  id: string
  userId: string
  type: string // NotificationType enum value
  title: string
  message: string
  data: Record<string, unknown> | null
  actionUrl?: string | null
  isRead: boolean
  emailSent?: boolean
  createdAt: string
}

export interface NotificationPreference {
  id: string
  userId: string
  inAppOrders: boolean
  inAppMessages: boolean
  inAppReviews: boolean
  inAppSystem: boolean
  emailOrders: boolean
  emailMessages: boolean
  emailMarketing: boolean
  emailDigest: 'none' | 'daily' | 'weekly'
  createdAt: string
  updatedAt: string
}

// ===== MESSAGING =====
export interface ConversationParticipant {
  id: string
  conversationId: string
  userId: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  mediaUrl?: string
  createdAt: string
}

export interface Conversation {
  id: string
  participants: ConversationParticipant[]
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

// ===== API RESPONSE TYPES =====
// ApiResponse is now defined in UTILITY TYPES section above

// ===== PAGINATION =====
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ===== SEARCH & FILTERS =====
export interface ProductFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  rating?: number
  minRating?: string | number
  tags?: string[]
  condition?: string
  size?: string
  gender?: string
  fabric?: string
  occasion?: string
  onSale?: boolean
  location?: string
  dress?: string
  userId?: string
  includePending?: boolean
  sold?: boolean
  includeInactive?: boolean
}

export interface SearchParams extends PaginationParams, ProductFilters {
  q?: string
}

// ===== FORM TYPES =====
export interface CreateProductDto {
  name: string
  description?: string
  price: number
  category: string
  brand?: string
  sku?: string
  stock: number
  images?: Omit<ProductImage, 'id'>[]
  tags?: string[]
}

export type UpdateProductDto = Partial<CreateProductDto>

export interface CreateUserDto {
  email: string
  username: string
  password: string
  fullName?: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface UpdateUserProfileDto {
  fullName?: string
  bio?: string
  avatarUrl?: string
}

// ===== VENDOR TYPES =====
export interface VendorProfile {
  id: string
  slug: string
  description?: string
  logo?: string
  banner?: string
  isActive: boolean
  isVerified: boolean
  rating: number
  totalSales: number
  totalProducts: number
  categories: string[]
  user?: {
    name: string | null
    email: string
  }
  contactInfo: {
    email: string
    phone?: string
    website?: string
    address?: AddressDto
  }
  bankInfo?: {
    accountNumber: string
    routingNumber: string
    accountHolderName: string
  }
  taxInfo?: {
    taxId: string
    businessType: string
  }
  createdAt: string
  updatedAt: string
}

// ===== ANALYTICS TYPES =====
export interface SalesAnalytics {
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  salesByMonth: Record<string, number>
  topProducts: Array<{
    productId: string
    productName: string
    sales: number
    revenue: number
  }>
}

export interface VendorAnalytics {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  recentOrders: Order[]
  lowStockProducts: Product[]
}

// ===== ERROR TYPES =====
export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: string
}

// ===== WEBHOOK TYPES =====
export interface WebhookEvent {
  id: string
  type: string
  data: Record<string, unknown>
  createdAt: string
}

// All types are already exported above as interfaces