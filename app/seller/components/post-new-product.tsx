"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddProductStepper from "./add-product-stepper";
import UploadPhotosStep from "./upload-photos-step";
import AboutProductStep from "./about-product-step";
import ProductDetailsStep from "./product-details-step";
import UploadVideoStep from "./upload-video-step";
import { Button } from "@/components/ui/button";
import { ProductData, initialProductData } from "./types";

interface PostNewProductProps {
    onShowPaymentModal: () => void;
}

export default function PostNewProduct({ onShowPaymentModal }: PostNewProductProps) {
    const router = useRouter();
    // Add product stepper state
    const [addProductStep, setAddProductStep] = useState(1);
    const [productData, setProductData] = useState<ProductData>(initialProductData);

    const updateProductData = (updates: Partial<ProductData>) => {
        setProductData((prev) => ({ ...prev, ...updates }));
    };

    const addProductSteps = [
        { number: 1, label: "Upload Photos" },
        { number: 2, label: "About Product" },
        { number: 3, label: "Product Details" },
        { number: 4, label: "Upload Video" },
    ];

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Helper to upload a single file
    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "x-filename": file.name,
                    "content-type": file.type,
                },
                body: file,
            });
            if (!res.ok) throw new Error("Upload failed");
            const data = await res.json();
            return data.url;
        } catch (error) {
            console.error("File upload error:", error);
            return null;
        }
    };

    const handleNext = async () => {
        if (addProductStep < addProductSteps.length) {
            setAddProductStep(addProductStep + 1);
        } else {
            // Final step - submit product
            setIsSubmitting(true);
            try {
                // 1. Upload Photos
                const uploadedImages = await Promise.all(
                    productData.photos
                        .filter(p => p.image !== null) // Only consider slots with images
                        .map(async (p, index) => {
                            let url = p.image;
                            // If there is a new file, upload it
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

                // 2. Upload Video
                let videoUrl = productData.video;
                if (productData.videoFile) {
                    const uploadedVideo = await uploadFile(productData.videoFile);
                    if (uploadedVideo) videoUrl = uploadedVideo;
                }

                // 3. Prepare Payload
                const { photos, videoFile, ...cleanProductData } = productData;

                const payload = {
                    ...cleanProductData,
                    images: uploadedImages,
                    video: videoUrl,

                    // API expects 'dress' field which it maps to subCategory
                };

                // 4. Submit to Backend
                const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    throw new Error("Failed to create product");
                }

                const createdProduct = await res.json();
                console.log("Product created:", createdProduct);

                // 5. Success
                router.push("/profile");

            } catch (error) {
                console.error("Submission error:", error);
                alert("Failed to create product. Please try again.");
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (addProductStep > 1) {
            setAddProductStep(addProductStep - 1);
        }
    };

    return (
        <main className="mx-auto w-full flex-1 bg-white">
            <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Header Section */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="mb-1 text-xl font-bold text-gray-900 sm:mb-2 sm:text-3xl">
                        Add a new product
                    </h1>
                    <p className="text-xs text-gray-400 sm:text-base">
                        Share clear info about your product to help it sell faster.
                    </p>
                </div>

                {/* Stepper */}
                <div className="mb-8 sm:mb-12">
                    <AddProductStepper currentStep={addProductStep} steps={addProductSteps} />
                </div>

                {/* Step Content */}
                <div className="min-h-[350px] sm:min-h-[400px]">
                    {addProductStep === 1 && (
                        <UploadPhotosStep
                            photos={productData.photos}
                            onPhotosChange={(photos) => updateProductData({ photos })}
                        />
                    )}
                    {addProductStep === 2 && (
                        <AboutProductStep
                            data={productData}
                            onUpdate={updateProductData}
                        />
                    )}
                    {addProductStep === 3 && (
                        <ProductDetailsStep
                            data={productData}
                            onUpdate={updateProductData}
                        />
                    )}
                    {addProductStep === 4 && (
                        <UploadVideoStep
                            video={productData.video}
                            onVideoChange={(video) => updateProductData({ video })}
                        />
                    )}
                </div>

                {/* Navigation Buttons */}
                <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
                    <Button
                        variant="ghost"
                        onClick={handleBack}
                        disabled={addProductStep === 1}
                        className={`h-[48px] sm:h-[52px] w-full sm:min-w-[140px] sm:w-auto rounded-[50px] text-sm sm:text-base font-semibold transition-colors ${addProductStep === 1
                            ? "hidden"
                            : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700 shadow-sm border border-gray-100"
                            }`}
                    >
                        Go Back
                    </Button>

                    <Button
                        onClick={handleNext}
                        className="h-[48px] sm:h-[52px] w-full sm:min-w-[140px] sm:w-auto rounded-[50px] bg-[#E87A3F] text-sm sm:text-base font-semibold text-white hover:bg-[#d96d34]"
                    >
                        {addProductStep === 4 ? (isSubmitting ? "Uploading..." : "Upload Product") : "Next"}
                    </Button>
                </div>
            </div>
        </main>
    );
}
