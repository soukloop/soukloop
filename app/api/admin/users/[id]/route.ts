import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { hash } from 'bcryptjs'
import { centrifugoPublish } from '@/lib/centrifugo'
import { invalidateUserSessions } from '@/lib/session'
import { Role } from '@prisma/client'
import {
    notifyAccountSuspended,
    notifyAccountReactivated,
    notifyAccountDeleted
} from '@/lib/notifications/templates/auth-templates'

// Legacy helper replacement - check session directly
async function checkAdminPermission(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, status: 401, error: 'Unauthorized' };
    }
    const role = session.user.role;
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN' && role !== 'MODERATOR' && role !== 'SUPPORT') {
        return { success: false, status: 403, error: 'Forbidden' };
    }
    return { success: true };
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authCheck = await checkAdminPermission(request);
        if (!authCheck.success) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        const adminUser = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                name: true,
                isActive: true,
                emailVerified: true,
                image: true,
                profile: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phone: true,
                        bio: true,
                        avatar: true
                    }
                },
                vendor: {
                    select: {
                        id: true,
                        slug: true,
                        kycStatus: true,
                        isActive: true,
                        _count: {
                            select: {
                                products: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        orders: true
                    }
                }
            }
        })

        if (!adminUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(adminUser)

    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authCheck = await checkAdminPermission(request);
        if (!authCheck.success) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        const body = await request.json()
        const updateData: any = {}
        const oldUser = await prisma.user.findUnique({ where: { id }, select: { role: true, isActive: true } });

        if (body.email) updateData.email = body.email
        if (body.role) updateData.role = body.role
        if (body.password) {
            updateData.password = await hash(body.password, 10)
            // If password changes, force logout everywhere
            await invalidateUserSessions(id, 'Admin changed password');
        }
        if (body.name) updateData.name = body.name

        const adminUser = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                name: true,
                isActive: true
            }
        });

        // 🔔 Handle Notifications for Status Changes
        if (body.isActive !== undefined && oldUser) {
            const userEmail = adminUser.email;
            const userName = adminUser.name || undefined;

            if (body.isActive === false && oldUser.isActive === true) {
                // Suspended
                await notifyAccountSuspended(id, userName, "Violation of terms").catch(console.error);
            } else if (body.isActive === true && oldUser.isActive === false) {
                // Reactivated
                await notifyAccountReactivated(id, userName).catch(console.error);
            }
        }

        // 🚀 REAL-TIME SIGNAL: Role Change
        if (body.role && oldUser && body.role !== oldUser.role) {
            const newRole = body.role as Role;
            const isPromotion = ['SELLER', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(newRole);
            const isDemotion = newRole === 'USER';

            await centrifugoPublish(`user:${id}:role-changed`, {
                oldRole: oldUser.role,
                newRole: newRole,
                message: isPromotion
                    ? `You have been promoted to ${newRole}!`
                    : `Your role has been updated to ${newRole}`,
                invalidateSession: isDemotion, // Force logout if demoted to basic user
                timestamp: new Date().toISOString()
            });
            console.log(`[Signal] Sent role-change signal to user ${id}`);
        }

        return NextResponse.json(adminUser)

    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authCheck = await checkAdminPermission(request);
        if (!authCheck.success) {
            return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
        }

        // 1. Invalidate all sessions first
        await invalidateUserSessions(id, 'Account deleted by Admin');

        // 2. Get user info before deleting for email
        const userToDelete = await prisma.user.findUnique({
            where: { id },
            select: { email: true, name: true }
        });

        // 3. Delete user
        await prisma.user.delete({
            where: { id }
        })

        // 4. Send deleted notification (Email only via auth-templates)
        if (userToDelete?.email) {
            await notifyAccountDeleted(userToDelete.email, userToDelete.name || undefined).catch(console.error);
        }

        // 3. Send final "Goodbye" signal (best effort, user might be disconnected already)
        await centrifugoPublish(`user:${id}:session-invalidated`, {
            reason: 'Account Deleted',
            message: 'Your account has been removed.',
            requireReauth: true
        });

        return NextResponse.json({ message: 'User deleted successfully' })

    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
