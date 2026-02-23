"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, AlertCircle, Play, Film, Info } from "lucide-react";
import { toast } from "sonner";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface UploadVideoStepProps {
    video: string | null;
    onVideoChange: (video: string | null, file?: File | null) => void;
    isUploading?: boolean;
    progress?: number;
    error?: string | null;
}

// Constants for validation
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_DURATION_SECONDS = 60;
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime', 'video/x-m4v'];
const ALLOWED_EXTENSIONS = ['MP4', 'MOV', 'M4V'];

export default function UploadVideoStep({ video, onVideoChange, isUploading = false, progress = 0, error: uploadError = null }: UploadVideoStepProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [isValidating, setIsValidating] = useState(false);

    const validateFile = (file: File): Promise<string | null> => {
        return new Promise((resolve) => {
            // Check file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                resolve(`Invalid format. Please upload ${ALLOWED_EXTENSIONS.join(' or ')} files only.`);
                return;
            }

            // Check file size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                resolve(`File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`);
                return;
            }

            // Check video duration
            const videoElement = document.createElement('video');
            videoElement.preload = 'metadata';
            videoElement.src = URL.createObjectURL(file);

            videoElement.onloadedmetadata = () => {
                URL.revokeObjectURL(videoElement.src);
                if (videoElement.duration > MAX_DURATION_SECONDS) {
                    resolve(`Video too long. Maximum duration is ${MAX_DURATION_SECONDS} seconds. Your video is ${Math.round(videoElement.duration)} seconds.`);
                } else {
                    resolve(null); // Valid
                }
            };

            videoElement.onerror = () => {
                URL.revokeObjectURL(videoElement.src);
                resolve("Could not read video file. Please try a different file.");
            };
        });
    };

    const processFile = async (file: File) => {
        setIsValidating(true);
        setError(null);

        try {
            const validationError = await validateFile(file);
            if (validationError) {
                setError(validationError);
                toast.error(validationError);
                if (inputRef.current) inputRef.current.value = "";
                return;
            }

            const url = URL.createObjectURL(file);
            onVideoChange(url, file);
            toast.success("Video uploaded successfully!");
        } catch (err) {
            setError("Failed to process video file.");
            toast.error("Failed to process video file.");
        } finally {
            setIsValidating(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRemove = () => {
        onVideoChange(null, null);
        setError(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1200px]">
            <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Upload Video</h2>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full text-gray-400 hover:text-[#E87A3F]">
                            <Info className="h-4 w-4" />
                            <span className="sr-only">Video Guidelines</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" align="start">
                        <div className="space-y-3">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <Film className="size-4 text-[#E87A3F]" /> Video Guidelines
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                    Accepted formats: {ALLOWED_EXTENSIONS.join(', ')}
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                    Maximum duration: {MAX_DURATION_SECONDS} seconds
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                    Maximum file size: {MAX_FILE_SIZE_MB}MB
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                    Show your product from multiple angles
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="mt-1 block h-1.5 w-1.5 rounded-full bg-[#E87A3F]" />
                                    Good lighting makes a big difference!
                                </li>
                            </ul>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
            <p className="mt-1 text-sm text-gray-500 mb-6">
                Add a video to showcase your product (optional)
            </p>

            {/* Error message */}
            {(error || uploadError) && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 border border-red-100 p-3 text-sm text-red-700">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{error || uploadError}</span>
                </div>
            )}

            {/* Dashed Area */}
            <div
                className={`flex h-[320px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all ${isValidating || isUploading
                    ? "border-orange-300 bg-orange-50/50"
                    : "border-gray-200 bg-white hover:bg-gray-50 hover:border-orange-200"
                    }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                {isValidating ? (
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="animate-spin size-12 border-4 border-gray-200 border-t-[#E87A3F] rounded-full mb-4" />
                        <p className="text-sm font-medium text-gray-600">Validating video...</p>
                    </div>
                ) : isUploading ? (
                    <div className="flex flex-col items-center justify-center text-center px-10 w-full max-w-md">
                        <div className="relative size-20 mb-6">
                            <svg className="size-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-200" strokeWidth="3" />
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-[#E87A3F] transition-all duration-300"
                                    strokeWidth="3"
                                    strokeDasharray={`${progress}, 100`}
                                    strokeDashoffset="0"
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-[#E87A3F]">{progress}%</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Uploading...</h3>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                            <div
                                className="bg-[#E87A3F] h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 animate-pulse">Large videos may take a moment. Don't close the window.</p>
                    </div>
                ) : video ? (
                    <div className="relative h-full w-full p-4">
                        {/* Status Overlay */}
                        {progress === 100 && !isUploading && (
                            <div className="absolute top-8 left-8 z-10 bg-green-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-green-600">
                                <div className="size-1.5 bg-white rounded-full animate-pulse" />
                                VIDEO READY
                            </div>
                        )}
                        <video
                            src={video}
                            controls
                            playsInline
                            preload="metadata"
                            className="h-full w-full rounded-2xl object-cover bg-black"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-6 right-6 flex size-8 items-center justify-center rounded-full bg-white text-gray-500 shadow-md hover:text-red-500 hover:bg-red-50 transition-colors z-20"
                        >
                            <X className="size-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center text-center px-4">
                        <div className="flex size-16 items-center justify-center rounded-full bg-orange-50 mb-4">
                            <UploadCloud className="size-8 text-[#E87A3F]" />
                        </div>
                        <h3 className="mb-2 text-lg font-bold text-gray-900">
                            Upload Video of the Product
                        </h3>
                        <p className="mb-1 text-sm text-gray-500">
                            Drag and drop or click to upload
                        </p>
                        <p className="mb-6 text-xs text-gray-400">
                            {ALLOWED_EXTENSIONS.join(', ')} • Max {MAX_DURATION_SECONDS}s • Max {MAX_FILE_SIZE_MB}MB
                        </p>

                        <button
                            onClick={() => inputRef.current?.click()}
                            className="h-[46px] rounded-[50px] bg-[#FEF3EC] px-8 text-sm font-semibold text-[#E87A3F] hover:bg-[#fdebdc] transition-colors flex items-center gap-2"
                        >
                            <Play className="size-4" />
                            Choose Video
                        </button>
                        <input
                            type="file"
                            ref={inputRef}
                            accept=".mp4,.mov,.m4v,video/mp4,video/quicktime,video/x-m4v"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
