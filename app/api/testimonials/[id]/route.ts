
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/testimonials/[id]
 * Update a testimonial (e.g. toggle active status or edit content)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { id } = await params;

        const testimonial = await prisma.testimonial.update({
            where: { id },
            data: body,
        });

        return NextResponse.json(testimonial);
    } catch (error) {
        console.error('[Testimonials API] Error updating testimonial:', error);
        return NextResponse.json(
            { error: 'Failed to update testimonial' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/testimonials/[id]
 * Delete a testimonial
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        await prisma.testimonial.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[Testimonials API] Error deleting testimonial:', error);
        return NextResponse.json(
            { error: 'Failed to delete testimonial' },
            { status: 500 }
        );
    }
}
