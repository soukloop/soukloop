"use client";

import * as React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/StatefulButton";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

export type ConfirmDialogType = "info" | "success" | "warning" | "danger";

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmDialogType;
    isLoading?: boolean;
}

const typeConfig = {
    info: {
        icon: Info,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-100",
        confirmBg: "bg-blue-600 hover:bg-blue-700",
    },
    success: {
        icon: CheckCircle,
        iconColor: "text-green-600",
        iconBg: "bg-green-100",
        confirmBg: "bg-[#E87A3F] hover:bg-[#E87A3F]/90",
    },
    warning: {
        icon: AlertTriangle,
        iconColor: "text-yellow-600",
        iconBg: "bg-yellow-100",
        confirmBg: "bg-yellow-600 hover:bg-yellow-700",
    },
    danger: {
        icon: XCircle,
        iconColor: "text-red-600",
        iconBg: "bg-red-100",
        confirmBg: "bg-red-600 hover:bg-red-700",
    },
};

/**
 * Unified professionally styled Confirmation Dialog
 * Merged from:
 * - components/admin/ConfirmationModal.tsx
 * - components/ui/ConfirmDialog.tsx
 */
export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "info",
    isLoading = false,
}: ConfirmDialogProps) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="sm:max-w-md rounded-2xl p-6">
                <DialogHeader className="flex flex-col items-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={cn("rounded-full p-4", config.iconBg)}>
                            <Icon className={cn("h-8 w-8", config.iconColor)} />
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-gray-900 mb-2 text-center w-full">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 text-center w-full">
                        {message}
                    </DialogDescription>
                </DialogHeader>

                {/* Actions */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 rounded-full"
                    >
                        {cancelText}
                    </Button>
                    <StatefulButton
                        onClick={onConfirm}
                        isLoading={isLoading}
                        loadingText="Processing..."
                        className={cn("px-6 rounded-full text-white", config.confirmBg)}
                    >
                        {confirmText}
                    </StatefulButton>
                </div>
            </DialogContent>
        </Dialog>
    );
}
