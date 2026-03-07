import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'

// Schema for creating a conversation
const createConversationSchema = z.object({
    sellerId: z.string().optional(),
    buyerId: z.string().optional(),
    productId: z.string().min(1, 'Product ID is required')
}).refine(data => data.sellerId || data.buyerId, {
    message: "Either sellerId or buyerId must be provided"
});

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
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                isRead: false,
                                senderId: { not: session.user.id }
                            }
                        }
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

        let { sellerId, buyerId, productId } = validationResult.data

        // Determine Roles based on who is initiating the request
        // If the initiator passed a buyerId, they act as the seller.
        // If the initiator passed a sellerId, they act as the buyer.
        const activeBuyerId = buyerId || session.user.id;
        const activeSellerId = sellerId || session.user.id;

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
        if (activeSellerId === activeBuyerId) {
            return NextResponse.json({ error: 'Cannot start a conversation with yourself' }, { status: 400 })
        }

        // Check if conversation already exists
        const existingConversation = await prisma.chatConversation.findFirst({
            where: {
                buyerId: activeBuyerId,
                sellerId: activeSellerId,
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
                buyerId: activeBuyerId,
                sellerId: activeSellerId,
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
