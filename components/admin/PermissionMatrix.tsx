/**
 * Permission Matrix - Shared permission definitions for UI
 */

// Permission matrix for the UI - defines available permissions per resource
export const PERMISSION_MATRIX: Record<string, { label: string; actions: string[] }> = {
    dashboard: { label: '📊 Dashboard', actions: ['view'] },
    analytics: { label: '📈 Analytics', actions: ['view'] }, // Separated from general dashboard
    users: { label: '👥 Users', actions: ['view', 'edit', 'suspend', 'delete'] },
    sellers: { label: '🏪 Sellers', actions: ['view', 'view_sensitive', 'view_documents', 'edit_profile', 'edit_address', 'kyc_approve', 'kyc_reject', 'suspend'] },
    orders: { label: '📦 Orders', actions: ['view', 'manage'] },
    products: { label: '🏷️ Products', actions: ['view', 'edit', 'block', 'delete'] },
    reports: { label: '🚨 Reports', actions: ['view', 'take_action', 'dismiss'] },
    categories: { label: '📁 Categories', actions: ['view', 'edit'] },
    dress_styles: { label: '👗 Dress Styles', actions: ['view', 'add', 'approve', 'reject', 'suspend'] },
    promotions: { label: '📢 Banners', actions: ['view', 'create', 'edit', 'delete'] },
    transactions: { label: '💰 Transactions', actions: ['view', 'process_payout'] },
    settings: { label: '⚙️ Settings', actions: ['view', 'edit'] },
    support: { label: '🎫 Support', actions: ['view', 'assign', 'respond'] },
    help: { label: '❓ Help', actions: ['view', 'edit'] },
};

// Get all permissions as a flat list
export function getAllPermissions(): Array<{ resource: string; action: string }> {
    const permissions: Array<{ resource: string; action: string }> = [];
    for (const [resource, { actions }] of Object.entries(PERMISSION_MATRIX)) {
        for (const action of actions) {
            permissions.push({ resource, action });
        }
    }
    return permissions;
}

// Count total available permissions
export function getTotalPermissionCount(): number {
    return Object.values(PERMISSION_MATRIX).reduce((sum, { actions }) => sum + actions.length, 0);
}
