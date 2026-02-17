/**
 * Sub-Admin Management API
 * GET: List all sub-admins (SuperAdmin only)
 * POST: Create new sub-admin (SuperAdmin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import {
    checkIsSuperAdmin,
    logAdminAction,
    getRequestMeta,
    setAdminPermissions,
    getAdminPermissions
} from '@/lib/admin/permissions';
import { z } from 'zod';

// Validation schema for creating sub-admin
const createSubAdminSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    password: z.string().min(8),
    permissions: z.array(z.object({
        resource: z.string(),
        action: z.string()
    })).optional().default([])
});

/**
 * GET /api/admin/subadmins
 * List all sub-admins with their permissions
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const adminId = authResult.admin?.id!;

        // Only SuperAdmin can view sub-admins
        const isSuper = await checkIsSuperAdmin(adminId);
        if (!isSuper) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        // Get all admin users (except maybe the requesting one? logic typically shows all)
        // We filter for roles that are considered "SubAdmins" or Staff.
        const admins = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'MODERATOR', 'SUPPORT'] }
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                createdAt: true,
                // createdBy is not on User, so we skip it or standardise if needed
            },
            orderBy: { createdAt: 'desc' }
        });

        // Fetch permissions for each admin
        const adminsWithPermissions = await Promise.all(
            admins.map(async (admin) => {
                const permissions = await getAdminPermissions(admin.id);
                // Count permissions
                const permissionCount = Object.values(permissions).reduce((acc, actions) => acc + actions.length, 0);

                return {
                    ...admin,
                    permissions,
                    permissionCount,
                    createdByName: null // User doesn't track createdBy for other users usually
                };
            })
        );

        return NextResponse.json(adminsWithPermissions);
    } catch (error) {
        console.error('[SubAdmins API] GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

/**
 * POST /api/admin/subadmins
 * Create a new sub-admin
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }
        const adminId = authResult.admin?.id!;

        // Only SuperAdmin can create sub-admins
        const isSuper = await checkIsSuperAdmin(adminId);
        if (!isSuper) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        const body = await request.json();
        const validation = createSubAdminSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { email, name, password, permissions } = validation.data;

        // Check if email already exists
        const existing = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'A user with this email already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create the sub-admin (Role defaults to ADMIN for sub-admins)
        const newAdmin = await prisma.user.create({
            data: {
                email: email.toLowerCase().trim(),
                name,
                password: passwordHash, // User table uses 'password', not 'passwordHash' usually? Wait, schema said 'password'.
                role: 'ADMIN',
                isActive: true,
                emailVerified: new Date()
            }
        });

        // Set permissions if provided
        if (permissions.length > 0) {
            await setAdminPermissions(newAdmin.id, permissions);
        }

        // Log the action (using generic logAdminAction which now maps to AuditLog)
        await logAdminAction(
            adminId,
            'subadmin.create',
            { type: 'User', id: newAdmin.id },
            { email, name, permissionCount: permissions.length },
            getRequestMeta(request)
        );

        return NextResponse.json({
            success: true,
            message: 'Sub-admin created successfully',
            admin: {
                id: newAdmin.id,
                email: newAdmin.email,
                name: newAdmin.name,
                role: newAdmin.role
            }
        }, { status: 201 });

    } catch (error) {
        console.error('[SubAdmins API] POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
