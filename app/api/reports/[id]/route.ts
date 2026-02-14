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

        // Check if Admin
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const { status } = await request.json()
        if (!['pending', 'resolved', 'dismissed'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
        }

        const report = await prisma.report.update({
            where: { id },
            data: { status }
        })

        return NextResponse.json(report)

    } catch (error) {
        console.error('Report PATCH error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
