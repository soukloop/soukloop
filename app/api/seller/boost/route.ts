import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { Role } from "@prisma/client";

const BOOST_PACKAGES = {
    '3_DAYS': { name: 'Quick Boost (3 Days)', priceIndex: 299 }, // $2.99
    '7_DAYS': { name: 'Weekly Spotlight (7 Days)', priceIndex: 599 }, // $5.99
    '15_DAYS': { name: 'Maximum Reach (15 Days)', priceIndex: 999 }, // $9.99
};

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        if (session.user.role !== Role.SELLER) {
            return new NextResponse("Forbidden: Sellers only", { status: 403 });
        }

        const body = await req.json();
        const { productId, packageId } = body;

        if (!productId || !packageId) {
            return new NextResponse("Missing productId or packageId", { status: 400 });
        }

        const boostPackage = BOOST_PACKAGES[packageId as keyof typeof BOOST_PACKAGES];

        if (!boostPackage) {
            return new NextResponse("Invalid boost package selected", { status: 400 });
        }

        // Verify vendor exists
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        });

        if (!vendor) {
            return new NextResponse("Vendor profile not found", { status: 404 });
        }

        // Verify product belongs to vendor and is active/approved
        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        if (product.vendorId !== vendor.id) {
            return new NextResponse("Forbidden: You do not own this product", { status: 403 });
        }

        // Check if there is already an active boost for this product
        const existingActiveBoost = await prisma.productBoost.findFirst({
            where: {
                productId,
                status: 'active',
                endDate: { gt: new Date() }
            }
        });

        if (existingActiveBoost) {
            return new NextResponse("Product is already boosted", { status: 400 });
        }

        // Create the pending ProductBoost record
        const pendingBoost = await prisma.productBoost.create({
            data: {
                productId: product.id,
                vendorId: vendor.id,
                packageType: packageId,
                status: 'pending_payment',
                // endDate will be set properly in the webhook
                endDate: new Date()
            }
        });

        // Initialize Stripe Checkout session
        const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "https://www.soukloop.com";

        const stripeSession = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            client_reference_id: vendor.id,
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Product Boost: ${product.name}`,
                            description: boostPackage.name,
                        },
                        unit_amount: boostPackage.priceIndex,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                type: 'boost_package',
                boostId: pendingBoost.id,
                vendorId: vendor.id,
                productId: product.id
            },
            success_url: `${origin}/seller/manage-listings?boost=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/seller/manage-listings?boost=cancelled`,
        });

        if (!stripeSession?.url) {
            throw new Error("Failed to create Stripe Checkout session");
        }

        return NextResponse.json({ url: stripeSession.url });

    } catch (error) {
        console.error("[BOOST_CHECKOUT]", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
