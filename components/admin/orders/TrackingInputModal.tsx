"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatefulButton } from '@/components/ui/StatefulButton';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TrackingInputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (trackingNumber: string, carrier: string) => void;
    isLoading?: boolean;
}

export default function TrackingInputModal({
    isOpen,
    onClose,
    onConfirm,
    isLoading = false,
}: TrackingInputModalProps) {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(trackingNumber, carrier);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900">
                        Add Tracking Details
                    </DialogTitle>
                    <DialogDescription className="text-gray-600">
                        Please enter the tracking number and carrier for this order.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="trackingNumber">Tracking Number</Label>
                        <Input
                            id="trackingNumber"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="e.g. 1Z9999999999999999"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="carrier">Carrier</Label>
                        <Input
                            id="carrier"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="e.g. UPS, FedEx, DHL"
                            required
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="rounded-full"
                        >
                            Cancel
                        </Button>
                        <StatefulButton
                            type="submit"
                            isLoading={isLoading}
                            loadingText="Saving..."
                            className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            Save & Mark Shipped
                        </StatefulButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
