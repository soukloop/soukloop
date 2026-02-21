"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestDressStyleModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId?: string;
    categoryName: string;       // derived from Step 2 selection — shown as read-only label
    onStyleRequested: (style: { id: string; name: string; status: string; isPending: boolean }) => void;
    initialName?: string;
}

export default function RequestDressStyleModal({
    isOpen,
    onClose,
    categoryId,
    categoryName,
    onStyleRequested,
    initialName = ""
}: RequestDressStyleModalProps) {
    const [name, setName] = useState(initialName);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setError("");
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter a dress style name");
            return;
        }

        if (!categoryId) {
            setError("No category selected. Please go back to Step 2 and select a category.");
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const res = await fetch("/api/dress-styles/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: name.trim(),
                    categoryId,        // always pass categoryId — resolved from Step 2
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit request");
            }

            if (data.alreadyApproved) {
                onStyleRequested({
                    id: data.dressStyle.id,
                    name: data.dressStyle.name,
                    status: "approved",
                    isPending: false
                });
            } else {
                onStyleRequested({
                    id: data.dressStyle.id,
                    name: data.dressStyle.name,
                    status: "pending",
                    isPending: true
                });
            }

            setName("");

        } catch (err: any) {
            setError(err.message || "Something went wrong");
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
                    Request a Dress Style
                </h2>

                {/* Category read-only chip */}
                <div className="mb-5 flex items-center gap-2">
                    <span className="text-sm text-gray-400">For category:</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100">
                        {categoryName || "—"}
                    </span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Style Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError("");
                            }}
                            placeholder="e.g. Palazzo Set, Kurta, Maxi Dress"
                            disabled={isSubmitting}
                            autoFocus
                            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-[#E87A3F] focus:outline-none focus:ring-2 focus:ring-[#E87A3F] disabled:bg-gray-50 transition-colors"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {/* Info Box */}
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                        <p className="text-xs text-blue-700">
                            Once approved by admin, this style will be available for all sellers in the <strong>{categoryName}</strong> category.
                        </p>
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
                            disabled={isSubmitting || !name.trim()}
                            className="rounded-xl bg-[#E87A3F] hover:bg-[#d96d34] text-white disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                "Submit Request"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
