import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const BOOST_PRICES: Record<string, { amount: number; label: string }> = {
    '3_DAYS': { amount: 299, label: '3-Day Boost' },
    '7_DAYS': { amount: 599, label: '7-Day Boost' },
    '15_DAYS': { amount: 999, label: '15-Day Boost' },
};

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: productId } = await context.params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { packageType } = await request.json();

        if (!packageType || !BOOST_PRICES[packageType]) {
            return NextResponse.json({ error: 'Invalid package type' }, { status: 400 });
        }

        // Look up the product and confirm ownership
        const product = await prisma.product.findUnique({
            where: { id: productId },
            include: { vendor: { select: { id: true, userId: true } } }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.vendor.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Cancel any existing pending boost for this product (avoid duplicates)
        await prisma.productBoost.updateMany({
            where: { productId, status: 'pending' },
            data: { status: 'cancelled' }
        });

        // Create a new ProductBoost record in 'pending' state
        const boost = await prisma.productBoost.create({
            data: {
                productId,
                vendorId: product.vendor.id,
                packageType,
                status: 'pending',
            } as any
        });

        const { amount, label } = BOOST_PRICES[packageType];

        // Build the success/cancel URLs
        const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.soukloop.com';
        const successUrl = `${baseUrl}/seller/manage-listings?boost_success=1`;
        const cancelUrl = `${baseUrl}/seller/manage-listings`;

        // Create the Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${label} — ${product.name}`,
                            description: `Boost your listing "${product.name}" to the top of search results.`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                boostId: boost.id,
                vendorId: product.vendor.id,
            },
            success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: cancelUrl,
        });

        // Store the session ID on the boost record for idempotency
        await prisma.productBoost.update({
            where: { id: boost.id },
            data: { stripeSessionId: checkoutSession.id }
        });

        return NextResponse.json({ url: checkoutSession.url });

    } catch (error: any) {
        console.error('[Boost Checkout] Error:', error);
        return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
    }
}
