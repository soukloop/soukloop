"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { StatefulButton } from '@/components/ui/StatefulButton';
import { Key } from 'lucide-react';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { PERMISSION_MATRIX } from './PermissionMatrix';

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

    const handleTogglePermission = (resource: string, action: string) => {
        const exists = selectedPermissions.some(p => p.resource === resource && p.action === action);
        if (exists) {
            setSelectedPermissions(prev => prev.filter(p => !(p.resource === resource && p.action === action)));
        } else {
            setSelectedPermissions(prev => [...prev, { resource, action }]);
        }
    };

    const handleToggleAllForResource = (resource: string, actions: string[]) => {
        const allSelected = actions.every(action =>
            selectedPermissions.some(p => p.resource === resource && p.action === action)
        );

        if (allSelected) {
            // Remove all
            setSelectedPermissions(prev => prev.filter(p => p.resource !== resource));
        } else {
            // Add all
            const newPerms = actions
                .filter(action => !selectedPermissions.some(p => p.resource === resource && p.action === action))
                .map(action => ({ resource, action }));
            setSelectedPermissions(prev => [...prev, ...newPerms]);
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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Key className="h-5 w-5 text-orange-500" />
                        Edit Permissions - {admin.name || admin.email}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                    <p className="text-sm text-gray-500">
                        Selected {selectedPermissions.length} permissions
                    </p>

                    {/* Permissions Grid */}
                    <div className="border rounded-lg p-4 bg-gray-50 max-h-[500px] overflow-y-auto">
                        <div className="space-y-4">
                            {Object.entries(PERMISSION_MATRIX).map(([resource, { label, actions }]) => (
                                <div key={resource} className="bg-white rounded-lg p-3 border">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium text-gray-900">{label}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleAllForResource(resource, actions)}
                                            className="text-xs text-orange-600 hover:text-orange-700"
                                        >
                                            {actions.every(a => selectedPermissions.some(p => p.resource === resource && p.action === a))
                                                ? 'Deselect All'
                                                : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {actions.map(action => {
                                            const isSelected = selectedPermissions.some(
                                                p => p.resource === resource && p.action === action
                                            );
                                            return (
                                                <button
                                                    key={action}
                                                    type="button"
                                                    onClick={() => handleTogglePermission(resource, action)}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${isSelected
                                                        ? 'bg-orange-100 text-orange-700 ring-1 ring-orange-300'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {action}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <StatefulButton
                            onClick={handleSubmit}
                            isLoading={isLoading}
                            loadingText="Saving..."
                            className="bg-orange-500 hover:bg-orange-600"
                        >
                            Save Permissions
                        </StatefulButton>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
