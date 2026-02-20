"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

/**
 * Server action: Get the current user's seller verification data with
 * sensitive fields (taxId, govIdNumber) decrypted — for use in edit modals.
 */
export async function getMyDecryptedVerification() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const verification = await prisma.userVerification.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
    });

    if (!verification) return null;

    let decryptedTaxId = "";
    let decryptedGovIdNumber = "";

    try {
        if (verification.taxId) decryptedTaxId = decrypt(verification.taxId);
    } catch {
        decryptedTaxId = "";
    }

    try {
        if (verification.govIdNumber) decryptedGovIdNumber = decrypt(verification.govIdNumber);
    } catch {
        decryptedGovIdNumber = "";
    }

    return {
        taxIdType: verification.taxIdType || "",
        taxId: decryptedTaxId,
        govIdType: verification.govIdType || "",
        govIdNumber: decryptedGovIdNumber,
        govIdFrontUrl: verification.govIdFrontUrl || "",
        govIdBackUrl: verification.govIdBackUrl || "",
        selfieUrl: verification.selfieUrl || "",
    };
}
