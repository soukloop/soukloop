import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper'
import { verifyAdminAuth } from '@/lib/admin/auth-utils'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const authResult = await verifyAdminAuth(request)
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status })
        }

        const conversation = await prisma.chatConversation.findUnique({
            where: { id },
            include: {
                buyer: {
                    select: {
                        id: true, name: true, image: true, email: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                seller: {
                    select: {
                        id: true, name: true, image: true, email: true,
                        vendor: { select: { logo: true } },
                        profile: { select: { avatar: true } }
                    }
                },
                product: {
                    select: {
                        id: true, name: true, price: true,
                        images: {
                            where: { isPrimary: true },
                            take: 1
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        })

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
        }

        return NextResponse.json(conversation)

    } catch (error) {
        return handleApiError(error)
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const authResult = await verifyAdminAuth(request)
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status })
        }

        await prisma.chatConversation.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        return handleApiError(error)
    }
}
