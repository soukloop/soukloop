'use client';

import { useState } from 'react';
import DataTable, { Column, FilterOption } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from 'lucide-react';
import GenericAttributeModal from './GenericAttributeModal';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { createColor, updateColor, deleteColor, toggleColorStatus } from '@/app/admin/categories/actions';

export default function ColorsTable({ data, total, page }: any) {
    const [selected, setSelected] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleToggleStatus = async (color: any) => {
        const res = await toggleColorStatus(color.id, !color.isActive);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(color.isActive ? 'Color suspended' : 'Color activated');
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setIsDeleting(true);
        try {
            const res = await deleteColor(selected.id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Color deleted');
                setShowDelete(false);
                router.refresh();
            }
        } catch (error) {
            toast.error('Failed to delete color');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'preview',
            header: 'Preview',
            render: (row) => (
                <div className="h-6 w-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: row.hexCode }}></div>
            )
        },
        {
            key: 'name',
            header: 'Color Name',
            render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>
        },
        {
            key: 'hexCode',
            header: 'Hex Code',
            className: 'hidden sm:table-cell',
            render: (row) => <span className="text-gray-500 font-mono text-xs">{row.hexCode}</span>
        },
        {
            key: 'status',
            header: 'Status',
            render: (row) => (
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.isActive
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}>
                    {row.isActive ? 'Active' : 'Suspended'}
                </span>
            )
        },
        {
            key: 'products',
            header: 'Products',
            render: (row) => <span className="font-medium text-gray-600">{row._count?.products || 0}</span>
        }
    ];

    const getActions = (row: any) => [
        {
            label: 'Edit Color',
            onClick: () => { setSelected(row); setShowModal(true); },
            className: 'text-gray-700'
        },
        {
            label: row.isActive ? 'Suspend' : 'Activate',
            onClick: () => handleToggleStatus(row),
            className: row.isActive ? 'text-orange-600' : 'text-green-600'
        },
        {
            label: 'Delete',
            onClick: () => { setSelected(row); setShowDelete(true); },
            className: 'text-red-600'
        }
    ];

    const filterOptions: FilterOption<any>[] = [
        {
            key: 'status',
            label: 'Status',
            options: [
                { label: 'Active', value: 'active' },
                { label: 'Suspended', value: 'inactive' },
            ]
        }
    ];

    const fields = [
        { name: 'name', label: 'Color Name', type: 'text' },
        { name: 'hexCode', label: 'Color Picker', type: 'color' }
    ];

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
                onRowClick={(row) => router.push(`/admin/categories/colors/${row.id}`)}
                toolbarActions={
                    <Button
                        onClick={() => { setSelected(null); setShowModal(true); }}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Color
                    </Button>
                }
            />

            {showModal && (
                <GenericAttributeModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={selected ? "Edit Color" : "Add Color"}
                    action={selected ? (d) => updateColor(selected.id, d) : createColor}
                    initialData={selected}
                    fields={fields as any}
                />
            )}

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete Color"
                message={`Are you sure you want to delete "${selected?.name}"?`}
                type="danger"
                isLoading={isDeleting} // Ensure isDeleting is available or use strict false if not
            />
        </div>
    );
}
