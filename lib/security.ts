import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Validates the current request's session against the database.
 * Optimized for performance: Single PK lookup, minimal fields.
 * 
 * Usage: Call at the top of Server Components (Layouts/Pages) or Server Actions.
 */
export async function validateRequest() {
    const session = await auth();

    // 1. Guest Access - Zero Overhead
    if (!session || !session.user) {
        return null;
    }

    const userId = session.user.id;
    // @ts-ignore - tokenVersion is added via module augmentation
    const sessionTokenVersion = session.user.tokenVersion;

    try {
        // 2. Optimized DB Lookup (Index Scan)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isActive: true,
                tokenVersion: true
            }
        });

        // 3. Validation Logic
        if (!user) {
            // Case: Account Deleted
            console.warn(`[Security] User ${userId} not found in DB. Terminating session.`);
            return redirect("/api/auth/force-signout?error=AccountDeleted");
        }

        if (!user.isActive) {
            // Case: Suspended
            console.warn(`[Security] Suspended user ${userId} attempted access.`);
            return redirect("/api/auth/force-signout?error=AccountSuspended");
        }

        // Fix: Default to 0 if session version is missing (backward compatibility)
        const currentSessionVersion = sessionTokenVersion ?? 0;
        const dbTokenVersion = user.tokenVersion ?? 0;

        if (dbTokenVersion !== currentSessionVersion) {
            // Case: Token Revoked (Password Change / Security Event)
            console.warn(`[Security] Token version mismatch for user ${userId}. Session: ${currentSessionVersion}, DB: ${dbTokenVersion}`);
            return redirect("/api/auth/force-signout?error=SessionExpired");
        }

        return user; // Valid
    } catch (error) {
        // If it's a redirect error, rethrow it (Next.js requirement)
        if (typeof error === 'object' && error !== null && 'digest' in error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error("[Security] Validation failed:", error);
        // Fail open or closed? Closed for security.
        return null;
    }
}
