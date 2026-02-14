"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import EditProfileSection from "@/app/edit-profile/components/EditProfileSection";
import AddressBookSection from "@/app/edit-profile/components/AddressBookSection";
import { EditVendorForm } from "../forms/edit-vendor-form";

type EditMode = "general" | "vendor" | "address";

interface EditUserModalProps {
    userId: string;
    mode: EditMode;
    trigger?: React.ReactNode;
    // Data props for initial values if needed
    vendorInitialData?: {
        slug?: string;
        taxIdType?: string;
        taxId?: string;
        govIdType?: string;
        govIdNumber?: string;
        govIdFrontUrl?: string;
        govIdBackUrl?: string;
        selfieUrl?: string;
        businessLicenseUrl?: string;
        addressProofUrl?: string;
    };
}

export function EditUserModal({ userId, mode, trigger, vendorInitialData }: EditUserModalProps) {
    const [open, setOpen] = useState(false);

    const getTitle = () => {
        switch (mode) {
            case "general": return "Edit General Information";
            case "vendor": return "Edit Vendor Identity";
            case "address": return "Manage Addresses";
            default: return "Edit User";
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                        Edit
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{getTitle()}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {mode === "general" && (
                        // Wrapping in a div to isolate styles if needed
                        <div className="profile-edit-wrapper">
                            <EditProfileSection userId={userId} hideSections={true} />
                        </div>
                    )}

                    {mode === "address" && (
                        <div className="address-edit-wrapper">
                            <AddressBookSection userId={userId} />
                        </div>
                    )}

                    {mode === "vendor" && vendorInitialData && (
                        <EditVendorForm
                            userId={userId}
                            initialData={vendorInitialData}
                            onSuccess={() => setOpen(false)}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
