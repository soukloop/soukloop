import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { notifyKycSubmitted, notifyAdminsNewKycSubmission } from '@/lib/notifications/index'
import { handleApiError } from '@/lib/api-wrapper'

/**
 * POST /api/seller/onboarding/submit
 * Submit completed application for admin review
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const verification = await prisma.userVerification.findFirst({
            where: {
                userId: session.user.id,
                OR: [
                    { status: 'incomplete' },
                    { status: 'rejected' }
                ]
            },
            orderBy: { createdAt: 'desc' }
        })

        if (!verification) {
            return NextResponse.json(
                { error: 'No application found' },
                { status: 404 }
            )
        }

        if (verification.status !== 'incomplete' && verification.status !== 'rejected' && verification.status !== 'approved') {
            return NextResponse.json({
                error: `Cannot submit. Application status: ${verification.status}`,
                status: verification.status
            }, { status: 400 })
        }

        // Validate all required fields
        const missing: string[] = []
        if (!verification.govIdType) missing.push('Identity Document Type')
        if (!verification.govIdNumber) missing.push('Identity Document Number')
        if (!verification.govIdFrontUrl) missing.push('ID Front Photo')
        if (!verification.govIdBackUrl) missing.push('ID Back Photo')
        if (!verification.selfieUrl) missing.push('Selfie Photo')
        if (!verification.addressLine1) missing.push('Business Address')
        if (!verification.taxId) missing.push('Tax ID (SSN/EIN)')
        if (!verification.taxIdType) missing.push('Tax ID Type')

        if (missing.length > 0) {
            return NextResponse.json({
                error: 'Please complete all required steps',
                missingFields: missing
            }, { status: 400 })
        }

        // Submit for review
        await prisma.userVerification.update({
            where: { id: verification.id },
            data: {
                status: 'submitted',
                submittedAt: new Date()
            }
        })

        // ===== SEND NOTIFICATIONS =====
        // Notify user that their application was submitted
        notifyKycSubmitted(session.user.id, { verificationId: verification.id })
            .catch(err => console.error('[KYC Submit] User notification failed:', err))

        // Notify all admins about new application
        notifyAdminsNewKycSubmission({
            verificationId: verification.id,
            userName: session.user.name || session.user.email || 'Unknown'
        }).catch(err => console.error('[KYC Submit] Admin notification failed:', err))

        return NextResponse.json({
            success: true,
            message: 'Application submitted successfully! We\'ll review it within 24-48 hours.',
            estimatedReviewTime: '24-48 hours'
        })

    } catch (error) {
        return handleApiError(error)
    }
}
