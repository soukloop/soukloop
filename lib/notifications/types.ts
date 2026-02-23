/**
 * NotificationType - String union type matching the schema enum values
 * Stored as String in database for flexibility with existing data
 */
export type NotificationType =
    // Order-related
    | 'ORDER_PLACED'
    | 'ORDER_CONFIRMED'
    | 'ORDER_PROCESSING'
    | 'ORDER_SHIPPED'
    | 'ORDER_DELIVERED'
    | 'ORDER_CANCELLED'
    // Payment-related
    | 'PAYMENT_SUCCESS'
    | 'PAYMENT_FAILED'
    | 'REFUND_REQUESTED'
    | 'REFUND_PROCESSED'
    | 'REFUND_DEDUCTED'
    // Seller KYC
    | 'KYC_SUBMITTED'
    | 'KYC_APPROVED'
    | 'KYC_REJECTED'
    | 'KYC_INFO_NEEDED'
    // Products
    | 'PRODUCT_LISTED'
    | 'NEW_PRODUCT_FROM_FOLLOWED'
    | 'PRODUCT_APPROVED'
    | 'PRODUCT_REJECTED'
    | 'LOW_STOCK'
    | 'OUT_OF_STOCK'
    // Communication
    | 'NEW_MESSAGE'
    | 'NEW_REVIEW'
    | 'NEW_FOLLOWER'
    // Admin alerts
    | 'NEW_KYC_SUBMISSION'
    | 'NEW_SUPPORT_TICKET'
    | 'NEW_REPORT'
    // System
    | 'SYSTEM_ANNOUNCEMENT'
    | 'POINTS_EARNED'
    | 'PAYOUT_PROCESSED'
    // Account Status
    | 'ACCOUNT_ACTIVATED'
    | 'ACCOUNT_SUSPENDED'
    | 'ACCOUNT_UPDATED'
    // Auth & Security
    | 'ACCOUNT_CREATED'
    | 'ACCOUNT_VERIFIED'
    | 'PASSWORD_RESET'
    | 'PASSWORD_CHANGED'
    | 'ACCOUNT_DELETED'
    | 'SELLER_WELCOME'
    // Finance
    | 'WITHDRAWAL_REQUEST'
    | 'WITHDRAWAL_PROCESSED'
    | 'WITHDRAWAL_REJECTED'
    | 'BANK_ACCOUNT_ADDED'
    // System
    | 'SYSTEM_ALERT'

/**
 * Input for creating a single notification
 */
export interface CreateNotificationInput {
    userId?: string
    adminUserId?: string
    type: NotificationType
    title: string
    message: string
    data?: Record<string, unknown>
    actionUrl?: string
    sendEmail?: boolean
    emailSubject?: string
    emailHtml?: string  // Pre-rendered HTML (legacy)
    emailReact?: React.ReactElement  // React Email component (preferred)
}

/**
 * Input for creating bulk notifications
 */
export interface BulkNotificationInput {
    userIds: string[]
    type: NotificationType
    title: string
    message: string
    data?: Record<string, unknown>
    actionUrl?: string
}

/**
 * Notification template definition
 */
export interface NotificationTemplate {
    type: NotificationType
    title: string | ((data: Record<string, unknown>) => string)
    message: string | ((data: Record<string, unknown>) => string)
    actionUrl?: string | ((data: Record<string, unknown>) => string)
    shouldEmail: boolean
    emailSubject?: string | ((data: Record<string, unknown>) => string)
}

/**
 * Category type for notification preferences
 */
export type NotificationCategory = 'orders' | 'messages' | 'reviews' | 'system'

/**
 * Maps notification types to their preference categories
 * Used to check user preferences before creating notifications
 */
