import { prisma } from '@/lib/prisma'
import { createNotification } from '../create-notification'

interface PaymentData {
    [key: string]: any
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
    const { render } = await import('@react-email/render');
    const { OrderPlacedEmail } = await import('@/lib/email-templates/orders/order-placed');

    const items = await prisma.orderItem.findMany({
        where: {
            OR: [
                { orderId: data.orderId },
                { order: { customerOrderId: data.orderId } }
            ]
        },
        include: {
            product: {
                select: {
                    name: true,
                    images: { take: 1, select: { url: true } }
                }
            }
        }
    });

    // compute subtotal and shipping (shipping not tracked, default to 0)
    const subtotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    const shipping = 0;

    const emailHtml = await render(
        OrderPlacedEmail({
            orderNumber: data.orderNumber,
            total: data.amount,
            itemCount: items.length,
            currency: data.currency || 'USD',
            orderUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${data.orderId}`,
            items: items as any,
            subtotal,
            shipping
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'PAYMENT_SUCCESS',
        title: 'Payment Successful! ✅',
        message: `Your payment for order #${data.orderNumber} was successful.`,
        data,
        actionUrl: `/trackorders?order=${data.orderId}`,
        sendEmail: true,
        emailSubject: `Payment Confirmed - Order #${data.orderNumber}`,
        emailHtml
    })
}

/**
 * Notify buyer of failed payment
 */
export async function notifyPaymentFailed(buyerId: string, data: PaymentData & { reason?: string }) {
    const formatted = formatCurrency(data.amount, data.currency)

    // Using default professional template for now, can be improved with specific React template later
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
/**
 * Notify buyer that refund was requested
 */
export async function notifyRefundRequested(
    buyerId: string,
    data: PaymentData & { refundId: string; reason?: string; items?: any[] }
) {
    const formatted = formatCurrency(data.amount, data.currency)
    const { render } = await import('@react-email/render');
    const { RefundRequestedEmail } = await import('@/lib/email-templates/order/refund-requested');

    const emailHtml = await render(
        RefundRequestedEmail({
            orderNumber: data.orderNumber,
            refundAmount: data.amount,
            reason: data.reason || 'No reason provided',
            items: data.items || [],
            actionUrl: `${process.env.NEXTAUTH_URL}/refunds-and-returns`
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'REFUND_REQUESTED',
        title: 'Refund Request Received 🔄',
        message: `Your refund request of ${formatted} for order #${data.orderNumber} has been received. We'll process it shortly.`,
        data,
        actionUrl: '/refunds-and-returns',
        sendEmail: true,
        emailSubject: `Refund Request Received - Order #${data.orderNumber}`,
        emailHtml
    })
}

/**
 * Notify buyer that refund was processed
 */
export async function notifyRefundProcessed(
    buyerId: string,
    data: PaymentData & { refundId: string }
) {
    const { render } = await import('@react-email/render');
    const { OrderStatusUpdateEmail } = await import('@/lib/email-templates/orders/order-status-update');

    const items = await prisma.orderItem.findMany({
        where: {
            OR: [
                { orderId: data.orderId },
                { order: { customerOrderId: data.orderId } }
            ]
        },
        include: {
            product: {
                select: {
                    name: true,
                    images: { take: 1, select: { url: true } }
                }
            }
        }
    });

    const formatted = formatCurrency(data.amount, data.currency)

    const emailHtml = await render(
        OrderStatusUpdateEmail({
            orderNumber: data.orderNumber,
            statusTitle: 'Refund Processed! 💰',
            statusMessage: `Your refund of ${formatted} for order #${data.orderNumber} has been processed. It may take 5-10 business days to appear in your account.`,
            items: items as any,
            actionUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${data.orderId}`
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'REFUND_PROCESSED',
        title: 'Refund Processed! 💰',
        message: `Your refund of ${formatted} for order #${data.orderNumber} has been processed.`,
        data,
        actionUrl: '/editprofile?section=my-orders',
        sendEmail: true,
        emailSubject: `Refund Processed - ${formatted}`,
        emailHtml
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
