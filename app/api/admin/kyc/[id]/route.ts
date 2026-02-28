import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { decrypt, encrypt } from '@/lib/encryption'
import { notifyKycApproved, notifyKycRejected, notifyKycInfoNeeded } from '@/lib/notifications/index'
import { outbox } from '@/lib/outbox'
import { generateUniqueSlug } from '@/lib/slug'

const actionSchema = z.object({
    action: z.enum(['approve', 'reject', 'update_details']),
    reason: z.string().min(10).optional(),
    details: z.object({
        govIdType: z.string().optional(),
        govIdNumber: z.string().optional(),
        taxIdType: z.string().optional(),
        taxId: z.string().optional(),
        businessAddressId: z.string().optional(),
        govIdFrontUrl: z.string().optional(),
        govIdBackUrl: z.string().optional()
    }).optional()
})

/**
 * GET /api/admin/kyc/[id]
 * Get verification details for review
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const verification = await prisma.userVerification.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        createdAt: true,
                        profile: {
                            select: {
                                firstName: true,
                                lastName: true,
                                phone: true,
                                bio: true,
                                avatar: true
                            }
                        },
                        orders: {
                            select: {
                                id: true,
                                orderNumber: true,
                                total: true,
                                status: true,
                                createdAt: true
                            },
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    }
                }
            }
        })

        if (!verification) {
            return NextResponse.json(
                { error: 'Verification not found' },
                { status: 404 }
            )
        }

        // Decrypt sensitive fields for admin review
        if (verification.govIdNumber) {
            try {
                verification.govIdNumber = await decrypt(verification.govIdNumber)
            } catch (err) {
                console.error('Failed to decrypt govIdNumber:', err)
                // Keep encrypted value if decryption fails
            }
        }

        if (verification.taxId) {
            try {
                verification.taxId = await decrypt(verification.taxId)
            } catch (err) {
                console.error('Failed to decrypt taxId:', err)
                // Keep encrypted value if decryption fails
            }
        }

        // Check for pending edits (newer submitted verification for same user)
        const pendingEdit = await prisma.userVerification.findFirst({
            where: {
                userId: verification.userId,
                id: { not: id },
                status: 'submitted',
                createdAt: { gt: verification.createdAt }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Decrypt pending edit sensitive fields if exists
        if (pendingEdit) {
            if (pendingEdit.govIdNumber) {
                try {
                    pendingEdit.govIdNumber = await decrypt(pendingEdit.govIdNumber)
                } catch (err) {
                    console.error('Failed to decrypt pending govIdNumber:', err)
                }
            }

            if (pendingEdit.taxId) {
                try {
                    pendingEdit.taxId = await decrypt(pendingEdit.taxId)
                } catch (err) {
                    console.error('Failed to decrypt pending taxId:', err)
                }
            }
        }

        return NextResponse.json({
            verification,
            hasPendingEdit: !!pendingEdit,
            pendingVerification: pendingEdit || null
        })

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/admin/kyc/[id]
 * Approve or reject seller application
 */
export async function PATCH(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await props.params

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Get the admin user ID from auth result
        let adminUserId = authResult.admin?.id || null;
        if (!adminUserId) {
            // Fallback: Find any admin user (should rely on authResult but safety net)
            const adminUser = await prisma.user.findFirst({
                where: { role: 'ADMIN' },
                select: { id: true }
            });
            adminUserId = adminUser?.id || null;
        }

        const body = await request.json()
        const validated = actionSchema.parse(body)
        const { action, reason, details } = validated

        /* Handle Update Details */
        if (action === 'update_details') {
            if (!details) {
                return NextResponse.json({ error: 'Details are required for update' }, { status: 400 })
            }

            const updateData: any = {}
            if (details.govIdType) updateData.govIdType = details.govIdType
            if (details.taxIdType) updateData.taxIdType = details.taxIdType
            if (details.businessAddressId) updateData.businessAddressId = details.businessAddressId
            if (details.govIdFrontUrl) updateData.govIdFrontUrl = details.govIdFrontUrl
            if (details.govIdBackUrl) updateData.govIdBackUrl = details.govIdBackUrl

            if (details.govIdNumber) {
                updateData.govIdNumber = await encrypt(details.govIdNumber)
            }
            if (details.taxId) {
                updateData.taxId = await encrypt(details.taxId)
            }

            const updated = await prisma.userVerification.update({
                where: { id },
                data: updateData
            })

            return NextResponse.json({ success: true, message: 'Details updated successfully', verification: updated })
        }

        if (action === 'reject' && !reason) {
            return NextResponse.json({
                error: 'Rejection reason is required'
            }, { status: 400 })
        }

        const verification = await prisma.userVerification.findUnique({
            where: { id },
            select: { userId: true, status: true, user: { select: { name: true } } }
        })

        if (!verification) {
            return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
        }

        if (verification.status !== 'submitted') {
            return NextResponse.json({ error: `Cannot review. Current status: ${verification.status}` }, { status: 400 })
        }

        if (action === 'approve') {
            await prisma.$transaction(async (tx) => {
                await tx.userVerification.updateMany({
                    where: { userId: verification.userId, isActive: true },
                    data: { isActive: false, supersededBy: id }
                })

                await tx.userVerification.update({
                    where: { id },
                    data: {
                        status: 'approved',
                        isActive: true,
                        reviewedAt: new Date(),
                        reviewedBy: adminUserId // Use valid User ID or null
                    }
                })

                await tx.user.update({
                    where: { id: verification.userId },
                    data: { role: 'SELLER' }
                })

                const existingVendor = await tx.vendor.findUnique({ where: { userId: verification.userId } })
                if (existingVendor) {
                    await tx.vendor.update({
                        where: { id: existingVendor.id },
                        data: { kycStatus: 'APPROVED', isActive: true }
                    })
                } else {
                    const slug = await generateUniqueSlug(verification.user.name || 'Store', tx.vendor);
                    await tx.vendor.create({
                        data: {
                            userId: verification.userId,
                            slug,
                            kycStatus: 'APPROVED',
                            isActive: true
                        }
                    })
                }
            })

            // Notify seller of approval
            notifyKycApproved(verification.userId, { verificationId: id })
                .catch(err => console.error('[KYC] Approval notification failed:', err))

            // ➤ PUBLISH REAL-TIME EVENT (Global Admin Stream)
            await outbox.broadcast('admin-updates', {
                entity: 'kyc',
                action: 'approved',
                id: verification.userId,
                timestamp: Date.now()
            })

            // ➤ TRIGGER INSTANT SESSION SYNC (User Personal Stream)
            await outbox.sendToUser(verification.userId, {
                type: 'SESSION_REFRESH',
                timestamp: Date.now()
            });

            return NextResponse.json({ success: true, message: 'Seller approved successfully' })
        }
        else {
            await prisma.userVerification.update({
                where: { id },
                data: {
                    status: 'rejected',
                    rejectionReason: reason,
                    reviewedAt: new Date(),
                    reviewedBy: adminUserId // Use valid User ID or null
                }
            })

            // Notify seller of rejection
            notifyKycRejected(verification.userId, { verificationId: id, reason: reason })
                .catch(err => console.error('[KYC] Rejection notification failed:', err))

            // ➤ PUBLISH REAL-TIME EVENT
            await outbox.broadcast('admin-updates', {
                entity: 'kyc',
                action: 'rejected',
                id: verification.userId,
                timestamp: Date.now()
            })

            return NextResponse.json({ success: true, message: 'Application rejected' })
        }

    } catch (error) {
        return handleApiError(error);
    }
}
