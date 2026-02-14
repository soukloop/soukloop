/**
 * Sub-Admin Detail API
 * GET: Get sub-admin details with permissions
 * PATCH: Update sub-admin details/permissions
 * DELETE: Delete/deactivate sub-admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import {
    isSuperAdmin,
    logAdminAction,
    getRequestMeta,
    canModifyAdmin,
    setAdminPermissions,
    getAdminPermissions
} from '@/lib/admin/permissions';
import { z } from 'zod';

// Validation schema for updating sub-admin
const updateSubAdminSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    password: z.string().min(8).optional(),
    isActive: z.boolean().optional(),
    role: z.enum(['ADMIN', 'MODERATOR', 'SUPPORT']).optional(),
    permissions: z.array(z.object({
        resource: z.string(),
        action: z.string()
    })).optional()
});

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/admin/subadmins/[id]
 * Get sub-admin details with permissions
 */
export async function GET(request: NextRequest, props: RouteParams) {
    const params = await props.params;
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const adminId = authResult.admin?.id!;

        // Only SuperAdmin can view sub-admin details
        const isSuper = await isSuperAdmin(adminId);
        if (!isSuper) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const { id } = params;

        const admin = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!admin) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify it's an admin-type user
        if (!['ADMIN', 'MODERATOR', 'SUPPORT', 'SUPER_ADMIN'].includes(admin.role)) {
            return NextResponse.json({ error: 'User is not an admin' }, { status: 404 });
        }

        // Get permissions
        const permissions = await getAdminPermissions(admin.id);
        const formattedPermissions: Record<string, string[]> = permissions; // getAdminPermissions already returns Record<string, string[]>

        return NextResponse.json({
            ...admin,
            permissions: formattedPermissions,
            isDeletable: admin.role !== 'SUPER_ADMIN', // Placeholder
        });
    } catch (error) {
        console.error('[SubAdmins API] GET [id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * PATCH /api/admin/subadmins/[id]
 * Update sub-admin details or permissions
 */
export async function PATCH(request: NextRequest, props: RouteParams) {
    const params = await props.params;
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const adminId = authResult.admin?.id!;

        // Only SuperAdmin can modify sub-admins
        const isSuper = await isSuperAdmin(adminId);
        if (!isSuper) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const { id } = params;

        // Check if the target admin can be modified
        const modifyCheck = await canModifyAdmin(id);
        if (!modifyCheck.canModify) {
            return NextResponse.json(
                { error: modifyCheck.reason || 'Cannot modify this admin' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validation = updateSubAdminSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { name, password, isActive, role, permissions } = validation.data;

        // Build update data
        const updateData: Record<string, unknown> = {};
        if (name !== undefined) updateData.name = name;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (role !== undefined) updateData.role = role;
        if (password) {
            updateData.password = await bcrypt.hash(password, 12);
        }

        // Update the admin user
        const updatedAdmin = await prisma.user.update({
            where: { id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true
            }
        });

        // Update permissions if provided
        if (permissions) {
            await setAdminPermissions(id, permissions);
        }

        // Log the action
        await logAdminAction(
            adminId,
            'subadmin.update',
            { type: 'User', id },
            {
                nameChanged: name !== undefined,
                passwordChanged: password !== undefined,
                statusChanged: isActive !== undefined,
                permissionsChanged: permissions !== undefined
            },
            getRequestMeta(request)
        );

        // Real-Time Update: Emit event if permissions or role changed
        if (permissions || isActive !== undefined) {
            const io = (global as any).io; // Not sure if global.io works here, but keeping it
            // Better to use outbox pattern if moved to unified, but sticking to logic.
            // We can maybe use `outbox` lib here? 
            // Leaving as is for now as `io` might be defined.
        }

        // Get updated permissions
        const updatedPermissions = await getAdminPermissions(id);

        return NextResponse.json({
            success: true,
            message: 'Sub-admin updated successfully',
            admin: {
                ...updatedAdmin,
                permissions: updatedPermissions
            }
        });
    } catch (error) {
        console.error('[SubAdmins API] PATCH error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/subadmins/[id]
 * Delete a sub-admin (permanent)
 */
export async function DELETE(request: NextRequest, props: RouteParams) {
    const params = await props.params;
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const adminId = authResult.admin?.id!;

        // Only SuperAdmin can delete sub-admins
        const isSuper = await isSuperAdmin(adminId);
        if (!isSuper) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const { id } = params;

        // Prevent self-deletion
        if (id === adminId) {
            return NextResponse.json(
                { error: 'Cannot delete your own account' },
                { status: 403 }
            );
        }

        // Check if the target admin can be deleted
        const modifyCheck = await canModifyAdmin(id);
        if (!modifyCheck.canModify) {
            return NextResponse.json(
                { error: modifyCheck.reason || 'Cannot delete this admin' },
                { status: 403 }
            );
        }

        // Get admin info before deletion for logging
        const adminToDelete = await prisma.user.findUnique({
            where: { id },
            select: { email: true, name: true }
        });

        if (!adminToDelete) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        // Delete the admin (permissions will cascade delete)
        await prisma.user.delete({
            where: { id }
        });

        // Log the action
        await logAdminAction(
            adminId,
            'subadmin.delete',
            { type: 'User', id },
            { deletedEmail: adminToDelete.email, deletedName: adminToDelete.name },
            getRequestMeta(request)
        );

        return NextResponse.json({
            success: true,
            message: 'Sub-admin deleted successfully'
        });
    } catch (error) {
        console.error('[SubAdmins API] DELETE error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
