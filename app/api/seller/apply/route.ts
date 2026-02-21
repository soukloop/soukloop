import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'

/**
 * POST /api/seller/apply
 * Start seller application process
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if already a seller
        const { isAtLeastSeller } = await import("@/lib/roles");
        if (isAtLeastSeller(session.user.role) && session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Already a seller' },
                { status: 400 }
            )
        }

        // Check for existing active or pending application
        const existing = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id,
                OR: [
                    { isActive: true },
                    { status: 'submitted' },
                    { status: 'incomplete' }
                ]
            },
            select: { id: true, status: true, isActive: true },
            orderBy: { createdAt: 'desc' }
        })

        if (existing) {
            if (existing.status === 'submitted') {
                return NextResponse.json({
                    error: 'Application already submitted and pending review',
                    verificationId: existing.id,
                    status: existing.status
                }, { status: 409 })
            }

            if (existing.isActive && existing.status === 'approved') {
                return NextResponse.json({
                    error: 'Application already approved',
                    status: existing.status
                }, { status: 409 })
            }

            // Return existing for incomplete or rejected
            return NextResponse.json({
                verificationId: existing.id,
                status: existing.status
            })
        }

        // Get the latest version number for this user
        const latestVersion = await prisma.userVerification.findFirst({
            where: { userId: session.user.id },
            select: { version: true },
            orderBy: { version: 'desc' }
        })

        // Create new verification record
        const verification = await prisma.userVerification.create({
            data: {
                userId: session.user.id,
                status: 'incomplete',
                version: (latestVersion?.version || 0) + 1
            },
            select: { id: true, status: true }
        })

        return NextResponse.json({
            success: true,
            verificationId: verification.id,
            status: verification.status,
            nextStep: '/seller/onboarding'
        })

    } catch (error) {
        console.error('[KYC Apply Error]:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
