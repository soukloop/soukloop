"use client";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export default function Modal({ isOpen, onClose, title, children, className = "" }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className={`relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 ${className}`}
                onClick={(e) => e.stopPropagation()}
                style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                    {title && <h2 className="text-xl font-bold text-gray-900">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        type="button"
                    >
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 -mr-1">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
