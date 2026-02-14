import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/dress-styles
 * Returns approved dress styles + seller's own pending requests
 * Query: ?categoryType=Women
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const { searchParams } = new URL(request.url);
        const categoryType = searchParams.get('categoryType');
        const includeAll = searchParams.get('includeAll') === 'true';

        // Build where clause
        const where: any = {};

        if (categoryType) {
            where.categoryType = categoryType;
        }

        // For regular users, only show approved styles + their own pending
        if (!includeAll) {
            if (session?.user?.id) {
                where.OR = [
                    { status: 'approved' },
                    {
                        status: 'pending',
                        requests: {
                            some: {
                                requesterId: session.user.id
                            }
                        }
                    }
                ];
            } else {
                where.status = 'approved';
            }
        }

        const dressStyles = await prisma.dressStyle.findMany({
            where,
            select: {
                id: true,
                name: true,
                slug: true,
                categoryType: true,
                status: true,
                createdAt: true,
                // Using select for counts is more efficient
                _count: {
                    select: {
                        requests: true,
                        products: true
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Transform to include isPending flag for seller's pending styles
        const transformedStyles = dressStyles.map(style => ({
            ...style,
            isPending: style.status === 'pending',
            requestCount: (style as any)._count?.requests ?? 0,
            productCount: (style as any)._count?.products ?? 0
        }));

        return NextResponse.json(transformedStyles);

    } catch (error) {
        console.error('DressStyles GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
