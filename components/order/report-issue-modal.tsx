"use client";

import { useState, useRef, useEffect } from "react";
import { X, Camera, Package, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReportIssueModalProps {
    order: any; // Using verbose any for flexibility with Order structure for now
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ReportIssueModal({ order, isOpen, onClose, onSuccess }: ReportIssueModalProps) {
    const [step, setStep] = useState<0 | 1>(0); // 0: Select Items, 1: Details
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [requestType, setRequestType] = useState<"RETURN" | "REFUND">("REFUND");
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<{ url: string; file: File }[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setSelectedItemIds([]);
            setRequestType("REFUND");
            setReason("");
            setDescription("");
            setImages([]);
        }
    }, [isOpen]);

    if (!isOpen || !order) return null;

    // Flatten items logic (handling both CustomerOrder and VendorOrder structures)
    const allItems: any[] = [];
    if (order.vendorOrders) {
        order.vendorOrders.forEach((vo: any) => {
            vo.items?.forEach((it: any) => allItems.push({ ...it, voId: vo.id }));
        });
    } else {
        order.items?.forEach((it: any) => allItems.push({ ...it, voId: order.id }));
    }

    const REFUND_REASONS = [
        "Item arrived damaged or defective",
        "Item not as described / wrong item",
        "Missing parts or accessories",
        "Quality not as expected",
        "Changed my mind / No longer needed",
        "Arrived too late",
        "Other"
    ];

    const handleToggleItem = (itemId: string) => {
        setSelectedItemIds(prev =>
            prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
        );
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) {
            toast.error("You can only upload up to 5 images.");
            return;
        }
        const newImages = files.map(file => ({ url: URL.createObjectURL(file), file }));
        setImages(prev => [...prev, ...newImages]);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const calculateRefundAmount = () => {
        return allItems
            .filter(item => selectedItemIds.includes(item.id))
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleSubmit = async () => {
        if (selectedItemIds.length === 0) {
            toast.error("Please select at least one item.");
            return;
        }
        if (!reason) {
            toast.error("Please select a reason.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Upload Images
            const uploadedImageUrls = await Promise.all(
                images.map(async (img) => {
                    const formData = new FormData();
                    formData.append("file", img.file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (!res.ok) throw new Error("Image upload failed");
                    const data = await res.json();
                    return data.url;
                })
            );

            // 2. Group by Vendor/Order ID
            const groups = allItems
                .filter(item => selectedItemIds.includes(item.id))
                .reduce((acc: any, item: any) => {
                    if (!acc[item.voId]) acc[item.voId] = [];
                    acc[item.voId].push(item);
                    return acc;
                }, {});

            // 3. Submit Requests
            for (const voId of Object.keys(groups)) {
                const items = groups[voId];
                const res = await fetch('/api/refunds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: voId,
                        amount: items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0),
                        reason: `[${requestType}] ${reason}\n\nDescription: ${description}\n\nEvidence: ${uploadedImageUrls.join(", ")}`,
                        itemId: items[0].id // Tag first item for reference
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Request failed');
                }
            }

            toast.success("Request submitted successfully!");
            onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h2 className="text-xl font-black text-gray-900">Request Return / Refund</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {step === 0 ? (
                        <div className="space-y-6">
                            <div className="bg-orange-50 p-4 rounded-xl flex items-start gap-3">
                                <AlertCircle className="text-[#E87A3F] shrink-0 mt-0.5" size={20} />
                                <p className="text-sm text-gray-700">
                                    Select the items you want to return or refund. You can select multiple items from the same order.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {allItems.map((item) => (
                                    <div
                                        key={item.id}
                                        onClick={() => handleToggleItem(item.id)}
                                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${selectedItemIds.includes(item.id)
                                            ? "border-[#E87A3F] bg-orange-50/30 ring-1 ring-[#E87A3F]"
                                            : "border-gray-100 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selectedItemIds.includes(item.id) ? "bg-[#E87A3F] border-[#E87A3F]" : "border-gray-300 bg-white"
                                            }`}>
                                            {selectedItemIds.includes(item.id) && <Package size={12} className="text-white" />}
                                        </div>

                                        <div className="h-14 w-14 bg-gray-100 rounded-lg shrink-0 overflow-hidden">
                                            <img src={item.product?.images?.[0]?.url || "/placeholder.png"} className="w-full h-full object-cover" alt="" />
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-sm">{item.product?.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity} • ${(item.price).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Type Selection */}
                            <div className="bg-gray-50 p-1.5 rounded-xl flex">
                                {(["REFUND", "RETURN"] as const).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setRequestType(type)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${requestType === type ? "bg-white text-[#E87A3F] shadow-sm" : "text-gray-500 hover:text-gray-900"
                                            }`}
                                    >
                                        {type === "REFUND" ? "Refund Only" : "Return & Refund"}
                                    </button>
                                ))}
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Why are you requesting this?</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full h-12 rounded-xl border-gray-200 bg-gray-50 focus:border-[#E87A3F] focus:ring-0 font-medium text-sm px-3"
                                >
                                    <option value="">Select a reason...</option>
                                    {REFUND_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Additional Details</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Please describe the issue in detail..."
                                    className="w-full h-24 rounded-xl border-gray-200 bg-gray-50 focus:border-[#E87A3F] focus:ring-0 p-3 text-sm"
                                />
                            </div>

                            {/* Photos */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Evidence (Optional)</label>
                                <div className="flex flex-wrap gap-3">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative h-20 w-20 rounded-xl overflow-hidden">
                                            <img src={img.url} className="w-full h-full object-cover" alt="" />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-0.5 hover:bg-red-500 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {images.length < 5 && (
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-[#E87A3F] hover:text-[#E87A3F] transition-all bg-gray-50"
                                        >
                                            <Camera size={20} />
                                            <span className="text-[10px] font-bold mt-1">Add Photo</span>
                                        </button>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                    <div className="text-sm">
                        <span className="text-gray-500 font-medium">Refund Amount:</span>
                        <span className="ml-2 font-black text-gray-900 text-lg">${calculateRefundAmount().toFixed(2)}</span>
                    </div>

                    <div className="flex gap-3">
                        {step === 1 && (
                            <Button variant="ghost" onClick={() => setStep(0)} className="rounded-full font-bold">Back</Button>
                        )}
                        <Button
                            onClick={() => step === 0 ? setStep(1) : handleSubmit()}
                            disabled={step === 0 ? selectedItemIds.length === 0 : isSubmitting || !reason}
                            className="rounded-full bg-[#E87A3F] hover:bg-[#d96d34] text-white font-bold h-11 px-8 min-w-[120px]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : step === 0 ? "Next Step" : "Submit Request"}
                        </Button>
                    </div>
                </div>

            </div>
        </div>
    );
}
