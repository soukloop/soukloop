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

        // Check if user is admin
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (currentUser?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            )
        }

        // Get top users by points
        const topUsers = await prisma.rewardBalance.findMany({
            orderBy: { currentBalance: 'desc' },
            take: 10,
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

        // Get total stats
        const totalStats = await prisma.rewardBalance.aggregate({
            _sum: {
                totalEarned: true,
                totalRedeemed: true,
                currentBalance: true
            },
            _count: {
                userId: true
            }
        })

        // Get points distribution by action type
        const actionTypeStats = await prisma.rewardPoint.groupBy({
            by: ['actionType'],
            _sum: {
                points: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    points: 'desc'
                }
            }
        })

        // Get recent transactions (all users)
        const recentTransactions = await prisma.rewardPoint.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
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

        // Get expiring points summary WITHOUT pulling all rows into memory
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const expiringWhere = {
            points: { gt: 0 },
            expiresAt: {
                lte: thirtyDaysFromNow,
                gte: new Date()
            }
        };

        const expiringAgg = await prisma.rewardPoint.aggregate({
            where: expiringWhere,
            _sum: { points: true },
            _count: { id: true }
        });

        // Only fetch a limited sample of expiring points for the UI
        const expiringPointsList = await prisma.rewardPoint.findMany({
            where: expiringWhere,
            take: 20,
            orderBy: { expiresAt: 'asc' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        const expiringTotal = expiringAgg._sum.points || 0;
        const expiringCount = expiringAgg._count.id || 0;

        return NextResponse.json({
            topUsers,
            totalStats: {
                totalUsers: totalStats._count.userId,
                totalEarned: totalStats._sum.totalEarned || 0,
                totalRedeemed: totalStats._sum.totalRedeemed || 0,
                totalOutstanding: totalStats._sum.currentBalance || 0
            },
            actionTypeStats,
            recentTransactions,
            expiringPoints: {
                count: expiringCount,
                total: expiringTotal,
                items: expiringPointsList
            }
        })

    } catch (error) {
        console.error('Reward Stats GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
