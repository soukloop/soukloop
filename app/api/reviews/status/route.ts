import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-wrapper'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')
        const session = await auth()

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            )
        }

        // 1. Check if ANY valid order exists (Sold)
        // We consider it sold if it's PAID, PROCESSING, FULFILLED, SHIPPED, or DELIVERED.
        // Assuming "Accepted" by seller implies at least PAID or PROCESSING state.
        const soldOrder = await prisma.order.findFirst({
            where: {
                status: {
                    in: ['PAID', 'DELIVERED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                },
                items: {
                    some: {
                        productId: productId
                    }
                }
            },
            select: { id: true }
        });

        const isSold = !!soldOrder;

        let canReview = false;
        let hasReviewed = false;

        if (session?.user?.id) {
            // 2. Check if Current User can review (Must be DELIVERED)
            const purchase = await prisma.order.findFirst({
                where: {
                    userId: session.user.id,
                    status: 'DELIVERED', // Strict check for delivery
                    items: {
                        some: {
                            productId: productId
                        }
                    }
                },
                select: { id: true }
            });

            canReview = !!purchase;

            // 3. Check if they have already reviewed
            const review = await prisma.review.findFirst({
                where: {
                    userId: session.user.id,
                    productId: productId
                },
                select: { id: true }
            });

            hasReviewed = !!review;
        }

        return NextResponse.json({
            isSold,
            canReview,
            hasReviewed
        });

    } catch (error) {
        return handleApiError(error);
    }
}
