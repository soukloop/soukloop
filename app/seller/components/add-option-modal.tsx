"use client";

import { useState, useEffect } from "react";
import { X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddOptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (name: string) => Promise<void>;
    label: string;              // e.g. "Brand", "Fabric", "Occasion"
    existingOptions: string[];  // current list for frontend duplicate check
    initialName?: string;       // pre-filled from what user typed in the dropdown
    isLoading?: boolean;
}

export default function AddOptionModal({
    isOpen,
    onClose,
    onConfirm,
    label,
    existingOptions,
    initialName = "",
    isLoading = false,
}: AddOptionModalProps) {
    const [name, setName] = useState(initialName);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Pre-fill whenever modal opens
    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setError("");
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    // Real-time duplicate check (case-insensitive)
    const isDuplicate = name.trim().length > 0 &&
        existingOptions.some(opt => opt.toLowerCase() === name.trim().toLowerCase());

    const isEmpty = name.trim().length === 0;
    const canSubmit = !isEmpty && !isDuplicate && !isSubmitting;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!canSubmit) return;

        setIsSubmitting(true);
        setError("");

        try {
            await onConfirm(name.trim());
            setName("");
            // onClose is called by parent after success
        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setName("");
            setError("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl mx-4 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors"
                    type="button"
                >
                    <X className="h-5 w-5 text-gray-400" />
                </button>

                {/* Header */}
                <h2 className="mb-1 text-lg font-semibold text-gray-900">
                    Add New {label}
                </h2>
                <p className="mb-5 text-sm text-gray-400">
                    Type the name and confirm to add it to the list.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            {label} Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            placeholder={`Enter ${label.toLowerCase()} name`}
                            disabled={isSubmitting}
                            autoFocus
                            className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 disabled:bg-gray-50 ${isDuplicate
                                    ? "border-amber-400 focus:ring-amber-300 bg-amber-50"
                                    : "border-gray-200 focus:ring-[#E87A3F] focus:border-[#E87A3F]"
                                }`}
                        />

                        {/* Real-time duplicate warning */}
                        {isDuplicate && (
                            <div className="mt-2 flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-top-1">
                                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                                <p className="text-xs font-medium">
                                    &ldquo;{name.trim()}&rdquo; already exists. Close this and select it from the dropdown instead.
                                </p>
                            </div>
                        )}

                        {/* Server error */}
                        {error && (
                            <p className="mt-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                                {error}
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="rounded-xl"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={!canSubmit || isLoading}
                            className="rounded-xl bg-[#E87A3F] hover:bg-[#d96d34] text-white disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Add {label}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
