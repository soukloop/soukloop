"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveSeller, rejectSeller } from "@/app/admin/sellers/actions";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export function SellerApprovalActions({ verificationId }: { verificationId: string }) {
    const [isPending, startTransition] = useTransition();

    const handleApprove = () => {
        startTransition(async () => {
            const res = await approveSeller(verificationId);
            if (res.success) toast.success("Seller approved!");
            else toast.error(res.error || "Failed to approve");
        });
    };

    const handleReject = () => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;
        startTransition(async () => {
            const res = await rejectSeller(verificationId, reason);
            if (res.success) toast.success("Seller rejected!");
            else toast.error(res.error || "Failed to reject");
        });
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleReject}
                disabled={isPending}
                className="h-8 text-red-600 border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm"
            >
                <X className="h-4 w-4 mr-1.5" />
                Reject
            </Button>
            <Button
                variant="default"
                size="sm"
                onClick={handleApprove}
                disabled={isPending}
                className="h-8 bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
                <Check className="h-4 w-4 mr-1.5" />
                Approve
            </Button>
        </div>
    );
}
