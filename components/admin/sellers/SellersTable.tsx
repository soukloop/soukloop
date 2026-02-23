'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import Image from 'next/image';
import { Store, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { approveSeller, rejectSeller } from '@/app/admin/sellers/actions';
import { suspendUser, activateUser, deleteUser } from '@/src/features/admin/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { CopyButton } from "@/components/ui/copy-button";
import { useAdminAuth } from '@/hooks/useAdminAuth';

type Seller = {
    id: string; // User ID
    dbId: string; // DB ID (Vendor or Verification)
    name: string;
    email: string;
    storeName: string;
    productsCount: number;
    status: string;
    joinedDate: string;
    avatar: string | null;
    isApplicant: boolean;
    isDeletable?: boolean;
};

type SellersTableProps = {
    initialSellers: Seller[];
    totalRecords: number;
    initialPage: number;
};

export default function SellersTable({
    initialSellers,
    totalRecords,
    initialPage
}: SellersTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { hasPermission } = useAdminAuth();

    // Local State
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    // Shared Modal State
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [userToSuspend, setUserToSuspend] = useState<Seller | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<Seller | null>(null);

    const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- URL Helpers ---
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
        params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    const handleRowClick = (seller: Seller) => {
        router.push(`/admin/users/${seller.id}`);
    };

    // --- Actions ---
    const onApprove = async (seller: Seller) => {
        try {
            const res = await approveSeller(seller.dbId);
            if (res.success) {
                toast.success('Seller approved successfully');
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to approve');
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const onReject = async () => {
        if (!selectedSeller) return;
        setIsSubmitting(true);
        try {
            const res = await rejectSeller(selectedSeller.dbId, rejectionReason);
            if (res.success) {
                toast.success('Seller rejected');
                setShowRejectModal(false);
                setRejectionReason('');
                setSelectedSeller(null);
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to reject');
            }
        } catch (error) {
            toast.error('An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSuspendConfirm = async () => {
        if (!userToSuspend) return;
        setIsSubmitting(true);
        try {
            const isSuspended = userToSuspend.status === 'SUSPENDED' || userToSuspend.status === 'Suspended';
            const res = isSuspended
                ? await activateUser(userToSuspend.id)
                : await suspendUser(userToSuspend.id);

            if (!res.success) throw new Error(res.error || 'Failed to update seller status');

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
            if (!res.success) throw new Error(res.error || 'Failed to delete seller');

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

    // --- Columns Configuration ---
    const columns: Column<Seller>[] = [
        {
            key: 'name',
            header: 'Seller',
            render: (seller) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200 relative">
                        {seller.avatar ? (
                            <Image
                                src={seller.avatar}
                                alt={seller.name}
                                fill
                                className="object-cover"
                                sizes="40px"
                            />
                        ) : (
                            <span className="text-gray-400 font-medium text-xs">
                                {seller.name.charAt(0)}
                            </span>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900 hover:text-orange-600 transition-colors">
                            {seller.name}
                        </div>
                        <CopyButton
                            value={seller.email}
                            displayText={seller.email}
                            className="text-xs text-gray-500"
                        />
                    </div>
                </div>
            ),
        },
        {
            key: 'productsCount',
            header: 'Products',
            render: (seller) => (
                <span className="text-sm font-medium text-gray-900">
                    {seller.productsCount || 0}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (seller) => <StatusBadge status={seller.status} type="user" />,
        },
        {
            key: 'joinedDate',
            header: 'Joined',
            className: 'hidden md:table-cell',
            render: (seller) => (
                <span className="text-gray-600 text-sm">
                    {new Date(seller.joinedDate).toLocaleDateString('en-US')}
                </span>
            ),
        },
    ];

    const filterOptions: FilterOption<Seller>[] = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Suspended', value: 'SUSPENDED' },
            ]
        }
    ];

    const getActions = (seller: Seller) => {
        const actions = [];

        // View Details
        actions.push({
            label: 'View Details',
            href: `/admin/users/${seller.id}`,
        });

        // Approve/Reject
        if (seller.status === 'Pending' || seller.status === 'PENDING') {
            actions.push({
                label: 'Approve Application',
                onClick: () => onApprove(seller),
                className: 'text-green-600 focus:text-green-700 focus:bg-green-50',
            });
            actions.push({
                label: 'Reject Application',
                onClick: () => {
                    setSelectedSeller(seller);
                    setShowRejectModal(true);
                },
                className: 'text-red-600 focus:text-red-700 focus:bg-red-50',
            });
        }

        // Suspend/Activate
        if (hasPermission('users', 'suspend')) {
            const isSuspended = seller.status === 'SUSPENDED' || seller.status === 'Suspended';
            actions.push({
                label: isSuspended ? 'Activate' : 'Suspend',
                onClick: () => {
                    setUserToSuspend(seller);
                    setShowSuspendModal(true);
                },
                className: isSuspended ? 'text-green-600' : 'text-red-600',
            });
        }

        // Delete
        if (hasPermission('users', 'delete')) {
            actions.push({
                label: 'Delete',
                onClick: () => {
                    setUserToDelete(seller);
                    setShowDeleteModal(true);
                },
                className: 'text-red-600',
            });
        }

        return actions;
    };

    return (
        <>
            <DataTable
                data={initialSellers}
                columns={columns}
                pageSize={10}
                rowCount={totalRecords}
                manualPagination={true}
                currentPage={initialPage}
                onPageChange={handlePageChange}
                onSearch={handleSearch}
                filterOptions={filterOptions}
                searchable={true}
                searchPlaceholder="Search sellers or stores..."
                actions={getActions}
                onRowClick={handleRowClick}
                initialFilters={{
                    status: searchParams?.get('status') || undefined,
                }}
            />

            {/* Reject Modal */}
            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Seller Application</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason for rejection</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please explain why the application is being rejected..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            onClick={onReject}
                            disabled={isSubmitting || !rejectionReason.trim()}
                        >
                            {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Suspend/Activate Modal */}
            <ConfirmDialog
                isOpen={showSuspendModal}
                onClose={() => setShowSuspendModal(false)}
                onConfirm={handleSuspendConfirm}
                title={userToSuspend?.status === 'SUSPENDED' || userToSuspend?.status === 'Suspended' ? 'Activate Seller' : 'Suspend Seller'}
                message={`Are you sure you want to ${userToSuspend?.status === 'SUSPENDED' || userToSuspend?.status === 'Suspended' ? 'activate' : 'suspend'} this seller?`}
                type={userToSuspend?.status === 'SUSPENDED' || userToSuspend?.status === 'Suspended' ? 'success' : 'danger'}
                isLoading={isSubmitting}
            />

            {/* Delete Modal */}
            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                title="Delete Seller"
                message={`Are you sure you want to delete ${userToDelete?.name}? This action cannot be undone.`}
                type="danger"
                isLoading={isSubmitting}
            />
        </>
    );
}
