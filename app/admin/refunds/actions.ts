"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type RefundWithDetails = Prisma.RefundGetPayload<{
    include: {
        order: {
            select: {
                id: true;
                orderNumber: true;
                total: true;
                user: {
                    select: {
                        name: true;
                        email: true;
                    }
                }
            }
        };
        orderItem: {
            select: {
                product: {
                    select: {
                        name: true;
                    }
                }
            }
        };
    }
}>;

export interface GetRefundsParams {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

export interface GetRefundsResponse {
    data: RefundWithDetails[];
    totalCount: number;
    pageCount: number;
}

export async function getRefunds({
    page = 1,
    pageSize = 15,
    search,
    status
}: GetRefundsParams): Promise<{ success: boolean; error?: string } & Partial<GetRefundsResponse>> {
    try {
        const session = await auth();

        if (!session?.user) {
            return { success: false, error: "Unauthorized" };
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { vendor: true }
        });

        // Permission & Scope Logic (similar to API route)
        const where: Prisma.RefundWhereInput = {};

        // Role-based scoping
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
            // Admin sees all
        } else if (user?.vendor) {
            // Basic vendor logic - this action seems specific to Admin page, so we could enforce ADMIN role
            // But to keep it consistent with the API logic:
            // If accessing admin page, they must be admin? 
            // app/admin/* is protected by middleware or layout usually.
            // But for safety, let's enforce Admin for this specific action if it's for the Admin Table.
            if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
                return { success: false, error: "Insufficient permissions" };
            }
        } else {
            return { success: false, error: "Insufficient permissions" };
        }

        // Search Logic
        if (search) {
            where.OR = [
                { order: { orderNumber: { contains: search, mode: 'insensitive' } } },
                { order: { user: { name: { contains: search, mode: 'insensitive' } } } },
                { order: { user: { email: { contains: search, mode: 'insensitive' } } } },
                // Add product name search if needed
                { orderItem: { product: { name: { contains: search, mode: 'insensitive' } } } }
            ];
        }

        // Status Filtering
        if (status && status !== 'ALL') {
            // Prisma enum or string? StatusBadge implies string match.
            // Usually uppercase in DB.
            where.status = status.toUpperCase();
        }

        // Count Total
        const totalCount = await prisma.refund.count({ where });

        // Fetch Data
        const refunds = await prisma.refund.findMany({
            where,
            include: {
                order: {
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        user: {
                            select: {
                                name: true,
                                email: true,
                            }
                        }
                    }
                },
                orderItem: {
                    select: {
                        product: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            take: pageSize,
            skip: (page - 1) * pageSize,
            orderBy: { createdAt: 'desc' }
        });

        return {
            success: true,
            data: refunds,
            totalCount,
            pageCount: Math.ceil(totalCount / pageSize)
        };

    } catch (error) {
        console.error("Failed to fetch refunds:", error);
        return { success: false, error: "Failed to fetch data" };
    }
}
