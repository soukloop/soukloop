"use client"

import { useState, useRef, useEffect } from 'react'
import { ImageIcon, Video, FileText, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AttachMenuProps {
    onSelectImages: () => void
    onSelectVideos: () => void
    onSelectFiles: () => void
    onSelectLocation: () => void
    onClose: () => void
    isOpen: boolean
}

export function AttachMenu({
    onSelectImages,
    onSelectVideos,
    onSelectFiles,
    onSelectLocation,
    onClose,
    isOpen
}: AttachMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            ref={menuRef}
            className="absolute bottom-full left-0 mb-2 w-48 rounded-lg border bg-white shadow-lg z-50"
        >
            <div className="p-1">
                <button
                    onClick={() => { onSelectImages(); onClose() }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-gray-100 transition-colors"
                >
                    <div className="flex size-8 items-center justify-center rounded-full bg-blue-100">
                        <ImageIcon className="size-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Photos</span>
                </button>

                <button
                    onClick={() => { onSelectVideos(); onClose() }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-gray-100 transition-colors"
                >
                    <div className="flex size-8 items-center justify-center rounded-full bg-purple-100">
                        <Video className="size-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Videos</span>
                </button>

                <button
                    onClick={() => { onSelectFiles(); onClose() }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-gray-100 transition-colors"
                >
                    <div className="flex size-8 items-center justify-center rounded-full bg-green-100">
                        <FileText className="size-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Documents</span>
                </button>

                <button
                    onClick={() => { onSelectLocation(); onClose() }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-gray-100 transition-colors"
                >
                    <div className="flex size-8 items-center justify-center rounded-full bg-red-100">
                        <MapPin className="size-4 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">Location</span>
                </button>
            </div>
        </div>
    )
}
