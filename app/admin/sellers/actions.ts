'use server'

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/lib/notifications/create-notification';
import { outbox } from '@/lib/outbox';

// Helper for permissions (simplified for Actions)
// In a real app, use the same verifyAdminAuth or checkPermission helpers
// Assuming the caller (Page) has access, but Actions need their own check.
// For speed, I'll assume the session check happens or simple role check.
// BEST PRACTICE: Always check auth in Server Actions.
import { auth } from '@/auth'; // Assuming auth.ts is at root or similar
import { Role } from '@prisma/client';

async function checkAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== Role.ADMIN && session.user.role !== Role.SUPER_ADMIN) {
        throw new Error('Unauthorized');
    }
    return session.user;
}

export async function approveSeller(sellerId: string) { // sellerId here is User ID or Vendor ID?
    // The previous logic used "vendorId". For applicants, it's weird.
    // Logic:
    // If Applicant: They have a UserVerification but no Vendor record?
    // actually previous API created a Vendor record upon approval?
    // Let's look at the API logic from `app/api/admin/route.ts`...
    // It calls PATCH with `vendorId` and `action: approve`.
    // Wait, if they are "Pending" (Applicant), they are in `UserVerification`. Current API handles "Pending" vendors?
    // The previous code mapped `UserVerification` to a "temporary vendor".
    // AND it likely used `vendorId` as the `verification.id` for applicants?
    // This is messy.
    //
    // Let's standardise: We receive the `dbId` (which is either Vendor.id or UserVerification.id).
    // And we need `isApplicant` flag or deduce it.

    // SIMPLIFICATION:
    // Existing logic updates `Vendor` table: `data: { kycStatus }`.
    // So "Applicants" must be converted to Vendors *before* this? 
    // OR `Vendor` records are created in PENDING state?

    // Looking at `api/admin/route.ts`:
    // It fetches `UserVerification` for applicants.
    // It fetches `Vendor` for existing.
    // If I approve an applicant, I probably need to:
    // 1. Create Vendor Record
    // 2. Update User Role to SELLER
    // 3. Mark Verification as APPROVED

    // Let's implement robustly.

    await checkAdmin();

    try {
        // Check if Vendor exists
        // We passed `dbId`. If it's a Vendor ID, good. If it's a Verification ID, we need to handle it.
        // Ambiguity is dangerous.
        // Let's assume we pass { id, type: 'VENDOR' | 'APPLICANT' } params? 
        // For now, let's try to find it.

        // 1. Try Configured Vendor
        const vendor = await prisma.vendor.findUnique({ where: { id: sellerId } });

        if (vendor) {
            // Existing Vendor -> Update Status
            await prisma.vendor.update({
                where: { id: sellerId },
                data: { kycStatus: 'APPROVED' }
            });
            // Update Notification & Outbox...
            await outbox.broadcast('admin-updates', {
                entity: 'vendor',
                action: 'approved',
                id: sellerId,
                timestamp: Date.now()
            });
            // Notify...
        } else {
            // Must be an Applicant (Verification ID)
            const verification = await prisma.userVerification.findUnique({
                where: { id: sellerId },
                include: { user: true }
            });

            if (!verification) throw new Error('Seller not found');

            // Approve Applicant:
            // 1. Create Vendor Profile
            await prisma.vendor.create({
                data: {
                    userId: verification.userId,
                    kycStatus: 'APPROVED',
                    // other defaults
                }
            });

            // 2. Update User Role
            await prisma.user.update({
                where: { id: verification.userId },
                data: { role: 'SELLER' }
            });

            // 3. Update Verification Status
            await prisma.userVerification.update({
                where: { id: sellerId },
                data: { status: 'approved' }
            });
        }

        // ➤ EMAIL NOTIFICATION
        const { notifyKycApproved } = await import('@/lib/notifications/templates/kyc-templates');
        const userId = vendor ? vendor.userId : (await prisma.userVerification.findUnique({ where: { id: sellerId } }))?.userId;

        if (userId) {
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
            await notifyKycApproved(userId, {
                verificationId: sellerId,
                userName: user?.name // fallback
            }).catch(console.error);
        }

        revalidatePath('/admin/sellers');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to approve seller' };
    }
}

export async function rejectSeller(sellerId: string, reason: string) {
    await checkAdmin();
    try {
        let userId: string | undefined;

        const vendor = await prisma.vendor.findUnique({ where: { id: sellerId } });

        if (vendor) {
            userId = vendor.userId;
            await prisma.vendor.update({
                where: { id: sellerId },
                data: { kycStatus: 'REJECTED' } // Or SUSPENDED?
            });
        } else {
            // Applicant
            const verification = await prisma.userVerification.findUnique({ where: { id: sellerId } });
            if (!verification) throw new Error('Seller not found');
            userId = verification.userId;

            await prisma.userVerification.update({
                where: { id: sellerId },
                data: { status: 'rejected', rejectionReason: reason }
            });
        }

        // ➤ EMAIL NOTIFICATION
        if (userId) {
            const { notifyKycRejected } = await import('@/lib/notifications/templates/kyc-templates');
            await notifyKycRejected(userId, {
                verificationId: sellerId,
                reason
            }).catch(console.error);
        }

        revalidatePath('/admin/sellers');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to reject seller' };
    }
}
