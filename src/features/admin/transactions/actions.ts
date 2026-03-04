"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, getAdminFromRequest } from "@/lib/admin/permissions";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";

// --- Cached Stat Queries (Prevents Full Table Scans) ---
export const getCachedTransactionStats = unstable_cache(
    async () => {
        const statsData = await prisma.paymentTransaction.groupBy({
            by: ['status'],
            _count: true,
            _sum: { amount: true }
        });

        // Match exact DB casing
        const revenue = statsData
            .filter(s => {
                const status = (s.status || '').toUpperCase();
                return status === 'SUCCEEDED' || status === 'COMPLETED';
            })
            .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

        const pendingCount = statsData.find(s => (s.status || '').toUpperCase() === 'PENDING')?._count || 0;
        const failedCount = statsData.find(s => (s.status || '').toUpperCase() === 'FAILED')?._count || 0;
        const totalCount = statsData.reduce((sum, s) => sum + s._count, 0);

        return { total: totalCount, revenue, pending: pendingCount, failed: failedCount };
    },
    ['admin-payment-tx-stats'],
    { revalidate: 300, tags: ['admin-transactions'] }
);

export const getCachedPayoutStats = unstable_cache(
    async () => {
        const statsData = await prisma.payout.groupBy({
            by: ['status'],
            _count: true,
            _sum: { amount: true }
        });

        // Payout schema uses lowercase statuses
        const completedTotal = statsData
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

        const pendingCount = statsData.find(s => s.status === 'pending')?._count || 0;
        const processingCount = statsData.find(s => s.status === 'processing')?._count || 0;
        const totalCount = statsData.reduce((sum, s) => sum + s._count, 0);

        return { total: totalCount, completed: completedTotal, pending: pendingCount, processing: processingCount };
    },
    ['admin-payout-stats'],
    { revalidate: 300, tags: ['admin-payouts'] }
);

