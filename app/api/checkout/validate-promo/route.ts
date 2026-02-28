import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        // Allow guests to validate promos? Let's check session just in case,
        // but typically carts can be tied to a session or local storage.
        // For Soukloop, let's assume Cart is tied to User for checkout.
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { code, vendorTotals } = body;

        if (!code || !vendorTotals || typeof vendorTotals !== 'object') {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fetch Coupon
        // @ts-ignore
        const coupon = await prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });

        if (!coupon) {
            return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
        }

        // 2. Validate Vendor Match
        const cartTotal = vendorTotals[coupon.vendorId];
        if (cartTotal === undefined) {
            return NextResponse.json({ error: "This promo code is not valid for this seller's items." }, { status: 400 });
        }

        // 3. Validate Active Status
        if (!coupon.isActive) {
            return NextResponse.json({ error: "This promo code is inactive." }, { status: 400 });
        }

        // 4. Validate Dates
        const now = new Date();
        if (now < new Date(coupon.startDate)) {
            return NextResponse.json({ error: "This promo code is not active yet." }, { status: 400 });
        }
        if (coupon.endDate && now > new Date(coupon.endDate)) {
            return NextResponse.json({ error: "This promo code has expired." }, { status: 400 });
        }

        // 5. Validate Uses
        if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
            return NextResponse.json({ error: "This promo code has reached its usage limit." }, { status: 400 });
        }

        // 6. Validate Minimum Order Value
        if (coupon.minOrderValue !== null && cartTotal < coupon.minOrderValue) {
            return NextResponse.json({
                error: `This promo code requires a minimum order of $${coupon.minOrderValue.toFixed(2)} from this seller.`
            }, { status: 400 });
        }

        // 7. Calculate Discount Amount
        let discountAmount = 0;
        if (coupon.discountType === "PERCENTAGE") {
            discountAmount = cartTotal * (coupon.discountValue / 100);
        } else if (coupon.discountType === "FIXED") {
            discountAmount = coupon.discountValue;
            // Prevent discount from making total negative
            if (discountAmount > cartTotal) {
                discountAmount = cartTotal;
            }
        }

        return NextResponse.json({
            success: true,
            discountAmount,
            couponId: coupon.id,
            code: coupon.code,
            vendorId: coupon.vendorId,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderValue: coupon.minOrderValue,
        });

    } catch (error) {
        console.error("[VALIDATE_PROMO]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
