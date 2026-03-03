"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Ban, CheckCircle, Trash2, UserMinus, UserX } from "lucide-react";

interface ReportActionsProps {
    reportId: string;
    productId?: string | null;
    reportedUserId?: string | null;
    sellerId?: string | null;
    status: string;
}

export default function ReportActions({ reportId, productId, reportedUserId, status }: ReportActionsProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [modalType, setModalType] = useState<"dismiss" | "suspend-user" | "suspend-product" | "delete-product" | null>(null);

    const handleAction = async (actionType: string) => {
        setIsLoading(true);
        try {
            let res;
            if (actionType === "dismiss" || actionType === "reviewed") {
                res = await fetch("/api/admin", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "report",
                        reportId,
                        action: actionType === "dismiss" ? "dismiss" : "takeAction",
                    }),
                });
            } else if (actionType === "suspend-user" && reportedUserId) {
                res = await fetch("/api/admin", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "user",
                        userId: reportedUserId,
                        action: "suspend",
                    }),
                });
            } else if (actionType === "suspend-product" && productId) {
                res = await fetch("/api/admin", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        type: "product",
                        productId,
                        action: "reject",
                        reason: "Reported by community and reviewed by admin",
                    }),
                });
            }

            if (res && res.ok) {
                toast.success(`Action ${actionType} completed successfully`);
                router.refresh();
                if (actionType === "dismiss" || actionType === "reviewed") {
                    // Stay or go back?
                }
            } else {
                const data = await res?.json();
                toast.error(data?.error || `Failed to perform ${actionType}`);
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred");
        } finally {
            setIsLoading(false);
            setModalType(null);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-gray-900 px-1">Management Actions</h3>

            <div className="grid gap-2">
                {status.toLowerCase() === "pending" && (
                    <Button
                        onClick={() => handleAction("reviewed")}
                        className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                        disabled={isLoading}
                    >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Reviewed
                    </Button>
                )}

                {reportedUserId && (
                    <Button
                        variant="destructive"
                        onClick={() => setModalType("suspend-user")}
                        className="w-full justify-start"
                        disabled={isLoading}
                    >
                        <UserMinus className="mr-2 h-4 w-4" />
                        Suspend User
                    </Button>
                )}

                {productId && (
                    <>
                        <Button
                            variant="destructive"
                            onClick={() => setModalType("suspend-product")}
                            className="w-full justify-start"
                            disabled={isLoading}
                        >
                            <Ban className="mr-2 h-4 w-4" />
                            Suspend Product
                        </Button>
                    </>
                )}

                <Button
                    variant="outline"
                    onClick={() => setModalType("dismiss")}
                    className="w-full justify-start text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                    disabled={isLoading}
                >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Dismiss Report
                </Button>
            </div>

            <ConfirmDialog
                isOpen={modalType === "dismiss"}
                onClose={() => setModalType(null)}
                onConfirm={() => handleAction("dismiss")}
                title="Dismiss Report"
                message="Are you sure you want to dismiss this report? It will be marked as resolved."
                type="success"
                isLoading={isLoading}
            />

            <ConfirmDialog
                isOpen={modalType === "suspend-user"}
                onClose={() => setModalType(null)}
                onConfirm={() => handleAction("suspend-user")}
                title="Suspend User"
                message="Are you sure you want to suspend this user? They will not be able to log in."
                type="danger"
                isLoading={isLoading}
            />

            <ConfirmDialog
                isOpen={modalType === "suspend-product"}
                onClose={() => setModalType(null)}
                onConfirm={() => handleAction("suspend-product")}
                title="Suspend Product"
                message="Are you sure you want to suspend this product? It will be hidden from the store."
                type="danger"
                isLoading={isLoading}
            />
        </div>
    );
}
