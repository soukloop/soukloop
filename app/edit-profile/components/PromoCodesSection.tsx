"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Tag, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { StatefulButton } from "@/components/ui/StatefulButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

interface PromoCode {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minOrderValue: number | null;
    maxUses: number | null;
    currentUses: number;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
}

export default function PromoCodesSection() {
    const [promos, setPromos] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [code, setCode] = useState("");
    const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
    const [discountValue, setDiscountValue] = useState("");
    const [minOrderValue, setMinOrderValue] = useState("");
    const [maxUses, setMaxUses] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Deletion State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [promoToDelete, setPromoToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPromos = async () => {
        try {
            const res = await fetch("/api/seller/promocodes");
            if (res.ok) {
                const data = await res.json();
                setPromos(data);
            }
        } catch (error) {
            console.error("Failed to fetch promos", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPromos();
    }, []);

    const handleDelete = (id: string) => {
        setPromoToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!promoToDelete) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/seller/promocodes?id=${promoToDelete}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Promo code deleted");
            setPromos(prev => prev.filter(p => p.id !== promoToDelete));
        } catch (error) {
            toast.error("Failed to delete promo code");
        } finally {
            setIsDeleting(false);
            setIsDeleteDialogOpen(false);
            setPromoToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code || !discountValue) return toast.error("Code and discount value are required");

        setIsSubmitting(true);
        try {
            const payload = {
                code: code.toUpperCase(),
                discountType,
                discountValue: parseFloat(discountValue),
                minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
                maxUses: maxUses ? parseInt(maxUses) : null,
                endDate: endDate ? new Date(endDate).toISOString() : null,
            };

            const res = await fetch("/api/seller/promocodes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to create promo code");
            }

            toast.success("Promo code created successfully");
            setIsModalOpen(false);
            resetForm();
            fetchPromos();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setCode("");
        setDiscountType("PERCENTAGE");
        setDiscountValue("");
        setMinOrderValue("");
        setMaxUses("");
        setEndDate("");
    };

    if (isLoading) {
        return <div className="animate-pulse h-40 bg-gray-100 rounded-xl w-full"></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Your Promo Codes</h3>
                    <p className="text-sm text-gray-500">Create discount codes to attract more buyers.</p>
                </div>
                <Dialog open={isModalOpen} onOpenChange={(open) => {
                    setIsModalOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#E87A3F] hover:bg-[#d96d34] text-white rounded-full px-6 flex items-center gap-2">
                            <Plus className="size-4" />
                            <span>New Code</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Promo Code</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Promo Code <span className="text-red-500">*</span></Label>
                                <Input
                                    id="code"
                                    placeholder="e.g. SUMMER20"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    required
                                    className="uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Discount Type</Label>
                                    <Select value={discountType} onValueChange={(val: any) => setDiscountType(val)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                            <SelectItem value="FIXED">Fixed Amount ($)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Value <span className="text-red-500">*</span></Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        required
                                        placeholder={discountType === "PERCENTAGE" ? "e.g. 20" : "e.g. 15.00"}
                                        value={discountValue}
                                        onChange={(e) => setDiscountValue(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Min Order Value ($)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="Optional"
                                        value={minOrderValue}
                                        onChange={(e) => setMinOrderValue(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Uses</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Optional"
                                        value={maxUses}
                                        onChange={(e) => setMaxUses(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Expiration Date</Label>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                />
                            </div>

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <StatefulButton type="submit" isLoading={isSubmitting} className="bg-[#E87A3F] hover:bg-[#d96d34] text-white">
                                    Create
                                </StatefulButton>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {promos.length === 0 ? (
                <Card className="bg-gray-50 border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Tag className="size-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No promo codes yet</h3>
                        <p className="text-gray-500">Create your first promo code to boost your sales.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {promos.map((promo) => (
                        <Card key={promo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-2 w-full bg-[#E87A3F]"></div>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-orange-100 text-[#E87A3F] font-black tracking-wider px-3 py-1 rounded-md text-lg">
                                            {promo.code}
                                        </span>
                                        {!promo.isActive && <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded font-bold">Expired</span>}
                                    </div>
                                    <button onClick={() => handleDelete(promo.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                                        <Trash2 className="size-4" />
                                    </button>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-gray-900">Discount:</span>
                                        <span className="font-bold text-green-600">
                                            {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                                        </span>
                                    </div>
                                    {(promo.minOrderValue ?? 0) > 0 && (
                                        <div className="flex justify-between">
                                            <span>Min Order:</span>
                                            <span>${promo.minOrderValue}</span>
                                        </div>
                                    )}
                                    {promo.maxUses && (
                                        <div className="flex justify-between">
                                            <span>Uses:</span>
                                            <span>{promo.currentUses} / {promo.maxUses}</span>
                                        </div>
                                    )}
                                    {promo.endDate && (
                                        <div className="flex justify-between">
                                            <span>Expires:</span>
                                            <span>{new Date(promo.endDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Promo Code"
                message="Are you sure you want to delete this promo code? This cannot be undone and customers will no longer be able to use it."
                type="danger"
                confirmText="Delete"
                isLoading={isDeleting}
            />
        </div>
    );
}
