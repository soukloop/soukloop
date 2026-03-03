import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addressUpdateSchema = z.object({
    type: z.enum(['billing', 'shipping']).optional(),
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    company: z.string().optional(),
    address1: z.string().min(1).optional(),
    address2: z.string().optional(),
    city: z.string().min(1).optional(),
    state: z.string().min(1).optional(),
    postalCode: z.string().min(1).optional(),
    country: z.string().min(1).optional(),
    phone: z.string().optional(),
    isDefault: z.boolean().optional(),
    isSellerAddress: z.boolean().optional(),
    isShipping: z.boolean().optional(),
    isBilling: z.boolean().optional()
})

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const address = await prisma.address.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        })

        if (!address) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(address)

    } catch (error) {
        console.error('Address GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function PUT(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validationResult = addressUpdateSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Check if address exists and belongs to user
        const existingAddress = await prisma.address.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        })

        if (!existingAddress) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            )
        }

        // If setting as default, unset other defaults of the same type
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: {
                    userId: session.user.id,
                    ...(existingAddress.isBilling ? { isBilling: true } : { isShipping: true }),
                    id: { not: params.id }
                },
                data: {
                    isDefault: false
                }
            })
        }

        const address = await prisma.address.update({
            where: { id: params.id },
            data
        })

        // Notify user about address update
        const { notifyProfileUpdated } = await import('@/lib/notifications/templates/account-templates');
        const userName = session.user.name || 'User';

        notifyProfileUpdated(session.user.id, userName, 'Address').catch(err =>
            console.error('Failed to send address update notification:', err)
        );

        return NextResponse.json(address)

    } catch (error) {
        console.error('Address PUT error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if address exists and belongs to user
        const address = await prisma.address.findFirst({
            where: {
                id: params.id,
                userId: session.user.id
            }
        })

        if (!address) {
            return NextResponse.json(
                { error: 'Address not found' },
                { status: 404 }
            )
        }

        await prisma.address.delete({
            where: { id: params.id }
        })

        return NextResponse.json({ message: 'Address deleted successfully' })

    } catch (error) {
        console.error('Address DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
