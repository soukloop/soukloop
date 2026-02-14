"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { centrifugoPublish } from "@/lib/centrifugo";

/**
 * Invalidate all sessions for a user
 * Use when: account deleted, password changed, role changed, security breach
 * 
 * @param userId - The ID of the user whose sessions should be invalidated
 * @param reason - Optional reason for the invalidation (sent via real-time notification)
 * @returns Success status
 */
export async function invalidateUserSessions(userId: string, reason?: string) {
    try {
        // 1. Delete all active sessions from database
        const deletedSessions = await prisma.session.deleteMany({
            where: { userId }
        });

        console.log(`[Session] Invalidated ${deletedSessions.count} sessions for user ${userId}`);

        // 2. Send real-time notification to user (if Centrifugo is configured)
        if (reason) {
            await centrifugoPublish(`user:${userId}:session-invalidated`, {
                reason,
                timestamp: new Date().toISOString(),
                sessionCount: deletedSessions.count
            });
        }

        // 3. Force Next.js to revalidate layout (clears cached session data)
        revalidatePath("/", "layout");

        return { success: true, count: deletedSessions.count };
    } catch (error) {
        console.error('[Session] Error invalidating sessions:', error);
        return { success: false, error: 'Failed to invalidate sessions' };
    }
}

/**
 * Validate that the current session is still valid
 * Checks: user exists, is active, email is verified
 * 
 * Use in server components/actions for extra security validation
 * 
 * @returns True if session is valid, false otherwise
 */
export async function validateCurrentSession(): Promise<boolean> {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return false;
        }

        // Query fresh user data from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                isActive: true,
                role: true,
                emailVerified: true
            }
        });

        // Invalidate if user deleted, suspended, or email unverified
        if (!user || !user.isActive || !user.emailVerified) {
            await invalidateUserSessions(
                session.user.id,
                !user ? 'Account deleted' : !user.isActive ? 'Account suspended' : 'Email verification revoked'
            );
            return false;
        }

        return true;
    } catch (error) {
        console.error('[Session] Error validating session:', error);
        return false;
    }
}

/**
 * Invalidate all sessions when user changes password
 * Forces re-authentication with new password
 * 
 * @param userId - The ID of the user who changed their password
 */
export async function invalidateSessionsOnPasswordChange(userId: string) {
    try {
        // Invalidate all sessions
        await invalidateUserSessions(userId);

        // Notify user via real-time
        await centrifugoPublish(`user:${userId}:session-invalidated`, {
            reason: 'Password changed',
            message: 'Please log in with your new password',
            requireReauth: true
        });

        return { success: true };
    } catch (error) {
        console.error('[Session] Error on password change:', error);
        return { success: false, error: 'Failed to invalidate sessions' };
    }
}

/**
 * Get all active sessions for a user
 * Useful for "active sessions" management UI
 * 
 * @param userId - The ID of the user
 * @returns Array of active sessions with metadata
 */
export async function getUserActiveSessions(userId: string) {
    try {
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                expires: { gt: new Date() } // Only non-expired sessions
            },
            select: {
                id: true,
                sessionToken: true,
                expires: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        return { success: true, sessions };
    } catch (error) {
        console.error('[Session] Error fetching sessions:', error);
        return { success: false, sessions: [] };
    }
}

/**
 * Invalidate a specific session by ID
 * Useful for "log out from this device" functionality
 * 
 * @param sessionId - The session ID to invalidate
 */
export async function invalidateSession(sessionId: string) {
    try {
        await prisma.session.delete({
            where: { id: sessionId }
        });

        revalidatePath("/", "layout");
        return { success: true };
    } catch (error) {
        console.error('[Session] Error invalidating specific session:', error);
        return { success: false };
    }
}
