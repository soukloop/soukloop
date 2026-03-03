import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { Prisma } from "@prisma/client";
import { notifyOrderStatusChange } from '@/lib/notifications/templates/order-templates'
export const dynamic = 'force-dynamic'

// Helper to compute delivery status
function computeDeliveryStatus(vendorOrders: { status: string }[]) {
    const total = vendorOrders.length
    const delivered = vendorOrders.filter(vo => vo.status === 'DELIVERED').length

    return {
        deliveredCount: delivered,
        totalShipments: total,
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = await params

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        // 1. Try to find as CustomerOrder (by ID or OrderNumber)
        let customerOrder = await (prisma as any).customerOrder.findFirst({
            where: {
                OR: [
                    { id: orderId },
                    { orderNumber: orderId }
                ]
            },
            include: {
                vendorOrders: {
                    include: {
                        items: {
                            include: {
                                product: {
                                    include: {
                                        images: true
                                    }
                                }
                            }
                        },
                        vendor: true
                    },
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (customerOrder) {
            // Verify authorization - only the buyer can view their order
            if (customerOrder.userId !== session.user.id) {
                return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 })
            }

            // --- STRIPE SESSION VERIFICATION (Professional Sync) ---
            const sessionId = request.nextUrl.searchParams.get('session_id')
            if (sessionId && customerOrder.vendorOrders.some(vo => vo.status === 'PENDING')) {
                try {
                    const { stripe } = await import('@/lib/stripe')
                    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId)

                    if (stripeSession.payment_status === 'paid' && stripeSession.metadata?.customerOrderId === customerOrder.id) {
                        // Atomic Transaction to Confirm Order (Synchronous Fallback to Webhook)
                        await prisma.$transaction(async (tx) => {
                            for (const order of customerOrder.vendorOrders) {
                                if (order.status !== 'PENDING') continue;

                                // 1. Update Order Status
                                await tx.order.update({
                                    where: { id: order.id },
                                    data: { status: 'PAID' }
                                });

                                // 2. Update Payment Records
                                await tx.payment.updateMany({
                                    where: { orderId: order.id, status: 'PENDING' },
                                    data: {
                                        status: 'SUCCEEDED',
                                        transactionId: stripeSession.payment_intent as string,
                                        providerRef: stripeSession.id,
                                        processedAt: new Date()
                                    }
                                });

                                await tx.paymentTransaction.updateMany({
                                    where: { orderId: order.id, status: 'PENDING' },
                                    data: {
                                        status: 'COMPLETED',
                                        providerTransactionId: stripeSession.payment_intent as string,
                                        currency: stripeSession.currency || 'usd',
                                        createdAt: new Date()
                                    }
                                });

                                // 3. Update Product Status to SOLD (No quantity tracking)
                                for (const item of (order as any).items) {
                                    if (item.productId) {
                                        await tx.product.update({
                                            where: { id: item.productId },
                                            data: { status: 'SOLD' }
                                        });
                                    }
                                }
                            }

                            // 4. Award Rewards
                            const { RewardService } = await import('@/features/rewards/service')
                            const { REWARD_RULES, ACTION_TYPES, REFERENCE_TYPES } = await import('@/features/rewards/constants')
                            const pointsEarned = Math.floor(Number(customerOrder.totalAmount) * REWARD_RULES.POINTS_PER_DOLLAR);

                            if (pointsEarned > 0) {
                                await RewardService.awardPoints(tx, {
                                    userId: customerOrder.userId,
                                    points: pointsEarned,
                                    actionType: ACTION_TYPES.PURCHASE,
                                    referenceId: customerOrder.id,
                                    referenceType: REFERENCE_TYPES.ORDER,
                                    note: `Earned points for Order #${customerOrder.orderNumber} (Sync)`
                                });
                            }
                        });

                        // --- Post-Transaction Side Effects (Non-blocking) ---
                        (async () => {
                            try {
                                const { notifyOrderPlaced, notifySellersNewOrder } = await import('@/lib/notifications/templates/order-templates')
                                const { notifyPaymentSuccess } = await import('@/lib/notifications/templates/payment-templates')

                                await notifyPaymentSuccess(customerOrder.userId, {
                                    orderId: customerOrder.id,
                                    orderNumber: customerOrder.orderNumber,
                                    amount: customerOrder.totalAmount,
                                    currency: stripeSession.currency || 'usd'
                                });

                                await notifyOrderPlaced(customerOrder.userId, {
                                    orderId: customerOrder.id,
                                    orderNumber: customerOrder.orderNumber,
                                    total: customerOrder.totalAmount,
                                    itemCount: customerOrder.vendorOrders.reduce((acc, vo: any) => acc + (vo.items?.length || 0), 0),
                                    shippingAddress: customerOrder.shippingAddress as any,
                                    paymentMethod: 'Credit Card (Stripe)'
                                });

                                // Notify Vendors
                                const vendorIds = customerOrder.vendorOrders.map(vo => vo.vendorId);
                                const vendors = await prisma.vendor.findMany({
                                    where: { id: { in: vendorIds } },
                                    select: { id: true, userId: true }
                                });

                                const buyer = await prisma.user.findUnique({
                                    where: { id: customerOrder.userId },
                                    select: { name: true }
                                });

                                for (const vo of customerOrder.vendorOrders) {
                                    const vendor = vendors.find(v => v.id === vo.vendorId);
                                    if (vendor) {
                                        await notifySellersNewOrder([vendor.userId], {
                                            orderId: vo.id,
                                            orderNumber: vo.orderNumber,
                                            total: vo.total,
                                            buyerName: buyer?.name || 'A Customer'
                                        });
                                    }
                                }
                            } catch (notifError) {
                                console.error('Failed to send sync post-payment notifications:', notifError);
                            }
                        })();

                        // Refetch to return updated data
                        customerOrder = await (prisma as any).customerOrder.findUnique({
                            where: { id: customerOrder.id },
                            include: {
                                vendorOrders: {
                                    include: {
                                        items: {
                                            include: {
                                                product: { include: { images: true } }
                                            }
                                        },
                                        vendor: true
                                    },
                                    orderBy: { createdAt: 'asc' }
                                }
                            }
                        });
                    }
                } catch (stripeError) {
                    console.error('Stripe Sync Error:', stripeError)
                    // Continue returning current state if stripe call fails
                }
            }
            // -------------------------------------------------------

            // Add computed delivery status
            const orderWithStatus = {
                ...customerOrder,
                ...computeDeliveryStatus(customerOrder.vendorOrders)
            }

            return NextResponse.json(orderWithStatus)
        }

        // 2. If not found, try as VendorOrder (by ID or OrderNumber)
        const vendorOrder = await (prisma as any).order.findFirst({
            where: {
                OR: [
                    { id: orderId },
                    { orderNumber: orderId }
                ]
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                },
                vendor: true,
                customerOrder: true,  // Include parent order info
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!vendorOrder) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Authorization: User must be the buyer or the vendor
        if (vendorOrder.userId !== session.user.id) {
            const vendor = await prisma.vendor.findUnique({
                where: { userId: session.user.id },
                select: { id: true }
            })

            if (!vendor || vendor.id !== vendorOrder.vendorId) {
                return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 })
            }
        }

        return NextResponse.json(vendorOrder)

    } catch (error) {
        console.error('Get Order Error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// PATCH - Update order status (seller accepts order)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { orderId } = await params
        const body = await request.json()
        const { status } = body

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 })
        }

        // Find the order
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { vendor: true }
        })

        if (!order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Verify seller owns this vendor
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        })

        if (!vendor || vendor.id !== order.vendorId) {
            return NextResponse.json({ error: 'Unauthorized to update this order' }, { status: 403 })
        }

        // Validate status transitions
        // 1. Seller accepts order: PAID -> PROCESSING
        const allowedInitialStatuses = ['PAID'];
        if (status === 'PROCESSING' && !allowedInitialStatuses.includes(order.status)) {
            return NextResponse.json({
                error: `Can only accept orders that are already PAID (current: ${order.status}). Please wait for payment confirmation.`
            }, { status: 400 })
        }

        // Allowed statuses for seller
        const allowedStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({
                error: 'Invalid status. Sellers can only move orders to PROCESSING, SHIPPED, or DELIVERED'
            }, { status: 400 })
        }

        // Atomic Transaction for Update & Credit
        const updatedOrder = await prisma.$transaction(async (tx) => {
            // 1. Update Order Status
            const orderUpdated = await tx.order.update({
                where: { id: orderId },
                data: { status },
                include: {
                    items: {
                        include: {
                            product: { include: { images: true } }
                        }
                    },
                    vendor: true
                }
            });

            // 2. Credit Logic (Only if status is changing to DELIVERED)
            // We assume 'DELIVERED' is the trigger. If 'FULFILLED' was used before, we might need to handle that too, 
            // but the user specific request is 'DELIVERED'.
            if (status === 'DELIVERED' && order.status !== 'DELIVERED') {
                // Calculate Net Payout: Total - Platform Fee (already calculated in order.netPayout usually, or we calculate now)
                // Looking at schema, Order has `netPayout` field. We should rely on that if it's set.
                // If not, we might fallback to `total` (but that's risky). 
                // Schema says netPayout @default(0). 
                // Let's check if order.netPayout is populated. 
                // If 0, we should probably calculate it: (total - shipping) * (1 - commission) etc.
                // For safety, let's use order.netPayout if > 0, else just use subtotal * 0.88 (12% take).
                // Actually, better to check if netPayout is set.

                let payoutAmount = new Prisma.Decimal(order.netPayout || 0);

                // If netPayout is 0, let's calculate it on the fly to be safe (or if it was missed during creation)
                if (payoutAmount.isZero()) {
                    const subtotal = new Prisma.Decimal(order.subtotal);
                    const shipping = new Prisma.Decimal(order.shipping || 0);

                    // Fallback to order's saved commissionRate, or default to 12% standard rate (0.12)
                    const commissionRate = order.commissionRate != null ? new Prisma.Decimal(order.commissionRate) : new Prisma.Decimal(0.12);
                    const vendorSharePercentage = new Prisma.Decimal(1).sub(commissionRate);

                    // Dynamic Logic: Net Payout = (Subtotal * Vendor Share %) + Shipping
                    payoutAmount = subtotal.mul(vendorSharePercentage).add(shipping);
                }

                await tx.vendor.update({
                    where: { id: order.vendorId },
                    data: { walletBalance: { increment: payoutAmount } }
                });

                await tx.walletTransaction.create({
                    data: {
                        vendorId: order.vendorId,
                        amount: payoutAmount,
                        type: 'CREDIT',
                        referenceId: order.id,
                        description: `Earnings for Order #${order.orderNumber}`
                    }
                });

                // --- REWARD SYSTEM: EARN POINTS ---
                const { RewardService } = await import('@/features/rewards/service')
                const { ACTION_TYPES, REFERENCE_TYPES } = await import('@/features/rewards/constants')

                // 2. Award Buyer Points
                const buyerPoints = Math.floor(order.total * 1.0);
                await RewardService.awardPoints(tx, {
                    userId: order.userId,
                    points: buyerPoints,
                    actionType: ACTION_TYPES.PURCHASE,
                    referenceId: order.id,
                    referenceType: REFERENCE_TYPES.ORDER,
                    note: `Point reward for purchase completion (Order #${order.orderNumber})`
                });

                // 3. Award Seller Points (Directly to Vendor)
                const sellerPoints = Math.floor(order.subtotal * 1.0);
                await tx.vendor.update({
                    where: { id: order.vendorId },
                    data: { rewardBalance: { increment: sellerPoints } }
                });
                // Note: vendor reward history not yet in schema, just balance for now.
                // ----------------------------------

                // 4. Update Payment Statistics or other delivered-only logic if needed
                // Payment is already SUCCEEDED via Stripe before reaching this stage.
            }

            // 4. Create History Log
            await tx.orderHistory.create({
                data: {
                    orderId: order.id,
                    status: status,
                    changedBy: session.user.id,
                    reason: `Status updated to ${status} by seller`
                }
            });

            return orderUpdated;
        });

        // ➤ NOTIFICATION (After Transaction)
        try {
            await notifyOrderStatusChange(
                order.userId, // Buyer ID
                order.orderNumber,
                status,
                order.id
            );
        } catch (notifError) {
            console.error('Failed to notify status update:', notifError);
        }

        return NextResponse.json(updatedOrder)

    } catch (error) {
        console.error('Update Order Status Error:', error)
        return NextResponse.json(
            { error: 'Failed to update order status' },
            { status: 500 }
        )
    }
}
