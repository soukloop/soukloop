"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Trash2, Edit3, Rocket, Clock, Ban } from "lucide-react";
import DataTable, { Column } from "@/components/admin/DataTable";
import { ActionItem } from "@/components/admin/ActionDropdown";
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Button } from "@/components/ui/button";
import { Banner } from "@prisma/client";
import { deleteBanner } from "../actions";
import { BannerModal } from "./BannerModal";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface PromotionsClientProps {
    initialBanners: Banner[];
}

export function PromotionsClient({ initialBanners }: PromotionsClientProps) {
    const router = useRouter();
    const [banners, setBanners] = useState<Banner[]>(initialBanners);
    const [showBannerModal, setShowBannerModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const columns: Column<Banner>[] = [
        {
            key: "title",
            header: "Banner",
            render: (banner) => (
                <div className="flex items-center gap-4 py-2">
                    <div className="group relative h-14 w-24 rounded-xl bg-gray-100 overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
                        <img
                            src={banner.imageUrl}
                            alt={banner.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/placeholder.png";
                            }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <p className="font-bold text-gray-900 leading-tight">{banner.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-[220px]">
                            {banner.description}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "startDate",
            header: "Duration",
            render: (banner) => (
                <div className="flex flex-col text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span>{new Date(banner.startDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <div className="w-3 h-px bg-gray-200 ml-1.5" />
                        <span>{new Date(banner.endDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "isActive",
            header: "Visibility",
            render: (banner) => {
                const isActive = banner.isActive;
                const now = new Date();
                const start = new Date(banner.startDate);
                const end = new Date(banner.endDate);
                const isScheduled = now < start;
                const isExpired = now > end;

                return (
                    <div className="flex flex-col gap-1">
                        <span
                            className={`inline-flex items-center w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                                }`}
                        >
                            {isActive ? "Published" : "Draft"}
                        </span>
                        {isActive && (
                            <span className="text-[10px] text-gray-400 font-medium italic">
                                {isExpired ? "Expired" : isScheduled ? "Upcoming" : "Live now"}
                            </span>
                        )}
                    </div>
                );
            },
        },
    ];

    const getActions = (banner: Banner): ActionItem[] => [
        {
            label: "Edit",
            onClick: () => {
                setSelectedBanner(banner);
                setShowBannerModal(true);
            },
        },
        {
            label: "Delete",
            onClick: () => {
                setSelectedBanner(banner);
                setShowDeleteModal(true);
            },
            className: "text-rose-600 hover:bg-rose-50",
        },
    ];

    const handleDelete = async () => {
        if (!selectedBanner) return;
        setIsDeleting(true);
        try {
            const res = await deleteBanner(selectedBanner.id);
            if (res.success) {
                toast.success("Banner removed successfully");
                setBanners((prev) => prev.filter((b) => b.id !== selectedBanner.id));
                setShowDeleteModal(false);
            } else {
                toast.error(res.error || "Failed to remove banner");
            }
        } catch (error) {
            toast.error("Operation failed");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Banners <span className="text-gray-500 font-normal">[{banners.length}]</span>
                </h1>
            </div>

            <div className="rounded-xl border border-gray-100 bg-white p-2 shadow-sm">
                <DataTable
                    data={banners}
                    columns={columns}
                    pageSize={10}
                    searchable
                    searchPlaceholder="Search campaigns..."
                    searchKeys={["title", "description"]}
                    actions={getActions}
                    toolbarActions={
                        <Button
                            onClick={() => {
                                setSelectedBanner(null);
                                setShowBannerModal(true);
                            }}
                            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white px-6 h-10 shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Create Banner
                        </Button>
                    }
                />
            </div>

            <BannerModal
                isOpen={showBannerModal}
                onClose={() => {
                    setShowBannerModal(false);
                    router.refresh();
                }}
                banner={selectedBanner}
            />

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedBanner(null);
                }}
                onConfirm={handleDelete}
                title="Delete Banner"
                message="Are you sure you want to delete this banner?"
                confirmText="Remove Now"
                type="danger"
                isLoading={isDeleting}
            />
        </div>
    );
}
