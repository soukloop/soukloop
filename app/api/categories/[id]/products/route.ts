
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from "@/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const category = await prisma.category.findUnique({
            where: { id }
        });

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        const products = await prisma.product.findMany({
            where: {
                category: { equals: category.name, mode: 'insensitive' },
            },
            include: {
                images: true,
                vendor: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                dressStyle: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error('Error fetching category products:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
