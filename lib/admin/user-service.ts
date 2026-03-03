import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { unstable_cache } from 'next/cache';

export type UserFilterParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    role?: string;
    status?: string;
};

export type PaginatedUsersResult = {
    users: any[];
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

/**
 * Fetches users with server-side pagination, sorting, and filtering.
 * Uses unstable_cache for basic caching if needed, though for admin tables
 * usually fresh data is preferred. We'll skip caching for now to ensure
 * immediate updates for admin actions.
 */
export async function getPaginatedUsers({
    page = 1,
    pageSize = 10,
    search = '',
    role,
    status
}: UserFilterParams): Promise<PaginatedUsersResult> {
    const skip = (page - 1) * pageSize;

    // Build Where Clause
    const where: Prisma.UserWhereInput = {};

    // 1. Search (Name or Email)
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ];
    }

    // 2. Role Filter
    if (role && role !== 'ALL') {
        // Handle case-insensitivity or specific enum mapping if needed
        // Assuming role is stored as uppercase string in DB matching the filter
        where.role = role as any;
    }

    // 3. Status Filter (Active/Suspended)
    if (status) {
        if (status === 'Active') {
            where.isActive = true;
        } else if (status === 'Suspended') {
            where.isActive = false;
        }
    }

    // Execute Transaction for Count + Data
    const [total, users] = await prisma.$transaction([
        prisma.user.count({ where }),
        prisma.user.findMany({
            where,
            take: pageSize,
            skip,
            orderBy: { createdAt: 'desc' },
            include: {
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                },
                vendor: {
                    select: {
                        planTier: true
                    }
                }
            }
        })
    ]);

    // Map to frontend friendly format
    const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.name || (user.profile ? `${user.profile.firstName} ${user.profile.lastName}` : 'Unknown'),
        email: user.email,
        role: user.role,
        status: user.isActive ? 'Active' : 'Suspended',
        lastActive: user.createdAt.toISOString().split('T')[0], // Fallback to createdAt
        avatar: user.profile?.avatar || user.image || null,
        planTier: user.vendor?.planTier || 'BASIC',
        isDeletable: true // Can contain logic if needed
    }));

    return {
        users: formattedUsers,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
    };
}
