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
import { createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '@/app/admin/categories/actions';

export default function CategoriesTable({ data, total, page }: any) {
    const [selected, setSelected] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleToggleStatus = async (category: any) => {
        const newStatus = category.status === 'Active' ? 'Inactive' : 'Active';
        const res = await toggleCategoryStatus(category.id, newStatus);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(category.status === 'Active' ? 'Category suspended' : 'Category activated');
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        const res = await deleteCategory(selected.id);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Category deleted');
            setShowDelete(false);
            router.refresh();
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'name',
            header: 'Name',
            render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>
        },
        {
            key: 'description',
            header: 'Description',
            className: 'hidden md:table-cell',
            render: (row) => <span className="text-gray-500 line-clamp-1">{row.description || '-'}</span>
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
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.status === 'Active'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}>
                    {row.status}
                </span>
            )
        }
    ];

    const getActions = (row: any) => [
        {
            label: 'Edit Category',
            onClick: () => { setSelected(row); setShowModal(true); },
            className: 'text-gray-700'
        },
        {
            label: row.status === 'Active' ? 'Suspend' : 'Activate',
            onClick: () => handleToggleStatus(row),
            className: row.status === 'Active' ? 'text-orange-600' : 'text-green-600'
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
                { label: 'Active', value: 'Active' },
                { label: 'Inactive', value: 'Inactive' },
            ]
        }
    ];

    const fields = [
        { name: 'name', label: 'Category Name', type: 'text' },
        { name: 'description', label: 'Description', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
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
                onRowClick={(row) => router.push(`/admin/categories/${row.id}`)}
                toolbarActions={
                    <Button
                        onClick={() => { setSelected(null); setShowModal(true); }}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                }
            />

            {showModal && (
                <GenericAttributeModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={selected ? "Edit Category" : "Add Category"}
                    action={selected
                        ? (d) => updateCategory(selected.id, d)
                        : (d) => createCategory({ ...d, status: d.status || 'Active' })
                    }
                    initialData={selected}
                    fields={fields as any}
                />
            )}

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete Category"
                message={`Are you sure you want to delete "${selected?.name}"?`}
                type="danger"
                isLoading={false}
            />
        </div>
    );
}
