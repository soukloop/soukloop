import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

const recentlyViewedSchema = z.object({
    productId: z.string().min(1, 'Product ID is required')
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const history = await prisma.recentlyViewed.findMany({
            where: { userId: session.user.id },
            include: {
                product: {
                    include: {
                        images: {
                            orderBy: { order: 'asc' },
                            take: 1
                        },
                        vendor: {
                            select: {
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { viewedAt: 'desc' },
            take: 12
        })

        return NextResponse.json(history.map(h => h.product))

    } catch (error) {
        return handleApiError(error)
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = recentlyViewedSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        let { productId } = validationResult.data

        // Check if productId is a valid UUID/CUID, if not try to find by slug
        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    { id: productId },
                    { slug: productId }
                ]
            },
            select: { id: true }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        productId = product.id;

        // Upsert recently viewed record
        await prisma.recentlyViewed.upsert({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId
                }
            },
            update: {
                viewedAt: new Date()
            },
            create: {
                userId: session.user.id,
                productId
            }
        })

        return NextResponse.json({ success: true }, { status: 201 })

    } catch (error) {
        return handleApiError(error)
    }
}
