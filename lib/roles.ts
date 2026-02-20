import { Role } from "@prisma/client";

/**
 * Role hierarchy definition
 * Higher values have more permissions and include permissions of lower values.
 */
export const RoleLevel: Record<Role, number> = {
    USER: 1,
    SELLER: 2,
    ADMIN: 5,
    SUPER_ADMIN: 10,
};

/**
 * Check if the user has at least the required role (inclusive hierarchy)
 * @param currentRole The role of the logged-in user
 * @param requiredRole The minimum role needed to access a feature
 */
export function hasRole(currentRole: Role | undefined | null, requiredRole: Role): boolean {
    if (!currentRole) return false;
    return RoleLevel[currentRole] >= RoleLevel[requiredRole];
}

/**
 * Convenience helper to check if a user is at least a seller
 */
export function isAtLeastSeller(role: Role | undefined | null): boolean {
    return hasRole(role, "SELLER");
}

/**
 * Convenience helper to check if a user is part of the administration team
 */
export function isAtLeastAdmin(role: Role | undefined | null): boolean {
    return hasRole(role, "ADMIN");
}

/**
 * Convenience helper to check for super admin status
 */
export function isSuperAdmin(role: Role | undefined | null): boolean {
    return role === "SUPER_ADMIN";
}

/**
 * Returns an array of roles that meet or exceed the specified role
 * Useful for legacy code or middleware that expects a flat list of roles
 */
export function getRolesAtLeast(baseRole: Role): Role[] {
    return Object.keys(RoleLevel).filter((r) =>
        RoleLevel[r as Role] >= RoleLevel[baseRole]
    ) as Role[];
}
