import { NextRequest, NextResponse } from "next/server";
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const CouponSchema = z.object({
    code: z.string().min(3).max(20).toUpperCase(),
    discountType: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().positive(),
    minOrderValue: z.number().nonnegative().optional().nullable(),
    maxUses: z.number().positive().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

        // @ts-ignore
        const coupons = await prisma.coupon.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: "desc" },
        });

        return NextResponse.json(coupons);
    } catch (error) {
        console.error("[GET_PROMOS]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

        const planLimits = SUBSCRIPTION_PLANS[vendor.planTier];

        if (planLimits.maxPromoCodes === 0) {
            return NextResponse.json({
                error: "Premium Feature Required",
                details: "Creating promo codes is not available on the Basic plan. Please upgrade to the Starter or Pro plan.",
                code: 'UPGRADE_REQUIRED'
            }, { status: 403 });
        }

        if (planLimits.maxPromoCodes !== Infinity) {
            // Count current total coupons for the vendor
            // @ts-ignore
            const couponCount = await prisma.coupon.count({
                where: { vendorId: vendor.id }
            });

            if (couponCount >= planLimits.maxPromoCodes) {
                return NextResponse.json({
                    error: "Subscription limit reached",
                    details: `You have reached the maximum limit of ${planLimits.maxPromoCodes} promo codes for the ${vendor.planTier} plan. Please upgrade to a higher tier to add more promo codes.`,
                    code: 'UPGRADE_REQUIRED'
                }, { status: 403 });
            }
        }

        const body = await request.json();
        const validation = CouponSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid data", details: validation.error.format() }, { status: 400 });
        }

        const data = validation.data;

        // Check for duplicate code
        // @ts-ignore
        const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
        if (existing) {
            return NextResponse.json({ error: "Promo code already exists" }, { status: 400 });
        }

        // Create
        // @ts-ignore
        const coupon = await prisma.coupon.create({
            data: {
                vendorId: vendor.id,
                code: data.code,
                discountType: data.discountType,
                discountValue: data.discountValue,
                minOrderValue: data.minOrderValue || null,
                maxUses: data.maxUses || null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            }
        });

        return NextResponse.json(coupon, { status: 201 });
    } catch (error) {
        console.error("[POST_PROMO]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (!id) return NextResponse.json({ error: "Promo ID required" }, { status: 400 });

        const vendor = await prisma.vendor.findUnique({ where: { userId: session.user.id } });
        if (!vendor) return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });

        // @ts-ignore
        const coupon = await prisma.coupon.findUnique({ where: { id } });
        if (!coupon || coupon.vendorId !== vendor.id) {
            return NextResponse.json({ error: "Promo not found" }, { status: 404 });
        }

        // @ts-ignore
        await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE_PROMO]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
