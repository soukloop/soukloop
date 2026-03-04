import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { handleApiError } from "@/lib/api-wrapper";
import { z } from "zod";

const payoutRequestSchema = z.object({
    amount: z.number().min(50, "Minimum withdrawal is $50"),
    method: z.string().optional()
});

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const validationResult = payoutRequestSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { amount } = validationResult.data;
        const requestAmount = new Prisma.Decimal(amount);

        // 1. Get Vendor & Balance
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
        });

        if (!vendor) {
            return NextResponse.json({ error: "Vendor profile not found" }, { status: 404 });
        }

        const currentBalance = new Prisma.Decimal(vendor.walletBalance || 0);

        if (requestAmount.greaterThan(currentBalance)) {
            return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
        }

        // 2. Atomic Transaction
        await prisma.$transaction(async (tx) => {
            // Deduct from Wallet
            await tx.vendor.update({
                where: { id: vendor.id },
                data: { walletBalance: { decrement: requestAmount } }
            });

            // Create Payout Record
            const payout = await tx.payout.create({
                data: {
                    vendorId: vendor.id,
                    amount: requestAmount,
                    method: "BANK_TRANSFER", // Defaulting for now as per UI
                    status: "PENDING",
                }
            });

            // Log Wallet Transaction (Vendor specific)
            await tx.walletTransaction.create({
                data: {
                    vendorId: vendor.id,
                    amount: requestAmount,
                    type: "DEBIT",
                    referenceId: payout.id,
                    description: "Payout Request",
                }
            });

            // Log PaymentTransaction (General Ledger)
            await tx.paymentTransaction.create({
                data: {
                    userId: session.user.id,
                    amount: requestAmount.negated(), // Debit from platform
                    currency: "USD",
                    provider: "PAYOUT",
                    status: "PENDING",
                    providerTransactionId: payout.id
                }
            });
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return handleApiError(error);
    }
}
