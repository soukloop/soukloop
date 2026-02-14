
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ProductData, initialProductData } from "@/app/seller/components/types";
import AboutProductStep from "@/app/seller/components/about-product-step";
import ProductDetailsStep from "@/app/seller/components/product-details-step";
import UploadPhotosStep from "@/app/seller/components/upload-photos-step";
import UploadVideoStep from "@/app/seller/components/upload-video-step";

interface EditProductModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: any;
    onSuccess?: () => void;
}

export function EditProductModal({ open, onOpenChange, product, onSuccess }: EditProductModalProps) {
    const [submitting, setSubmitting] = useState(false);

    // Initialize state from props... 
    // This part is a bit tricky because the modal is remounted or we need useEffect
    // But since we are separating it, we can use a key or useEffect.

    const [productData, setProductData] = useState<ProductData>(() => createInitialData(product));

    function createInitialData(product: any): ProductData {
        const mappedPhotos = initialProductData.photos.map((slot, index) => {
            // Logic from original page
            const exists = product.images?.find((img: any) => img.order === index) || (index < (product.images?.length || 0) ? product.images[index] : null);
            return { ...slot, image: exists ? exists.url : null };
        });

        return {
            ...initialProductData,
            photos: mappedPhotos,
            name: product.name || "",
            price: product.price || 0,
            comparePrice: product.comparePrice || 0,
            description: product.description || "",
            category: product.category || "",
            size: product.size || "",
            tags: product.tags || "",
            brand: product.brand || "",
            color: product.color || "",
            condition: product.condition || "",
            gender: product.gender || "",
            fabric: product.fabric || "",
            dress: product.dressStyle?.name || product.dress || "",
            dressStyleId: product.dressStyleId || product.dressStyle?.id || "",
            occasion: product.occasion || "",
            video: product.video || null,
            hasPendingStyle: product.hasPendingStyle || false,
        };
    }

    const updateProductData = (updates: Partial<ProductData>) => {
        setProductData((prev) => ({ ...prev, ...updates }));
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            return data.url;
        } catch (error) {
            console.error("File upload error:", error);
            return null;
        }
    };

    const handleEditSave = async () => {
        setSubmitting(true);
        try {
            // Include image processing logic here (same as original)
            // 1. Process Images
            const uploadedImages = await Promise.all(
                productData.photos
                    .filter(p => p.image !== null)
                    .map(async (p, index) => {
                        let url = p.image;
                        if (p.file) {
                            const uploadedUrl = await uploadFile(p.file);
                            if (uploadedUrl) url = uploadedUrl;
                        }
                        return {
                            url: url,
                            alt: p.label,
                            order: index,
                            isPrimary: index === 0
                        };
                    })
            );

            // 2. Process Video
            let videoUrl = productData.video;
            if (productData.videoFile) {
                const uploadedVideo = await uploadFile(productData.videoFile);
                if (uploadedVideo) videoUrl = uploadedVideo;
            }

            // 3. Prepare Payload
            const { photos, videoFile, ...cleanData } = productData;

            const payload = {
                ...cleanData,
                images: uploadedImages,
                video: videoUrl
            };

            const res = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to update');

            toast.success('Product updated successfully');
            onOpenChange(false);
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update product details');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                <DialogHeader>
                    <DialogTitle>Edit Product Details</DialogTitle>
                    <DialogDescription>
                        Update product information including images, video, and attributes.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-2 space-y-8">
                    {/* Step 1: Photos */}
                    <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Media</h3>
                        <div className="space-y-8">
                            <UploadPhotosStep
                                photos={productData.photos}
                                onPhotosChange={(updatedPhotos) => updateProductData({ photos: updatedPhotos })}
                            />
                            <UploadVideoStep
                                video={productData.video}
                                onVideoChange={(url, file) => updateProductData({ video: url, videoFile: file })}
                            />
                        </div>
                    </div>

                    {/* Step 2: About */}
                    <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Basic Info</h3>
                        <AboutProductStep
                            data={productData}
                            onUpdate={updateProductData}
                        />
                    </div>

                    {/* Step 3: Details */}
                    <div className="rounded-xl border border-gray-100 p-4 bg-gray-50/50">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Attributes</h3>
                        <ProductDetailsStep
                            data={productData}
                            onUpdate={updateProductData}
                        />
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleEditSave} disabled={submitting} className="bg-[#E87A3F] hover:bg-[#d96d34]">
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
