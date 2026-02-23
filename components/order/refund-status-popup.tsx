"use client";

import { useEffect, useState } from "react";
import {
    X,
    CheckCircle,
    AlertCircle,
    Clock,
    Package,
    CreditCard,
    DollarSign,
    Calendar,
    Truck,
    FileText,
    ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

interface RefundStatusPopupProps {
    refund: any;
    onClose: () => void;
}

export default function RefundStatusPopup({ refund, onClose }: RefundStatusPopupProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "unset"; };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    // --- Parsing Logic ---
    const parseReason = (fullReason: string) => {
        if (!fullReason) return { reason: '', description: '', evidence: [] };

        let text = fullReason;
        let evidence: string[] = [];
        let description = "";

        // 1. Extract Evidence
        if (text.includes("Evidence:")) {
            const parts = text.split("Evidence:");
            text = parts[0];
            const evidenceStr = parts[1];
            // simplistic url extraction assuming comma separation
            evidence = evidenceStr.split(",").map(s => s.trim()).filter(s => s.length > 5);
        }

        // 2. Extract Description
        if (text.includes("Description:")) {
            const parts = text.split("Description:");
            text = parts[0];
            description = parts[1].trim();
            // Clean trailing dots
            if (description.endsWith('.')) description = description.slice(0, -1);
        }

        // 3. Clean Main Reason
        let reason = text.replace(/\[REFUND\]/i, "").trim();
        if (reason.endsWith("-")) reason = reason.slice(0, -1).trim();

        return { reason, description, evidence };
    };

    const { reason, description, evidence } = parseReason(refund?.reason || "");

    // --- Timeline Data ---
    const timelineEvents = [
        {
            label: "Ordered",
            date: refund.order?.createdAt,
            icon: <Package size={14} />,
            done: true
        },
        {
            label: "Delivery",
            date: null,
            icon: <Truck size={14} />,
            done: true
        },
        {
            label: "Requested",
            date: refund.createdAt,
            icon: <FileText size={14} />,
            done: true
        },
        {
            label: refund.status === 'APPROVED' ? "Approved" : refund.status === 'REJECTED' ? "Rejected" : "Processing",
            date: refund.status === 'PENDING' ? null : refund.updatedAt || refund.createdAt,
            icon: refund.status === 'APPROVED' ? <CheckCircle size={14} /> : refund.status === 'REJECTED' ? <AlertCircle size={14} /> : <Clock size={14} />,
            done: refund.status !== 'PENDING',
            active: refund.status === 'PENDING'
        }
    ];

    if (!refund) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300 ${isVisible ? "bg-black/60" : "bg-black/0 pointer-events-none"}`}>
            <div
                // Changed max-w-sm to max-w-2xl (Wide) and grid layout
                className={`bg-white w-full max-w-3xl rounded-[24px] shadow-2xl overflow-hidden transition-all duration-300 transform ${isVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-8"}`}
            >
                <div className="flex flex-col md:flex-row h-full max-h-[85vh]">

                    {/* LEFT COLUMN: Status & Timeline (Orange Theme) */}
                    <div className={`md:w-1/3 bg-[#E87A3F] p-6 text-white flex flex-col`}>
                        <div className="mb-8">
                            <h2 className="text-2xl font-black mb-1">{refund.status}</h2>
                            <div className="flex flex-col gap-1 items-start">
                                <CopyButton
                                    value={refund.id}
                                    displayText={`Ref: #${refund.id.slice(0, 8)}`}
                                    className="opacity-80 text-xs font-medium text-white hover:opacity-100"
                                    iconClassName="text-white/70 group-hover:text-white"
                                />
                                {refund.order?.orderNumber && (
                                    <CopyButton
                                        value={refund.order.orderNumber}
                                        displayText={`Order: #${refund.order.orderNumber}`}
                                        className="opacity-80 text-xs font-medium text-white hover:opacity-100"
                                        iconClassName="text-white/70 group-hover:text-white"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Vertical Timeline on Dark Background */}
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <div className="relative pl-2 pb-2">
                                <div className="absolute left-[11px] top-2 bottom-6 w-0.5 bg-white/20" />
                                <div className="space-y-8">
                                    {timelineEvents.map((event, i) => (
                                        <div key={i} className="relative flex items-center gap-3">
                                            <div className={`z-10 h-6 w-6 rounded-full flex items-center justify-center border-2 border-white shrink-0 ${event.done ? "bg-white text-[#E87A3F]" : "bg-[#E87A3F] text-white"}`}>
                                                {event.icon}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold leading-tight">{event.label}</p>
                                                {event.date && (
                                                    <p className="text-[10px] opacity-70 mt-0.5 font-medium">
                                                        {new Date(event.date).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/20">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold uppercase opacity-80">Refund Amount</span>
                                <span className="text-2xl font-black">${refund.amount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Details & Reason */}
                    <div className="md:w-2/3 p-6 flex flex-col bg-white overflow-y-auto">
                        <button
                            onClick={handleClose}
                            className="self-end p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-500 mb-4"
                        >
                            <X size={20} />
                        </button>

                        <div className="space-y-6">
                            {/* Refund Reason Block */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Refund Reason</h3>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{reason}</p>
                                        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
                                    </div>

                                    {/* Evidence Images */}
                                    {evidence.length > 0 && (
                                        <div className="pt-2 border-t border-gray-200/50">
                                            <p className="text-[10px] font-bold text-gray-400 mb-2 flex items-center gap-1"><ImageIcon size={12} /> Evidence</p>
                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                {evidence.map((url, idx) => (
                                                    <div key={idx} className="h-16 w-16 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                                        <img src={url} alt="Evidence" className="h-full w-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Product Info */}
                            <div className="flex gap-4 items-center p-3 border border-gray-100 rounded-2xl bg-white shadow-sm">
                                <div className="h-14 w-14 bg-gray-50 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                                    {refund.orderItem?.product?.images?.[0]?.url ? (
                                        <img src={refund.orderItem.product.images[0].url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-gray-400"><Package size={20} /></div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400">Product</p>
                                    <p className="text-sm font-bold text-gray-900 line-clamp-1">
                                        {refund.orderItem?.product?.title || "Product Name"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-6">
                            <Button
                                onClick={handleClose}
                                className="w-full rounded-full bg-gray-900 hover:bg-black text-white font-bold h-12"
                            >
                                Close Details
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
