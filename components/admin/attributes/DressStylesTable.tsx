'use client';

import { useState } from 'react';
import DataTable, { Column } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { createDressStyle, updateDressStyle, deleteDressStyle, suspendDressStyle } from '@/app/admin/categories/actions';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from '@/components/ui/input';

// Requires Category list to be passed down for dropdown
export default function DressStylesTable({ data, total, page, categoriesList = [] }: any) {
    const [selected, setSelected] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [formData, setFormData] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleToggleStatus = async (row: any) => {
        const res = await suspendDressStyle(row.id, row.status === 'suspended' ? 'activate' : 'suspend');
        if (res && res.success) {
            toast.success(row.status === 'suspended' ? 'Style activated' : 'Style suspended');
            router.refresh();
        } else {
            toast.error('Failed to update status');
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>
        },
        {
            key: 'category',
            header: 'Category',
            className: 'hidden sm:table-cell',
            render: (row) => (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {row.category?.name || row.categoryType || 'Uncategorized'}
                </span>
            )
        },
        {
            key: 'products',
            header: 'Products',
            render: (row) => <span className="font-medium text-gray-600">{row._count?.products || 0}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${row.status === 'approved' ? 'bg-green-50 text-green-700' :
                    row.status === 'suspended' ? 'bg-red-50 text-red-700' :
                        'bg-yellow-50 text-yellow-700'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    const handleApprove = async (row: any) => {
        const res = await updateDressStyle(row.id, {
            name: row.name,
            categoryId: row.categoryId,
            status: 'approved'
        });

        if (res && res.success) {
            toast.success('Style approved successfully');
            router.refresh();
        } else {
            toast.error(res.error || 'Failed to approve style');
        }
    };

    const getActions = (row: any) => {
        const actions = [];

        if (row.status === 'pending') {
            actions.push({
                label: 'Approve',
                onClick: () => handleApprove(row),
                className: 'text-green-600 font-medium'
            });
            actions.push({
                label: 'Reject',
                onClick: () => { setSelected(row); setShowDelete(true); },
                className: 'text-red-600 font-medium'
            });
        }

        actions.push({
            label: 'Edit Style',
            onClick: () => { setSelected(row); setFormData({ ...row, categoryId: row.categoryId || row.category?.id }); setShowModal(true); },
            className: 'text-gray-700'
        });

        if (row.status !== 'pending') {
            actions.push({
                label: row.status === 'suspended' ? 'Activate' : 'Suspend',
                onClick: () => handleToggleStatus(row),
                className: row.status === 'suspended' ? 'text-green-600' : 'text-orange-600'
            });
        }

        // Always allow delete
        if (row.status !== 'pending') { // Avoid duplicate delete button for pending
            actions.push({
                label: 'Delete',
                onClick: () => { setSelected(row); setShowDelete(true); },
                className: 'text-red-600'
            });
        }

        return actions;
    };

    const filterOptions: FilterOption<any>[] = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Approved', value: 'approved' },
                { label: 'Pending', value: 'pending' },
                { label: 'Suspended', value: 'suspended' },
            ]
        },
        {
            key: 'categoryId',
            label: 'Category',
            options: categoriesList.map((c: any) => ({ label: c.name, value: c.id }))
        }
    ];

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (!formData.name?.trim()) {
                toast.error('Name is required');
                return;
            }
            if (!formData.categoryId) {
                toast.error('Category is required');
                return;
            }

            const payload = {
                name: formData.name,
                categoryId: formData.categoryId,
                status: formData.status || 'approved'
            };

            const res = selected
                ? await updateDressStyle(selected.id, payload)
                : await createDressStyle(payload);

            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Saved successfully');
                router.refresh();
                setShowModal(false);
            }
        } catch (e) {
            toast.error('Error saving');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="md:p-2">
            <DataTable
                data={data}
                columns={columns}
                rowCount={total}
                currentPage={page}
                pageSize={10}
                searchable
                manualPagination
                actions={getActions}
                filterOptions={filterOptions}
                initialFilters={{
                    status: searchParams?.get('status') || undefined
                }}
                onRowClick={(row) => router.push(`/admin/categories/dress-styles/${row.id}`)}
                toolbarActions={
                    <Button
                        onClick={() => { setSelected(null); setFormData({}); setShowModal(true); }}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Style
                    </Button>
                }
            />

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selected ? "Edit Dress Style" : "Add Dress Style"}>
                <div className="space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Name</label>
                        <Input
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. A-Line, Midi"
                            className="rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <Select
                            value={formData.categoryId || ''}
                            onValueChange={val => setFormData({ ...formData, categoryId: val })}
                        >
                            <SelectTrigger className="w-full rounded-xl">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categoriesList.map((cat: any) => (
                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSubmitting} className="rounded-full">Cancel</Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formData.categoryId || !formData.name}
                            className={`text-white rounded-full transition-colors ${(!formData.categoryId || !formData.name) ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'bg-orange-500 hover:bg-orange-600'}`}
                        >
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </div>
            </Modal>

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={async () => {
                    await deleteDressStyle(selected.id);
                    setShowDelete(false);
                    router.refresh();
                }}
                title="Delete Style"
                message={`Are you sure you want to delete "${selected?.name}"?`}
                type="danger"
            />
        </div>
    );
}
