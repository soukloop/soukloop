"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { bankAccountSchema, withdrawalRequestSchema } from "./schemas";
import { Prisma } from "@prisma/client";
import { encrypt, decrypt } from "@/lib/encryption";
import { notifyAdminsWithdrawalRequested } from "@/lib/notifications/templates/finance-templates";

export async function getWithdrawalData() {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        include: {
            bankAccounts: {
                orderBy: { createdAt: "desc" },
            },
            payouts: {
                include: { bankAccount: true },
                orderBy: { createdAt: "desc" },
                take: 10,
            },
        },
    });

    if (!vendor) throw new Error("Vendor profile not found");

    // Decrypt accounts for display (Masked)
    const decryptedAccounts = vendor.bankAccounts.map(acc => {
        let last4 = "----";
        if (acc.accountNumberEncrypted) {
            try {
                const plain = decrypt(acc.accountNumberEncrypted!);
                last4 = plain.slice(-4);
            } catch (e) { console.error("Decryption failed", e) }
        } else if (acc.accountNumber) {
            // Fallback for legacy plain text rows
            last4 = acc.accountNumber.slice(-4);
        }

        return {
            ...acc,
            accountNumber: `****${last4}`, // Never send full number to client
            accountNumberEncrypted: undefined // Don't send encrypted blob either
        };
    });

    return {
        balance: Number(vendor.walletBalance),
        bankAccounts: decryptedAccounts,
        recentPayouts: vendor.payouts,
    };
}

export async function saveBankAccount(data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = bankAccountSchema.parse(data);

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
    });

    if (!vendor) throw new Error("Vendor profile not found");

    // Encrypt sensitive fields
    const encryptedAccount = encrypt(validated.accountNumber);
    const encryptedRouting = validated.routingNumber ? encrypt(validated.routingNumber) : null;

    // If this is set as default, unset others first
    if (validated.isDefault) {
        await prisma.bankAccount.updateMany({
            where: { vendorId: vendor.id },
            data: { isDefault: false },
        });
    }

    const account = await prisma.bankAccount.create({
        data: {
            bankName: validated.bankName,
            accountHolder: validated.accountHolder,
            isDefault: validated.isDefault,
            vendorId: vendor.id,
            // Store Encrypted
            accountNumberEncrypted: encryptedAccount,
            routingNumberEncrypted: encryptedRouting,
            // Legacy/Optional - Keep null or store last 4 for easier debugging if needed? 
            // Better to keep null to force usage of encrypted field.
            accountNumber: null,
            routingNumber: null
        },
    });

    revalidatePath("/withdraw-earnings");
    revalidatePath("/editprofile");
    return account;
}

export async function updateBankAccount(id: string, data: any) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const validated = bankAccountSchema.parse(data);

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
    });

    if (!vendor) throw new Error("Vendor profile not found");

    // If this is set as default, unset others first
    if (validated.isDefault) {
        await prisma.bankAccount.updateMany({
            where: { vendorId: vendor.id },
            data: { isDefault: false },
        });
    }

    const updateData: any = {
        bankName: validated.bankName,
        accountHolder: validated.accountHolder,
        isDefault: validated.isDefault,
    };

    // Only re-encrypt if changed (Simple check: if incoming data looks like a real number, not masked)
    // Front-end should send the full number only if user edited it.
    if (!validated.accountNumber.includes('*')) {
        updateData.accountNumberEncrypted = encrypt(validated.accountNumber);
        updateData.accountNumber = null;
    }

    if (validated.routingNumber && !validated.routingNumber.includes('*')) {
        updateData.routingNumberEncrypted = encrypt(validated.routingNumber);
        updateData.routingNumber = null;
    }

    const account = await prisma.bankAccount.update({
        where: {
            id,
            vendorId: vendor.id
        },
        data: updateData,
    });

    revalidatePath("/withdraw-earnings");
    revalidatePath("/editprofile");
    return account;
}

export async function deleteBankAccount(id: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
        select: { id: true },
    });

    if (!vendor) throw new Error("Vendor profile not found");

    const account = await prisma.bankAccount.delete({
        where: {
            id,
            vendorId: vendor.id
        },
    });

    revalidatePath("/withdraw-earnings");
    revalidatePath("/editprofile");
    return account;
}

export async function requestWithdrawal(data: { amount: number; bankAccountId: string }) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const { amount, bankAccountId } = withdrawalRequestSchema.parse(data);
    const requestAmount = new Prisma.Decimal(amount);

    const vendor = await prisma.vendor.findUnique({
        where: { userId: session.user.id },
    });

    if (!vendor) throw new Error("Vendor not found");

    // Run in Serializable Transaction to prevent Race Conditions
    const result = await prisma.$transaction(async (tx) => {
        // Re-fetch balance inside lock
        const currentVendor = await tx.vendor.findUnique({
            where: { id: vendor.id },
            select: { walletBalance: true }
        });

        if (!currentVendor) throw new Error("Vendor not found during transaction");

        const currentBalance = new Prisma.Decimal(currentVendor.walletBalance);

        if (requestAmount.gt(currentBalance)) {
            throw new Error("Insufficient balance");
        }

        // 1. Deduct balance
        const updatedVendor = await tx.vendor.update({
            where: { id: vendor.id },
            data: { walletBalance: { decrement: requestAmount } },
        });

        // 2. Create Payout
        const payout = await tx.payout.create({
            data: {
                vendorId: vendor.id,
                bankAccountId,
                amount: requestAmount,
                method: "BANK_TRANSFER",
                status: "PENDING",
            },
        });

        // 3. Log Wallet Transaction
        await tx.walletTransaction.create({
            data: {
                vendorId: vendor.id,
                amount: requestAmount,
                type: "DEBIT",
                referenceId: payout.id,
                description: `Withdrawal request`,
            },
        });

        // 4. Notify Admins (Outside transaction if possible, but inside for consistency/safety is fine as it's async but we await it)
        // Ideally we should do this AFTER transaction commits, but here we can just fire and forget or await.
        // Since we are in a transaction, we should technically wait until after, but for simplicity here:
        // formatting account info
        // We know bankAccountId is valid because foreign key constraint in payout creation would fail otherwise? 
        // Actually we didn't fetch bank account details here. We need them for the email.

        return payout;
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable // STRICT mode
    });

    // Fetch bank details for email after transaction
    try {
        const bankAccount = await prisma.bankAccount.findUnique({
            where: { id: bankAccountId }
        });

        if (bankAccount) {
            let last4 = '****';
            if (bankAccount.accountNumberEncrypted) {
                try {
                    const plain = decrypt(bankAccount.accountNumberEncrypted);
                    last4 = plain.slice(-4);
                } catch (e) { }
            } else if (bankAccount.accountNumber) {
                last4 = bankAccount.accountNumber.slice(-4);
            }

            // Fire and forget notification
            notifyAdminsWithdrawalRequested(
                vendor.userId, // Use userId (or fetch name if needed, but userId is safer than non-existent storeName)
                amount,
                bankAccount.bankName,
                last4
            ).catch(err => console.error("Failed to notify admins of withdrawal", err));
        }
    } catch (e) {
        console.error("Error fetching bank details for notification", e);
    }

    revalidatePath("/withdraw-earnings");
    return result;
}
