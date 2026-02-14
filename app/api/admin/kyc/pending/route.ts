import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/kyc/pending
 * Get all pending seller applications for review
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const verifications = await prisma.userVerification.findMany({
            where: { status: 'submitted' },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { submittedAt: 'asc' } // First in, first out
        })

        return NextResponse.json({
            success: true,
            count: verifications.length,
            verifications
        })

    } catch (error) {
        return handleApiError(error);
    }
}
