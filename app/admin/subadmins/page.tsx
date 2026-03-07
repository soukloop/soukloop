"use client";

import { useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Shield, ShieldOff, Trash2, Edit, User, Key, Search } from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/admin/StatusBadge';
import RoleBadge from '@/components/admin/RoleBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useRouter } from 'next/navigation';
import PromoteUserModal from '@/components/admin/PromoteUserModal';
import EditPermissionsModal from '@/components/admin/EditPermissionsModal';
import { UserAvatar } from '@/components/shared/user-avatar';

const fetcher = (url: string) => fetch(url, { credentials: 'include' }).then(res => res.json());

interface SubAdmin {
    id: string;
    email: string;
    name: string | null;
    image?: string | null;
    role: 'ADMIN' | 'SUPER_ADMIN' | 'SELLER' | 'USER';
    isActive: boolean;
    isDeletable: boolean;
    createdAt: string;
    updatedAt: string;
    createdByName: string | null;
    permissions: Record<string, string[]>;
}

interface EnrichedSubAdmin extends SubAdmin {
    displayRole: string;
}

export default function SubAdminManagementPage() {
    const router = useRouter();
    const { isSuperAdmin, isAuthChecking, isAuthenticated, adminUser } = useAdminAuth();
    const { data: subAdmins, error, isLoading, mutate } = useSWR<SubAdmin[]>(
        isAuthenticated ? '/api/admin/subadmins' : null,
        fetcher
    );

    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPermissionsModal, setShowPermissionsModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<SubAdmin | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Enrich data for table display and filtering
    const enrichedAdmins = useMemo<EnrichedSubAdmin[]>(() => {
        const safeData = Array.isArray(subAdmins) ? subAdmins : [];
        return safeData.map(admin => {
            let displayRole = 'Custom Admin';
            if (admin.role === 'SUPER_ADMIN') {
                displayRole = 'Super Admin';
            } else {
                const assignedRolePerm = admin.permissions?.['SYSTEM_ROLE']?.[0];
                if (assignedRolePerm) displayRole = assignedRolePerm;
            }
            return {
                ...admin,
                displayRole
            };
        });
    }, [subAdmins]);

    // Redirect if not SuperAdmin
    useEffect(() => {
        if (!isAuthChecking && isAuthenticated && !isSuperAdmin) {
            toast.error('Access denied: SuperAdmin only');
            router.push('/admin');
        }
    }, [isAuthChecking, isAuthenticated, isSuperAdmin, router]);

    // Table columns
    const columns: Column<EnrichedSubAdmin>[] = [
        {
            key: 'name',
            header: 'Admin',
            render: (admin) => (
                <div className="flex items-center gap-3">
                    <UserAvatar
                        src={admin.image}
                        name={admin.name || "Admin"}
                        fallbackType="image"
                        className="size-10 border-2 border-orange-200"
                    />
                    <div>
                        <p className="font-medium text-gray-900">{admin.name || 'Unnamed'}</p>
                        <p className="text-xs text-gray-500">{admin.email}</p>
                    </div>
                </div>
            )
        },
        {
            key: 'displayRole',
            header: 'Admin Role',
            render: (admin) => (
                <RoleBadge role={admin.displayRole} />
            )
        },
        {
            key: 'isActive',
            header: 'Status',
            render: (admin) => (
                <StatusBadge
                    status={admin.isActive ? 'Active' : 'Suspended'}
                    type="user"
                />
            )
        },
        {
            key: 'updatedAt',
            header: 'Last Updated',
            render: (admin) => (
                <div>
                    <p className="text-gray-600">
                        {admin.updatedAt ? new Date(admin.updatedAt).toLocaleDateString() : new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                </div>
            )
        }
    ];

    // Filter options
    const filterOptions: FilterOption<EnrichedSubAdmin>[] = [
        {
            key: 'displayRole',
            label: 'Role',
            options: [
                { label: 'Super Admin', value: 'Super Admin' },
                { label: 'Manager', value: 'Manager' },
                { label: 'Content Moderator', value: 'Content Moderator' },
                { label: 'Customer Support', value: 'Customer Support' },
                { label: 'Finance Manager', value: 'Finance Manager' }
            ]
        },
        {
            key: 'isActive',
            label: 'Status',
            options: [
                { label: 'Active', value: 'true' },
                { label: 'Suspended', value: 'false' }
            ]
        }
    ];

    // Row actions
    const getActions = (admin: EnrichedSubAdmin) => {
        const actions = [];
        // Check if this row is the current user
        const isSelf = adminUser?.id === admin.id;

        // Edit permissions (not for SuperAdmin)
        if (admin.role !== 'SUPER_ADMIN') {
            actions.push({
                label: 'Manage Permissions',
                onClick: () => {
                    setSelectedAdmin(admin);
                    setShowPermissionsModal(true);
                },
                icon: <Key className="h-4 w-4 mr-2" />
            });


            // Delete (only if deletable)
            // Rename to Revoke Access potentially? Keeping Delete for now to match API.
            if (admin.isDeletable) {
                actions.push({
                    label: 'Revoke Admin',
                    onClick: () => {
                        setSelectedAdmin(admin);
                        setShowDeleteModal(true);
                    },
                    className: 'text-red-600',
                    icon: <Trash2 className="h-4 w-4 mr-2" />
                });
            }
        }

        return actions;
    };

    const handleDelete = async () => {
        if (!selectedAdmin) return;
        setIsSubmitting(true);

        try {
            const res = await fetch(`/api/admin/subadmins/${selectedAdmin.id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to revoke admin');
            }

            toast.success('Admin privileges revoked successfully');
            mutate();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Failed to revoke admin');
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false);
            setSelectedAdmin(null);
        }
    };

    const handleCreateSuccess = () => {
        setShowPromoteModal(false);
        mutate();
    };

    const handlePermissionsUpdate = () => {
        setShowPermissionsModal(false);
        setSelectedAdmin(null);
        mutate();
    };

    // Show loading or access denied
    if (isAuthChecking) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
        );
    }

    if (!isSuperAdmin) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <ShieldOff className="h-16 w-16 text-red-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-500">Only SuperAdmins can manage sub-admin accounts.</p>
            </div>
        );
    }

    // Safely get the array of sub-admins (handles error objects from API)
    const safeSubAdmins = Array.isArray(subAdmins) ? subAdmins : [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sub-Admin Management</h1>
                    <p className="text-gray-500 mt-1">Promote users to admin roles and manage their permissions</p>
                </div>
                <Button onClick={() => setShowPromoteModal(true)} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="h-4 w-4 mr-2" /> Promote User
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Total Admins</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {safeSubAdmins.length}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Super Admins</p>
                    <p className="text-2xl font-bold text-purple-600">
                        {safeSubAdmins.filter(a => a.role === 'SUPER_ADMIN').length}
                    </p>
                </div>
                <div className="rounded-xl border bg-white p-4">
                    <p className="text-sm text-gray-600">Active Staff</p>
                    <p className="text-2xl font-bold text-green-600">
                        {safeSubAdmins.filter(a => a.role !== 'SUPER_ADMIN' && a.isActive).length}
                    </p>
                </div>
            </div>

            {/* Data Table */}
            <DataTable
                data={enrichedAdmins}
                columns={columns}
                pageSize={10}
                isLoading={isLoading}
                searchable
                searchPlaceholder="Search admins..."
                searchKeys={['name', 'email', 'displayRole']}
                filterOptions={filterOptions}
                actions={getActions}
            />

            {/* Promote Modal */}
            <PromoteUserModal
                isOpen={showPromoteModal}
                onClose={() => setShowPromoteModal(false)}
                onSuccess={handleCreateSuccess}
            />

            {/* Edit Permissions Modal */}
            {selectedAdmin && (
                <EditPermissionsModal
                    isOpen={showPermissionsModal}
                    onClose={() => {
                        setShowPermissionsModal(false);
                        setSelectedAdmin(null);
                    }}
                    admin={selectedAdmin}
                    onSuccess={handlePermissionsUpdate}
                />
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedAdmin(null);
                }}
                onConfirm={handleDelete}
                title="Revoke Admin Access"
                message={`Are you sure you want to revoke admin privileges for ${selectedAdmin?.name || selectedAdmin?.email}? This will delete their account (User record).`}
                confirmText="Revoke & Delete"
                type="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
