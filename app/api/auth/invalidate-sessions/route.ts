import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

/**
 * POST /api/auth/invalidate-sessions
 * ===================================
 * Professional session invalidation endpoint.
 * 
 * Use Cases:
 * 1. User deleted - invalidate their sessions
 * 2. Password changed - force re-login
 * 3. "Log out everywhere" feature
 * 4. Account security incident
 * 
 * Pattern: Incrementing tokenVersion invalidates all JWT tokens for that user.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, reason } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        // Optional: Verify caller has permission (admin or the user themselves)
        const session = await auth();
        const isAdmin = session?.user?.role === 'ADMIN';
        const isSelf = session?.user?.id === userId;

        if (!isAdmin && !isSelf) {
            return NextResponse.json(
                { error: 'Not authorized to invalidate sessions for this user' },
                { status: 403 }
            );
        }

        // Increment tokenVersion to invalidate all existing JWTs for this user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { tokenVersion: { increment: 1 } },
            select: { id: true, tokenVersion: true }
        });

        console.log(`[Auth] Sessions invalidated for user ${userId}. Reason: ${reason || 'unspecified'}. New tokenVersion: ${updatedUser.tokenVersion}`);

        return NextResponse.json({
            success: true,
            message: 'All sessions invalidated',
            tokenVersion: updatedUser.tokenVersion
        });

    } catch (error: any) {
        // Handle case where user doesn't exist
        if (error?.code === 'P2025') {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        console.error('[Auth] Invalidate sessions error:', error);
        return NextResponse.json(
            { error: 'Failed to invalidate sessions' },
            { status: 500 }
        );
    }
}
