"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatefulButton } from '@/components/ui/StatefulButton';
import { Key } from 'lucide-react';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { ADMIN_ROLES, ROLE_PERMISSIONS } from '@/lib/admin/permissions';

interface SubAdmin {
    id: string;
    email: string;
    name: string | null;
    permissions: Record<string, string[]>;
}

interface EditPermissionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    admin: SubAdmin;
    onSuccess: () => void;
}

export default function EditPermissionsModal({ isOpen, onClose, admin, onSuccess }: EditPermissionsModalProps) {
    // Initialize with existing permissions
    const initialPermissions = (): { resource: string; action: string }[] => {
        const perms: { resource: string; action: string }[] = [];
        for (const [resource, actions] of Object.entries(admin.permissions || {})) {
            for (const action of actions) {
                perms.push({ resource, action });
            }
        }
        return perms;
    };

    const [selectedPermissions, setSelectedPermissions] = useState<{ resource: string; action: string }[]>(
        initialPermissions()
    );
    const { execute, isLoading } = useAsyncAction();

    const handleRoleSelect = (roleName: string) => {
        const rolePermissions = ROLE_PERMISSIONS[roleName];
        if (rolePermissions) {
            setSelectedPermissions(rolePermissions);
        }
    };

    const handleSubmit = async () => {
        await execute(async () => {
            const res = await fetch(`/api/admin/subadmins/${admin.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    permissions: selectedPermissions
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update permissions');
            }
        }, {
            successMessage: 'Permissions updated successfully',
            onSuccess: () => onSuccess()
        });
    };

    const handleDemote = async () => {
        if (!confirm('Are you sure you want to demote this admin to a Seller? This will remove all admin privileges.')) {
            return;
        }

        await execute(async () => {
            const res = await fetch(`/api/admin/subadmins/${admin.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    role: 'SELLER',
                    permissions: []
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to demote admin');
            }
        }, {
            successMessage: 'User demoted to Seller successfully',
            onSuccess: () => onSuccess()
        });
    };

    const ROLE_DESCRIPTIONS: Record<string, { can: string; cannot: string }> = {
        [ADMIN_ROLES.MANAGER]: {
            can: "Manage products, categories, styles, promotions, and store layout.",
            cannot: "Manage other admins or process financial payouts."
        },
        [ADMIN_ROLES.MODERATOR]: {
            can: "Review products, approve sellers, and manage reports or testimonials.",
            cannot: "Access orders, store settings, or financial data."
        },
        [ADMIN_ROLES.SUPPORT]: {
            can: "View orders, users, sellers, and manage all support tickets and chats.",
            cannot: "Modify store configuration or process financial refunds."
        },
        [ADMIN_ROLES.FINANCE]: {
            can: "Manage orders, refunds, and process payouts.",
            cannot: "Modify website layout, banners, or product moderation."
        },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Key className="h-5 w-5 text-orange-500" />
                        Assign Role - {admin.name || admin.email}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-gray-700">Select Admin Role</label>
                        <div className="grid grid-cols-2 gap-4">
                            {Object.values(ADMIN_ROLES).filter(role => role !== ADMIN_ROLES.CUSTOM).map((role) => {
                                const isSelected = selectedPermissions.some(p => p.resource === 'SYSTEM_ROLE' && p.action === role);

                                return (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => handleRoleSelect(role)}
                                        className={`w-full text-left p-4 rounded-xl border-2 transition-all group h-full flex flex-col ${isSelected
                                            ? 'bg-orange-50 border-orange-500'
                                            : 'bg-white border-gray-200 hover:border-orange-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="mt-0.5 flex-shrink-0">
                                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300 group-hover:border-orange-400'
                                                    }`}>
                                                    {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <span className={`block font-bold text-base ${isSelected ? 'text-orange-900' : 'text-gray-900'}`}>
                                                    {role}
                                                </span>

                                                <div className="mt-3 space-y-2">
                                                    <div className="flex gap-2 items-start text-[11px] leading-relaxed">
                                                        <span className="font-bold text-green-600 uppercase tracking-tight shrink-0 px-1 py-0 bg-green-50 rounded border border-green-100">Can</span>
                                                        <span className={isSelected ? 'text-orange-800' : 'text-gray-600'}>
                                                            {ROLE_DESCRIPTIONS[role].can}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2 items-start text-[11px] leading-relaxed">
                                                        <span className="font-bold text-red-500 uppercase tracking-tight shrink-0 px-1 py-0 bg-red-50 rounded border border-red-100">No</span>
                                                        <span className={isSelected ? 'text-orange-700' : 'text-gray-400'}>
                                                            {ROLE_DESCRIPTIONS[role].cannot}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-6 border-t mt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 font-medium text-xs h-9 px-4"
                            onClick={handleDemote}
                            disabled={isLoading}
                        >
                            Downgrade to Seller
                        </Button>

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                                Cancel
                            </Button>
                            <StatefulButton
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                loadingText="Saving..."
                                className="bg-orange-500 hover:bg-orange-600 px-6 h-9 text-sm font-semibold"
                            >
                                Save Role
                            </StatefulButton>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
