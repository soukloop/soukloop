import { z } from "zod";

export const bankAccountSchema = z.object({
    bankName: z.string().min(1, "Bank name is required"),
    accountHolder: z.string().min(1, "Account holder name is required"),
    accountNumber: z.string().min(5, "Account number must be at least 5 characters"),
    routingNumber: z.string().optional(),
    isDefault: z.boolean().default(false),
});

export const withdrawalRequestSchema = z.object({
    amount: z.number().min(10, "Minimum withdrawal amount is $10"),
    bankAccountId: z.string().min(1, "Please select a bank account"),
});

export type BankAccountSchema = z.infer<typeof bankAccountSchema>;
export type WithdrawalRequestSchema = z.infer<typeof withdrawalRequestSchema>;
