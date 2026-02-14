"use client"

import { X, FileText, Image as ImageIcon, Video } from 'lucide-react'
import Image from 'next/image'

export interface AttachedFile {
    id: string
    file: File
    type: 'image' | 'video' | 'file'
    preview?: string
}

interface MediaPreviewProps {
    files: AttachedFile[]
    onRemove: (id: string) => void
    maxFiles: number
}

export function MediaPreview({ files, onRemove, maxFiles }: MediaPreviewProps) {
    if (files.length === 0) return null

    const remaining = maxFiles - files.length

    return (
        <div className="border-b bg-gray-50 p-2">
            <div className="flex items-center gap-2 flex-wrap">
                {files.map((file) => (
                    <div key={file.id} className="relative group">
                        {file.type === 'image' && file.preview ? (
                            <div className="relative size-16 rounded-lg overflow-hidden border bg-white">
                                <Image
                                    src={file.preview}
                                    alt={file.file.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : file.type === 'video' && file.preview ? (
                            <div className="relative size-16 rounded-lg overflow-hidden border bg-black">
                                <video
                                    src={file.preview}
                                    className="size-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <Video className="size-6 text-white" />
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 p-2 rounded-lg border bg-white max-w-[150px]">
                                <FileText className="size-5 text-gray-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs font-medium truncate">{file.file.name}</p>
                                    <p className="text-xs text-gray-400">{formatFileSize(file.file.size)}</p>
                                </div>
                            </div>
                        )}

                        {/* Remove button */}
                        <button
                            onClick={() => onRemove(file.id)}
                            className="absolute -top-1 -right-1 size-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                ))}

                {/* Add more indicator */}
                {remaining > 0 && (
                    <div className="text-xs text-gray-400 px-2">
                        +{remaining} more allowed
                    </div>
                )}
            </div>
        </div>
    )
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
