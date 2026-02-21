import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { isAtLeastSeller } from '@/lib/roles'

/**
 * GET /api/user/verification
 * Get current user's seller verification status
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const verification = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id,
                OR: [
                    { isActive: true },
                    { status: 'submitted' },
                    { status: 'incomplete' }
                ]
            },
            select: {
                id: true,
                userId: true,
                status: true,
                submittedAt: true,
                reviewedAt: true,
                rejectionReason: true,

                // Identity Documents
                govIdType: true,
                govIdNumber: true,
                govIdFrontUrl: true,
                govIdBackUrl: true,
                selfieUrl: true,

                // Address Information
                addressLine1: true,
                addressLine2: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                addressProofUrl: true,

                // Tax Information
                taxIdType: true,
                taxId: true,

                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!verification) {
            return NextResponse.json(null, { status: 200 })
        }

        return NextResponse.json(verification)

    } catch (error: any) {
        console.error('[Verification GET Error]:', error)
        return NextResponse.json(
            {
                error: error.message || 'Internal server error', // Return actual error for debugging
                message: error.message,
                stack: error.stack
            },
            { status: 500 }
        )
    }
}

/**
 * POST /api/user/verification
 * Create or update verification record (alternative to /api/seller/apply)
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if already a seller
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        })

        if (isAtLeastSeller(user?.role) && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'You are already a seller' },
                { status: 400 }
            )
        }

        // Check for existing application
        const existing = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id,
                OR: [
                    { isActive: true },
                    { status: 'submitted' },
                    { status: 'incomplete' }
                ]
            },
            orderBy: { createdAt: 'desc' }
        })

        if (existing) {
            // Return existing record
            return NextResponse.json({
                id: existing.id,
                status: existing.status,
                message: 'Verification record already exists'
            })
        }

        // Get latest version number
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
            }
        })

        return NextResponse.json({
            id: verification.id,
            status: verification.status,
            message: 'Verification record created'
        })

    } catch (error: any) {
        console.error('[Verification POST Error]:', error)
        return NextResponse.json(
            {
                error: 'Internal server error',
                message: error.message,
                stack: error.stack
            },
            { status: 500 }
        )
    }
}
