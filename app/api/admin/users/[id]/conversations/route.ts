import { verifyAdminAuth } from '@/lib/admin/auth-utils'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id: targetUserId } = await params
        if (!targetUserId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const conversations = await prisma.chatConversation.findMany({
            where: {
                OR: [
                    { buyerId: targetUserId },
                    { sellerId: targetUserId }
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
                    take: 1
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(conversations)

    } catch (error) {
        console.error('Admin Conversations GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
