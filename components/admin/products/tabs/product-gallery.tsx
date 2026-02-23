
"use client";

import { useState } from "react";
import { Play, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProductGalleryProps {
    images: string[];
    video?: string | null;
    productName: string;
}

export default function ProductGallery({ images = [], video, productName }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isVideoSelected, setIsVideoSelected] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [zoomStyle, setZoomStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { currentTarget: target } = e;
        const rect = target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        setZoomStyle({
            transformOrigin: `${xPercent}% ${yPercent}%`,
            transform: 'scale(2.5)',
            transition: 'transform 0.1s ease-out',
        });
    };

    const handleMouseLeave = () => setZoomStyle({});

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image/Video */}
            <div
                className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-50 shadow-sm border border-gray-100 cursor-zoom-in"
                onMouseMove={!isVideoSelected ? handleMouseMove : undefined}
                onMouseLeave={!isVideoSelected ? handleMouseLeave : undefined}
                onClick={() => !isVideoSelected && setIsLightboxOpen(true)}
            >
                {isVideoSelected && video ? (
                    <video
                        src={video}
                        controls
                        poster={images?.[0] || "/images/placeholder.png"}
                        className="h-full w-full object-contain bg-black"
                        playsInline
                        preload="metadata"
                    />
                ) : (
                    <Image
                        src={images && images.length > 0
                            ? images[selectedImage]
                            : "/images/placeholder.png"}
                        alt={productName}
                        fill
                        className="object-contain transition-transform duration-200 ease-out"
                        style={zoomStyle}
                        sizes="(max-width: 768px) 100vw, 800px"
                        priority
                    />
                )}

                {/* Zoom/Lightbox Hint */}
                {!isVideoSelected && (
                    <div className="absolute bottom-4 right-4 rounded-full bg-black/20 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] font-bold text-white uppercase tracking-wider">Click to Zoom</p>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img: string, index: number) => (
                    <button
                        key={index}
                        onClick={() => {
                            setSelectedImage(index);
                            setIsVideoSelected(false);
                        }}
                        className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${!isVideoSelected && index === selectedImage
                            ? "border-[#E87A3F] scale-95 shadow-inner"
                            : "border-transparent hover:border-gray-200"
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    </button>
                ))}

                {video && (
                    <button
                        onClick={() => setIsVideoSelected(true)}
                        className={`relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${isVideoSelected
                            ? "border-[#E87A3F] scale-95 shadow-inner"
                            : "border-transparent hover:border-gray-200 bg-gray-100"
                            }`}
                    >
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="rounded-full bg-white/90 p-1.5 shadow-md">
                                <Play className="h-4 w-4 text-[#E87A3F] fill-current" />
                            </div>
                        </div>
                        {images?.[0] ? (
                            <Image
                                src={images[0]}
                                fill
                                className="object-cover opacity-80"
                                alt="Video thumbnail"
                                sizes="80px"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200">
                                <Video className="h-8 w-8 text-gray-400" />
                            </div>
                        )}
                    </button>
                )}
            </div>

            <div className="h-px bg-gray-100 w-full mt-2"></div>

            {/* LIGHTBOX */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 transition-opacity cursor-zoom-out"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-6 top-6 size-12 rounded-full bg-white/10 text-white hover:bg-white/20 z-10"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLightboxOpen(false);
                        }}
                    >
                        <X className="size-8" />
                    </Button>

                    {/* Lightbox Content */}
                    <div className="relative h-[90vh] w-[90vw]">
                        <Image
                            src={images[selectedImage]}
                            alt="Lightbox"
                            fill
                            className="object-contain"
                            sizes="90vw"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
