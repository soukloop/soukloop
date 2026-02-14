import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

const createFavoriteSchema = z.object({
    productId: z.string().min(1, 'Product ID is required')
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        // console.log("GET /api/favorites session:", session?.user?.email, session?.user?.id); // Debug log

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const favorites = await prisma.favorite.findMany({
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
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(favorites)

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
        const validationResult = createFavoriteSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { productId } = validationResult.data

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Check if already favorited
        const existingFavorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId
                }
            }
        })

        if (existingFavorite) {
            // Toggle removal if it exists? Or just return error?
            // Usually POST is create. Let's return error or handle toggle. 
            // For now, I will treat it as ONLY create as per standard REST. 
            // The frontend can handle check.
            return NextResponse.json(
                { error: 'Already favorited' },
                { status: 409 }
            )
        }

        const favorite = await prisma.favorite.create({
            data: {
                userId: session.user.id,
                productId
            }
        })

        return NextResponse.json(favorite, { status: 201 })

    } catch (error) {
        return handleApiError(error)
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const productId = searchParams.get('productId')

        if (!productId) {
            return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
        }

        await prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId
                }
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        return handleApiError(error)
    }
}
