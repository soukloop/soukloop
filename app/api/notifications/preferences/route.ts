import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const preferencesSchema = z.object({
    inAppOrders: z.boolean().optional(),
    inAppMessages: z.boolean().optional(),
    inAppReviews: z.boolean().optional(),
    inAppSystem: z.boolean().optional(),
    emailOrders: z.boolean().optional(),
    emailMessages: z.boolean().optional(),
    emailMarketing: z.boolean().optional(),
    emailDigest: z.enum(['none', 'daily', 'weekly']).optional()
})

/**
 * GET /api/notifications/preferences
 * Get user's notification preferences
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Find or create default preferences
        let preferences = await prisma.notificationPreference.findUnique({
            where: { userId: session.user.id }
        })

        if (!preferences) {
            // Create default preferences
            preferences = await prisma.notificationPreference.create({
                data: { userId: session.user.id }
            })
        }

        return NextResponse.json(preferences)

    } catch (error) {
        console.error('Preferences GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/notifications/preferences
 * Update user's notification preferences
 */
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const validationResult = preferencesSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const data = validationResult.data

        // Upsert preferences
        const preferences = await prisma.notificationPreference.upsert({
            where: { userId: session.user.id },
            update: data,
            create: {
                userId: session.user.id,
                ...data
            }
        })

        return NextResponse.json({
            success: true,
            preferences
        })

    } catch (error) {
        console.error('Preferences PUT error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
