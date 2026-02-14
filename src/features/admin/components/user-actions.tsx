"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CheckCircle, Ban, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { suspendUser, activateUser, deleteUser } from "../actions";
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface UserActionsProps {
    userId: string;
    isActive: boolean;
}

export default function UserActions({ userId, isActive }: UserActionsProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleToggleStatus = async () => {
        startTransition(async () => {
            try {
                const res = isActive
                    ? await suspendUser(userId)
                    : await activateUser(userId);

                if (!res.success) {
                    throw new Error(res.error || "Failed to update user status");
                }

                toast.success(res.message);
                router.refresh();
            } catch (error: any) {
                toast.error(error.message || "Something went wrong");
            }
        });
    };

    const handleDelete = async () => {
        startTransition(async () => {
            try {
                const res = await deleteUser(userId);

                if (!res.success) {
                    throw new Error(res.error || "Failed to delete user");
                }

                toast.success(res.message);
                router.push("/admin/users");
            } catch (error: any) {
                toast.error(error.message || "Something went wrong");
            } finally {
                setShowDeleteModal(false);
            }
        });
    };

    return (
        <>
            <div className="flex items-center gap-2 pb-1">
                {isActive ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={isPending}
                        className="h-8 text-red-600 border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm"
                    >
                        <Ban className="h-3.5 w-3.5 mr-1.5" />
                        {isPending ? "Updating..." : "Suspend"}
                    </Button>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleToggleStatus}
                        disabled={isPending}
                        className="h-8 text-green-600 border-green-200 bg-green-50/50 hover:bg-green-50 hover:text-green-700 hover:border-green-300 shadow-sm"
                    >
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        {isPending ? "Updating..." : "Activate"}
                    </Button>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={isPending}
                            className="h-8 w-8 border-slate-200 hover:bg-slate-50 shadow-sm"
                        >
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                type="danger"
                isLoading={isPending}
            />
        </>
    );
}
