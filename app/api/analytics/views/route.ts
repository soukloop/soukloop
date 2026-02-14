import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'

const createAnalyticsViewSchema = z.object({
    productId: z.string().min(1, 'Product ID is required')
})

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        const body = await request.json()

        const validationResult = createAnalyticsViewSchema.safeParse(body)
        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { productId } = validationResult.data

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId }
        })

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            )
        }

        // Create analytics view
        const analyticsView = await prisma.analyticsView.create({
            data: {
                productId,
                viewerId: session?.user?.id || null
            }
        })

        return NextResponse.json(analyticsView, { status: 201 })

    } catch (error) {
        console.error('Analytics View POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
