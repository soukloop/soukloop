import { prisma } from '@/lib/prisma'

/**
 * Reward Points Configuration
 * Define how many points are awarded for each action
 */
export const REWARD_POINTS_CONFIG = {
    REGISTRATION_BONUS: 100,
    LISTING_POSTED: 50,
    PURCHASE_COMPLETED: 200, // Base points, can be % of order value
    ORDER_DELIVERED: 50,
    PROFILE_COMPLETED: 25,
    PROMOTION_PURCHASE: 100,
    REFERRAL_BONUS: 150,
    REVIEW_POSTED: 20,
    DAILY_LOGIN: 5,
    FIRST_PURCHASE: 500
} as const

/**
 * Award points to a user
 */
export async function awardPoints(params: {
    userId: string
    points: number
    actionType: string
    referenceId?: string
    referenceType?: string
    note?: string
    expiresAt?: Date
}) {
    const { userId, points, actionType, referenceId, referenceType, note, expiresAt } = params

    // Create reward point record
    const rewardPoint = await prisma.rewardPoint.create({
        data: {
            userId,
            points,
            actionType,
            referenceId: referenceId || null,
            referenceType: referenceType || null,
            note: note || null,
            expiresAt: expiresAt || null
        }
    })

    // Update user's balance
    await updateUserBalance(userId)

    return rewardPoint
}

/**
 * Redeem points from a user
 */
export async function redeemPoints(params: {
    userId: string
    points: number
    referenceId?: string
    note?: string
}) {
    const { userId, points, referenceId, note } = params

    // Check if user has enough points
    const balance = await prisma.rewardBalance.findUnique({
        where: { userId }
    })

    if (!balance || balance.currentBalance < points) {
        throw new Error('Insufficient points balance')
    }

    // Create redemption record (negative points)
    const redemption = await prisma.rewardPoint.create({
        data: {
            userId,
            points: -points,
            actionType: 'points_redeemed',
            referenceId: referenceId || null,
            referenceType: 'redemption',
            note: note || null
        }
    })

    // Update user's balance
    await updateUserBalance(userId)

    return redemption
}

/**
 * Update user's reward balance
 */
export async function updateUserBalance(userId: string) {
    // Get all non-expired points
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

    return { totalEarned, totalRedeemed, currentBalance }
}

/**
 * Get user's current balance
 */
export async function getUserBalance(userId: string) {
    let balance = await prisma.rewardBalance.findUnique({
        where: { userId }
    })

    if (!balance) {
        // Create balance if it doesn't exist
        balance = await prisma.rewardBalance.create({
            data: {
                userId,
                totalEarned: 0,
                totalRedeemed: 0,
                currentBalance: 0
            }
        })
    }

    return balance
}

/**
 * Get points expiring soon for a user
 */
export async function getExpiringPoints(userId: string, daysAhead: number = 30) {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    const expiringPoints = await prisma.rewardPoint.findMany({
        where: {
            userId,
            points: { gt: 0 },
            expiresAt: {
                lte: futureDate,
                gte: new Date()
            }
        },
        orderBy: { expiresAt: 'asc' }
    })

    const total = expiringPoints.reduce((sum, p) => sum + p.points, 0)

    return {
        points: expiringPoints,
        total,
        count: expiringPoints.length
    }
}

/**
 * Expire old points (should be run as a cron job)
 */
export async function expireOldPoints() {
    const now = new Date()

    // Find all expired points that haven't been processed
    const expiredPoints = await prisma.rewardPoint.findMany({
        where: {
            expiresAt: { lt: now },
            points: { gt: 0 }
        },
        include: {
            user: true
        }
    })

    // Group by user
    const userIds = [...new Set(expiredPoints.map(p => p.userId))]

    // Update balances for affected users
    for (const userId of userIds) {
        await updateUserBalance(userId)
    }

    return {
        expiredCount: expiredPoints.length,
        affectedUsers: userIds.length
    }
}

/**
 * Award points for registration
 */
export async function awardRegistrationBonus(userId: string) {
    return awardPoints({
        userId,
        points: REWARD_POINTS_CONFIG.REGISTRATION_BONUS,
        actionType: 'registration_bonus',
        note: 'Welcome bonus for new user'
    })
}

/**
 * Award points for listing posted
 */
export async function awardListingBonus(userId: string, listingId: string) {
    return awardPoints({
        userId,
        points: REWARD_POINTS_CONFIG.LISTING_POSTED,
        actionType: 'listing_posted',
        referenceId: listingId,
        referenceType: 'listing',
        note: 'Posted a new listing'
    })
}

/**
 * Award points for purchase
 */
export async function awardPurchaseBonus(userId: string, orderId: string, orderAmount: number) {
    // Award base points + percentage of order
    const basePoints = REWARD_POINTS_CONFIG.PURCHASE_COMPLETED
    const bonusPoints = Math.floor(orderAmount * 0.01) // 1% of order value
    const totalPoints = basePoints + bonusPoints

    // Points expire in 90 days
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 90)

    return awardPoints({
        userId,
        points: totalPoints,
        actionType: 'purchase_completed',
        referenceId: orderId,
        referenceType: 'order',
        note: `Purchase reward (${basePoints} base + ${bonusPoints} bonus)`,
        expiresAt
    })
}

/**
 * Award points for order delivered
 */
export async function awardOrderDeliveredBonus(userId: string, orderId: string) {
    return awardPoints({
        userId,
        points: REWARD_POINTS_CONFIG.ORDER_DELIVERED,
        actionType: 'order_delivered',
        referenceId: orderId,
        referenceType: 'order',
        note: 'Order successfully delivered'
    })
}

/**
 * Award points for profile completion
 */
export async function awardProfileCompletedBonus(userId: string) {
    // Check if already awarded
    const existing = await prisma.rewardPoint.findFirst({
        where: {
            userId,
            actionType: 'profile_completed'
        }
    })

    if (existing) {
        return null // Already awarded
    }

    return awardPoints({
        userId,
        points: REWARD_POINTS_CONFIG.PROFILE_COMPLETED,
        actionType: 'profile_completed',
        note: 'Profile completed'
    })
}

/**
 * Award points for referral
 */
export async function awardReferralBonus(userId: string, referredUserId: string) {
    return awardPoints({
        userId,
        points: REWARD_POINTS_CONFIG.REFERRAL_BONUS,
        actionType: 'referral_bonus',
        referenceId: referredUserId,
        referenceType: 'referral',
        note: 'Referred a new user'
    })
}
