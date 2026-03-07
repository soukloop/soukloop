import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { hash } from 'bcryptjs'
import { z } from 'zod'

// Shared permission check
async function checkAdminPermission(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, status: 401, error: 'Unauthorized' };
    }
    const role = session.user.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return { success: false, status: 403, error: 'Forbidden' };
    }
    return { success: true };
}

const createAdminUserSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['ADMIN'])
})

export async function GET(request: NextRequest) {
    try {
        const authCheck = await checkAdminPermission(request);
        if (!authCheck.success) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('query');
        const scope = searchParams.get('scope'); // 'admins' (default) or 'all'

        const where: any = {};

        if (scope === 'all') {
            // Search all users (for Promotion) - require query to prevent dumping entire DB
            if (!query || query.length < 1) {
                return NextResponse.json([]);
            }

            const searchFilter = {
                contains: query,
                mode: 'insensitive' as const
            };

            where.OR = [
                { email: searchFilter },
                { name: searchFilter }
            ];

            // Exclude regular users (buyers) from search results. Allow Sellers and existing Admins (to change status).
            where.role = { not: 'USER' };
        } else {
            // Default: List Admins
            where.role = { in: ['ADMIN', 'SUPER_ADMIN'] };

            if (query) {
                const searchFilter = {
                    contains: query,
                    mode: 'insensitive' as const
                };

                where.OR = [
                    { email: searchFilter },
                    { name: searchFilter }
                ];
            }
        }

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                name: true,
                image: true
            },
            take: 20, // Limit results
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(users)

    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authCheck = await checkAdminPermission(request);
        if (!authCheck.success) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        const body = await request.json()
        const validationResult = createAdminUserSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { email, password, role } = validationResult.data

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            // If user exists but is just a generic USER, we could promote them?
            // For now, fail as duplicate
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            )
        }

        // Hash password
        const passwordHash = await hash(password, 10)

        // Create User with specific role
        const adminUser = await prisma.user.create({
            data: {
                email,
                password: passwordHash,
                role: role as any,
                emailVerified: new Date(),
                isActive: true
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        })

        return NextResponse.json(adminUser, { status: 201 })

    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
