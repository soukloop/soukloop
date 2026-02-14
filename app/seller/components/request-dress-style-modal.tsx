"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RequestDressStyleModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryType: string;
    categoryId?: string;
    onStyleRequested: (style: { id: string; name: string; status: string; isPending: boolean }) => void;
    initialName?: string;
}

export default function RequestDressStyleModal({
    isOpen,
    onClose,
    categoryType,
    categoryId,
    onStyleRequested,
    initialName = ""
}: RequestDressStyleModalProps) {
    const [name, setName] = useState(initialName);
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
        }
    }, [isOpen, initialName]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter a dress style name");
            return;
        }

        if (!categoryType) {
            setError("No category selected");
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
                    categoryType,
                    message: message.trim() || undefined
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Failed to submit request");
            }

            if (data.alreadyApproved) {
                // Style already exists and is approved
                onStyleRequested({
                    id: data.dressStyle.id,
                    name: data.dressStyle.name,
                    status: "approved",
                    isPending: false
                });
            } else {
                // New pending style or added to existing
                onStyleRequested({
                    id: data.dressStyle.id,
                    name: data.dressStyle.name,
                    status: "pending",
                    isPending: true
                });
            }

            // Reset form
            setName("");
            setMessage("");

        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setName("");
            setMessage("");
            setError("");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl mx-4 animate-in zoom-in-95 duration-200">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="absolute right-4 top-4 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                    <X className="h-5 w-5 text-gray-500" />
                </button>

                {/* Header */}
                <h2 className="mb-2 text-xl font-semibold text-gray-900">
                    Request a Dress Style
                </h2>
                <p className="mb-6 text-sm text-gray-500">
                    Request a new dress style for <strong className="text-orange-600">{categoryType}</strong> category.
                    Once approved, it will be available for all sellers.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dress Style Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Palazzo Set, Koti, Dupatta"
                            disabled={isSubmitting}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Message Input (Optional) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Additional Notes <span className="text-gray-400">(optional)</span>
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Any additional details about this style..."
                            disabled={isSubmitting}
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 disabled:bg-gray-100 resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
                            {error}
                        </p>
                    )}

                    {/* Info Box */}
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                        <p className="text-xs text-blue-700">
                            Your request will be reviewed by admin. Once approved, the style will be available
                            for selection and any products using it will become visible to buyers.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-orange-500 hover:bg-orange-600"
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
