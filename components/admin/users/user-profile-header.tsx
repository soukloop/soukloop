import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { SensitiveDataDisplay } from "@/components/admin/users/ui/sensitive-data";
import { Calendar, Mail, Phone, MapPin, Shield, Ban, CheckCircle, Trash2, UserX, UserCheck, ChevronRight, Home, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import UserActions from "@/src/features/admin/components/user-actions";

interface UserProfileHeaderProps {
    userId: string;
    currentTab?: string;
}

export default async function UserProfileHeader({ userId, currentTab = "overview" }: UserProfileHeaderProps) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            profile: true,
            vendor: { select: { id: true, kycStatus: true } },
            _count: {
                select: {
                    orders: true,
                }
            }
        }
    });

    if (!user) return <div className="p-8 text-center text-red-500">User not found</div>;

    const isVendor = !!user.vendor;
    const isActive = user.isActive;

    const fullName = user.profile?.firstName
        ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
        : (user.name || "N/A");

    const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const joinDate = format(new Date(user.createdAt), "MMM d, yyyy");

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "orders", label: "Orders" },
        { id: "chat", label: "Chat" },
        { id: "reports", label: "Reports" },
    ];

    if (isVendor) {
        tabs.push({ id: "products", label: "Products" });
        tabs.push({ id: "dashboard", label: "Dashboard" });
    }

    return (
        <div className="w-full bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">

                {/* Top Section: User Info and Actions */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">

                    {/* User Info Block */}
                    <div className="flex items-center gap-5">
                        <UserAvatar
                            src={user.profile?.avatar || user.image}
                            name={fullName}
                            fallbackType="initials"
                            className="h-20 w-20 border-2 border-white shadow-sm bg-slate-50"
                        />

                        <div className="space-y-1.5">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{fullName}</h1>
                                <div className="flex items-center gap-2">
                                    {isVendor && <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100 border border-orange-200 shadow-none">Seller</Badge>}
                                    {user.role === 'ADMIN' && <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-100 border border-purple-200 shadow-none">Admin</Badge>}
                                    <Badge variant="outline" className={cn("capitalize bg-white shadow-none", isActive ? "text-green-600 border-green-200" : "text-red-600 border-red-200")}>
                                        {isActive ? "Active" : "Suspended"}
                                    </Badge>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-slate-500">
                                <div className="group/email flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span>{user.email}</span>
                                    <CopyButton value={user.email} hoverOnly className="h-3 w-3 text-slate-400 hover:text-slate-600" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ID</span>
                                    <SensitiveDataDisplay value={user.id} className="font-mono text-xs" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions Block - Aligned to bottom right */}
                    <div className="flex items-center gap-2 pb-1">

                        <UserActions userId={userId} isActive={isActive} />
                    </div>
                </div>

                {/* 3. Navigation Tabs */}
                <div className="flex items-center gap-6 border-b border-slate-200 text-sm">
                    {tabs.map((tab) => {
                        const isActiveTab = currentTab === tab.id;
                        return (
                            <Link
                                key={tab.id}
                                href={`/admin/users/${userId}?tab=${tab.id}`}
                                className={cn(
                                    "pb-3 border-b-2 transition-colors font-medium",
                                    isActiveTab
                                        ? "border-orange-600 text-orange-600"
                                        : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                                )}
                            >
                                {tab.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
