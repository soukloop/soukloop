"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Shield } from 'lucide-react';
import { SIDEBAR_ITEMS } from '@/lib/admin/constants';
import { useState, useEffect, useMemo } from 'react';
import { SidebarItem } from '@/lib/admin/types';

interface AdminSidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    isMobile: boolean;
    mobileOpen: boolean;
    onMobileClose: () => void;
    // Permission props
    hasPermission?: (resource: string, action: string) => boolean;
    isSuperAdmin?: boolean;
}

export default function AdminSidebar({
    collapsed,
    onToggle,
    isMobile,
    mobileOpen,
    onMobileClose,
    hasPermission,
    isSuperAdmin = false
}: AdminSidebarProps) {
    const pathname = usePathname();

    // Check if a path is active
    const isActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname?.startsWith(href) ?? false;
    };

    // Filter sidebar items based on permissions
    const filteredItems = useMemo((): SidebarItem[] => {
        // If no permission function provided, show all (backwards compatible)
        if (!hasPermission) {
            return SIDEBAR_ITEMS;
        }

        return SIDEBAR_ITEMS.filter(item => {
            // Dashboard is ALWAYS visible to all logged-in admins
            if (item.resource === 'dashboard' || item.href === '/admin') {
                return true;
            }

            // SuperAdmin-only items
            if (item.superAdminOnly && !isSuperAdmin) {
                return false;
            }

            // SuperAdmin has full access
            if (isSuperAdmin) {
                return true;
            }

            // Check permission for the resource
            if (item.resource) {
                return hasPermission(item.resource, 'view');
            }

            // Default: show if no resource specified
            return true;
        });
    }, [hasPermission, isSuperAdmin]);

    // Mobile sidebar overlay
    if (isMobile) {
        return (
            <>
                {/* Mobile overlay */}
                {mobileOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-black/50"
                        onClick={onMobileClose}
                    />
                )}

                {/* Mobile sidebar */}
                <aside
                    className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    {/* Header */}
                    <div className="flex h-16 items-center justify-between border-b px-4">
                        <div className="flex items-center gap-2">
                            <img src="/logo.png" alt="Soukloop" className="h-8 w-auto" />
                        </div>
                        <button
                            onClick={onMobileClose}
                            className="p-2 rounded-lg hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)] custom-scrollbar">
                        {filteredItems.map((item, index) => (
                            <Link
                                key={index}
                                href={item.href || '/admin'}
                                onClick={onMobileClose}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.href || '/admin')
                                    ? 'bg-orange-50 text-orange-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon
                                    className={`h-5 w-5 flex-shrink-0 ${isActive(item.href || '/admin') ? 'opacity-100' : 'opacity-70'}`}
                                />
                                <span className="text-sm font-medium">{item.label}</span>
                                {item.superAdminOnly && (
                                    <Shield className="h-3 w-3 text-purple-500 ml-auto" />
                                )}
                            </Link>
                        ))}
                    </nav>
                </aside>
            </>
        );
    }

    // Desktop sidebar
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-30 bg-white border-r transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b px-4">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="Soukloop" className="h-8 w-auto" />
                    </div>
                )}
                <button
                    onClick={onToggle}
                    className={`p-2 rounded-lg hover:bg-gray-100 ${collapsed ? 'mx-auto' : ''}`}
                >
                    <Menu className="h-5 w-5 text-gray-600" />
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)] custom-scrollbar">
                {filteredItems.map((item, index) => (
                    <Link
                        key={index}
                        href={item.href || '/admin'}
                        title={collapsed ? item.label : undefined}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive(item.href || '/admin')
                            ? 'bg-orange-50 text-orange-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                            } ${collapsed ? 'justify-center' : ''}`}
                    >
                        <item.icon
                            className={`h-5 w-5 flex-shrink-0 transition-opacity ${isActive(item.href || '/admin') ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}
                        />
                        {!collapsed && (
                            <>
                                <span className="text-sm font-medium truncate">{item.label}</span>
                                {item.superAdminOnly && (
                                    <Shield className="h-3 w-3 text-purple-500 ml-auto" />
                                )}
                            </>
                        )}
                    </Link>
                ))}
            </nav>
        </aside>
    );
}

