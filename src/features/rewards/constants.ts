export const REWARD_RULES = {
    POINTS_PER_DOLLAR: 1,
    POINTS_FOR_REVIEW: 25,
    POINTS_FOR_REGISTRATION: 50,
    REDEMPTION_RATE: 0.01, // $0.01 per point
    MINIMUM_REDEMPTION_POINTS: 100,
} as const;

export const ACTION_TYPES = {
    PURCHASE: 'purchase',
    REVIEW: 'review',
    REGISTRATION: 'registration',
    REDEEMED: 'points_redeemed',
    ADMIN_AWARD: 'admin_award',
    ADMIN_DEDUCT: 'admin_deduct',
} as const;

export const REFERENCE_TYPES = {
    ORDER: 'order',
    REVIEW: 'review',
    REDEMPTION: 'redemption',
    SYSTEM: 'system',
} as const;
