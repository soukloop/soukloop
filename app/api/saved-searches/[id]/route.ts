import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth()

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const userId = session.user.id

        // Check ownership
        const savedSearch = await prisma.savedSearch.findUnique({
            where: { id }
        })

        if (!savedSearch) {
            return NextResponse.json(
                { error: 'Saved search not found' },
                { status: 404 }
            )
        }

        if (savedSearch.userId !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized to delete this saved search' },
                { status: 403 }
            )
        }

        await prisma.savedSearch.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Saved Search DELETE error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
