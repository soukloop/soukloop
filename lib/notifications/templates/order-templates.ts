import { createNotification, notifyAllAdmins } from '../create-notification'
import { prisma } from '@/lib/prisma'

interface OrderData {
    orderId: string
    orderNumber: string
    total?: number
    itemCount?: number
    buyerName?: string
    [key: string]: any
}

/**
 * Notify buyer that order was placed successfully
 */
/**
 * Notify buyer that order was placed successfully
 */
export async function notifyOrderPlaced(buyerId: string, data: OrderData) {
    const formattedTotal = data.total
        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.total)
        : ''

    // Fetch products for all shipments in this customer order
    const items = await prisma.orderItem.findMany({
        where: {
            order: {
                customerOrderId: data.orderId
            }
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

    // Render React Email
    const { render } = await import('@react-email/render');
    const { OrderPlacedEmail } = await import('@/lib/email-templates/orders/order-placed');

    const emailHtml = await render(
        OrderPlacedEmail({
            orderNumber: data.orderNumber,
            buyerName: data.buyerName || 'Customer',
            items: items as any,
            total: data.total || 0,
            itemCount: items.length || data.itemCount || 0,
            currency: 'USD',
            orderUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${data.orderId}`,
            // New Data Pass-through
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
            estimatedDelivery: data.estimatedDelivery,
            pointsUsed: data.pointsUsed,
            pointsGained: data.pointsGained,
            couponCode: data.couponCode,
            couponDiscount: data.couponDiscount,
            subtotal: data.subtotal || 0,
            shipping: data.shipping || 0
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'ORDER_PLACED',
        title: 'Order Confirmed! 🛍️',
        message: `Your order #${data.orderNumber} has been placed successfully.${formattedTotal ? ` Total: ${formattedTotal}` : ''}`,
        data,
        actionUrl: '/editprofile?section=my-orders',
        sendEmail: true,
        emailSubject: `Order Confirmed - #${data.orderNumber}`,
        emailHtml
    })
}

/**
 * Notify seller(s) about new order received
 * Now specific items are passed for each vendor
 */
export async function notifySellersNewOrder(
    vendorUserIds: string[],
    data: OrderData
) {
    const { render } = await import('@react-email/render');
    const { NewSaleEmail } = await import('@/lib/email-templates/orders/new-sale');

    return Promise.all(
        vendorUserIds.map(async (userId) => {
            // Fetch items for this specific vendor in this order
            const vendorItems = await prisma.orderItem.findMany({
                where: {
                    order: {
                        customerOrderId: data.orderId,
                        vendor: { userId }
                    }
                },
                include: {
                    product: {
                        select: {
                            name: true,
                            images: { take: 1, select: { url: true } }
                        }
                    },
                    order: {
                        select: {
                            total: true,
                            orderNumber: true,
                            shippingAddress: true, // Need to make sure we fetch/pass this if not in 'data'
                            notes: true
                        }
                    }
                }
            });

            const specificVendorOrder = vendorItems[0]?.order;
            const vendorOrderNumber = specificVendorOrder?.orderNumber || data.orderNumber;
            const vendorTotal = Number(specificVendorOrder?.total) || 0;

            // Extract vendor specific shipping/notes if available on the order object, 
            // OR fall back to the global data passed in
            const shippingAddress = (specificVendorOrder?.shippingAddress as any) || data.shippingAddress;
            const customerNotes = specificVendorOrder?.notes || data.notes;

            const emailHtml = await render(
                NewSaleEmail({
                    orderNumber: vendorOrderNumber,
                    sellerName: 'Seller',
                    buyerName: data.buyerName || 'Customer',
                    total: vendorTotal,
                    items: vendorItems as any,
                    currency: 'USD',
                    orderUrl: `${process.env.NEXTAUTH_URL}/seller/dashboard?tab=orders`,
                    // New Data
                    shippingAddress,
                    customerNotes,
                    couponCode: data.couponCode,
                    couponDiscount: data.couponDiscount
                })
            );

            return createNotification({
                userId,
                type: 'ORDER_PLACED',
                title: 'New Order Received! 📦',
                message: `You have a new order #${vendorOrderNumber}${data.buyerName ? ` from ${data.buyerName}` : ''}. Please process it soon.`,
                data: { ...data, orderNumber: vendorOrderNumber, total: vendorTotal },
                actionUrl: '/seller/dashboard?tab=orders',
                sendEmail: true,
                emailSubject: `New Sale Alert - #${vendorOrderNumber}`,
                emailHtml
            });
        })
    );
}

/**
 * Notify buyer about order status change
 */
export async function notifyOrderStatusChange(
    buyerId: string,
    orderNumber: string,
    newStatus: string,
    orderId: string
) {
    const statusConfig: Record<string, { title: string; message: string; icon: string }> = {
        PROCESSING: {
            title: 'Order Being Prepared ⚙️',
            message: `Your order #${orderNumber} is being prepared by the seller.`,
            icon: '⚙️'
        },
        PAID: {
            title: 'Payment Confirmed ✅',
            message: `Payment for order #${orderNumber} has been confirmed.`,
            icon: '✅'
        },
        SHIPPED: {
            title: 'Order Shipped! 🚚',
            message: `Your order #${orderNumber} is on its way!`,
            icon: '🚚'
        },
        FULFILLED: {
            title: 'Order Delivered! 📦',
            message: `Your order #${orderNumber} has been delivered. Enjoy!`,
            icon: '📦'
        },
        CANCELED: {
            title: 'Order Cancelled ❌',
            message: `Your order #${orderNumber} has been cancelled.`,
            icon: '❌'
        },
        REFUNDED: {
            title: 'Refund Processed 💰',
            message: `Your refund for order #${orderNumber} has been processed.`,
            icon: '💰'
        }
    }

    const config = statusConfig[newStatus] || {
        title: `Order Update: ${newStatus}`,
        message: `Your order #${orderNumber} status has been updated to ${newStatus}.`
    }

    // Determine if we should send email for this status
    const emailStatuses = ['SHIPPED', 'FULFILLED', 'CANCELED', 'REFUNDED']
    const shouldSendEmail = emailStatuses.includes(newStatus)

    let emailHtml = undefined
    if (shouldSendEmail) {
        try {
            const items = await prisma.orderItem.findMany({
                where: {
                    OR: [
                        { orderId: orderId },
                        { order: { customerOrderId: orderId } }
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
            })

            const { render } = await import('@react-email/render');
            const { OrderStatusUpdateEmail } = await import('@/lib/email-templates/orders/order-status-update');

            emailHtml = await render(
                OrderStatusUpdateEmail({
                    orderNumber,
                    statusTitle: config.title,
                    statusMessage: config.message,
                    items: items as any,
                    actionUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${orderId}`
                })
            )
        } catch (err) {
            console.error('Failed to render order status email:', err)
        }
    }

    return createNotification({
        userId: buyerId,
        type: newStatus === 'SHIPPED' ? 'ORDER_SHIPPED' :
            newStatus === 'FULFILLED' ? 'ORDER_DELIVERED' :
                newStatus === 'CANCELED' ? 'ORDER_CANCELLED' :
                    'ORDER_CONFIRMED',
        title: config.title,
        message: config.message,
        data: { orderId, orderNumber, status: newStatus },
        actionUrl: `/trackorders?order=${orderId}`,
        sendEmail: shouldSendEmail,
        emailSubject: `Order Update - #${orderNumber}`,
        emailHtml
    })
}

/**
 * Notify buyer that order was shipped with tracking info
 */
export async function notifyOrderShipped(
    buyerId: string,
    data: OrderData & { trackingNumber?: string; carrier?: string }
) {
    const trackingInfo = data.trackingNumber
        ? ` Tracking #: ${data.trackingNumber}${data.carrier ? ` via ${data.carrier}` : ''}`
        : ''

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

    const emailHtml = await render(
        OrderStatusUpdateEmail({
            orderNumber: data.orderNumber,
            statusTitle: 'Your Order is On Its Way! 🚚',
            statusMessage: `Order #${data.orderNumber} has been shipped.${trackingInfo}`,
            items: items as any,
            actionUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${data.orderId}`
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'ORDER_SHIPPED',
        title: 'Your Order is On Its Way! 🚚',
        message: `Order #${data.orderNumber} has been shipped.${trackingInfo}`,
        data,
        actionUrl: `/trackorders?order=${data.orderId}`,
        sendEmail: true,
        emailSubject: `Order Shipped - #${data.orderNumber}`,
        emailHtml
    })
}

/**
 * Notify buyer that order was delivered
 */
export async function notifyOrderDelivered(buyerId: string, data: OrderData) {
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

    const emailHtml = await render(
        OrderStatusUpdateEmail({
            orderNumber: data.orderNumber,
            statusTitle: 'Order Delivered! 📦✅',
            statusMessage: `Order #${data.orderNumber} has been delivered. We hope you love your purchase!`,
            items: items as any,
            actionUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${data.orderId}`
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'ORDER_DELIVERED',
        title: 'Order Delivered! 📦✅',
        message: `Order #${data.orderNumber} has been delivered. We hope you love your purchase!`,
        data,
        actionUrl: `/trackorders?order=${data.orderId}`,
        sendEmail: true,
        emailSubject: `Order Delivered - #${data.orderNumber}`,
        emailHtml
    })
}

/**
 * Notify buyer about order cancellation
 */
export async function notifyOrderCancelled(
    buyerId: string,
    data: OrderData & { reason?: string }
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

    const emailHtml = await render(
        OrderStatusUpdateEmail({
            orderNumber: data.orderNumber,
            statusTitle: 'Order Cancelled ❌',
            statusMessage: `Order #${data.orderNumber} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}`,
            items: items as any,
            actionUrl: `${process.env.NEXTAUTH_URL}/trackorders?order=${data.orderId}`
        })
    );

    return createNotification({
        userId: buyerId,
        type: 'ORDER_CANCELLED',
        title: 'Order Cancelled ❌',
        message: `Order #${data.orderNumber} has been cancelled.${data.reason ? ` Reason: ${data.reason}` : ''}`,
        data,
        actionUrl: `/trackorders?order=${data.orderId}`,
        sendEmail: true,
        emailSubject: `Order Cancelled - #${data.orderNumber}`,
        emailHtml
    })
}
