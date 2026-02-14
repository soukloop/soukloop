import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { notifyRefundProcessed, notifySellerRefundDeducted } from '@/lib/notifications/index'

const refundUpdateSchema = z.object({
    status: z.enum(['PENDING', 'PROCESSED', 'FAILED', 'REJECTED']),
    amount: z.number().optional(),
    providerRef: z.string().optional(),
    metadata: z.any().optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        if (!id) {
            console.error('[Refund API] Missing ID parameter');
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        console.log(`[Refund API] GET request for ID: ${id}`);

        const session = await auth()
        // console.log('[Refund API] Session:', session?.user?.email);

        if (!session?.user) {
            console.warn('[Refund API] Unauthorized access attempt');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const refund = await prisma.refund.findUnique({
            where: { id },
            include: {
                orderItem: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                },
                order: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        },
                        vendor: {
                            include: {
                                user: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                        image: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!refund) {
            console.warn(`[Refund API] Refund not found: ${id}`);
            return NextResponse.json(
                { error: 'Refund not found' },
                { status: 404 }
            )
        }

        // Check authorization
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        const isOwner = refund.order.userId === session.user.id;
        const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

        if (!isAdmin && !isOwner) {
            console.warn(`[Refund API] Forbidden access. User: ${session.user.id}, Owner: ${refund.order.userId}`);
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        return NextResponse.json(refund)

    } catch (error: any) {
        console.error('Refund GET error:', error)
        // Check if error is due to BigInt serialization
        if (error?.message?.includes('BigInt')) {
            console.error('BigInt serialization issue detected');
        }
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        )
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    console.log(`[Refund API] PATCH request for ID: ${id}`);
    try {
        const session = await auth()

        if (!session?.user) {
            console.warn('[Refund API] User not authenticated');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Only admins can update refund status
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
            console.warn(`[Refund API] Access denied for user role: ${user?.role}`);
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        console.log(`[Refund API] Request body:`, body);

        const validationResult = refundUpdateSchema.safeParse(body)

        if (!validationResult.success) {
            console.error('[Refund API] Validation failed:', validationResult.error);
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // 1. Fetch Refund with Order and Vendor details needed for logic
        const existingRefund = await prisma.refund.findUnique({
            where: { id },
            include: {
                order: {
                    include: {
                        items: true,
                        paymentTransactions: true // Need this for Stripe ID
                    }
                }
            }
        })

        if (!existingRefund) {
            console.warn(`[Refund API] Refund not found: ${id}`);
            return NextResponse.json({ error: 'Refund not found' }, { status: 404 })
        }

        // Prevent double processing
        if (existingRefund.status === 'PROCESSED' && data.status === 'PROCESSED') {
            console.log('[Refund API] Refund already processed');
            return NextResponse.json(existingRefund)
        }

        // STRIPE LOGIC (Pre-empt DB Transaction to ensure we can refund)
        if (data.status === 'PROCESSED') {
            // Find successful Stripe payment
            const payment = existingRefund.order.paymentTransactions.find(
                p => p.provider === 'STRIPE' && p.status === 'COMPLETED' && p.providerTransactionId
            )

            if (payment && payment.providerTransactionId) {
                console.log(`[Refund API] processing Stripe refund for payment ID: ${payment.providerTransactionId}`);
                try {
                    // Stripe expects amount in cents
                    const refundAmount = data.amount || existingRefund.amount;
                    const amountInCents = Math.round(refundAmount * 100);

                    // Use existing stripe instance from lib
                    const { stripe } = await import('@/lib/stripe');

                    await stripe.refunds.create({
                        payment_intent: payment.providerTransactionId,
                        amount: amountInCents, // Use the calculated cents
                        reason: 'requested_by_customer',
                        metadata: {
                            orderId: existingRefund.orderId,
                            refundId: existingRefund.id
                        }
                    });
                    console.log('[Refund API] Stripe refund successful');
                } catch (stripeError: any) {
                    console.error('[Stripe Refund Failed]', stripeError);
                    // If refund fails, we block the status update.
                    return NextResponse.json(
                        { error: 'Stripe refund failed: ' + stripeError.message },
                        { status: 500 }
                    )
                }
            } else {
                console.warn('[Refund] No Stripe payment found for order ' + existingRefund.orderId);
                // Proceed as it might be a manual or non-Stripe order
            }
        }

        // EXECUTE TRANSACTION
        console.log('[Refund API] Starting DB transaction...');
        const result = await prisma.$transaction(async (tx) => {
            // A. Update Refund
            const refund = await tx.refund.update({
                where: { id },
                data: {
                    ...data,
                    processedAt: data.status === 'PROCESSED' ? new Date() : undefined
                }
            })

            // If not processing (e.g. rejecting or just updating metadata), return early
            if (data.status !== 'PROCESSED') {
                return refund
            }

            // B. Financials: Debit Vendor Wallet
            const vendorId = existingRefund.order.vendorId

            // Create Wallet Transaction (REFUND = Debit)
            console.log(`[Refund API] Creating wallet transaction for vendor: ${vendorId}`);
            await tx.walletTransaction.create({
                data: {
                    vendorId,
                    amount: refund.amount, // Positive number
                    type: 'REFUND',
                    referenceId: refund.id,
                    description: `Refund for Order #${existingRefund.order.orderNumber}`
                }
            })

            // Create PaymentTransaction (Ledger entry)
            console.log(`[Refund API] Creating payment transaction record`);
            await tx.paymentTransaction.create({
                data: {
                    orderId: refund.orderId,
                    userId: existingRefund.order.userId,
                    amount: new Prisma.Decimal(-refund.amount), // Negative for refund
                    currency: 'USD',
                    provider: 'REFUND',
                    status: 'COMPLETED',
                    providerTransactionId: refund.id // Link to refund record
                }
            })

            // Decrement Vendor Balance
            console.log(`[Refund API] Decrementing vendor balance`);
            await tx.vendor.update({
                where: { id: vendorId },
                data: {
                    walletBalance: {
                        decrement: refund.amount
                    }
                }
            })

            // C. Inventory: Restock Item
            if (existingRefund.orderItemId) {
                const orderItem = existingRefund.order.items.find(i => i.id === existingRefund.orderItemId)
                if (orderItem && orderItem.productId) {
                    console.log(`[Refund API] Restocking product: ${orderItem.productId}`);
                    await tx.product.update({
                        where: { id: orderItem.productId },
                        data: {
                            status: 'ACTIVE'
                        }
                    })
                }
            }

            // D. Update Order Status
            console.log(`[Refund API] Updating order status to REFUNDED`);
            await tx.order.update({
                where: { id: refund.orderId },
                data: { status: 'REFUNDED' }
            })

            return refund
        }, {
            maxWait: 5000,
            timeout: 20000
        })
        console.log('[Refund API] DB transaction successful');

        // Post-transaction notifications
        if (data.status === 'PROCESSED') {
            try {
                // 1. Notify Buyer
                notifyRefundProcessed(existingRefund.order.userId, {
                    orderId: existingRefund.orderId,
                    orderNumber: existingRefund.order.orderNumber,
                    amount: existingRefund.amount,
                    refundId: existingRefund.id
                }).catch(err => console.error('[Refund] Buyer Notification failed:', err))

                // 2. Notify Seller (Vendor)
                notifySellerRefundDeducted(existingRefund.order.vendorId, {
                    orderId: existingRefund.orderId,
                    orderNumber: existingRefund.order.orderNumber,
                    amount: existingRefund.amount,
                    refundId: existingRefund.id
                }).catch(err => console.error('[Refund] Seller Notification failed:', err))
            } catch (notifyError) {
                console.error('[Refund API] Notification setup failed', notifyError);
            }
        }

        return NextResponse.json(result)

    } catch (error: any) {
        console.error('Refund PATCH error:', error)
        return NextResponse.json(
            { error: 'Internal server error', details: error.message, stack: error.stack },
            { status: 500 }
        )
    }
}
