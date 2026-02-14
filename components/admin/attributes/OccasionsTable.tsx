
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Power, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DataTable, { FilterOption } from '@/components/admin/DataTable';
import ActionDropdown from '@/components/admin/ActionDropdown';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import {
    createOccasion,
    updateOccasion,
    deleteOccasion,
    toggleOccasionStatus
} from '@/lib/admin/occasions-actions';

interface Occasion {
    id: string;
    name: string;
    isActive: boolean;
    _count?: {
        products: number;
    };
}

interface OccasionsTableProps {
    data: Occasion[];
    total: number;
    page: number;
    pageSize: number;
}

export default function OccasionsTable({ data, total, page, pageSize }: OccasionsTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [selected, setSelected] = useState<Occasion | null>(null);
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenModal = (occasion?: Occasion) => {
        if (occasion) {
            setSelected(occasion);
            setName(occasion.name);
        } else {
            setSelected(null);
            setName('');
        }
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error('Please enter a name');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = selected
                ? await updateOccasion(selected.id, { name })
                : await createOccasion({ name });

            if (res.success) {
                toast.success(selected ? 'Occasion updated' : 'Occasion created');
                setShowModal(false);
                router.refresh();
            } else {
                toast.error(res.error || 'Something went wrong');
            }
        } catch (error) {
            toast.error('Failed to save');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setIsSubmitting(true);
        try {
            const res = await deleteOccasion(selected.id);
            if (res.success) {
                toast.success('Occasion deleted');
                setShowDelete(false);
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to delete');
            }
        } catch (error) {
            toast.error('Failed to delete');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (occasion: Occasion) => {
        try {
            const res = await toggleOccasionStatus(occasion.id, !occasion.isActive);
            if (res.success) {
                toast.success(occasion.isActive ? 'Occasion suspended' : 'Occasion activated');
                router.refresh();
            } else {
                toast.error(res.error || 'Failed to update status');
            }
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const columns = [
        {
            key: 'name',
            header: 'Occasion Name',
            render: (row: Occasion) => (
                <span className="font-medium text-gray-900">{row.name}</span>
            )
        },
        {
            key: 'products',
            header: 'Products',
            render: (row: Occasion) => (
                <span className="text-gray-600">{row._count?.products || 0} Products</span>
            )
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: Occasion) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                    {row.isActive ? 'Active' : 'Suspended'}
                </span>
            )
        }
    ];

    const getActions = (row: Occasion) => [
        {
            label: 'View Details',
            onClick: () => router.push(`/admin/categories/occasions/${row.id}`),
            icon: <Eye className="w-4 h-4" />
        },
        {
            label: 'Rename',
            onClick: () => handleOpenModal(row),
            icon: <Edit2 className="w-4 h-4" />
        },
        {
            label: row.isActive ? 'Suspend' : 'Activate',
            onClick: () => handleToggleStatus(row),
            icon: <Power className="w-4 h-4" />,
            className: row.isActive ? 'text-orange-600' : 'text-green-600'
        },
        {
            label: 'Delete',
            onClick: () => { setSelected(row); setShowDelete(true); },
            icon: <Trash2 className="w-4 h-4" />,
            className: 'text-red-600'
        }
    ];

    return (
        <div className="md:p-2">
            <DataTable
                data={data}
                columns={columns}
                rowCount={total}
                currentPage={page}
                pageSize={pageSize}
                searchable
                manualPagination
                actions={getActions}
                filterOptions={[
                    {
                        key: 'status',
                        label: 'Status',
                        options: [
                            { label: 'Active', value: 'active' },
                            { label: 'Suspended', value: 'inactive' },
                        ]
                    }
                ] as FilterOption<any>[]}
                initialFilters={{
                    status: searchParams?.get('status') || undefined
                }}
                onRowClick={(row) => router.push(`/admin/categories/occasions/${row.id}`)}
                toolbarActions={
                    <Button
                        onClick={() => handleOpenModal()}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Occasion
                    </Button>
                }
            />

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selected ? 'Edit Occasion' : 'Add New Occasion'}
            >
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Occasion Name</Label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Wedding"
                            className="rounded-xl"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowModal(false)} className="rounded-full">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-8"
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete Occasion"
                message={`Are you sure you want to delete "${selected?.name}"? This action cannot be undone.`}
                type="danger"
                isLoading={isSubmitting}
            />
        </div>
    );
}
