"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

interface PublishBoostModalProps {
    isOpen: boolean;
    saveData?: {
        payload: any;
        isEditMode: boolean;
        editProductId: string | null;
    } | null;
    initialPackage?: 'NONE' | '3_DAYS' | '7_DAYS' | '15_DAYS';
    clearPersistence: () => void;
    onClose: () => void;
    saveActionOnly?: boolean;
    productId?: string;
}

const PACKAGES = [
    { id: 'NONE', label: 'Free', price: 'No Boost', days: 0 },
    { id: '3_DAYS', label: '3 Days', price: '$2.99', days: 3 },
    { id: '7_DAYS', label: '7 Days', price: '$5.99', days: 7, recommended: true },
    { id: '15_DAYS', label: '15 Days', price: '$9.99', days: 15 },
] as const;

type PackageId = typeof PACKAGES[number]['id'];

export default function PublishBoostModal({
    isOpen,
    saveData,
    initialPackage = 'NONE',
    clearPersistence,
    onClose,
    saveActionOnly = false,
    productId,
}: PublishBoostModalProps) {
    const router = useRouter();
    const [selected, setSelected] = useState<PackageId>(initialPackage);
    const [status, setStatus] = useState<'idle' | 'saving' | 'redirecting'>('idle');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Lock body scroll when modal is open
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!isOpen || !mounted) return null;

    const handleProceed = async () => {
        setStatus('saving');
        try {
            let finalProductId = productId;

            // 1. Save/update the product in the background (Only if not in standalone boost mode)
            if (!saveActionOnly && saveData) {
                const { payload, isEditMode, editProductId } = saveData;
                const finalPayload = {
                    ...payload,
                    boostPackage: selected,
                    isFeatured: selected !== 'NONE'
                };

                const res = await fetch(isEditMode ? `/api/products/${editProductId}` : "/api/products", {
                    method: isEditMode ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(finalPayload),
                });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData?.details || errorData?.error || "Failed to publish product");
                }

                const savedProduct = await res.json().catch(() => null);
                finalProductId = savedProduct?.id || (saveData?.isEditMode ? saveData?.editProductId : null);

                clearPersistence();
                toast.success("Product published successfully!");
            }

            // 2. If no boost selected, redirect to listings
            if (selected === 'NONE') {
                router.push("/seller/manage-listings");
                return;
            }

            // 3. If boost selected, create checkout session
            if (!finalProductId) throw new Error("Product ID missing");
            setStatus('redirecting');
            const boostRes = await fetch(`/api/products/${finalProductId}/boost-checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ packageType: selected }),
            });

            if (!boostRes.ok) {
                const err = await boostRes.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to create boost checkout');
            }

            const { url } = await boostRes.json();
            if (url) {
                window.location.href = url;
            } else {
                router.push("/seller/manage-listings");
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong');
            setStatus('idle');
        }
    };

    const modalContent = (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center isolate">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 animate-in fade-in duration-300"
                onClick={() => status === 'idle' && onClose()}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-lg mx-4 bg-white rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden">
                {/* Close Button */}
                {status === 'idle' && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                {/* Header content */}
                <div className="px-6 pt-7 pb-5 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 text-orange-600 shadow-sm shrink-0">
                            <Zap className="h-6 w-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">Boost Your Listing</h2>
                            <p className="text-sm text-gray-500 mt-0.5">Your listing is ready. Choose a boost option below.</p>
                        </div>
                    </div>
                </div>

                {/* Package Grid */}
                <div className="px-6 py-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {PACKAGES.map((pkg) => {
                            const isSelected = selected === pkg.id;
                            return (
                                <div
                                    key={pkg.id}
                                    onClick={() => status === 'idle' && setSelected(pkg.id)}
                                    className={`group relative cursor-pointer rounded-2xl border-2 p-3 sm:p-4 transition-all duration-200 ${isSelected
                                        ? 'border-orange-500 bg-orange-50 shadow-md transform -translate-y-0.5'
                                        : 'border-gray-100 bg-white hover:border-orange-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {'recommended' in pkg && pkg.recommended && (
                                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider shadow-sm z-10">
                                            Popular
                                        </div>
                                    )}
                                    <div className="flex flex-col items-center text-center justify-center h-full gap-1.5">
                                        <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest ${isSelected ? 'text-orange-900' : 'text-gray-400'}`}>
                                            {pkg.label}
                                        </span>
                                        <span className={`text-sm sm:text-base font-black ${isSelected ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-500'}`}>
                                            {pkg.price}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                        {selected === 'NONE' ? (
                            <div className="flex items-start gap-3 text-sm text-gray-600">
                                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-gray-400 shrink-0" />
                                <p>Proceeding with <span className="font-semibold text-gray-900">Free Listing</span>. Your product will be visible in standard search results.</p>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3 text-sm text-orange-900">
                                <Sparkles className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                                <p>Appears <span className="font-bold text-gray-900 underline decoration-orange-300">at the top</span> of search with a <span className="inline-flex items-center bg-amber-200/50 px-1.5 py-0.5 rounded text-[10px] font-black text-amber-800 uppercase tracking-tight">★ Featured</span> badge.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="px-6 pb-7">
                    <Button
                        onClick={handleProceed}
                        disabled={status !== 'idle'}
                        className="w-full h-14 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-[#E87A3F] to-[#d96d34] hover:from-[#d96d34] hover:to-[#c45a2a] shadow-lg shadow-orange-200 transition-all duration-300 disabled:opacity-70 disabled:grayscale-[0.5]"
                    >
                        {status === 'saving' ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Updating listing...
                            </>
                        ) : status === 'redirecting' ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Redirecting to secure pay...
                            </>
                        ) : (
                            'Proceed'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
