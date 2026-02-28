"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { X, Check, Camera, ChevronDown, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface ReturnRefundPopupProps {
    order: any; // The full order object (CustomerOrder or VendorOrder)
    onClose: () => void;
    onSuccess: () => void;
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

export default function ReturnRefundPopup({ order, onClose, onSuccess }: ReturnRefundPopupProps) {
    const { data: session } = useSession();
    const [reportStep, setReportStep] = useState<0 | 1>(0);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [requestType, setRequestType] = useState<"RETURN" | "REFUND">("REFUND");
    const [reportReason, setReportReason] = useState("");
    const [reportImages, setReportImages] = useState<{ url: string; file: File }[]>([]);
    const [isSubmittingReport, setIsSubmittingReport] = useState(false);
    const [showReasonDropdown, setShowReasonDropdown] = useState(false);
    const [reportData, setReportData] = useState({
        name: "",
        email: "",
        category: "",
        description: "",
    });

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const allOrderItems = useMemo(() => {
        if (!order) return [];
        return order.vendorOrders?.flatMap((vo: any) => vo.items) || order.items || [];
    }, [order]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + reportImages.length > 5) {
            toast.error("You can only upload up to 5 images.");
            return;
        }

        files.forEach(file => {
            const url = URL.createObjectURL(file);
            setReportImages(prev => [...prev, { url, file }]);
        });
    };

    const removeImage = (index: number) => {
        setReportImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleReportSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItemIds.length === 0 || !reportReason) {
            toast.error("Please select products and a reason.");
            return;
        }

        setIsSubmittingReport(true);
        try {
            // 1. Upload Images
            const uploadedImageUrls = await Promise.all(
                reportImages.map(async (img) => {
                    const formData = new FormData();
                    formData.append("file", img.file);
                    const res = await fetch("/api/upload", { method: "POST", body: formData });
                    if (!res.ok) throw new Error("Image upload failed");
                    const data = await res.json();
                    return data.url;
                })
            );

            // 2. Group items by VendorOrder
            const allItems: any[] = [];
            if (order.vendorOrders) {
                order.vendorOrders.forEach((vo: any) => {
                    vo.items?.forEach((it: any) => {
                        if (selectedItemIds.includes(it.id)) {
                            allItems.push({ ...it, voId: vo.id });
                        }
                    });
                });
            } else {
                order.items?.forEach((it: any) => {
                    if (selectedItemIds.includes(it.id)) {
                        allItems.push({ ...it, voId: order.id });
                    }
                });
            }

            const groups = allItems.reduce((acc: any, item: any) => {
                if (!acc[item.voId]) acc[item.voId] = [];
                acc[item.voId].push(item);
                return acc;
            }, {});

            // 3. Submit requests
            for (const voId of Object.keys(groups)) {
                const items = groups[voId];
                const res = await fetch('/api/refunds', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: voId,
                        amount: items.reduce((sum: number, it: any) => sum + ((it.price || it.product?.price) * it.quantity), 0),
                        reason: `[${requestType}] ${reportReason}\n\nDescription: ${reportData.description}\n\nEvidence: ${uploadedImageUrls.join(", ")}`,
                        itemId: items[0].id
                    })
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Request failed');
                }
            }

            onSuccess();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmittingReport(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 px-4 transform-gpu">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300 transform-gpu text-left">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 leading-none">
                            {reportStep === 0 ? "Select Products" : "Request Details"}
                        </h2>
                        <p className="text-sm text-gray-500 mt-2">
                            {reportStep === 0 ? "Which items are you reporting?" : "Tell us more about the issue"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-10 w-10 rounded-full hover:bg-white hover:shadow-md flex items-center justify-center transition-all text-gray-400 hover:text-gray-900"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {reportStep === 0 ? (
                        <div className="space-y-6">
                            <div className="grid gap-3">
                                {allOrderItems.map((item: any) => (
                                    <label
                                        key={item.id}
                                        className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedItemIds.includes(item.id)
                                            ? "border-[#E87A3F] bg-orange-50/30"
                                            : "border-gray-100 hover:border-gray-200 bg-white"
                                            }`}
                                    >
                                        <div className={`h-6 w-6 rounded-md border-2 flex items-center justify-center transition-colors ${selectedItemIds.includes(item.id) ? "bg-[#E87A3F] border-[#E87A3F]" : "border-gray-300 group-hover:border-gray-400"
                                            }`}>
                                            {selectedItemIds.includes(item.id) && <Check className="h-4 w-4 text-white" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={selectedItemIds.includes(item.id)}
                                            onChange={() => {
                                                if (selectedItemIds.includes(item.id)) {
                                                    setSelectedItemIds(prev => prev.filter(id => id !== item.id));
                                                } else {
                                                    setSelectedItemIds(prev => [...prev, item.id]);
                                                }
                                            }}
                                        />
                                        <div className="h-14 w-14 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                                            <img src={item.product?.images?.[0]?.url || "/placeholder.png"} className="object-cover w-full h-full" alt="" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-gray-900 truncate">{item.product?.name || "Product"}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity} • ${(item.price || item.product?.price || 0).toFixed(2)}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleReportSubmit} className="space-y-8">
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Selected Items</span>
                                    <button
                                        type="button"
                                        onClick={() => setReportStep(0)}
                                        className="text-xs font-bold text-[#E87A3F] hover:underline"
                                    >
                                        Change Selection
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {selectedItemIds.map(id => {
                                        const item = allOrderItems.find((it: any) => it.id === id);
                                        return (
                                            <div key={id} className="h-12 w-12 rounded-lg overflow-hidden border border-white shadow-sm ring-1 ring-gray-100">
                                                <img src={item?.product?.images?.[0]?.url || "/placeholder.png"} className="object-cover w-full h-full" alt="" />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setRequestType("REFUND")}
                                    className={`h-11 rounded-xl text-sm font-bold transition-all ${requestType === "REFUND" ? "bg-white text-[#E87A3F] shadow-sm" : "text-gray-500"}`}
                                >
                                    Money Refund
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRequestType("RETURN")}
                                    className={`h-11 rounded-xl text-sm font-bold transition-all ${requestType === "RETURN" ? "bg-white text-[#E87A3F] shadow-sm" : "text-gray-500"}`}
                                >
                                    Return Item
                                </button>
                            </div>

                            <div className="relative text-left">
                                <label className="block text-sm font-bold text-gray-900 mb-2">Reason for {requestType === "REFUND" ? "Refund" : "Return"}</label>
                                <button
                                    type="button"
                                    onClick={() => setShowReasonDropdown(!showReasonDropdown)}
                                    className={`flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-5 text-left transition-all ${showReasonDropdown ? "border-[#E87A3F] ring-4 ring-orange-50" : "border-gray-100 hover:border-gray-300"}`}
                                >
                                    <span className={reportReason ? "text-gray-900 font-bold" : "text-gray-400"}>
                                        {reportReason || "Select a reason"}
                                    </span>
                                    <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${showReasonDropdown ? "rotate-180" : ""}`} />
                                </button>
                                {showReasonDropdown && (
                                    <div className="absolute top-full left-0 right-0 z-[110] mt-2 bg-white rounded-2xl border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                                        <div className="p-2 space-y-1">
                                            {REFUND_REASONS.map(res => (
                                                <button
                                                    key={res}
                                                    type="button"
                                                    onClick={() => { setReportReason(res); setShowReasonDropdown(false); }}
                                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${reportReason === res ? "bg-orange-50 text-[#E87A3F]" : "text-gray-600 hover:bg-gray-50"}`}
                                                >
                                                    {res}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Detailed Description</label>
                                <textarea
                                    required
                                    placeholder="Please share more details about the problem..."
                                    className="w-full h-32 rounded-2xl border-gray-100 bg-white p-5 text-base text-gray-900 outline-none transition-all focus:border-[#E87A3F] focus:ring-4 focus:ring-orange-50 resize-none border-2"
                                    value={reportData.description}
                                    onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-900">Damage/Proof Images</label>
                                    <span className="text-xs text-gray-400">{reportImages.length}/5 images</span>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {reportImages.map((img, i) => (
                                        <div key={i} className="relative h-20 w-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                                            <img src={img.url} className="object-cover w-full h-full" alt="" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 h-6 w-6 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {reportImages.length < 5 && (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#E87A3F] hover:bg-orange-50 flex flex-col items-center justify-center transition-all text-gray-400 hover:text-[#E87A3F]"
                                        >
                                            <Camera className="h-6 w-6 mb-1" />
                                            <span className="text-[10px] font-bold">ADD</span>
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/jpeg, image/png, image/webp"
                                    multiple
                                    onChange={handleImageUpload}
                                />
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex gap-3 text-left">
                                <ShieldCheck className="h-5 w-5 text-blue-600 flex-shrink-0" />
                                <p className="text-xs text-blue-700 leading-relaxed">
                                    Your request will be linked to your account (<strong>{session?.user?.email}</strong>). Our team will review your evidence and get back to you within 24-48 hours.
                                </p>
                            </div>
                        </form>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                    {reportStep === 0 ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 h-14 rounded-full font-bold text-gray-500 hover:bg-white transition-all border border-transparent hover:border-gray-200"
                            >
                                Discard
                            </button>
                            <button
                                onClick={() => setReportStep(1)}
                                disabled={selectedItemIds.length === 0}
                                className="flex-[2] h-14 rounded-full font-bold text-white bg-[#E87A3F] hover:bg-[#d96d34] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => setReportStep(0)}
                                className="flex-1 h-14 rounded-full font-bold text-gray-500 hover:bg-white transition-all border border-transparent hover:border-gray-200"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleReportSubmit}
                                disabled={isSubmittingReport || !reportReason || !reportData.description}
                                className="flex-[2] h-14 rounded-full font-bold text-white bg-[#E87A3F] hover:bg-[#d96d34] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmittingReport ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</>
                                ) : (
                                    <>Submit Request</>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
