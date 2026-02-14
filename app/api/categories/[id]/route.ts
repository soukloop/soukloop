import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const categoryUpdateSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional(),
    status: z.enum(['Active', 'Inactive']).optional(),
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/).optional()
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const category = await prisma.category.findUnique({
            where: { id }
        })

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            )
        }

        // Count active products in this category (using Product model)
        const productCount = await prisma.product.count({
            where: {
                category: {
                    equals: category.name,
                    mode: 'insensitive'
                },
                isActive: true
            }
        });

        return NextResponse.json({
            ...category,
            productCount
        })

    } catch (error) {
        console.error('Category GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Only admins can update categories
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const validationResult = categoryUpdateSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // If updating slug, check uniqueness
        if (data.slug) {
            const existing = await prisma.category.findFirst({
                where: {
                    slug: data.slug,
                    id: { not: id }
                }
            })

            if (existing) {
                return NextResponse.json(
                    { error: 'Category with this slug already exists' },
                    { status: 409 }
                )
            }
        }

        const category = await prisma.category.update({
            where: { id },
            data
        })

        return NextResponse.json(category)

    } catch (error) {
        console.error('Category PUT error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Only admins can delete categories
        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        })

        if (user?.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Forbidden - Admin access required' },
                { status: 403 }
            )
        }

        // Check if category has usage in Product table
        const category = await prisma.category.findUnique({ where: { id } });
        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const productUsage = await prisma.product.count({
            where: { category: { equals: category.name, mode: 'insensitive' } }
        });

        if (productUsage > 0) {
            return NextResponse.json(
                { error: `Cannot delete category: ${productUsage} products depend on it` },
                { status: 400 }
            )
        }

        await prisma.category.delete({
            where: { id }
        })

        return NextResponse.json({ message: 'Category deleted successfully' })

    } catch (error) {
        console.error('Category DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
