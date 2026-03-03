import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, SubscriptionTier } from "@prisma/client";

// This route should only be called by the Vercel Cron service.
// We secure it with a basic check against the CRON_SECRET environment variable.
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("[CRON] Starting weekly auto-payout generation...");

        // Find all vendors eligible for weekly payouts
        const eligibleVendors = await prisma.vendor.findMany({
            where: {
                // Must be on a tier that grants weekly payouts (STARTER or PRO)
                planTier: { in: ['STARTER', 'PRO'] as any },
                // Must have at least $50 to withdraw
                walletBalance: { gte: 50 },
                // Must have a default bank account configured
                bankAccounts: { some: { isDefault: true } },
                // MUST NOT have any currently pending payout requests
                payouts: { none: { status: 'pending' } }
            },
            include: {
                bankAccounts: {
                    where: { isDefault: true },
                    take: 1
                }
            }
        });

        console.log(`[CRON] Found ${eligibleVendors.length} eligible vendors for auto-payout.`);

        const results = {
            successCount: 0,
            failureCount: 0,
            failures: [] as string[]
        };

        for (const vendor of eligibleVendors) {
            try {
                // Prisma returns bankAccounts as an array because of the 1:M relationship, but we used `take: 1`
                const bankAccount = (vendor as any).bankAccounts[0];
                if (!bankAccount) continue;

                // Create the payout within a transaction exactly like manual withdrawals do
                await prisma.$transaction(async (tx) => {
                    // Re-fetch lock to prevent race conditions just in case
                    const currentVendor = await tx.vendor.findUnique({
                        where: { id: vendor.id },
                        select: { walletBalance: true }
                    });

                    if (!currentVendor) throw new Error("Vendor not found during transaction");

                    // We withdraw the entire available balance.
                    const amountToWithdraw = new Prisma.Decimal(currentVendor.walletBalance);

                    if (amountToWithdraw.lt(50)) {
                        throw new Error("Balance fell below $50 threshold before processing");
                    }

                    // 1. Deduct balance completely
                    await tx.vendor.update({
                        where: { id: vendor.id },
                        data: { walletBalance: 0 },
                    });

                    // 2. Create the PENDING Payout
                    const payout = await tx.payout.create({
                        data: {
                            vendorId: vendor.id,
                            bankAccountId: bankAccount.id,
                            amount: amountToWithdraw,
                            method: "BANK_TRANSFER",
                            status: "PENDING",
                        },
                    });

                    // 3. Log the Wallet Transaction
                    await tx.walletTransaction.create({
                        data: {
                            vendorId: vendor.id,
                            amount: amountToWithdraw,
                            type: "DEBIT",
                            referenceId: payout.id,
                            description: "Automated Weekly Payout Request",
                        },
                    });
                }, {
                    isolationLevel: Prisma.TransactionIsolationLevel.Serializable
                });

                results.successCount++;
            } catch (err: any) {
                console.error(`[CRON] Failed to process auto-payout for vendor ${vendor.id}:`, err);
                results.failureCount++;
                results.failures.push(`Vendor ${vendor.id}: ${err.message}`);
            }
        }

        console.log(`[CRON] Finished weekly auto-payout generation. Success: ${results.successCount}, Failures: ${results.failureCount}`);

        return NextResponse.json({
            message: "Weekly payouts processed successfully",
            processed: results.successCount,
            failed: results.failureCount,
            errors: results.failures
        });

    } catch (error: any) {
        console.error("[CRON] Global error processing payouts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
