"use client";

import { useSession, signOut } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { AdminUser } from "@/lib/admin/types";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";

/**
 * COMPATIBILITY HOOK
 * Replaces the old API-based auth with NextAuth session
 */

interface UseAdminAuthReturn {
    isAuthChecking: boolean;
    isAuthenticated: boolean;
    adminUser: AdminUser | null;
    login: (admin: AdminUser) => void;
    logout: () => Promise<void>;
    checkSession: () => Promise<boolean>;
    hasPermission: (resource: string, action: string) => boolean;
    isSuperAdmin: boolean;
    canAccessRoute: (route: string) => boolean;
}

// Map routes to resource names (kept for backward compatibility)
const ROUTE_TO_RESOURCE: Record<string, string> = {
    '/admin': 'dashboard',
    '/admin/users': 'users',
    '/admin/sellers': 'sellers',
    '/admin/products': 'products',
    '/admin/reports': 'reports',
    '/admin/categories': 'categories',
    '/admin/banners': 'promotions',
    '/admin/refunds': 'refunds',
    '/admin/transactions': 'transactions',
    '/admin/settings': 'settings',
    '/admin/support': 'support',
    '/admin/help': 'help',
    '/admin/subadmins': 'subadmins',
};

export function useAdminAuth(initialPermissions: Record<string, string[]> = {}): UseAdminAuthReturn {
    const { data: session, status } = useSession();
    const router = useRouter();

    const isAuthenticated = status === "authenticated";
    const isAuthChecking = status === "loading";

    // Convert NextAuth user to AdminUser format
    const adminUser: AdminUser | null = useMemo(() => {
        if (!session?.user) return null;

        return {
            id: session.user.id,
            email: session.user.email || "",
            firstName: session.user.name?.split(' ')[0] || "",
            lastName: session.user.name?.split(' ').slice(1).join(' ') || "",
            role: session.user.role || Role.USER,
            // Restore actual permissions from server data
            permissions: initialPermissions,
            isActive: true,
            image: session.user.image,
            createdAt: new Date(),
            updatedAt: new Date()
        } as unknown as AdminUser;
    }, [session]);

    // Check if admin is SuperAdmin
    const isSuperAdmin = useMemo(() => {
        return session?.user?.role === Role.SUPER_ADMIN;
    }, [session?.user?.role]);

    // Full permission check matching the original legacy format
    const hasPermission = useCallback((resource: string, action: string): boolean => {
        if (!session?.user) return false;

        const role = session.user.role;

        // SuperAdmins always have full access
        if (role === Role.SUPER_ADMIN) return true;

        // Ensure regular admins only access what they explicitly have in the database
        if (role === Role.ADMIN) {
            // Dashboard is universally allowed for admins
            if (resource === 'dashboard') return true;

            const resourcePermissions = initialPermissions[resource];
            if (!resourcePermissions) return false;

            return resourcePermissions.includes(action);
        }

        return false;
    }, [session?.user, initialPermissions]);

    // Check route access
    const canAccessRoute = useCallback((route: string): boolean => {
        if (!session?.user) return false;
        if (session.user.role === Role.SUPER_ADMIN) return true;
        if (session.user.role === Role.ADMIN) return true;

        // Legacy resource check
        let resource = ROUTE_TO_RESOURCE[route];
        if (!resource) {
            for (const [routePrefix, res] of Object.entries(ROUTE_TO_RESOURCE)) {
                if (route.startsWith(routePrefix + '/') || route === routePrefix) {
                    resource = res;
                    break;
                }
            }
        }

        if (resource) return hasPermission(resource, 'view');

        return true; // Default allow if not matched (handled by middleware anyway)
    }, [session, hasPermission]);

    // Deprecated methods
    const checkSession = useCallback(async () => {
        return status === "authenticated";
    }, [status]);

    const login = useCallback(() => {
        // No-op: handled by NextAuth
    }, []);

    const logout = useCallback(async () => {
        await signOut({ callbackUrl: '/' });
    }, []);

    return {
        isAuthChecking,
        isAuthenticated,
        adminUser,
        login,
        logout,
        checkSession,
        hasPermission,
        isSuperAdmin,
        canAccessRoute,
    };
}
