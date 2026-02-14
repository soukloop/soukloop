
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { z } from 'zod';

export async function GET(request: NextRequest) {
    const { success } = await verifyAdminAuth(request);
    if (!success) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '10')));
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status.toUpperCase();
        }

        const [orders, total, statusCounts, revenue] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                        }
                    },
                    items: {
                        select: {
                            id: true // Just counting items for list view
                        }
                    }
                }
            }),
            prisma.order.count({ where }),
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { in: ['PAID', 'DELIVERED'] } } // Revenue only from paid/delivered orders
            })
        ]);

        const stats = {
            total: total,
            completed: statusCounts.find(s => s.status === 'DELIVERED' || s.status === 'PAID')?._count.status || 0,
            pending: statusCounts.find(s => s.status === 'PENDING')?._count.status || 0,
            cancelled: statusCounts.find(s => s.status === 'CANCELED')?._count.status || 0,
            processing: statusCounts.find(s => s.status === 'PROCESSING')?._count.status || 0,
            revenue: revenue._sum.total || 0
        };

        return Response.json({
            orders,
            total,
            stats,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
