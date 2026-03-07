import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/products/featured/count
 * Returns the number of active FEATURED promotions for the current seller.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ count: 0 });
        }

        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        });

        if (!vendor) {
            return NextResponse.json({ count: 0 });
        }

        const now = new Date();

        const count = await prisma.promotion.count({
            where: {
                type: 'FEATURED',
                startDate: { lte: now },
                endDate: { gte: now },
                product: {
                    vendorId: vendor.id,
                    status: 'ACTIVE'
                }
            }
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Featured count error:', error);
        return NextResponse.json({ count: 0 });
    }
}
