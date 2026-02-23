"use client";

import { useState } from "react";
import { X, AlertTriangle, Loader2, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import SearchableDropdown from "@/app/seller/components/searchable-dropdown";

interface UserReportModalProps {
    reportedUserId: string;
    reportedUserName: string;
    isOpen: boolean;
    onClose: () => void;
}

const REPORT_REASONS = [
    "Harassment",
    "Spam",
    "Fraud or Scam",
    "Inappropriate Behavior",
    "Suspected Underage",
    "Other"
];

export default function UserReportModal({ reportedUserId, reportedUserName, isOpen, onClose }: UserReportModalProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!user) {
            router.push(`/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
            return;
        }

        if (!reason) {
            toast.error("Please select a reason.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    reportedUserId,
                    reason: `${reason}\n\nDetails: ${description}`
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to submit report");
            }

            toast.success("Report submitted. We will review this user shortly.");
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-2 text-red-600">
                        <Flag size={18} />
                        <h2 className="text-base font-bold text-gray-900">Report User</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    <div className="bg-red-50 p-3 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-gray-700 leading-relaxed">
                            You are reporting <span className="font-bold">{reportedUserName}</span>.
                            Please provide accurate details to help us investigate.
                        </p>
                    </div>

                    {/* Reason Selection */}
                    <div>
                        <SearchableDropdown
                            label="Reason"
                            value={reason}
                            onChange={setReason}
                            options={REPORT_REASONS}
                            placeholder="Select a reason..."
                            variant="button"
                            searchable={false}
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-900">Additional Details (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Provide more context..."
                            className="w-full h-24 rounded-xl border-gray-100 bg-white focus:border-[#E87A3F] focus:ring-2 focus:ring-[#E87A3F]/20 p-3 text-sm resize-none shadow-sm transition-all"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose} className="rounded-full font-bold h-9 text-sm">Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!reason || isSubmitting}
                        className="rounded-full bg-red-600 hover:bg-red-700 text-white font-bold h-9 px-5 text-sm"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Submit Report
                    </Button>
                </div>

            </div>
        </div>
    );
}
