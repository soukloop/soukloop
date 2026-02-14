import { prisma } from '@/lib/prisma';
import { AwardPointsInput, RedeemPointsInput } from './schemas';
import { ACTION_TYPES, REFERENCE_TYPES } from './constants';

/**
 * Service to handle reward points logic with database integrity.
 * Should be used within transactions where possible.
 */
export class RewardService {
    /**
     * Recalculates and updates the user's reward balance using efficient SQL aggregation.
     */
    static async updateBalance(tx: any, userId: string) {
        const now = new Date();

        // Sum all non-expired positive and negative points
        const result = await tx.rewardPoint.aggregate({
            where: {
                userId,
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } }
                ]
            },
            _sum: {
                points: true
            }
        });

        const currentBalance = result._sum.points || 0;

        // Sum total earned (only positive points)
        const earnedResult = await tx.rewardPoint.aggregate({
            where: {
                userId,
                points: { gt: 0 }
            },
            _sum: {
                points: true
            }
        });

        const totalEarned = earnedResult._sum.points || 0;

        // Sum total redeemed (only negative points, stored as absolute)
        const redeemedResult = await tx.rewardPoint.aggregate({
            where: {
                userId,
                points: { lt: 0 }
            },
            _sum: {
                points: true
            }
        });

        const totalRedeemed = Math.abs(redeemedResult._sum.points || 0);

        return await tx.rewardBalance.upsert({
            where: { userId },
            update: {
                currentBalance,
                totalEarned,
                totalRedeemed,
                updatedAt: now
            },
            create: {
                userId,
                currentBalance,
                totalEarned,
                totalRedeemed
            }
        });
    }

    /**
     * Awards points to a user.
     */
    static async awardPoints(tx: any, input: AwardPointsInput & { userId: string }) {
        const rewardPoint = await tx.rewardPoint.create({
            data: {
                userId: input.userId,
                points: input.points,
                actionType: input.actionType,
                referenceId: input.referenceId,
                referenceType: input.referenceType,
                note: input.note,
                expiresAt: input.expiresAt,
            }
        });

        await this.updateBalance(tx, input.userId);
        return rewardPoint;
    }

    /**
     * Redeems points from a user's balance.
     */
    static async redeemPoints(tx: any, userId: string, input: RedeemPointsInput) {
        // 1. Lock the balance row for this user to prevent concurrent redemptions
        // Use raw SQL because Prisma doesn't support FOR UPDATE in findUnique
        await tx.$executeRaw`SELECT 1 FROM reward_balances WHERE user_id = ${userId} FOR UPDATE`;

        const balance = await tx.rewardBalance.findUnique({
            where: { userId }
        });

        if (!balance || balance.currentBalance < input.points) {
            throw new Error('Insufficient points balance');
        }

        // 2. Create redemption record
        const redemption = await tx.rewardPoint.create({
            data: {
                userId,
                points: -input.points,
                actionType: ACTION_TYPES.REDEEMED,
                referenceId: input.referenceId,
                referenceType: REFERENCE_TYPES.REDEMPTION,
                note: input.note,
            }
        });

        // 3. Update balance
        await this.updateBalance(tx, userId);
        return redemption;
    }
}
