import { z } from 'zod';

export const awardPointsSchema = z.object({
    userId: z.string().optional(),
    points: z.number().int().positive('Points must be positive'),
    actionType: z.string().min(1, 'Action type is required'),
    referenceId: z.string().optional(),
    referenceType: z.string().optional(),
    note: z.string().optional(),
    expiresAt: z.date().optional(),
});

export const redeemPointsSchema = z.object({
    points: z.number().int().positive('Points must be positive'),
    referenceId: z.string().optional(),
    note: z.string().optional(),
});

export type AwardPointsInput = z.infer<typeof awardPointsSchema>;
export type RedeemPointsInput = z.infer<typeof redeemPointsSchema>;
