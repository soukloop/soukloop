"use client";

import { useState } from "react";
import { ImagePlus, AlertCircle, X, Info } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

import { PhotoSlot } from "./types";

interface UploadPhotosStepProps {
    photos: PhotoSlot[];
    onPhotosChange: (photos: PhotoSlot[]) => void;
}

// Constants for validation
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PHOTOS = 10;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const ALLOWED_EXTENSIONS = ['JPG', 'JPEG', 'PNG'];

export default function UploadPhotosStep({ photos, onPhotosChange }: UploadPhotosStepProps) {
    const [error, setError] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch for Popover
    useState(() => {
        setMounted(true);
    });

    const validateFile = (file: File): string | null => {
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `Invalid format. Please upload ${ALLOWED_EXTENSIONS.join(' or ')} files only.`;
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`;
        }

        return null;
    };

    const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            toast.error(validationError);
            e.target.value = ''; // Reset input
            return;
        }

        setError(null);

        setError(null);

        // Optimistic Preview using Blob URL (Instant, no Base64 lag)
        const objectUrl = URL.createObjectURL(file);

        const updatedPhotos = photos.map((photo) =>
            photo.id === id ? {
                ...photo,
                image: objectUrl,
                file: file,
                // Reset upload state for new file
                isUploading: false,
                uploadUrl: null,
                uploadError: null
            } : photo
        );
        onPhotosChange(updatedPhotos);
    };

    const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const updatedPhotos = photos.map((photo) =>
            photo.id === id ? { ...photo, image: null, file: null } : photo
        );
        onPhotosChange(updatedPhotos);
    };

    const uploadedCount = photos.filter(p => p.image !== null).length;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-semibold text-gray-900">Upload Photos</h2>
                            {/* Client-side only to prevent hydration mismatch with Radix UI IDs */}
                            {mounted && (
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-gray-400 hover:text-[#E87A3F]">
                                            <Info className="h-4 w-4" />
                                            <span className="sr-only">Photo Guidelines</span>
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4" align="start">
                                        <div className="space-y-3">
                                            <h4 className="font-bold text-gray-900">Photo Guidelines</h4>
                                            <ul className="space-y-2 text-sm text-gray-600">
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                                    Upload up to {MAX_PHOTOS} high-quality photos
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                                    Accepted formats: {ALLOWED_EXTENSIONS.join(', ')}
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                                    Maximum file size: {MAX_FILE_SIZE_MB}MB per image
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                                    First photo will be your cover image
                                                </li>
                                            </ul>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">
                            Add JPG or PNG format photos (max {MAX_FILE_SIZE_MB}MB each)
                        </p>
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                        <span className={uploadedCount > 0 ? "text-[#E87A3F] font-bold" : ""}>
                            {uploadedCount}
                        </span>
                        <span> / {MAX_PHOTOS} photos</span>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                        <AlertCircle className="size-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {photos.slice(0, MAX_PHOTOS).map((photo, index) => (
                    <div key={photo.id} className="group relative aspect-[4/3] w-full">
                        <label
                            htmlFor={`photo-upload-${photo.id}`}
                            className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl bg-white transition-all hover:bg-gray-50 hover:shadow-md border border-dashed border-gray-200 hover:border-orange-200"
                            style={{
                                boxShadow: "0px 2px 4px rgba(0,0,0,0.02)",
                            }}
                        >
                            {photo.image ? (
                                <div className="relative h-full w-full overflow-hidden rounded-xl">
                                    <Image
                                        src={photo.image}
                                        alt={photo.label}
                                        fill
                                        className={`object-cover ${photo.isUploading ? 'opacity-50 grayscale' : ''}`}
                                    />

                                    {/* Upload Spinner */}
                                    {photo.isUploading && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="size-6 animate-spin rounded-full border-2 border-white border-t-orange-500" />
                                        </div>
                                    )}

                                    {/* Error Badge */}
                                    {photo.uploadError && (
                                        <div className="absolute bottom-2 left-2 right-2 rounded bg-red-500/90 p-1 text-center text-[10px] text-white">
                                            Retry
                                        </div>
                                    )}

                                    {/* Cover badge for first image */}
                                    {index === 0 && !photo.isUploading && !photo.uploadError && (
                                        <div className="absolute top-2 left-2 bg-[#E87A3F] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            COVER
                                        </div>
                                    )}
                                    {/* Remove button */}
                                    <button
                                        onClick={(e) => handleRemovePhoto(photo.id, e)}
                                        className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:bg-white"
                                    >
                                        <X className="size-4" />
                                    </button>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                                        <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">Change</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-3 p-4 text-center">
                                    <div className="text-gray-400">
                                        <ImagePlus strokeWidth={1.5} className="size-8" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">
                                        {index === 0 ? "Cover" : `Photo ${index + 1}`}
                                    </span>
                                </div>
                            )}
                        </label>
                        <input
                            type="file"
                            id={`photo-upload-${photo.id}`}
                            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                            className="hidden"
                            onChange={(e) => handleFileChange(photo.id, e)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
