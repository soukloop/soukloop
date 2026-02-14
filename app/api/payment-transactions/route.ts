import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from "@/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // We expect body to contain orderId, amount, provider, etc.
        const body = await request.json();
        const { orderId, amount, provider, providerTransactionId, status, currency } = body;

        if (!orderId || !amount || !provider) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const transaction = await prisma.paymentTransaction.create({
            data: {
                orderId,
                userId: session.user.id,
                amount: amount, // handled as decimal by Prisma
                currency: currency || 'USD',
                provider,
                providerTransactionId,
                status: status || 'pending'
            }
        });

        return NextResponse.json(transaction);

    } catch (error) {
        console.error('Payment Transaction Create Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const orderId = searchParams.get('orderId');

        // Check if user is allowed to view transactions for this order if filtering by orderId
        // Or if listing all, filter by userId unless ADMIN

        const where: any = {};
        if (orderId) {
            where.orderId = orderId;
        }

        // For security, strict matching to user unless admin (which we skip for simplicity or strictness)
        where.userId = session.user.id;

        const transactions = await prisma.paymentTransaction.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ items: transactions });

    } catch (error) {
        console.error('Payment Transaction Get Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
