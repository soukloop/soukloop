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

        // If not admin and trying to view another user's history, deny
        if (userId && userId !== session.user.id && currentUser?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            )
        }

        const targetUserId = userId || session.user.id

        const history = await prisma.rewardPoint.findMany({
            where: { userId: targetUserId },
            orderBy: { createdAt: 'desc' }
        })

        // Group by action type
        const byActionType = await prisma.rewardPoint.groupBy({
            by: ['actionType'],
            where: { userId: targetUserId },
            _sum: {
                points: true
            },
            _count: {
                id: true
            }
        })

        // Group by month
        const monthlyStats = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        SUM(CASE WHEN points > 0 THEN points ELSE 0 END) as earned,
        SUM(CASE WHEN points < 0 THEN ABS(points) ELSE 0 END) as redeemed,
        COUNT(*) as transaction_count
      FROM reward_points
      WHERE user_id = ${targetUserId}
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
      LIMIT 12
    `

        return NextResponse.json({
            history,
            stats: {
                byActionType,
                monthlyStats
            }
        })

    } catch (error) {
        console.error('Reward History GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
