import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
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

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        // If not admin and trying to view another user's balance, deny
        if (userId && userId !== session.user.id && currentUser?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        const targetUserId = userId || session.user.id

        // Get or create balance
        let balance = await prisma.rewardBalance.findUnique({
            where: { userId: targetUserId },
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

        if (!balance) {
            // Create balance if it doesn't exist
            balance = await prisma.rewardBalance.create({
                data: {
                    userId: targetUserId,
                    totalEarned: 0,
                    totalRedeemed: 0,
                    currentBalance: 0
                },
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
        }

        // Get additional stats
        const [recentTransactions, expiringPoints] = await Promise.all([
            // Recent transactions
            prisma.rewardPoint.findMany({
                where: { userId: targetUserId },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            // Points expiring in next 30 days
            prisma.rewardPoint.findMany({
                where: {
                    userId: targetUserId,
                    points: { gt: 0 },
                    expiresAt: {
                        lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                        gte: new Date()
                    }
                }
            })
        ])

        const expiringTotal = expiringPoints.reduce((sum, p) => sum + p.points, 0)

        return NextResponse.json({
            balance,
            recentTransactions,
            expiringPoints: {
                count: expiringPoints.length,
                total: expiringTotal,
                items: expiringPoints
            }
        })

    } catch (error) {
        console.error('Reward Balance GET error:', error)
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
        const { userId } = body

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        const targetUserId = userId || session.user.id

        // Only admins can recalculate other users' balances
        if (targetUserId !== session.user.id && currentUser?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            )
        }

        // Recalculate balance from all non-expired points
        const allPoints = await prisma.rewardPoint.findMany({
            where: {
                userId: targetUserId,
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

        // Update balance
        const balance = await prisma.rewardBalance.upsert({
            where: { userId: targetUserId },
            update: {
                totalEarned,
                totalRedeemed,
                currentBalance
            },
            create: {
                userId: targetUserId,
                totalEarned,
                totalRedeemed,
                currentBalance
            }
        })

        return NextResponse.json({
            message: 'Balance recalculated successfully',
            balance
        })

    } catch (error) {
        console.error('Reward Balance POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
