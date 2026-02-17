/**
 * Admin Permissions Library
 * Centralized permission definitions and helper functions for sub-admin access control
 */

import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { isSuperAdmin as isSuperAdminRole, isAtLeastAdmin as isAtLeastAdminRole } from '@/lib/roles';

// ==================== PERMISSION DEFINITIONS ====================

/**
 * Complete resource-action matrix for the admin dashboard
 * Each resource maps to an array of allowed actions
 */
export const PERMISSION_DEFINITIONS: Record<string, string[]> = {
    // Core Dashboard
    dashboard: ['view'],

    // User Management
    users: ['view', 'edit', 'edit_address', 'suspend', 'delete'],

    // Chats Access
    chats: ['view', 'delete'],

    // Seller Management & KYC
    sellers: ['view', 'view_sensitive', 'view_documents', 'edit_profile', 'edit_address', 'kyc_approve', 'kyc_reject', 'suspend'],

    // Orders Management
    orders: ['view', 'manage'],

    // Returns & Refunds
    refunds: ['view', 'edit'],

    // Analytics & Dashboard
    analytics: ['view'],

    // Product Management
    products: ['view', 'edit', 'block', 'delete'],

    // Reports
    reports: ['view', 'take_action', 'dismiss'],

    // Categories
    categories: ['view', 'edit'],

    // Dress Styles
    dress_styles: ['view', 'add', 'approve', 'reject', 'suspend'],

    // Promotions & Banners
    promotions: ['view', 'create', 'edit', 'delete'],

    // Transactions
    transactions: ['view', 'process_payout'],

    // System Settings
    settings: ['view', 'edit'],

    // Support Tickets
    support: ['view', 'assign', 'respond'],

    // Help / FAQ
    help: ['view', 'edit'],

    // Sub-Admin Management (SuperAdmin only)
    subadmins: ['view', 'create', 'edit', 'delete'],
};

/**
 * Map sidebar routes to resource names
 */
export const ROUTE_TO_RESOURCE: Record<string, string> = {
    '/admin': 'dashboard',
    '/admin/users': 'users',
    '/admin/sellers': 'sellers',
    '/admin/products': 'products',
    '/admin/reports': 'reports',
    '/admin/categories': 'categories',
    '/admin/promotions': 'promotions',
    '/admin/refunds': 'refunds',
    '/admin/transactions': 'transactions',
    '/admin/settings': 'settings',
    '/admin/support': 'support',
    '/admin/help': 'help',
    '/admin/subadmins': 'subadmins',
};

/**
 * Resources that are SuperAdmin-only (can never be assigned to sub-admins)
 */
export const SUPER_ADMIN_ONLY_RESOURCES = ['subadmins'];

// ==================== PERMISSION HELPERS ====================

/**
 * Check if a user has a specific permission
 * SuperAdmins have all permissions automatically
 */
export async function hasPermission(
    userId: string,
    resource: string,
    action: string
): Promise<boolean> {
    try {
        // First, get the user to check role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true }
        });

        if (!user || !user.isActive) {
            return false;
        }

        const role = user.role as Role;

        // SuperAdmin has all permissions
        if (isSuperAdminRole(role)) {
            return true;
        }

        // Admins have implicit access to dashboard
        if (isAtLeastAdminRole(role) && resource === 'dashboard') {
            return true;
        }

        // Check if resource is SuperAdmin-only
        if (SUPER_ADMIN_ONLY_RESOURCES.includes(resource)) {
            return false;
        }

        // Check specific permission in the database
        const permission = await prisma.userPermission.findUnique({
            where: {
                userId_resource_action: {
                    userId: userId,
                    resource,
                    action
                }
            }
        });

        return !!permission;
    } catch (error) {
        console.error('[Permissions] Error checking permission:', error);
        return false;
    }
}

/**
 * Require a permission - throws if not authorized
 */
export async function requirePermission(
    userId: string,
    resource: string,
    action: string
): Promise<void> {
    const allowed = await hasPermission(userId, resource, action);
    if (!allowed) {
        throw new Error(`Permission denied: ${resource}:${action}`);
    }
}

/**
 * Get all permissions for a user
 * Returns a map of resource -> actions[]
 */
