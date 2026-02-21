"use server";

import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { decryptAsync } from "@/lib/encryption";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function revealSensitiveData(verificationId: string, field: 'govIdNumber' | 'taxId') {
    // 1. Verify Admin Auth
    // We need to mock a NextRequest for our utility, or just check session directly.
    // verifyAdminAuth is designed for API routes, let's use a simpler check here.
    const { auth } = await import("@/auth");
    const session = await auth();

    if (!session?.user?.id || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role || '')) {
        throw new Error("Unauthorized");
    }

    // 2. Fetch the encrypted string
    const verification = await prisma.userVerification.findUnique({
        where: { id: verificationId },
        select: {
            govIdNumber: true,
            taxId: true
        }
    });

    if (!verification) {
        throw new Error("Verification record not found");
    }

    const encryptedValue = verification[field];

    if (!encryptedValue) {
        return null;
    }

    // 3. Decrypt
    // Logic: If length < 50, it assumes it is legacy cleartext (e.g. "12345")
    // If length > 50, it assumes it is our Base64 encrypted blob (96+ chars).
    if (encryptedValue.length < 50) {
        return encryptedValue;
    }

    try {
        const decrypted = await decryptAsync(encryptedValue);
        return decrypted;
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Decryption failed");
    }
}
