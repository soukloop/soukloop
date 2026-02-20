import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const addressSchema = z.object({
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    isDefault: z.boolean().optional().default(false),
    // Purpose flags - which purposes this address serves
    isSellerAddress: z.boolean().optional().default(false),
    isShipping: z.boolean().optional().default(false),
    isBilling: z.boolean().optional().default(false)
})

export async function GET(request: NextRequest) {
    console.log('[API] GET /api/addresses - Start');
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type') // 'billing' | 'shipping' | 'seller'

        const where: any = { userId: session.user.id }

        if (type === 'billing') where.isBilling = true
        if (type === 'shipping') where.isShipping = true
        if (type === 'seller') where.isSellerAddress = true

        // Fetch addresses with user profile for name/phone
        const addresses = await prisma.address.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true
                    }
                }
            },
            orderBy: [
                { isDefault: 'desc' },
                { createdAt: 'desc' }
            ]
        })

        return NextResponse.json(addresses)

    } catch (error) {
        console.error('Addresses GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validationResult = addressSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // If this address is set as default, unset other defaults
        if (data.isDefault) {
            await prisma.address.updateMany({
                where: { userId: session.user.id },
                data: { isDefault: false }
            })
        }

        // Upsert: Find existing address by location OR create new
        const address = await prisma.address.upsert({
            where: {
                unique_address_location: {
                    userId: session.user.id,
                    address1: data.address1,
                    city: data.city,
                    postalCode: data.postalCode
                }
            },
            update: {
                address2: data.address2,
                state: data.state,
                country: data.country,
                isDefault: data.isDefault,
                // Explicitly set flags from data, allowing toggling off
                isSellerAddress: data.isSellerAddress,
                isShipping: data.isShipping,
                isBilling: data.isBilling
            },
            create: {
                userId: session.user.id,
                address1: data.address1,
                address2: data.address2,
                city: data.city,
                state: data.state,
                postalCode: data.postalCode,
                country: data.country,
                isDefault: data.isDefault,
                isSellerAddress: data.isSellerAddress || false,
                isShipping: data.isShipping || false,
                isBilling: data.isBilling || false
            }
        })

        // Notify user about address update
        const { notifyProfileUpdated } = await import('@/lib/notifications/templates/account-templates');
        const userName = session.user.name || 'User';

        notifyProfileUpdated(session.user.id, userName, 'Address').catch(err =>
            console.error('Failed to send address update notification:', err)
        );

        return NextResponse.json(address, { status: 201 })

    } catch (error) {
        console.error('Addresses POST error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
