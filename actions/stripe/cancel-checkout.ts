'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function cancelCheckoutSession(customerOrderId: string) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const userId = session.user.id;

        // Verify the order belongs to the user and is still PENDING
        const customerOrder = await prisma.customerOrder.findUnique({
            where: {
                id: customerOrderId,
                userId: userId
            },
            include: {
                vendorOrders: true
            }
        });

        if (!customerOrder) {
            // If the order is already deleted (e.g. by a strict mode double-render),
            // consider the cancellation successful.
            return { success: true };
        }

        // We ONLY delete if all sub-orders are PENDING. If any are PAID, we abort to prevent 
        // a race condition where Stripe Webhook succeeds right as they click back.
        const isSafeToDelete = customerOrder.vendorOrders.every(order => order.status === 'PENDING');

        if (!isSafeToDelete) {
            return { success: false, error: 'Order is no longer pending and cannot be canceled' };
        }

        // Proceed to delete the pending order securely
        await prisma.$transaction(async (tx) => {
            const vendorOrderIds = customerOrder.vendorOrders.map(o => o.id);

            // Delete PaymentTransactions directly (which are explicitly tracked separately)
            await tx.paymentTransaction.deleteMany({
                where: {
                    orderId: { in: vendorOrderIds },
                    status: 'PENDING'
                }
            });

            // The CustomerOrder delete cascades to Orders, OrderItems, Payments etc.
            await tx.customerOrder.delete({
                where: {
                    id: customerOrderId
                }
            });
        });

        revalidatePath('/cart');
        revalidatePath('/orders');

        return { success: true };

    } catch (error: any) {
        console.error('Cancel Checkout Session Error:', error);
        return { success: false, error: error.message || 'Failed to cancel checkout session' };
    }
}
