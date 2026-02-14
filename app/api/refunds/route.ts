import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const refundCreateSchema = z.object({
    orderId: z.string().min(1, 'Order ID is required'),
    amount: z.number().positive('Amount must be positive'),
    reason: z.string().optional(),
    comments: z.string().optional(),
    contact: z.string().optional(),
    metadata: z.any().optional()
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get('orderId')
        const cursor = searchParams.get('cursor')
        const limit = parseInt(searchParams.get('limit') || '20', 10)
        const role = searchParams.get('role') // 'buyer' | 'seller'

        const where: any = {}

        // If not admin, check if user is Vendor or Buyer
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { vendor: true }
        })

        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            // Admin sees all, filtered by params if any
        } else if (user?.vendor) {
            if (role === 'seller') {
                // ONLY incoming requests for my products
                where.order = { vendorId: user.vendor.id }
            } else if (role === 'buyer') {
                // ONLY my own refund requests
                const ownOrderIds = await prisma.order.findMany({
                    where: { userId: session.user.id },
                    select: { id: true }
                }).then(orders => orders.map(o => o.id));
                where.orderId = { in: ownOrderIds }
            } else {
                // Mix (legacy behavior or all)
                const ownOrderIds = await prisma.order.findMany({
                    where: { userId: session.user.id },
                    select: { id: true }
                }).then(orders => orders.map(o => o.id));

                where.OR = [
                    { order: { vendorId: user.vendor.id } },
                    { orderId: { in: ownOrderIds } }
                ];
            }
        } else {
            // Regular user sees their own requests
            const userOrders = await prisma.order.findMany({
                where: { userId: session.user.id },
                select: { id: true }
            })
            where.orderId = { in: userOrders.map(o => o.id) }
        }

        if (orderId) {
            // Use AND to ensure we don't break the role-based scoping (security)
            // and allow searching by either internal UUID or human-readable Order Number
            where.AND = [
                ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
                {
                    OR: [
                        { id: orderId }, // Support searching by Refund ID (Ref #)
                        { orderId: orderId }, // Support searching by Order UUID
                        { order: { orderNumber: orderId } } // Support searching by Order Number
                    ]
                }
            ];
        }

        const search = searchParams.get('search');
        if (search) {
            where.AND = [
                ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
                {
                    OR: [
                        { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
                        { orderItem: { product: { name: { contains: search, mode: 'insensitive' } } } }
                    ]
                }
            ];
        }

        const take = limit + 1; // Fetch 1 extra to check if there are more

        const refunds = await prisma.refund.findMany({
            where,
            include: {
                orderItem: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                },
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        userId: true,
                        vendorId: true,
                        createdAt: true, // Needed for timeline
                        updatedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        vendor: {
                            select: {
                                userId: true
                            }
                        }
                    }
                }
            },
            take,
            skip: cursor && cursor !== 'null' ? 1 : 0,
            cursor: cursor && cursor !== 'null' ? { id: cursor } : undefined,
            orderBy: { createdAt: 'desc' }
        })

        let nextCursor: string | null = null;
        if (refunds.length > limit) {
            const nextItem = refunds.pop();
            nextCursor = nextItem?.id || refunds[limit - 1].id;
        }

        return NextResponse.json({
            items: refunds,
            nextCursor
        })

    } catch (error) {
        console.error('Refunds GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Extended schema for itemId
        const extendedSchema = refundCreateSchema.extend({
            itemId: z.string().optional()
        })

        const validationResult = extendedSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { orderId, amount, reason, itemId, comments, contact, metadata: bodyMetadata } = validationResult.data

        // Verify order exists and belongs to user
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: session.user.id
            }
        })

        if (!order) {
            return NextResponse.json(
                { error: 'Order not found' },
                { status: 404 }
            )
        }

        // Check if order is paid
        if (order.status !== 'PAID' && order.status !== 'DELIVERED'
        ) {
            return NextResponse.json(
                { error: 'Order must be paid to request refund' },
                { status: 400 }
            )
        }

        // Enforce 24-hour return policy
        // Check deliveredAt (preferred) or createdAt if delivery not tracked
        const timeReference = order.deliveredAt || order.createdAt
        if (timeReference) {
            const hoursSince = (Date.now() - new Date(timeReference).getTime()) / (1000 * 60 * 60)
            if (hoursSince > 24) {
                return NextResponse.json(
                    { error: 'Return window closed. Returns only accepted within 24 hours of delivery.' },
                    { status: 400 }
                )
            }
        }

        // Check if refund amount is valid
        if (amount > order.total) {
            return NextResponse.json(
                { error: 'Refund amount cannot exceed order total' },
                { status: 400 }
            )
        }

        // Check for existing refunds (EXCLUDE Rejected/Failed)
        const existingRefunds = await prisma.refund.findMany({
            where: {
                orderId,
                status: {
                    notIn: ['REJECTED', 'FAILED']
                }
            }
        })

        const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0)

        if (totalRefunded + amount > order.total) {
            return NextResponse.json(
                { error: 'Total refund amount would exceed order total' },
                { status: 400 }
            )
        }

        // Create the refund
        const refund = await prisma.refund.create({
            data: {
                orderId,
                amount,
                reason,
                status: 'PENDING',
                orderItemId: itemId || undefined,
                metadata: {
                    ...(bodyMetadata as any || {}),
                    comments,
                    contact
                }
            },
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true
                    }
                }
            }
        })

        return NextResponse.json(refund, { status: 201 })

    } catch (error) {
        console.error('Refunds POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
