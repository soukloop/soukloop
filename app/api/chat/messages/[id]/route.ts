import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const message = await prisma.chatMessage.findUnique({
            where: { id },
            include: { conversation: true }
        })

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 })
        }

        // Only the recipient can mark as read (not the sender)
        const isRecipient =
            (message.conversation.buyerId === session.user.id && message.senderId !== session.user.id) ||
            (message.conversation.sellerId === session.user.id && message.senderId !== session.user.id)

        if (!isRecipient) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const updatedMessage = await prisma.chatMessage.update({
            where: { id },
            data: { isRead: true }
        })

        return NextResponse.json(updatedMessage)

    } catch (error) {
        console.error('Message PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
