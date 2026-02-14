import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const awardPointsSchema = z.object({
    userId: z.string().optional(), // Admin can specify userId
    points: z.number().int().positive('Points must be positive'),
    actionType: z.string().min(1, 'Action type is required'),
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
    note: z.string().optional(),
    expiresAt: z.string().datetime().optional()
})

const redeemPointsSchema = z.object({
    points: z.number().int().positive('Points must be positive'),
    referenceId: z.string().optional(),
    note: z.string().optional()
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
        const userId = searchParams.get('userId')
        const actionType = searchParams.get('actionType')
        const limit = parseInt(searchParams.get('limit') || '50')
        const includeExpired = searchParams.get('includeExpired') === 'true'

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        // If not admin and trying to view another user's points, deny
        if (userId && userId !== session.user.id && currentUser?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        const targetUserId = userId || session.user.id

        const where: any = { userId: targetUserId }

        if (actionType) {
            where.actionType = actionType
        }

        if (!includeExpired) {
            where.OR = [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        }

        const points = await prisma.rewardPoint.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        return NextResponse.json(points)

    } catch (error) {
        console.error('Reward Points GET error:', error)
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
        const action = body.action // 'award' or 'redeem'

        if (action === 'award') {
            return await awardPoints(request, session, body)
        } else if (action === 'redeem') {
            return await redeemPoints(request, session, body)
        } else {
            return NextResponse.json(
                { error: 'Invalid action. Use "award" or "redeem"' },
                { status: 400 }
            )
        }

    } catch (error) {
        console.error('Reward Points POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

async function awardPoints(request: NextRequest, session: any, body: any) {
    const validationResult = awardPointsSchema.safeParse(body)

    if (!validationResult.success) {
        return NextResponse.json(
            { error: 'Invalid input', details: validationResult.error.flatten() },
            { status: 400 }
        )
    }

    const { userId, points, actionType, referenceId, referenceType, note, expiresAt } = validationResult.data

    // Check if admin when awarding to another user
    const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id }
    })

    const targetUserId = userId || session.user.id

    if (targetUserId !== session.user.id && currentUser?.role !== 'ADMIN') {
        return NextResponse.json(
            { error: 'Forbidden - Admin access required to award points to other users' },
            { status: 403 }
        )
    }

    // Create reward point
    const rewardPoint = await prisma.rewardPoint.create({
        data: {
            userId: targetUserId,
            points,
            actionType,
            referenceId: referenceId || null,
            referenceType: referenceType || null,
            note: note || null,
            expiresAt: expiresAt ? new Date(expiresAt) : null
        }
    })

    // Update balance
    await updateUserBalance(targetUserId)

    return NextResponse.json(rewardPoint, { status: 201 })
}

async function redeemPoints(request: NextRequest, session: any, body: any) {
    const validationResult = redeemPointsSchema.safeParse(body)

    if (!validationResult.success) {
        return NextResponse.json(
            { error: 'Invalid input', details: validationResult.error.flatten() },
            { status: 400 }
        )
    }

    const { points, referenceId, note } = validationResult.data

    // Check user's current balance
    const balance = await prisma.rewardBalance.findUnique({
        where: { userId: session.user.id }
    })

    if (!balance || balance.currentBalance < points) {
        return NextResponse.json(
            { error: 'Insufficient points balance' },
            { status: 400 }
        )
    }

    // Create redemption record (negative points)
    const redemption = await prisma.rewardPoint.create({
        data: {
            userId: session.user.id,
            points: -points,
            actionType: 'points_redeemed',
            referenceId: referenceId || null,
            referenceType: 'redemption',
            note: note || null
        }
    })

    // Update balance
    await updateUserBalance(session.user.id)

    return NextResponse.json(redemption, { status: 201 })
}

async function updateUserBalance(userId: string) {
    // Calculate totals
    const allPoints = await prisma.rewardPoint.findMany({
        where: {
            userId,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        }
    })

    const totalEarned = allPoints
        .filter(p => p.points > 0)
        .reduce((sum, p) => sum + p.points, 0)

    const totalRedeemed = Math.abs(
        allPoints
            .filter(p => p.points < 0)
            .reduce((sum, p) => sum + p.points, 0)
    )

    const currentBalance = totalEarned - totalRedeemed

    // Upsert balance
    await prisma.rewardBalance.upsert({
        where: { userId },
        update: {
            totalEarned,
            totalRedeemed,
            currentBalance
        },
        create: {
            userId,
            totalEarned,
            totalRedeemed,
            currentBalance
        }
    })
}
