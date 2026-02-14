import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const promotion = await prisma.promotion.findUnique({
            where: { id },
            include: {
                product: true
            }
        })

        if (!promotion) {
            return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
        }

        // Verify ownership
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        })

        if (!vendor || promotion.product.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        return NextResponse.json(promotion)

    } catch (error) {
        console.error('Promotion GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const promotion = await prisma.promotion.findUnique({
            where: { id },
            include: {
                product: true
            }
        })

        if (!promotion) {
            return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
        }

        // Verify ownership
        const vendor = await prisma.vendor.findUnique({
            where: { userId: session.user.id }
        })

        if (!vendor || promotion.product.vendorId !== vendor.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        await prisma.promotion.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Promotion deleted successfully' })

    } catch (error) {
        console.error('Promotion DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