export async function getAdminTransactions({
    page = 1,
    limit = 15,
    search,
    status,
    method
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await requirePermission(session.user.id, "transactions", "view");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'all') {
        where.status = status;
    }

    if (method && method !== 'all') {
        where.provider = method;
    }

    if (search) {
        where.OR = [
            { providerTransactionId: { contains: search, mode: 'insensitive' } },
            { user: { name: { contains: search, mode: 'insensitive' } } },
            { user: { email: { contains: search, mode: 'insensitive' } } },
            { order: { orderNumber: { contains: search, mode: 'insensitive' } } }
        ];
    }

    const [transactions, totalCount, stats] = await Promise.all([
        prisma.paymentTransaction.findMany({
            where,
            include: {
                user: { select: { name: true, email: true } },
                order: { select: { orderNumber: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.paymentTransaction.count({ where }),
        getCachedTransactionStats() // Fetched from cache in ~5ms
    ]);

    return {
        transactions: JSON.parse(JSON.stringify(transactions)),
        totalCount,
        stats,
        totalPages: Math.ceil(totalCount / limit)
    };
}

export async function getAdminPayouts({
    page = 1,
    limit = 15,
    search,
    status,
    method
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    method?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await requirePermission(session.user.id, "transactions", "view");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'all') {
        where.status = status;
    }

    if (method && method !== 'all') {
        where.method = method;
    }

    if (search) {
        where.OR = [
            { vendor: { user: { name: { contains: search, mode: 'insensitive' } } } },
            { vendor: { user: { email: { contains: search, mode: 'insensitive' } } } }
        ];
    }

    const [payouts, totalCount, stats] = await Promise.all([
        prisma.payout.findMany({
            where,
            include: {
                vendor: { select: { user: { select: { name: true, email: true } } } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.payout.count({ where }),
        getCachedPayoutStats() // Fetched from cache in ~5ms
    ]);

    return {
        payouts: JSON.parse(JSON.stringify(payouts)),
        totalCount,
        stats,
        totalPages: Math.ceil(totalCount / limit)
    };
}

export const getCachedSubscriptionStats = unstable_cache(
    async () => {
        const statsData = await prisma.subscriptionTransaction.groupBy({
            by: ['status'],
            _count: true,
            _sum: { amount: true }
        });

        const completedTotal = statsData
            .filter(s => s.status === 'succeeded' || s.status === 'PAID')
            .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

        const failedCount = statsData.find(s => s.status === 'failed')?._count || 0;
        const totalCount = statsData.reduce((sum, s) => sum + s._count, 0);

        return { total: totalCount, completed: completedTotal, failed: failedCount };
    },
    ['admin-subscription-stats'],
    { revalidate: 300, tags: ['admin-subscriptions'] }
);

export async function getAdminSubscriptions({
    page = 1,
    limit = 15,
    search,
    status
}: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    await requirePermission(session.user.id, "transactions", "view");

    const skip = (page - 1) * limit;

    const where: any = {};

    if (status && status !== 'all') {
        where.status = status;
    }

    if (search) {
        where.OR = [
            { vendor: { user: { name: { contains: search, mode: 'insensitive' } } } },
            { vendor: { user: { email: { contains: search, mode: 'insensitive' } } } },
            { stripeInvoiceId: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [subscriptions, totalCount, stats] = await Promise.all([
        prisma.subscriptionTransaction.findMany({
            where,
            include: {
                vendor: { select: { user: { select: { name: true, email: true } } } },
                subscription: { select: { stripeSubscriptionId: true } }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.subscriptionTransaction.count({ where }),
        getCachedSubscriptionStats()
    ]);

    return {
        subscriptions: JSON.parse(JSON.stringify(subscriptions)),
        totalCount,
        stats,
        totalPages: Math.ceil(totalCount / limit)
    };
}



// --- Status Updates ---

/**
 * Approve a payout request
 */
export async function approvePayout(payoutId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        await requirePermission(session.user.id, "transactions", "edit");

        const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: {
                vendor: { include: { user: true } }
            }
        });

        if (!payout) throw new Error("Payout not found");
        if (payout.status !== 'pending') throw new Error("Payout is not pending");

        // Update Payout
        const updatedPayout = await prisma.payout.update({
            where: { id: payoutId },
            data: {
                status: 'completed',
                processedAt: new Date()
            }
        });

        // Notify Vendor
        const { WithdrawalProcessedEmail } = await import('@/lib/email-templates/finance/withdrawal-processed');

        await import('@/lib/notifications/create-notification').then(mod =>
            mod.createNotification({
                userId: payout.vendor.userId,
                type: 'SYSTEM_ALERT', // or a specific PAYMENT type if available
                title: 'Withdrawal Processed',
                message: `Your withdrawal of $${Number(payout.amount).toFixed(2)} has been processed.`,
                actionUrl: '/withdraw-earnings',
                sendEmail: true,
                emailSubject: `Withdrawal Processed - ${process.env.NEXT_PUBLIC_APP_NAME || 'SoukLoop'}`,
                emailReact: WithdrawalProcessedEmail({
                    amount: Number(payout.amount),
                    currency: payout.currency,
                    vendorName: payout.vendor.user.name || undefined,
                    transactionId: payout.id
                })
            })
        );

        return { success: true };
    } catch (error: any) {
        console.error("Failed to approve payout:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Reject a payout request
 */
export async function rejectPayout(payoutId: string, reason: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new Error("Unauthorized");
        await requirePermission(session.user.id, "transactions", "edit");

        const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: {
                vendor: { include: { user: true } }
            }
        });

        if (!payout) throw new Error("Payout not found");
        if (payout.status !== 'pending') throw new Error("Payout is not pending");

        // Transaction: Mark as rejected AND Refund to Wallet
        await prisma.$transaction([
            // 1. Update Payout Status
            prisma.payout.update({
                where: { id: payoutId },
                data: {
                    status: 'rejected', // or 'failed' based on your preference, sticking to rejected for clarity
                    processedAt: new Date()
                }
            }),
            // 2. Refund to Wallet
            prisma.vendor.update({
                where: { id: payout.vendorId },
                data: {
                    walletBalance: { increment: payout.amount }
                }
            }),
            // 3. Create Wallet Transaction Record
            prisma.walletTransaction.create({
                data: {
                    vendorId: payout.vendorId,
                    amount: payout.amount,
                    type: 'REFUND', // Ensure this enum exists or use string if not enum
                    description: `Refund for rejected withdrawal: ${reason}`,
                    referenceId: payout.id
                }
            })
        ]);

        // Notify Vendor
        const { WithdrawalRejectedEmail } = await import('@/lib/email-templates/finance/withdrawal-rejected');

        await import('@/lib/notifications/create-notification').then(mod =>
            mod.createNotification({
                userId: payout.vendor.userId,
                type: 'SYSTEM_ALERT',
                title: 'Withdrawal Rejected',
                message: `Your withdrawal of $${Number(payout.amount).toFixed(2)} was rejected. Reason: ${reason}`,
                actionUrl: '/withdraw-earnings',
                sendEmail: true,
                emailSubject: `Withdrawal Rejected - ${process.env.NEXT_PUBLIC_APP_NAME || 'SoukLoop'}`,
                emailReact: WithdrawalRejectedEmail({
                    userName: payout.vendor.user.name || undefined,
                    amount: `$${Number(payout.amount).toFixed(2)}`,
                    reason: reason,
                    date: payout.createdAt.toLocaleDateString(),
                    dashboardUrl: `${process.env.NEXTAUTH_URL}/withdraw-earnings`
                })
            })
        );

        return { success: true };
    } catch (error: any) {
        console.error("Failed to reject payout:", error);
        return { success: false, error: error.message };
    }
}
