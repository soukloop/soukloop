"use client";

import { useState, useEffect } from 'react';
import { Loader2, ShieldOff } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import { usePathname, useRouter } from 'next/navigation';

import PermissionListener from '@/components/admin/PermissionListener';

export default function AdminLayoutClient({
    children,
    initialPermissions = {},
}: {
    children: React.ReactNode;
    initialPermissions?: Record<string, string[]>;
}) {
    const { isAuthChecking, isAuthenticated, adminUser, login, logout, hasPermission, isSuperAdmin, canAccessRoute } = useAdminAuth(initialPermissions);
    const pathname = usePathname();
    const router = useRouter();

    // Sidebar states
    // Initialize with false, but effect will sync with localStorage
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    // Toggle handler that persists state
    const toggleSidebar = () => {
        const newState = !sidebarCollapsed;
        setSidebarCollapsed(newState);
        localStorage.setItem('admin:sidebarCollapsed', String(newState));
    };

    // Check screen size on mount and resize
    useEffect(() => {
        // 1. Restore preference from localStorage on mount
        const savedState = localStorage.getItem('admin:sidebarCollapsed');
        if (savedState !== null) {
            setSidebarCollapsed(savedState === 'true');
        }

        const checkScreenSize = () => {
            const width = window.innerWidth;
            const mobile = width < 768; // Mobile is strictly small screens
            setIsMobile(mobile);

            // Auto collapse on Tablet (768px - 1024px)
            // But respects user preference if they manually expanded it on a large screen
            // Logic: strictly force collapse only if space is tight? 
            // Current existing logic forced collapse on < 1024. Let's keep it but only if no user preference?
            // Actually, best UX: If screen becomes small, collapse. If screen becomes big, usage localStorage.

            if (width < 1024 && width >= 768) {
                setSidebarCollapsed(true);
            } else if (width >= 1024) {
                // Restoration logic is already handled by the initial check, 
                // but if we resize *back* to desktop, we might want to restore.
                // For simplicity, let's leave resize strictly for "forcing small".
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <PermissionListener />
            <AdminSidebar
                collapsed={sidebarCollapsed}
                onToggle={toggleSidebar}
                isMobile={isMobile}
                mobileOpen={mobileMenuOpen}
                onMobileClose={() => setMobileMenuOpen(false)}
                hasPermission={hasPermission}
                isSuperAdmin={isSuperAdmin}
            />


            <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
                <AdminHeader
                    adminUser={adminUser}
                    onLogout={logout}
                    onMobileMenuToggle={() => setMobileMenuOpen(true)}
                    isMobile={isMobile}
                />
                <main className="p-4 lg:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}



