import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'

// Schema for creating a conversation - requires productId
const createConversationSchema = z.object({
    sellerId: z.string().min(1, 'Seller ID is required'),
    productId: z.string().min(1, 'Product ID is required')
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Get conversations where user is either buyer or seller
        const conversations = await prisma.chatConversation.findMany({
            where: {
                OR: [
                    { buyerId: session.user.id },
                    { sellerId: session.user.id }
                ]
            },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: { take: 1, orderBy: { isPrimary: 'desc' } }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: { select: { id: true, name: true, image: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(conversations)

    } catch (error) {
        console.error('Conversations GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const body = await request.json()
        const validationResult = createConversationSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        let { sellerId, productId } = validationResult.data

        // Check if product exists (resolve slug if needed)
        const product = await prisma.product.findFirst({
            where: {
                OR: [
                    { id: productId },
                    { slug: productId }
                ]
            },
            include: {
                vendor: { select: { userId: true } },
                images: { take: 1, orderBy: { isPrimary: 'desc' } }
            }
        })

        if (product) {
            productId = product.id;
        }

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 })
        }

        // Prevent chatting with yourself
        if (sellerId === session.user.id) {
            return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 })
        }

        // Check if conversation already exists
        const existingConversation = await prisma.chatConversation.findFirst({
            where: {
                buyerId: session.user.id,
                sellerId,
                productId
            },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: { take: 1, orderBy: { isPrimary: 'desc' } }
                    }
                }
            }
        })

        if (existingConversation) {
            return NextResponse.json(existingConversation)
        }

        // Create new conversation
        const conversation = await prisma.chatConversation.create({
            data: {
                buyerId: session.user.id,
                sellerId,
                productId
            },
            include: {
                buyer: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                seller: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true,
                        images: { take: 1, orderBy: { isPrimary: 'desc' } }
                    }
                }
            }
        })

        return NextResponse.json(conversation, { status: 201 })

    } catch (error) {
        console.error('Conversations POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
