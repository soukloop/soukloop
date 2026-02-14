/**
 * Soukloop Notification System
 * 
 * This module provides a comprehensive notification system for the marketplace.
 * It supports:
 * - In-app notifications (stored in database)
 * - Email notifications (via Resend)
 * - User preference management
 * - Bulk notifications
 * - Admin notifications
 * 
 * @example
 * ```typescript
 * import { notifyOrderPlaced, notifyKycApproved } from '@/lib/notifications'
 * 
 * // In your order checkout API:
 * await notifyOrderPlaced(userId, { orderId, orderNumber, total })
 * 
 * // In your KYC approval API:
 * await notifyKycApproved(userId, { verificationId })
 * ```
 */

// Core functions
export {
    createNotification,
    createBulkNotifications,
    notifyAllAdmins,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadCount,
    cleanupOldNotifications
} from './create-notification'

// Types
export * from './types'

// Order templates
export {
    notifyOrderPlaced,
    notifySellersNewOrder,
    notifyOrderStatusChange,
    notifyOrderShipped,
    notifyOrderDelivered,
    notifyOrderCancelled
} from './templates/order-templates'

// KYC templates
export {
    notifyKycApproved,
    notifyKycRejected,
    notifyKycInfoNeeded,
    notifyKycSubmitted,
    notifyAdminsNewKycSubmission
} from './templates/kyc-templates'

// Payment templates
export {
    notifyPaymentSuccess,
    notifyPaymentFailed,
    notifyRefundRequested,
    notifyRefundProcessed,
    notifySellerRefundRequested,
    notifySellerRefundDeducted
} from './templates/payment-templates'

// Message & Product templates
export {
    notifyNewMessage,
    notifyNewReview,
    notifyNewFollower,
    notifyProductApproved,
    notifyProductRejected,
    notifyLowStock,
    notifyOutOfStock
} from './templates/message-templates'

// Admin templates
export {
    notifyNewSupportTicket,
    notifyTicketStatusUpdate,
    notifyNewReport,
    broadcastSystemAnnouncement,
    notifyPointsEarned,
    notifyPayoutProcessed
} from './templates/admin-templates'

// Product listing templates
export {
    notifySellerProductListed,
    notifyFollowersNewProduct,
    notifyReportReceived
} from './templates/product-templates'
