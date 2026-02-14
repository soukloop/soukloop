import { prisma } from "@/lib/prisma";

export const DEFAULT_REWARD_CONFIG = {
    BUYER_REWARD_RATE: 1.0, // 1 point per $1
    SELLER_REWARD_RATE: 1.0, // 1 point per $1
    POINT_VALUE_USD: 0.01 // 1 point = $0.01
};

export async function getRewardConfig() {
    // In a real app, we'd cache this or fetch from Settings table
    // For now, return defaults or fetch if needed
    // const s = await prisma.settings.findMany(...)
    return DEFAULT_REWARD_CONFIG;
}

export function getPointsForProduct(price: number, rate: number = DEFAULT_REWARD_CONFIG.BUYER_REWARD_RATE): number {
    return Math.floor(price * rate);
}

export function getDiscountForPoints(points: number, pointValue: number = DEFAULT_REWARD_CONFIG.POINT_VALUE_USD): number {
    return points * pointValue;
}