export async function getAdminPermissions(
    userId: string
): Promise<Record<string, string[]>> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true, isActive: true }
        });

        if (!user || !user.isActive) {
            return {};
        }

        // SuperAdmin has all permissions
        if (isSuperAdminRole(user.role as Role)) {
            return { ...PERMISSION_DEFINITIONS };
        }

        // Get permissions from database
        const permissions = await prisma.userPermission.findMany({
            where: { userId: userId },
            select: { resource: true, action: true }
        });

        // Group by resource
        const result: Record<string, string[]> = {};

        // Admins always have dashboard access
        if (isAtLeastAdminRole(user.role as Role)) {
            result['dashboard'] = ['view'];
        }

        // Add explicit permissions
        for (const perm of permissions) {
            if (!result[perm.resource]) {
                result[perm.resource] = [];
            }
            if (!result[perm.resource].includes(perm.action)) {
                result[perm.resource].push(perm.action);
            }
        }

        return result;
    } catch (error) {
        console.error('[Permissions] Error getting permissions:', error);
        return {};
    }
}

/**
 * Check if user is a SuperAdmin
 */
export async function checkIsSuperAdmin(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });
    return isSuperAdminRole(user?.role as Role);
}

/**
 * Check if a user can be modified (deleted/suspended)
 */
export async function canModifyAdmin(
    targetUserId: string
): Promise<{ canModify: boolean; reason?: string }> {
    const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: { role: true }
    });

    if (!targetUser) {
        return { canModify: false, reason: 'User not found' };
    }

    if (isSuperAdminRole(targetUser.role as Role)) {
        return { canModify: false, reason: 'Cannot modify SuperAdmin' };
    }

    return { canModify: true };
}

// ==================== AUDIT LOGGING ====================

interface AuditLogOptions {
    type?: string;
    id?: string;
}

/**
 * Log an admin action for audit purposes
 */
export async function logAdminAction(
    userId: string,
    action: string,
    target?: AuditLogOptions,
    details?: Record<string, unknown>,
    request?: { ip?: string; userAgent?: string }
): Promise<void> {
    try {
        await prisma.auditLog.create({
            data: {
                userId: userId,
                action,
                entity: target?.type || 'system',
                entityId: target?.id || 'system',
                details: (details || null) as any,
                ipAddress: request?.ip || null,
                userAgent: request?.userAgent || null,
            }
        });
    } catch (error) {
        console.error('[AuditLog] Error logging action:', error);
    }
}

/**
 * Get request metadata for audit logging
 */
export function getRequestMeta(request: Request): { ip?: string; userAgent?: string } {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent') || undefined;

    return {
        ip: forwardedFor?.split(',')[0]?.trim() || realIp || undefined,
        userAgent: userAgent?.substring(0, 500) // Limit length
    };
}

// ==================== PERMISSION ASSIGNMENT ====================

/**
 * Set permissions for a sub-admin/user (replaces existing)
 */
export async function setAdminPermissions(
    userId: string,
    permissions: Array<{ resource: string; action: string }>
): Promise<void> {
    // Validate that this is not a SuperAdmin
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
    });

    if (isSuperAdminRole(user?.role as Role)) {
        throw new Error('Cannot modify SuperAdmin permissions');
    }

    // Filter out invalid permissions
    const validPermissions = permissions.filter(p => {
        const resourceDef = PERMISSION_DEFINITIONS[p.resource];
        return resourceDef && resourceDef.includes(p.action);
    });

    // Transaction: delete old permissions and create new ones
    await prisma.$transaction([
        prisma.userPermission.deleteMany({
            where: { userId: userId }
        }),
        prisma.userPermission.createMany({
            data: validPermissions.map(p => ({
                userId: userId,
                resource: p.resource,
                action: p.action
            }))
        })
    ]);
}

/**
 * Get the current admin user ID from the request session
 */
export async function getAdminFromRequest(request: Request): Promise<string | null> {
    try {
        const { auth } = await import("@/auth");
        const session = await auth();

        if (!session?.user?.id) {
            return null;
        }

        const userId = session.user.id;

        // Check if user has an admin role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (isAtLeastAdminRole(user?.role as Role)) {
            return userId;
        }

        return null;
    } catch (error) {
        console.error('[Permissions] Error getting admin from request:', error);
        return null;
    }
}

/**
 * Get full permissions for display in permission matrix
 */
export function getAllPermissionDefinitions(): Record<string, string[]> {
    return { ...PERMISSION_DEFINITIONS };
}
