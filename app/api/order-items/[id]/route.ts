import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from "@/auth";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Optional: Add Role check here if this is sensitive
        // if (session.user.role !== 'ADMIN') { ... }

        const body = await request.json();
        const { quantity, price, listingId, orderId } = body;

        // Validate existence of item
        const existingItem = await prisma.orderItem.findUnique({
            where: { id },
        });

        if (!existingItem) {
            return NextResponse.json(
                { error: 'Order item not found' },
                { status: 404 }
            );
        }

        // Perform update
        const updatedItem = await prisma.orderItem.update({
            where: { id },
            data: {
                quantity: quantity !== undefined ? quantity : undefined,
                price: price !== undefined ? price : undefined,
                listingId: listingId !== undefined ? listingId : undefined,
                orderId: orderId !== undefined ? orderId : undefined,
                // updatedAt is handled automatically by @updatedAt or default(now()) in schema
                // but we can explicitly set it to match the user's "updated_at = NOW()" intent
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(updatedItem);

    } catch (error) {
        console.error('Order Item UPDATE error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
