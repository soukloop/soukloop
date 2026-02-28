"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { approveSeller, rejectSeller } from "@/app/admin/sellers/actions";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function SellerApprovalActions({ verificationId }: { verificationId: string }) {
    const [isPending, startTransition] = useTransition();
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    const handleApprove = () => {
        startTransition(async () => {
            const res = await approveSeller(verificationId);
            if (res.success) toast.success("Seller approved!");
            else toast.error(res.error || "Failed to approve");
        });
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) return;

        startTransition(async () => {
            const res = await rejectSeller(verificationId, rejectionReason);
            if (res.success) {
                toast.success("Seller rejected!");
                setShowRejectModal(false);
                setRejectionReason("");
            } else {
                toast.error(res.error || "Failed to reject");
            }
        });
    };

    return (
        <>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRejectModal(true)}
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

            <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Seller Application</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason for rejection</Label>
                            <Textarea
                                id="reason"
                                placeholder="Please explain why the application is being rejected..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectModal(false);
                                setRejectionReason("");
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isPending || !rejectionReason.trim()}
                        >
                            {isPending ? 'Rejecting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
