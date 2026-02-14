import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { z } from 'zod'
import { notifyNewReport, notifyReportReceived } from '@/lib/notifications/index'

const createReportSchema = z.object({
    productId: z.string().optional(),
    reportedUserId: z.string().optional(),
    reason: z.string().min(1, 'Reason is required')
}).refine(data => data.productId || data.reportedUserId, {
    message: "Either productId or reportedUserId must be provided",
    path: ["productId"]
})

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
        }

        // Check if Admin (assuming 'ADMIN' role exists in Role enum)
        const user = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        const reports = await prisma.report.findMany({
            include: {
                reporter: { select: { id: true, name: true, email: true } },
                product: { select: { id: true, name: true } },
                reportedUser: { select: { id: true, name: true, email: true } }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(reports)
    } catch (error) {
        console.error('Reports GET error:', error)
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
        const validationResult = createReportSchema.safeParse(body)

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            )
        }

        const { productId, reportedUserId, reason } = validationResult.data

        const report = await prisma.report.create({
            data: {
                reporterId: session.user.id,
                productId: (productId || null) as any,
                reportedUserId: (reportedUserId || null) as any,
                reason,
                status: 'pending'
            }
        })

        // ===== NOTIFY ADMINS =====
        notifyNewReport({
            reportId: report.id,
            reason,
            type: productId ? 'product' : 'user',
            reporterName: session.user.name || undefined
        }).catch(err => console.error('[Report] Admin notification failed:', err))

        // ===== NOTIFY REPORTER (Product Only for now) =====
        if (productId) {
            // Fetch product name for better notification
            const product = await prisma.product.findUnique({
                where: { id: productId },
                select: { name: true }
            })

            if (product) {
                notifyReportReceived(session.user.id, {
                    productName: product.name,
                    reason
                }).catch(err => console.error('[Report] Reporter notification failed:', err))
            }
        }

        return NextResponse.json(report, { status: 201 })

    } catch (error) {
        console.error('Reports POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
