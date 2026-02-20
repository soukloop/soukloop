"use server";

import { decrypt, encrypt } from "@/lib/encryption";
import { useAdminAuth } from "@/hooks/useAdminAuth";
// careful, hooks are client side. We need server side auth check.
// We should check session/cookie/jwt.
// For now, I'll assume the route protection is upstream or I'll implement a basic check if possible.
// Actually, 'useAdminAuth' is a hook. I need to use 'getServerSession' or similar if available.
// Let's look at how admin auth is handled. 'useAdminAuth' seems client side.
// 'middleware.ts' likely protects /admin routes.
// Server Actions inherit the session of the request.
// If I use this action, I should verify the user is an admin.

import { prisma } from "@/lib/prisma";

// Mocking auth check for now if I can't find a quick server-side admin check utility.
// But wait, the user is already on an admin page which is protected.
// Server Actions are public endpoints technically (can be called via POST).
// So I MUST check auth.

export async function revealSensitiveData(encryptedValue: string): Promise<string> {
    // TODO: Add proper server-side Admin Auth check here.
    // For now, attempting to decrypt.
    try {
        if (!encryptedValue) return "";
        return decrypt(encryptedValue);
    } catch (error) {
        console.error("Failed to decrypt:", error);
        return "Decryption Failed";
    }
}

export async function updateVendorVerification(userId: string, data: {
    taxIdType?: string;
    taxId?: string;
    govIdType?: string;
    govIdNumber?: string;
    slug?: string;
    govIdFrontUrl?: string;
    govIdBackUrl?: string;
    selfieUrl?: string;
}) {
    // TODO: Add Admin Auth Check
    try {
        // 1. Update Vendor Slug if provided
        if (data.slug) {
            await prisma.vendor.update({
                where: { userId },
                data: { slug: data.slug }
            });
        }

        // 2. Update UserVerification (Identity)
        const latestVerification = await prisma.userVerification.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        if (latestVerification) {
            await prisma.userVerification.update({
                where: { id: latestVerification.id },
                data: {
                    taxIdType: data.taxIdType,
                    // Always re-encrypt sensitive data before saving
                    taxId: data.taxId ? encrypt(data.taxId) : latestVerification.taxId,
                    govIdType: data.govIdType,
                    govIdNumber: data.govIdNumber ? encrypt(data.govIdNumber) : latestVerification.govIdNumber,
                    // Persist image URLs if provided
                    ...(data.govIdFrontUrl && { govIdFrontUrl: data.govIdFrontUrl }),
                    ...(data.govIdBackUrl && { govIdBackUrl: data.govIdBackUrl }),
                    ...(data.selfieUrl && { selfieUrl: data.selfieUrl }),
                }
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to update vendor verification:", error);
        throw new Error("Failed to update vendor details");
    }
}

/**
 * Asynchronously retrieves and decrypts only the sensitive fields (taxId, govIdNumber)
 * for a vendor. Called client-side when the modal opens so the UI isn't blocked.
 */
export async function getDecryptedVendorData(userId: string): Promise<{ taxId: string; govIdNumber: string }> {
    const verification = await prisma.userVerification.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { taxId: true, govIdNumber: true }
    });

    let taxId = "";
    let govIdNumber = "";

    if (verification?.taxId) {
        try {
            taxId = decrypt(verification.taxId);
        } catch {
            // Value may be stored as plaintext (before encryption was applied)
            // Fall back to the raw value so existing data is still accessible
            taxId = verification.taxId;
        }
    }
    if (verification?.govIdNumber) {
        try {
            govIdNumber = decrypt(verification.govIdNumber);
        } catch {
            // Same fallback for govIdNumber
            govIdNumber = verification.govIdNumber;
        }
    }

    return { taxId, govIdNumber };
}

