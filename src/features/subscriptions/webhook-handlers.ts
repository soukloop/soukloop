import { prisma } from "@/lib/prisma";
import Stripe from "stripe";
import { SubscriptionTier } from "@prisma/client";

export async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (session.mode !== "subscription") return;

    const vendorId = session.subscription ?
        (typeof session.subscription === 'string' ? undefined : session.subscription.metadata?.vendorId)
        : session.metadata?.vendorId;

    const requestedTier = session.subscription ?
        (typeof session.subscription === 'string' ? session.metadata?.tier : session.subscription.metadata?.tier)
        : session.metadata?.tier;

    if (!vendorId || !requestedTier) {
        console.error("Missing vendorId or tier in subscription metadata");
        return;
    }

    // Default or Parse Tier carefully
    const tier = (requestedTier === "STARTER" ? "STARTER" : "PRO") as SubscriptionTier;

    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    // We need to fetch the subscription to get price and current period dates
    // However, the session might not have the full subscription object expanded
    // Let's rely on the customer.subscription.created/updated webhook for full details,
    // OR just do a basic update here.

    await prisma.$transaction(async (tx) => {
        // Upgrade vendor
        await tx.vendor.update({
            where: { id: vendorId },
            data: { planTier: tier },
        });

        // Upsert subscription record
        // We'll upsert so that if the subscription.created webhook fires first, we don't duplicate
        await tx.subscription.upsert({
            where: {
                stripeSubscriptionId: subscriptionId,
            },
            create: {
                vendorId: vendorId,
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                tier: tier,
                status: "active",
                currentPeriodStart: new Date(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days, actual dates will sync via `customer.subscription.updated`
            },
            update: {
                status: "active",
                tier: tier,
            }
        });
    });

    console.log(`Successfully upgraded Vendor ${vendorId} to ${tier} plan via Checkout`);
}

export async function handleSubscriptionChange(subscription: Stripe.Subscription) {
    const status = subscription.status; // e.g., active, past_due, canceled, unpaid
    const stripeSubscriptionId = subscription.id;
    const customerId = subscription.customer as string;
    const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
    const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
    const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end;

    // Attempt to find the existing subscription
    const existingSub = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId },
        include: { vendor: true }
    });

    if (!existingSub) {
        // We might not have it yet if this is a 'created' event firing before checkout completed.
        // But checkout completed should metadata with vendorId.
        // The webhook subscription payload might have metadata if we passed it in subscription_data.
        const vendorId = subscription.metadata?.vendorId;
        const requestedTier = subscription.metadata?.tier;
        const tier = (requestedTier === "STARTER" ? "STARTER" : "PRO") as SubscriptionTier;

        if (vendorId) {
            await prisma.subscription.create({
                data: {
                    vendorId,
                    stripeCustomerId: customerId,
                    stripeSubscriptionId,
                    tier: tier,
                    status: status,
                    currentPeriodStart,
                    currentPeriodEnd,
                    cancelAtPeriodEnd,
                }
            });
            // Downgrade if immediately canceled or past due
            if (status === "canceled" || status === "unpaid" || status === "past_due") {
                await prisma.vendor.update({
                    where: { id: vendorId },
                    data: { planTier: "BASIC" },
                });
            } else if (status === "active") {
                await prisma.vendor.update({
                    where: { id: vendorId },
                    data: { planTier: tier },
                });
            }
        } else {
            console.log(`Unable to link Stripe Subscription ${stripeSubscriptionId} to a Vendor.`);
        }
        return;
    }

    // Default assume active tier is STARTER or PRO based on the schema and plans
    let vendorTier = existingSub.tier;

    // For statuses like 'canceled', 'unpaid', 'past_due', gracefully downgrade the user
    // In strict terms, 'past_due' could still be premium during grace period, but let's be strict or follow typical SaaS
    // Let's downgrade on canceled or unpaid
    if (status === "canceled" || status === "unpaid") {
        vendorTier = "BASIC";
    }

    await prisma.$transaction(async (tx) => {
        // Update subscription record
        await tx.subscription.update({
            where: { id: existingSub.id },
            data: {
                status,
                currentPeriodStart,
                currentPeriodEnd,
                cancelAtPeriodEnd
            },
        });

        // Sync vendor tier
        await tx.vendor.update({
            where: { id: existingSub.vendorId },
            data: { planTier: vendorTier },
        });
    });

    console.log(`Synced Stripe Subscription ${stripeSubscriptionId}: Status is now ${status}. Vendor tier set to ${vendorTier}`);
}

export async function handleSubscriptionInvoicePaid(invoice: Stripe.Invoice) {
    const invAny = invoice as any;
    if (invAny.subscription) {
        const subscriptionId = typeof invAny.subscription === 'string'
            ? invAny.subscription
            : invAny.subscription.id;

        const sub = await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscriptionId }
        });

        if (!sub) {
            console.error(`Received invoice.paid for unknown subscription: ${subscriptionId}`);
            return;
        }

        // Create transaction history record
        await (prisma as any).subscriptionTransaction.create({
            data: {
                subscriptionId: sub.id,
                vendorId: sub.vendorId,
                stripeInvoiceId: invoice.id,
                amount: invoice.amount_paid / 100, // Stripe amount is in cents
                status: "succeeded"
            }
        });

        console.log(`Logged successful recurring payment of ${invoice.amount_paid / 100} for generic subscription: ${subscriptionId}`);
    }
}