export const NOTIFICATION_CATEGORY_MAP: Record<NotificationType, NotificationCategory> = {
    // Order-related → orders
    ORDER_PLACED: 'orders',
    ORDER_CONFIRMED: 'orders',
    ORDER_PROCESSING: 'orders',
    ORDER_SHIPPED: 'orders',
    ORDER_DELIVERED: 'orders',
    ORDER_CANCELLED: 'orders',

    // Payment-related → orders
    PAYMENT_SUCCESS: 'orders',
    PAYMENT_FAILED: 'orders',
    REFUND_REQUESTED: 'orders',
    REFUND_PROCESSED: 'orders',
    REFUND_DEDUCTED: 'orders',

    // KYC → system
    KYC_SUBMITTED: 'system',
    KYC_APPROVED: 'system',
    KYC_REJECTED: 'system',
    KYC_INFO_NEEDED: 'system',

    // Products → system
    PRODUCT_LISTED: 'system',
    NEW_PRODUCT_FROM_FOLLOWED: 'system',
    PRODUCT_APPROVED: 'system',
    PRODUCT_REJECTED: 'system',
    LOW_STOCK: 'system',
    OUT_OF_STOCK: 'system',

    // Communication
    NEW_MESSAGE: 'messages',
    NEW_REVIEW: 'reviews',
    NEW_FOLLOWER: 'system',

    // Admin alerts → system
    NEW_KYC_SUBMISSION: 'system',
    NEW_SUPPORT_TICKET: 'system',
    NEW_REPORT: 'system',

    // System
    SYSTEM_ANNOUNCEMENT: 'system',
    POINTS_EARNED: 'system',
    PAYOUT_PROCESSED: 'orders',

    // Account Status
    ACCOUNT_ACTIVATED: 'system',
    ACCOUNT_SUSPENDED: 'system',
    ACCOUNT_UPDATED: 'system',

    // Auth & Security
    ACCOUNT_CREATED: 'system',
    ACCOUNT_VERIFIED: 'system',
    PASSWORD_RESET: 'system',
    PASSWORD_CHANGED: 'system',
    ACCOUNT_DELETED: 'system',
    SELLER_WELCOME: 'system',

    // Finance → requests are system or orders? Let's say system for admins, orders for users?
    WITHDRAWAL_REQUEST: 'system',
    WITHDRAWAL_PROCESSED: 'orders', // Money related usually goes with orders/wallet
    WITHDRAWAL_REJECTED: 'system',
    BANK_ACCOUNT_ADDED: 'system',

    // System Alerts
    SYSTEM_ALERT: 'system',
}

/**
 * Notification icons by type (for frontend use)
 */
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
    ORDER_PLACED: '🛍️',
    ORDER_CONFIRMED: '✅',
    ORDER_PROCESSING: '⚙️',
    ORDER_SHIPPED: '🚚',
    ORDER_DELIVERED: '📦',
    ORDER_CANCELLED: '❌',
    PAYMENT_SUCCESS: '💳',
    PAYMENT_FAILED: '⚠️',
    REFUND_REQUESTED: '🔄',
    REFUND_PROCESSED: '💰',
    REFUND_DEDUCTED: '💸',
    KYC_SUBMITTED: '📋',
    KYC_APPROVED: '🎉',
    KYC_REJECTED: '❌',
    KYC_INFO_NEEDED: '📝',
    PRODUCT_LISTED: '📦',
    NEW_PRODUCT_FROM_FOLLOWED: '🛍️',
    PRODUCT_APPROVED: '✅',
    PRODUCT_REJECTED: '❌',
    LOW_STOCK: '📉',
    OUT_OF_STOCK: '🚫',
    NEW_MESSAGE: '💬',
    NEW_REVIEW: '⭐',
    NEW_FOLLOWER: '👤',
    NEW_KYC_SUBMISSION: '📋',
    NEW_SUPPORT_TICKET: '🎫',
    NEW_REPORT: '🚩',
    SYSTEM_ANNOUNCEMENT: '📢',
    POINTS_EARNED: '🎁',
    PAYOUT_PROCESSED: '💵',
    ACCOUNT_ACTIVATED: '✅',
    ACCOUNT_SUSPENDED: '🚫',
    ACCOUNT_UPDATED: 'ℹ️',
    ACCOUNT_CREATED: '👋',
    ACCOUNT_VERIFIED: '✅',
    PASSWORD_RESET: '🔑',
    PASSWORD_CHANGED: '🔐',
    ACCOUNT_DELETED: '👋',
    SELLER_WELCOME: '🎉',
    WITHDRAWAL_REQUEST: '💸',
    WITHDRAWAL_PROCESSED: '💰',
    WITHDRAWAL_REJECTED: '❌',
    BANK_ACCOUNT_ADDED: '🏦',
    SYSTEM_ALERT: '🚨',
}
