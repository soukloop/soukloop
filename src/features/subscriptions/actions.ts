"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { redirect } from "next/navigation";

function getBaseUrl() {
    return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function createSubscriptionCheckout(selectedPriceId?: string) {
    const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
    const proPriceId = process.env.STRIPE_PRO_PRICE_ID;

    // Use passed priceId or default to Pro if not provided (fallback)
    const priceId = selectedPriceId || proPriceId;

    if (!priceId) {
        throw new Error("Stripe Price IDs are not configured. Cannot start checkout.");
    }

    const requestedTier = priceId === starterPriceId ? "STARTER" : "PRO";

    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized. Please log in.");
    }

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        include: { subscriptions: true }
    });

    if (!vendor) {
        throw new Error("You must be an approved seller to subscribe to a paid plan.");
    }

    if (vendor.planTier === requestedTier) {
        throw new Error(`You are already on the ${requestedTier} plan.`);
    }

    let stripeCustomerId = vendor.subscriptions[0]?.stripeCustomerId;

    if (!stripeCustomerId) {
        // Create a new Stripe customer if we don't have one saved
        const customer = await stripe.customers.create({
            email: session.user.email || undefined,
            name: session.user.name || undefined,
            metadata: {
                vendorId: vendor.id,
                userId: vendor.userId
            }
        });
        stripeCustomerId = customer.id;
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
            {
                price: priceId,
                quantity: 1,
            },
        ],
        success_url: `${getBaseUrl()}/seller/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${getBaseUrl()}/pricing`,
        subscription_data: {
            metadata: {
                vendorId: vendor.id,
                tier: requestedTier,
            },
        },
    });

    if (!checkoutSession.url) {
        throw new Error("Failed to create checkout session");
    }

    redirect(checkoutSession.url);
}

export async function createCustomerPortalSession() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        include: { subscriptions: true }
    });

    if (!vendor || !vendor.subscriptions[0]?.stripeCustomerId) {
        throw new Error("Active billing account not found. Please upgrade to Premium first.");
    }

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: vendor.subscriptions[0].stripeCustomerId,
        return_url: `${getBaseUrl()}/seller/dashboard`,
    });

    redirect(portalSession.url);
}

export async function getSubscriptionTransactions() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true, planTier: true }
    });

    if (!vendor) {
        throw new Error("Vendor profile not found");
    }

    const transactions = await prisma.subscriptionTransaction.findMany({
        where: { vendorId: vendor.id },
        orderBy: { createdAt: "desc" },
    });

    return {
        transactions,
        planTier: vendor.planTier
    };
}
