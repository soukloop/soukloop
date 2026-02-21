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
    /** Optional: control open state externally (no trigger button needed) */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
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
    /** If true, hides the vendor slug field in the form */
    hideSlug?: boolean;
}

export function EditUserModal({ userId, mode, trigger, open: externalOpen, onOpenChange: externalOnOpenChange, vendorInitialData, hideSlug }: EditUserModalProps) {
    // Internal state for when the modal is used with a trigger button
    const [internalOpen, setInternalOpen] = useState(false);

    // Determine open state: prefer external control if provided
    const isControlled = externalOpen !== undefined;
    const open = isControlled ? externalOpen : internalOpen;
    const setOpen = isControlled
        ? (val: boolean) => externalOnOpenChange?.(val)
        : setInternalOpen;

    const getTitle = () => {
        switch (mode) {
            case "general": return "Edit General Information";
            case "vendor": return "Edit Vendor Identity";
            case "address": return "Manage Addresses";
            default: return "Edit User";
        }
    };

    const content = (
        <DialogContent className="w-full sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{getTitle()}</DialogTitle>
            </DialogHeader>

            <div className="py-4">
                {mode === "general" && (
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
                        hideSlug={hideSlug}
                        onSuccess={() => setOpen(false)}
                    />
                )}
            </div>
        </DialogContent>
    );

    // When triggered externally (no trigger button), render without DialogTrigger
    if (isControlled) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                {content}
            </Dialog>
        );
    }

    // When triggered by an internal button
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="h-8 text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                        Edit
                    </Button>
                )}
            </DialogTrigger>
            {content}
        </Dialog>
    );
}
