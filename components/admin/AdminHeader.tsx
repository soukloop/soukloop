"use client";

import { Bell, ChevronDown, LogOut, Menu, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/hooks/useNotifications';
import { AdminUser } from '@/lib/admin/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";

interface AdminHeaderProps {
    adminUser: AdminUser | null;
    onLogout: () => void;
    onMobileMenuToggle: () => void;
    isMobile: boolean;
}

export default function AdminHeader({
    adminUser,
    onLogout,
    onMobileMenuToggle,
    isMobile
}: AdminHeaderProps) {
    const router = useRouter();
    const { unreadCount } = useNotifications();

    return (
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
            {/* Left side - Mobile menu */}
            <div className="flex items-center gap-4">
                {isMobile && (
                    <button
                        onClick={onMobileMenuToggle}
                        className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                    >
                        <Menu className="h-5 w-5 text-gray-600" />
                    </button>
                )}
            </div>

            {/* Right side - Notifications & Profile */}
            <div className="flex items-center gap-3">
                {/* Notifications */}
                <button
                    onClick={() => router.push('/admin/notifications')}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                    <Bell className="h-5 w-5 text-gray-600" />
                    {unreadCount > 0 && (
                        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </button>

                {/* Admin Profile Dropdown */}
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild id="admin-user-menu-trigger">
                        <Button variant="ghost" className="flex items-center gap-2 px-2">
                            <UserAvatar
                                src={adminUser?.image || null}
                                name={adminUser?.email || "Admin Profile"}
                                className="w-8 h-8"
                            />
                            <div className="hidden text-left sm:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {adminUser?.email || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500">{adminUser?.role?.replace('_', ' ') || 'Super Admin'}</p>
                            </div>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600"
                            onClick={onLogout}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
