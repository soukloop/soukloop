"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { MapPin } from "lucide-react";

interface SetSellerAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    verificationId: string;
    addresses: any[];
    currentSellerAddressId?: string;
    onSuccess: () => void;
}

export function SetSellerAddressModal({ isOpen, onClose, verificationId, addresses, currentSellerAddressId, onSuccess }: SetSellerAddressModalProps) {
    const [loading, setLoading] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(currentSellerAddressId || "");

    const handleSubmit = async () => {
        if (!selectedAddressId) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/admin/kyc/${verificationId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_details',
                    details: { sellerAddressId: selectedAddressId }
                })
            });

            if (!res.ok) throw new Error('Failed to update seller address');

            toast.success("Seller address updated");
            onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Set Seller Address</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    <RadioGroup value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        {addresses.map((addr) => (
                            <div key={addr.id} className={`flex items-start space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50'}`}>
                                <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                                <Label htmlFor={addr.id} className="cursor-pointer flex-1">
                                    <div className="font-medium text-gray-900 flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-gray-400" />
                                        {addr.isDefault && <span className="text-xs bg-gray-100 text-gray-600 px-2 rounded-full">Default</span>}
                                        {addr.address1}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-1">
                                        {addr.city}, {addr.state} {addr.postalCode}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1 uppercase">
                                        {addr.country}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {addresses.length === 0 && (
                        <p className="text-center text-gray-500 py-4">No addresses available. Please ask the user to add an address first.</p>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={loading || !selectedAddressId}>
                        {loading ? 'Saving...' : 'Set as Seller Address'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
