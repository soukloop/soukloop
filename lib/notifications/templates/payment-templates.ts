import { createNotification } from '../create-notification'

interface PaymentData {
    orderId: string
    orderNumber: string
    amount: number
    currency?: string
}

/**
 * Format currency amount
 */
function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount)
}

/**
 * Notify buyer of successful payment
 */
export async function notifyPaymentSuccess(buyerId: string, data: PaymentData) {
    const formatted = formatCurrency(data.amount, data.currency)

    return createNotification({
        userId: buyerId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful! ✅',
        message: `Your payment of ${formatted} for order #${data.orderNumber} was successful.`,
        data,
        actionUrl: '/editprofile?section=my-orders',
        sendEmail: true,
        emailSubject: `Payment Confirmed - Order #${data.orderNumber}`
    })
}

/**
 * Notify buyer of failed payment
 */
export async function notifyPaymentFailed(buyerId: string, data: PaymentData & { reason?: string }) {
    const formatted = formatCurrency(data.amount, data.currency)

    return createNotification({
        userId: buyerId,
        type: 'PAYMENT_FAILED',
        title: 'Payment Failed ⚠️',
        message: `Your payment of ${formatted} for order #${data.orderNumber} could not be processed.${data.reason ? ` Reason: ${data.reason}` : ' Please try again.'}`,
        data,
        actionUrl: '/cart',
        sendEmail: true,
        emailSubject: `Payment Issue - Order #${data.orderNumber}`
    })
}

/**
 * Notify buyer that refund was requested
 */
export async function notifyRefundRequested(
    buyerId: string,
    data: PaymentData & { refundId: string }
) {
    const formatted = formatCurrency(data.amount, data.currency)

    return createNotification({
        userId: buyerId,
        type: 'REFUND_REQUESTED',
        title: 'Refund Request Received 🔄',
        message: `Your refund request of ${formatted} for order #${data.orderNumber} has been received. We'll process it shortly.`,
        data,
        actionUrl: '/editprofile?section=my-orders',
        sendEmail: true,
        emailSubject: `Refund Request Received - Order #${data.orderNumber}`
    })
}

/**
 * Notify buyer that refund was processed
 */
export async function notifyRefundProcessed(
    buyerId: string,
    data: PaymentData & { refundId: string }
) {
    const formatted = formatCurrency(data.amount, data.currency)

    return createNotification({
        userId: buyerId,
        type: 'REFUND_PROCESSED',
        title: 'Refund Processed! 💰',
        message: `Your refund of ${formatted} for order #${data.orderNumber} has been processed. It may take 5-10 business days to appear in your account.`,
        data,
        actionUrl: '/editprofile?section=my-orders',
        sendEmail: true,
        emailSubject: `Refund Processed - ${formatted}`
    })
}

/**
 * Notify seller about refund request on their order
 */
/**
 * Notify seller about refund request on their order
 */
export async function notifySellerRefundRequested(
    sellerId: string,
    data: PaymentData & { refundId: string; buyerName?: string }
) {
    const formatted = formatCurrency(data.amount, data.currency)

    return createNotification({
        userId: sellerId,
        type: 'REFUND_REQUESTED',
        title: 'Refund Request Received 🔄',
        message: `${data.buyerName || 'A buyer'} has requested a refund of ${formatted} for order #${data.orderNumber}.`,
        data,
        actionUrl: '/seller/returns',
        sendEmail: true
    })
}

/**
 * Notify seller that refund was deducted from their wallet
 */
export async function notifySellerRefundDeducted(
    sellerId: string,
    data: PaymentData & { refundId: string }
) {
    const formatted = formatCurrency(data.amount, data.currency)

    return createNotification({
        userId: sellerId,
        type: 'REFUND_DEDUCTED',
        title: 'Refund Deducted 💸',
        message: `A refund of ${formatted} for order #${data.orderNumber} has been processed and deducted from your wallet.`,
        data,
        actionUrl: '/seller/dashboard?tab=earnings', // Or logic to show transactions
        sendEmail: true,
        emailSubject: `Refund Deduction - ${formatted}`
    })
}
