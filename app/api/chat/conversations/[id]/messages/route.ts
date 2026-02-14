import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'
import { notifyNewMessage } from '@/lib/notifications/templates/message-templates'
import { outbox } from '@/lib/outbox'

const attachmentSchema = z.object({
    type: z.string(),
    url: z.string(), // Accept both relative (/uploads/...) and absolute URLs
    name: z.string().optional(),
    size: z.number().optional(),
    mimeType: z.string().optional(),
    duration: z.number().optional() // For voice messages
})

const createMessageSchema = z.object({
    message: z.string().optional().nullable(),
    content: z.string().optional(),
    imageUrl: z.string().optional(), // Accept relative paths too
    attachments: z.array(attachmentSchema).optional(),
    messageType: z.enum(['text', 'image', 'video', 'voice', 'file', 'location']).optional(),
    latitude: z.number().optional(),
    longitude: z.number().optional()
}).refine(data => data.message || data.content || data.imageUrl || data.attachments?.length || data.messageType === 'location', {
    message: "Either message, content, imageUrl, attachments, or location must be provided"
})

export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Verify user is part of conversation OR is admin
        const conversation = await prisma.chatConversation.findUnique({
            where: { id }
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        const isParticipant = conversation.buyerId === session.user.id || conversation.sellerId === session.user.id
        const isAdmin = session.user.role === 'ADMIN' || (session.user as any).model === 'AdminUser'

        if (!isParticipant && !isAdmin) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // Mark unread messages from other users as read (ONLY if participant)
        if (isParticipant) {
            await prisma.chatMessage.updateMany({
                where: {
                    conversationId: id,
                    senderId: { not: session.user.id },
                    isRead: false
                },
                data: { isRead: true }
            })
        }

        const messages = await prisma.chatMessage.findMany({
            where: { conversationId: id },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        profile: { select: { avatar: true } },
                        vendor: { select: { logo: true } }
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        return NextResponse.json(messages)

    } catch (error) {
        console.error('Messages GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params

        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Verify user is part of conversation and get product info
        const conversation = await prisma.chatConversation.findUnique({
            where: { id },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        images: {
                            take: 1,
                            select: { url: true }
                        }
                    }
                }
            }
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        if (conversation.buyerId !== session.user.id && conversation.sellerId !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const body = await request.json()
        const validationResult = createMessageSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { message, content, imageUrl, attachments, messageType, latitude, longitude } = validationResult.data
        const messageText = message || content

        // Determine message type
        let finalMessageType = messageType || 'text'
        if (!messageType) {
            if (attachments?.length) {
                finalMessageType = attachments[0].type as any
            } else if (imageUrl) {
                finalMessageType = 'image'
            }
        }

        // 1. Create message in DB
        const chatMessage = await prisma.chatMessage.create({
            data: {
                conversationId: id,
                senderId: session.user.id,
                message: messageText,
                imageUrl,
                attachments: attachments || undefined,
                messageType: finalMessageType,
                latitude,
                longitude,
                status: 'sent'
            },
            include: {
                sender: { select: { id: true, name: true, image: true } }
            }
        })

        // 2. Queue for real-time delivery via Centrifugo Outbox
        const payload = {
            ...chatMessage,
            productImage: conversation.product?.images?.[0]?.url || null
        }

        // Emit to the specific conversation room
        await outbox.publish(`conversation:${id}`, {
            type: 'new-message',
            data: payload
        });

        // Emit to both users' personal rooms
        await outbox.sendToUser(conversation.buyerId, {
            type: 'new-message',
            data: payload
        });

        await outbox.sendToUser(conversation.sellerId, {
            type: 'new-message',
            data: payload
        });

        console.log(`📡 Outbox entry created for new-message in conversation:${id}`)

        // 3. Notify recipient (Mobile Push/Email)
        const recipientId = session.user.id === conversation.buyerId ? conversation.sellerId : conversation.buyerId;

        try {
            await notifyNewMessage(recipientId, {
                conversationId: id,
                senderName: session.user.name || 'User',
                senderId: session.user.id,
                preview: messageText || (imageUrl ? 'Sent an image' : 'Sent an attachment'),
                productName: conversation.product?.name || undefined,
                productId: conversation.productId || undefined
            });
        } catch (err) {
            console.error('Failed to notify new message:', err);
        }

        return NextResponse.json(chatMessage, { status: 201 })

    } catch (error) {
        console.error('Messages POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
