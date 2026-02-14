import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ listingId: string }> }
) {
    const { listingId } = await params;
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        const favorite = await prisma.favorite.findUnique({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId: listingId
                }
            }
        })

        if (!favorite) {
            return NextResponse.json({ error: 'Favorite not found' }, { status: 404 })
        }

        await prisma.favorite.delete({
            where: {
                userId_productId: {
                    userId: session.user.id,
                    productId: listingId
                }
            }
        })

        return NextResponse.json({ message: 'Favorite removed successfully' })

    } catch (error) {
        console.error('Favorite DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
