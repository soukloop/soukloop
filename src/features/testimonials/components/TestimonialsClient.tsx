"use client";

import { useState, useCallback } from "react";
import { Plus, Edit3, Trash2, Star, Image as ImageIcon, Search } from "lucide-react";
import DataTable, { Column } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { TestimonialModal } from "./TestimonialModal";
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { deleteTestimonial } from "../actions";
import StatusBadge from "@/components/admin/StatusBadge";
import { ActionItem } from "@/components/admin/ActionDropdown";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
// @ts-ignore
import { debounce } from "lodash";

interface TestimonialsClientProps {
    initialTestimonials: any[];
    total: number;
    currentPage: number;
    totalPages: number;
}

export function TestimonialsClient({
    initialTestimonials,
    total,
    currentPage,
    totalPages,
}: TestimonialsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTestimonial, setSelectedTestimonial] = useState<any | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Search handling
    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams?.toString() || '');
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    /* eslint-disable react-hooks/exhaustive-deps */
    const handleSearch = useCallback(
        debounce((term: string) => {
            router.push(pathname + "?" + createQueryString("search", term));
        }, 500),
        [pathname, createQueryString, router]
    );
    /* eslint-enable react-hooks/exhaustive-deps */

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams?.toString() || '');
        params.set("page", newPage.toString());
        router.push(pathname + "?" + params.toString());
    };

    const columns: Column<any>[] = [
        {
            key: "profileImage",
            header: "User",
            render: (t) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 relative shrink-0 rounded-full overflow-hidden bg-gray-100 border border-gray-200 aspect-square">
                        {t.profileImage ? (
                            <img src={t.profileImage} alt={t.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full w-full text-gray-400">
                                <ImageIcon size={20} />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-500">{t.location || "No location"}</div>
                    </div>
                </div>
            ),
        },
        {
            key: "rating",
            header: "Rating",
            render: (t) => (
                <div className="flex items-center text-yellow-500">
                    <span className="font-bold mr-1">{t.rating}</span>{" "}
                    <Star size={14} fill="currentColor" />
                </div>
            ),
        },
        {
            key: "text",
            header: "Review",
            render: (t) => (
                <p className="text-sm text-gray-600 max-w-md truncate" title={t.text}>
                    {t.text}
                </p>
            ),
        },
        {
            key: "product",
            header: "Product Link",
            render: (t) => t.product ? (
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600 truncate max-w-[150px] inline-block">
                    {t.product.name}
                </span>
            ) : (
                <span className="text-xs text-gray-400 italic">None</span>
            )
        },
        {
            key: "isActive",
            header: "Status",
            render: (t) => <StatusBadge status={t.isActive ? "Active" : "Inactive"} />,
        },
    ];

    const getActions = (testimonial: any): ActionItem[] => [
        {
            label: "Edit",
            icon: <Edit3 className="w-4 h-4" />,
            onClick: () => {
                setSelectedTestimonial(testimonial);
                setShowModal(true);
            },
        },
        {
            label: "Delete",
            icon: <Trash2 className="w-4 h-4" />,
            onClick: () => {
                setSelectedTestimonial(testimonial);
                setShowDeleteModal(true);
            },
            className: "text-rose-600 hover:bg-rose-50",
        },
    ];

    const handleDelete = async () => {
        if (!selectedTestimonial) return;
        setIsDeleting(true);
        try {
            const res = await deleteTestimonial(selectedTestimonial.id);
            if (res.success) {
                toast.success("Testimonial deleted");
                setShowDeleteModal(false);
                router.refresh();
            } else {
                toast.error("Failed to delete");
            }
        } catch (e) {
            toast.error("Error deleting testimonial");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Testimonials</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col">
                {/* Header Row: Search + Add Button */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search testimonials..."
                            className="pl-9 bg-gray-50 border-gray-200 focus-visible:ring-offset-0"
                            defaultValue={searchParams?.get('search') || ""}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <Button
                        onClick={() => {
                            setSelectedTestimonial(null);
                            setShowModal(true);
                        }}
                        className="bg-[#E87A3F] rounded-full px-6 shadow-sm hover:bg-[#d6692f] whitespace-nowrap"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                    </Button>
                </div>

                <DataTable
                    data={initialTestimonials}
                    columns={columns}
                    actions={getActions}
                    searchable={false} // We are handling search externally now
                />

                {/* Pagination Controls */}
                <div className="border-t border-gray-100 p-4 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Page {currentPage} of {totalPages || 1}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage <= 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage >= totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>

            <TestimonialModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                testimonial={selectedTestimonial}
            />

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Testimonial"
                message="Are you sure you want to delete this testimonial? This action cannot be undone."
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
