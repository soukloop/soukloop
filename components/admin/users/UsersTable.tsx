/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from 'next/image';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import EditUserModal from '@/components/admin/EditUserModal';
import { User } from '@/lib/admin/types';
import { X } from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { suspendUser, activateUser, deleteUser } from '@/src/features/admin/actions';
import { toast } from 'sonner';
import RoleBadge from '@/components/admin/RoleBadge';
import { CopyButton } from "@/components/ui/copy-button";

interface UsersTableProps {
    initialUsers: any[]; // Using any to match service output for now, strict typing later
    totalRecords: number;
    initialPage: number;
}

export default function UsersTable({ initialUsers, totalRecords, initialPage }: UsersTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hasPermission } = useAdminAuth();

    // Local State for Modals
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<any | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // URL State Helpers
    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set('page', page.toString());
        router.push(`?${params.toString()}`);
    };

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        if (term) {
            params.set('search', term);
        } else {
            params.delete('search');
        }
        params.set('page', '1'); // Reset to page 1 on search
        router.push(`?${params.toString()}`);
    };

    // Navigation Helper
    const handleRowClick = (user: any) => {
        router.push(`/admin/users/${user.id}`);
    };

    // Table Config
    const columns: Column<any>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (user) => (
                <div className="flex items-center gap-3">
                    <Link href={`/admin/users/${user.id}`} className="block shrink-0" onClick={(e) => e.stopPropagation()}>
                        <div className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 relative">
                            {user.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.name}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                />
                            ) : (
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            )}
                        </div>
                    </Link>
                    <div>
                        <div className="flex items-center gap-1.5 min-w-0">
                            <Link href={`/admin/users/${user.id}`} className="font-medium text-gray-900 truncate max-w-[120px] sm:max-w-xs block hover:text-orange-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                                {user.name}
                            </Link>
                        </div>
                        {/* Copyable ID for convenience */}
                        <CopyButton
                            value={user.id}
                            displayText={`ID: ${user.id.slice(0, 8)}...`}
                            className="text-xs text-gray-400"
                        />
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            header: 'Email',
            className: 'hidden sm:table-cell',
            render: (user) => (
                <CopyButton
                    value={user.email}
                    displayText={user.email}
                    className="text-gray-600 truncate max-w-[150px]"
                />
            ),
        },
        {
            key: 'role',
            header: 'Role',
            render: (user) => <RoleBadge role={user.role} />,
        },
        {
            key: 'lastActive',
            header: 'Last Active',
            className: 'hidden md:table-cell',
            render: (user) => <span className="text-gray-600">{user.lastActive}</span>,
        },
        {
            key: 'status',
            header: 'Status',
            render: (user) => <StatusBadge status={user.status} type="user" />,
        },
    ];

    const filterOptions: FilterOption<any>[] = [
        {
            key: 'role',
            label: 'Role',
            options: [
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Seller', value: 'SELLER' },
                { label: 'User', value: 'USER' },
            ]
        },
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Active', value: 'Active' },
                { label: 'Suspended', value: 'Suspended' },
            ]
        }
    ];

    const getActions = (user: any) => {
        const actions = [];
        // View Profile
        actions.push({
            label: 'View Profile',
            href: `/admin/users/${user.id}`,
        });

        // Suspend
        if (hasPermission('users', 'suspend')) {
            actions.push({
                label: user.status === 'Suspended' ? 'Activate' : 'Suspend',
                onClick: () => {
                    setUserToSuspend(user);
                    setShowSuspendModal(true);
                },
                className: user.status === 'Suspended' ? 'text-green-600' : 'text-red-600',
            });
        }
        // Delete
        if (hasPermission('users', 'delete') && user.isDeletable !== false) {
            actions.push({
                label: 'Delete',
                onClick: () => {
                    setUserToDelete(user);
                    setShowDeleteModal(true);
                },
                className: 'text-red-600',
            });
        }
        return actions;
    };

    // ============= ACTION HANDLERS =============

    const handleSuspendConfirm = async () => {
        if (!userToSuspend) return;
        setIsSubmitting(true);
        try {
            const isSuspended = userToSuspend.status === 'Suspended';
            const res = isSuspended
                ? await activateUser(userToSuspend.id)
                : await suspendUser(userToSuspend.id);

            if (!res.success) throw new Error(res.error || 'Failed to update user status');

            toast.success(res.message);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
            setShowSuspendModal(false);
            setUserToSuspend(null);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        setIsSubmitting(true);
        try {
            const res = await deleteUser(userToDelete.id);
            if (!res.success) throw new Error(res.error || 'Failed to delete user');

            toast.success(res.message);
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setIsSubmitting(false);
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };

    return (
        <>
            <DataTable
                data={initialUsers}
                columns={columns}
                pageSize={10} // Display purposes only
                rowCount={totalRecords}
                manualPagination={true}
                currentPage={initialPage}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                filterOptions={filterOptions}
                searchable={true}
                actions={getActions}
                onRowClick={handleRowClick}
                initialFilters={{
                    role: searchParams?.get('role') || undefined,
                    status: searchParams?.get('status') || undefined,
                }}
            />

            {/* Modals */}
            <ConfirmDialog
                isOpen={showSuspendModal}
                onClose={() => setShowSuspendModal(false)}
                onConfirm={handleSuspendConfirm}
                title={userToSuspend?.status === 'Suspended' ? 'Activate User' : 'Suspend User'}
                message={`Are you sure you want to ${userToSuspend?.status === 'Suspended' ? 'activate' : 'suspend'} this user?`}
                type={userToSuspend?.status === 'Suspended' ? 'info' : 'danger'}
                isLoading={isSubmitting}
            />

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete User"
                message={`Are you sure you want to delete ${userToDelete?.name}?`}
                type="danger"
                isLoading={isSubmitting}
            />
        </>
    );
}
