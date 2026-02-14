'use server';

import { auth } from '@/auth';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
// import { redirect } from 'next/navigation'; // Removing redirect

export async function createCheckoutSession(customerOrderId: string) {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    // Fetch Parent CustomerOrder with all Vendor Sub-Orders
    const customerOrder = await prisma.customerOrder.findUnique({
        where: {
            id: customerOrderId,
            userId: session.user.id,
        },
        include: {
            vendorOrders: {
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!customerOrder) {
        throw new Error('Order not found');
    }

    // CRITICAL: Availability Verification (Unique Items)
    for (const vendorOrder of customerOrder.vendorOrders) {
        for (const item of vendorOrder.items) {
            // For unique items, we check status instead of quantity tracking
            if (item.product?.status !== 'ACTIVE') {
                throw new Error(`Item "${item.product?.name}" is no longer available (Status: ${item.product?.status}).`);
            }
        }
    }

    // Flatten all items from all vendor orders
    const line_items = customerOrder.vendorOrders.flatMap((order) =>
        order.items.map((item) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.product?.name || 'Unknown Product',
                    images:
                        item.product?.images && Array.isArray(item.product.images) && item.product.images.length > 0
                            ? [
                                item.product.images[0].url.startsWith('http')
                                    ? item.product.images[0].url
                                    : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}${item.product.images[0].url}`
                            ]
                            : [],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
                tax_behavior: 'exclusive' as const,
            },
            quantity: item.quantity,
        }))
    );

    // Calculate details for Shipping line item
    const totalShipping = customerOrder.vendorOrders.reduce(
        (acc, order) => acc + (order.shipping || 0),
        0
    );

    if (totalShipping > 0) {
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping Cost',
                    images: [],
                },
                unit_amount: Math.round(totalShipping * 100),
                tax_behavior: 'exclusive',
            },
            quantity: 1,
        });
    }

    // Calculate details for Tax line item
    const totalTax = customerOrder.vendorOrders.reduce(
        (acc, order) => acc + (order.tax || 0),
        0
    );

    if (totalTax > 0) {
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Tax',
                    images: [],
                },
                unit_amount: Math.round(totalTax * 100), // Stripe expects cents
                tax_behavior: 'exclusive',
            },
            quantity: 1,
        });
    }

    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    let url: string | null = null;

    try {
        // Using Dynamic Payment Methods (Stripe Best Practice)
        // Stripe automatically shows payment methods enabled in Dashboard
        // This includes: Card, Apple Pay, Google Pay, Amazon Pay, Link, etc.
        const sessionPayload: any = {
            mode: 'payment',
            line_items,
            success_url: `${origin}/order-confirmation/${customerOrder.id}?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/cart?canceled=true`,
            customer_email: session.user.email || undefined,
            automatic_tax: { enabled: false }, // Disabled per user request (missing head office address)
            metadata: {
                customerOrderId: customerOrder.id, // Track Parent ID
                userId: session.user.id,
            },
        };

        const stripeSession = await stripe.checkout.sessions.create(sessionPayload);

        if (!stripeSession.url) {
            throw new Error('Failed to create Stripe session');
        }

        url = stripeSession.url;
    } catch (err: any) {
        console.error('Stripe Session Error:', err);
        throw new Error(err.message || 'Failed to initiate Stripe checkout');
    }

    if (url) {
        return { url };
    }

    throw new Error('No session URL generated');
}
