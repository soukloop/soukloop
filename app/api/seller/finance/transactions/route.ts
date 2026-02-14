import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get Vendor
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        });

        if (!vendor) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        // 2. Fetch Transactions
        const transactions = await prisma.walletTransaction.findMany({
            where: { vendorId: vendor.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // 3. Enrich with Payout Status (for Debits)
        // Collect Payout IDs
        const payoutIds = transactions
            .filter(t => t.type === 'DEBIT' && t.referenceId)
            .map(t => t.referenceId as string);

        // Fetch Payouts if needed
        let payoutsMap: Record<string, string> = {};
        if (payoutIds.length > 0) {
            const payouts = await prisma.payout.findMany({
                where: { id: { in: payoutIds } },
                select: { id: true, status: true }
            });
            payouts.forEach(p => {
                payoutsMap[p.id] = p.status;
            });
        }

        // 4. Transform for UI
        const formattedTransactions = transactions.map(t => {
            let status = 'Completed'; // Default for Credits

            if (t.type === 'DEBIT') {
                // If it's a Debit, check if we have a payout status
                if (t.referenceId && payoutsMap[t.referenceId]) {
                    status = payoutsMap[t.referenceId]; // e.g., PENDING, PAID
                }
            }

            return {
                id: t.id,
                date: t.createdAt.toISOString(), // Client will format
                amount: t.amount.toString(),
                type: t.type,
                description: t.description,
                status: status
            };
        });

        return NextResponse.json(formattedTransactions);

    } catch (error) {
        console.error("Fetch Transactions Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
