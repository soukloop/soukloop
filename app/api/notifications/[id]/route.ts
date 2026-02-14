import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'

/**
 * PATCH /api/notifications/[id]
 * Mark a single notification as read
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Update notification (only if it belongs to the user)
        const result = await prisma.notification.updateMany({
            where: {
                id,
                userId: session.user.id
            },
            data: { isRead: true }
        })

        if (result.count === 0) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Notification marked as read'
        })

    } catch (error) {
        console.error('Notification PATCH error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a single notification
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await auth()

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Delete notification (only if it belongs to the user)
        const result = await prisma.notification.deleteMany({
            where: {
                id,
                userId: session.user.id
            }
        })

        if (result.count === 0) {
            return NextResponse.json(
                { error: 'Notification not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            message: 'Notification deleted'
        })

    } catch (error) {
        console.error('Notification DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
