'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { RewardService } from './service';
import { awardPointsSchema, redeemPointsSchema, AwardPointsInput, RedeemPointsInput } from './schemas';
import { revalidatePath } from 'next/cache';

/**
 * Server Action to award points (Admin or System only)
 */
export async function awardPointsAction(input: AwardPointsInput) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    // Security: Only allow awarding points to others if admin
    const targetUserId = input.userId || session.user.id;
    if (targetUserId !== session.user.id) {
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });
        if (currentUser?.role !== 'ADMIN') throw new Error('Forbidden');
    }

    const validated = awardPointsSchema.parse(input);

    const result = await prisma.$transaction(async (tx) => {
        return await RewardService.awardPoints(tx, {
            ...validated,
            userId: targetUserId
        });
    });

    revalidatePath('/rewardpoints');
    return result;
}

/**
 * Server Action to redeem points
 */
export async function redeemPointsAction(input: RedeemPointsInput) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const validated = redeemPointsSchema.parse(input);

    const result = await prisma.$transaction(async (tx) => {
        return await RewardService.redeemPoints(tx, session.user.id as string, validated);
    }, {
        isolationLevel: 'Serializable'
    });

    revalidatePath('/rewardpoints');
    revalidatePath('/cart');
    return result;
}

/**
 * Fetches the current user's reward balance and recent history.
 */
/**
 * Fetches the current user's reward balance and recent history with pagination.
 */
export async function getMyRewardsAction(page: number = 1, limit: number = 5) {
    const session = await auth();
    if (!session?.user) return null;

    const skip = (page - 1) * limit;

    const [balance, history, total] = await Promise.all([
        prisma.rewardBalance.findUnique({
            where: { userId: session.user.id }
        }),
        prisma.rewardPoint.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: skip
        }),
        prisma.rewardPoint.count({
            where: { userId: session.user.id }
        })
    ]);

    return {
        balance,
        history,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    };
}
