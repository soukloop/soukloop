import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'

// Validation schema for creating a promotion
const createPromotionSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    type: z.enum(['FEATURED', 'BUMP_UP', 'VIDEO_PROMO']),
    videoUrl: z.string().optional(),
    startDate: z.string().or(z.date()), // Accept ISO string
    endDate: z.string().or(z.date()),   // Accept ISO string
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Get the vendor associated with the user
        const vendor = await prisma.vendor.findUnique({
            where: { userId }
        })

        if (!vendor) {
            return NextResponse.json(
                { error: 'Vendor not found' },
                { status: 404 }
            )
        }

        // Fetch promotions for products owned by this vendor
        const promotions = await prisma.promotion.findMany({
            where: {
                product: {
                    vendorId: vendor.id
                }
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: {
                            where: { isPrimary: true },
                            take: 1
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(promotions)

    } catch (error) {
        console.error('Promotions GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Validate input
        const validationResult = createPromotionSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { productId, type, videoUrl, startDate, endDate } = validationResult.data

        const userId = session.user.id

        // Verify product ownership (must belong to user's vendor)
        const product = await prisma.product.findFirst({
            where: {
                id: productId,
                vendor: {
                    userId: userId
                }
            }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found or access denied' },
                { status: 403 }
            )
        }

        // Validate video URL if required
        if (type === 'VIDEO_PROMO' && !videoUrl) {
            return NextResponse.json(
                { error: 'Video URL is required for video promotions' },
                { status: 400 }
            )
        }

        const promotion = await prisma.promotion.create({
            data: {
                product: { connect: { id: productId } },
                type,
                videoUrl: type === 'VIDEO_PROMO' ? videoUrl : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            }
        })

        return NextResponse.json(promotion, { status: 201 })

    } catch (error) {
        console.error('Promotions POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
