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
import { createBrand, updateBrand, deleteBrand, toggleBrandStatus } from '@/app/admin/categories/actions';

export default function BrandsTable({ data, total, page }: any) {
    const [selected, setSelected] = useState<any>(null);
    const [showModal, setShowModal] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    const handleToggleStatus = async (brand: any) => {
        const res = await toggleBrandStatus(brand.id, !brand.isActive);
        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success(brand.isActive ? 'Brand suspended' : 'Brand activated');
            router.refresh();
        }
    };

    const handleDelete = async () => {
        if (!selected) return;
        setIsDeleting(true);
        try {
            const res = await deleteBrand(selected.id);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Brand deleted successfully');
                setShowDelete(false);
                setSelected(null);
                router.refresh();
            }
        } catch (error) {
            toast.error('Failed to delete brand');
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<any>[] = [
        {
            key: 'logo',
            header: 'Logo',
            render: (row) => (
                row.logo
                    ? <img src={row.logo} className="h-10 w-10 object-contain rounded-md border bg-white" alt={row.name} />
                    : <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-400">N/A</div>
            )
        },
        {
            key: 'name',
            header: 'Brand Name',
            render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>
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
            label: 'Edit Brand',
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
        { name: 'name', label: 'Brand Name', type: 'text' },
        { name: 'logo', label: 'Logo URL', type: 'text' },
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
                onRowClick={(row) => router.push(`/admin/categories/brands/${row.id}`)}
                toolbarActions={
                    <Button
                        onClick={() => { setSelected(null); setShowModal(true); }}
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Brand
                    </Button>
                }
            />

            {showModal && (
                <GenericAttributeModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={selected ? "Edit Brand" : "Add Brand"}
                    action={selected ? (d) => updateBrand(selected.id, d) : createBrand}
                    initialData={selected}
                    fields={fields as any}
                />
            )}

            <ConfirmDialog
                isOpen={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete Brand"
                message={`Are you sure you want to delete "${selected?.name}"?`}
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
