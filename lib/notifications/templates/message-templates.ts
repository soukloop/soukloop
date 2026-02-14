import { createNotification } from '../create-notification'

interface MessageData {
    conversationId: string
    senderName: string
    senderId: string
    productName?: string
    productId?: string
    preview?: string
}

interface ReviewData {
    productId: string
    productName: string
    rating: number
    comment?: string
    reviewerName?: string
}

/**
 * Notify user about new chat message
 */
export async function notifyNewMessage(recipientId: string, data: MessageData) {
    // Truncate preview to reasonable length
    const previewText = data.preview
        ? data.preview.length > 60
            ? `"${data.preview.substring(0, 60)}..."`
            : `"${data.preview}"`
        : null

    const message = previewText
        ? `${data.senderName}: ${previewText}`
        : `${data.senderName} sent you a message${data.productName ? ` about "${data.productName}"` : ''}`

    return createNotification({
        userId: recipientId,
        type: 'NEW_MESSAGE',
        title: `💬 New message from ${data.senderName}`,
        message,
        data,
        actionUrl: `/chats?conversation=${data.conversationId}`,
        sendEmail: false // Messages are usually too frequent for email
    })
}

/**
 * Notify seller about new product review
 */
export async function notifyNewReview(sellerId: string, data: ReviewData) {
    const stars = '⭐'.repeat(Math.min(data.rating, 5))

    const commentPreview = data.comment
        ? data.comment.length > 50
            ? `"${data.comment.substring(0, 50)}..."`
            : `"${data.comment}"`
        : ''

    const message = data.comment
        ? `${commentPreview} on ${data.productName}`
        : `${data.reviewerName || 'Someone'} rated your product "${data.productName}"`

    return createNotification({
        userId: sellerId,
        type: 'NEW_REVIEW',
        title: `New ${data.rating}-Star Review ${stars}`,
        message,
        data,
        actionUrl: `/product/${data.productId}`,
        sendEmail: data.rating <= 2 // Only email for negative reviews
    })
}

/**
 * Notify user about new follower
 */
export async function notifyNewFollower(
    userId: string,
    data: { followerId: string; followerName: string }
) {
    return createNotification({
        userId,
        type: 'NEW_FOLLOWER',
        title: 'New Follower! 👤',
        message: `${data.followerName} started following you.`,
        data,
        actionUrl: '/profile',
        sendEmail: false
    })
}

/**
 * Notify seller about product approval
 */
export async function notifyProductApproved(
    sellerId: string,
    data: { productId: string; productName: string }
) {
    return createNotification({
        userId: sellerId,
        type: 'PRODUCT_APPROVED',
        title: 'Product Approved! ✅',
        message: `Your product "${data.productName}" has been approved and is now live on the marketplace.`,
        data,
        actionUrl: `/product/${data.productId}`,
        sendEmail: true,
        emailSubject: 'Your Product Has Been Approved!'
    })
}

/**
 * Notify seller about product rejection
 */
export async function notifyProductRejected(
    sellerId: string,
    data: { productId: string; productName: string; reason?: string }
) {
    const reasonText = data.reason ? ` Reason: ${data.reason}` : ''

    return createNotification({
        userId: sellerId,
        type: 'PRODUCT_REJECTED',
        title: 'Product Not Approved ❌',
        message: `Your product "${data.productName}" was not approved.${reasonText}`,
        data,
        actionUrl: '/seller/manage-listings',
        sendEmail: true,
        emailSubject: 'Update on Your Product Listing'
    })
}

/**
 * Notify seller about low stock
 */
export async function notifyLowStock(
    sellerId: string,
    data: { productId: string; productName: string; currentStock: number; threshold?: number }
) {
    return createNotification({
        userId: sellerId,
        type: 'LOW_STOCK',
        title: 'Low Stock Alert! 📉',
        message: `"${data.productName}" is running low. Only ${data.currentStock} left in stock.`,
        data,
        actionUrl: `/seller/manage-listings`,
        sendEmail: true,
        emailSubject: `Low Stock Alert: ${data.productName}`
    })
}

/**
 * Notify seller about out of stock
 */
export async function notifyOutOfStock(
    sellerId: string,
    data: { productId: string; productName: string }
) {
    return createNotification({
        userId: sellerId,
        type: 'OUT_OF_STOCK',
        title: 'Out of Stock! 🚫',
        message: `"${data.productName}" is now out of stock. Consider restocking to avoid missing sales.`,
        data,
        actionUrl: `/seller/manage-listings`,
        sendEmail: true,
        emailSubject: `Out of Stock: ${data.productName}`
    })
}
