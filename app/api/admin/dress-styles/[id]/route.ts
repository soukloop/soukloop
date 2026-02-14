import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';


// GET - Get single dress style details
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

        const style = await prisma.dressStyle.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { products: true }
                }
            }
        });

        if (!style) {
            return NextResponse.json({ error: 'Style not found' }, { status: 404 });
        }

        return NextResponse.json(style);
    } catch (error) {
        return handleApiError(error);
    }
}

// PUT - Update dress style
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, categoryType } = body;

        const updated = await prisma.dressStyle.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(categoryType && { categoryType })
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return handleApiError(error);
    }
}

// DELETE - Delete dress style
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id } = await params;

        // Remove dressStyleId from products using this style
        await prisma.product.updateMany({
            where: { dressStyleId: id },
            data: { dressStyleId: null, dress: '' }
        });

        // Delete the style
        await prisma.dressStyle.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return handleApiError(error);
    }
}

