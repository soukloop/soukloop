import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-wrapper';

import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';


// GET - Get all products with this dress style (including pending)
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;

        const products = await prisma.product.findMany({
            where: { dressStyleId: id },
            include: {
                images: {
                    take: 1,
                    orderBy: { order: 'asc' }
                },
                vendor: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: [
                { hasPendingStyle: 'desc' }, // Pending first
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(products);
    } catch (error) {
        return handleApiError(error);
    }
}

