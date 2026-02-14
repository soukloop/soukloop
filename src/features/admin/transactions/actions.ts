"use server";

import { prisma } from "@/lib/prisma";
import { requirePermission, getAdminFromRequest } from "@/lib/admin/permissions";
import { auth } from "@/auth";

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

    const [transactions, totalCount, statsData] = await Promise.all([
        prisma.paymentTransaction.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                order: {
                    select: {
                        orderNumber: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.paymentTransaction.count({ where }),
        prisma.paymentTransaction.groupBy({
            by: ['status'],
            _count: true,
            _sum: {
                amount: true
            }
        })
    ]);

    // Calculate revenue (completed transactions)
    const revenue = statsData
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

    const pendingCount = statsData.find(s => s.status === 'pending')?._count || 0;
    const failedCount = statsData.find(s => s.status === 'failed')?._count || 0;

    return {
        transactions: JSON.parse(JSON.stringify(transactions)),
        totalCount,
        stats: {
            total: totalCount,
            revenue,
            pending: pendingCount,
            failed: failedCount
        },
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

    const [payouts, totalCount, statsData] = await Promise.all([
        prisma.payout.findMany({
            where,
            include: {
                vendor: {
                    select: {
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.payout.count({ where }),
        prisma.payout.groupBy({
            by: ['status'],
            _count: true,
            _sum: {
                amount: true
            }
        })
    ]);

    const completedTotal = statsData
        .filter(s => s.status === 'completed')
        .reduce((sum, s) => sum + Number(s._sum.amount || 0), 0);

    const pendingCount = statsData.find(s => s.status === 'pending')?._count || 0;
    const processingCount = statsData.find(s => s.status === 'processing')?._count || 0;

    return {
        payouts: JSON.parse(JSON.stringify(payouts)),
        totalCount,
        stats: {
            total: totalCount,
            completed: completedTotal,
            pending: pendingCount,
            processing: processingCount
        },
        totalPages: Math.ceil(totalCount / limit)
    };
}
