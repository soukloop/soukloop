import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getAdminPermissions } from '@/lib/admin/permissions'

// Removed ADMIN_SESSION_SECRET as it's no longer needed for custom JWT

interface AdminTokenPayload {
    id: string
    email: string
    role: string
    iat: number
    exp: number
}

export async function GET(request: NextRequest) {
    try {
        // 1. Verify session using NextAuth
        const session = await auth();

        // 2. Check if there is a session
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'No active session', authenticated: false },
                { status: 401 }
            );
        }

        // 3. Fetch fresh user data from database
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
            }
        });

        // 4. Validate Admin Role
        const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'];
        if (!user || !user.isActive || !allowedRoles.includes(user.role)) {
            return NextResponse.json(
                { error: 'Unauthorized access', authenticated: false },
                { status: 401 }
            );
        }

        // 5. Get permissions for the user
        const permissions = await getAdminPermissions(user.id);

        // 6. Return standard response mapped to old structure
        return NextResponse.json({
            authenticated: true,
            admin: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isDeletable: true, // Placeholder
                permissions
            }
        });

    } catch (error) {
        console.error('Admin session check error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

