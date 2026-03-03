import { SubscriptionTier } from "@prisma/client";

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, {
    maxActiveListings: number;
    commissionBps: number;
    maxPromoCodes: number;
    payoutSchedule: 'STANDARD' | 'WEEKLY';
    hasSellerStats: boolean;
    hasPremiumBadge: boolean;
}> = {
    BASIC: {
        maxActiveListings: 3,
        commissionBps: 1200, // 12%
        maxPromoCodes: 0,
        payoutSchedule: 'STANDARD',
        hasSellerStats: false,
        hasPremiumBadge: false
    },
    STARTER: {
        maxActiveListings: 30,
        commissionBps: 1000, // 10%
        maxPromoCodes: 5,
        payoutSchedule: 'WEEKLY',
        hasSellerStats: true,
        hasPremiumBadge: true
    },
    PRO: {
        maxActiveListings: Infinity,
        commissionBps: 800, // 8%
        maxPromoCodes: Infinity,
        payoutSchedule: 'WEEKLY',
        hasSellerStats: true,
        hasPremiumBadge: true
    }
};
