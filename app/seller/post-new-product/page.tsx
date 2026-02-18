"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import BecomeSellerCTA from "@/components/become-seller-cta";
import AddProductStepper from "../components/add-product-stepper";
import UploadPhotosStep from "../components/upload-photos-step";
import AboutProductStep from "../components/about-product-step";
import ProductDetailsStep from "../components/product-details-step";
import UploadVideoStep from "../components/upload-video-step";
import { Button } from "@/components/ui/button";
import { StatefulButton } from "@/components/ui/StatefulButton";
import { ProductData, initialProductData, PhotoSlot } from "../components/types";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { Loader2 } from "lucide-react";
import { FormSkeleton } from "@/components/ui/skeletons";
import { useAuth } from "@/hooks/useAuth";
import { useProductPersistence } from "@/hooks/useProductPersistence";
import { step1Schema, step2Schema, step3Schema, step4Schema } from "./schemas";
import { toast } from "sonner";

export default function PostNewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth(); // Auth needed for session

    // Check if editing existing product
    const editProductId = searchParams?.get("edit");
    const isEditMode = !!editProductId;

    const [addProductStep, setAddProductStep] = useState(1);
    const [productData, setProductData] = useState<ProductData>(initialProductData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);

    // Ref to prevent double-submit
    const isSubmittingRef = useRef(false);

    // Seller authentication check
    const { isSeller, isLoading: isAuthLoading } = useSellerAuth();

    // Fetch product data if in edit mode
    useEffect(() => {
        async function fetchProduct() {
            if (!editProductId) return;

            try {
                setIsLoadingProduct(true);
                const res = await fetch(`/api/products/${editProductId}`);

                if (res.ok) {
                    const product = await res.json();

                    // Map product data to form format
                    const photos = product.images?.map((img: any, index: number) => ({
                        id: index + 1,
                        label: img.alt || `Photo ${index + 1}`,
                        image: img.url,
                        file: null,
                    })) || [];

                    // Fill in empty photo slots
                    while (photos.length < 6) {
                        photos.push({
                            id: photos.length + 1,
                            label: `Back${photos.length > 3 ? ' 2' : ''}`,
                            image: null,
                            file: null,
                        });
                    }

                    setProductData({
                        photos,
                        name: product.name || "",
                        title: product.name || "",
                        category: product.category || "",
                        condition: product.condition || "",
                        occasion: product.occasion || "",
                        gender: product.gender || "",
                        size: product.size || "",
                        color: product.color || "",
                        fabric: product.fabric || "",
                        brand: product.brand || "",
                        price: product.price || 0,
                        comparePrice: product.comparePrice || 0,
                        description: product.description || "",
                        tags: product.tags || "",
                        dress: product.dress || "",
                        video: product.video || null,
                        videoFile: null,
                    });
                } else {
                    toast.error("Failed to load product");
                    router.push("/seller/manage-listings");
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                toast.error("Failed to load product");
            } finally {
                setIsLoadingProduct(false);
            }
        }

        fetchProduct();
    }, [editProductId]);

    // Show BecomeSellerCTA if user is not a seller
    if (!isAuthLoading && !isSeller) {
        return (
            <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
                <EcommerceHeader />
                <BecomeSellerCTA />
                <FooterSection />
            </div>
        );
    }

    const updateProductData = (updates: Partial<ProductData>) => {
        setProductData((prev) => ({ ...prev, ...updates }));
    };

    // Scroll to top on step change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [addProductStep]);

    // Generate/Manage Draft ID
    const draftIdParam = searchParams?.get("draftId");
    const [draftId, setDraftId] = useState(draftIdParam);

    useEffect(() => {
        if (!searchParams) return;

        if (!isEditMode && !draftIdParam) {
            const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            setDraftId(newId);
            const params = new URLSearchParams(searchParams.toString());
            params.set("draftId", newId);
            router.replace(`?${params.toString()}`);
        } else if (draftIdParam && draftIdParam !== draftId) {
            setDraftId(draftIdParam);
        }
    }, [isEditMode, draftIdParam, router, searchParams]);

    // Construct Storage Key
    const storageKey = isEditMode
        ? `product_edit_${editProductId}`
        : draftId
            ? `product_draft_${draftId}`
            : "";

    // Persistence Hook
    const { clearPersistence } = useProductPersistence(
        storageKey,
        productData,
        addProductStep,
        (loadedData, loadedStep) => {
            if (!isEditMode && storageKey) {
                setProductData(loadedData);
                setAddProductStep(loadedStep);
                console.log('Restored form state from IDB', storageKey);
            }
        }
    );

    const addProductSteps = [
        { number: 1, label: "Upload Photos" },
        { number: 2, label: "About Product" },
        { number: 3, label: "Product Details" },
        { number: 4, label: "Upload Video" },
    ];

    // --- UPLOAD LOGIC (Optimistic & Binary Streaming) ---

    const uploadFileBinary = async (file: File): Promise<string> => {
        // Binary Upload Pattern: Direct stream, no FormData overhead
        const headers: HeadersInit = {
            // Let browser set Content-Type for binary? 
            // Actually, explicitly setting it is better for our API check
            "Content-Type": file.type || "application/octet-stream",
            "X-Filename": file.name.replace(/\s+/g, '-'),
        };

        const res = await fetch("/api/upload", {
            method: "POST",
            headers,
            body: file // Direct binary
        });

        if (!res.ok) {
            const errorText = await res.text().catch(() => "Unknown error");
            throw new Error(`Upload failed: ${res.status} (${errorText})`);
        }

        const data = await res.json();
        return data.url;
    };

    const handlePhotosChange = async (updatedPhotos: PhotoSlot[]) => {
        // 1. Update state immediately (Optimistic Preview)
        setProductData(prev => ({ ...prev, photos: updatedPhotos }));

        // 2. Identify and Trigger Uploads
        const processingPhotos = updatedPhotos.map(async (photo) => {
            // If it has a file, NO url, and NOT already uploading/error -> Start Upload
            if (photo.file && !photo.uploadUrl && !photo.isUploading && !photo.uploadError) {
                // Set uploading state
                setProductData(prev => ({
                    ...prev,
                    photos: prev.photos.map(p => p.id === photo.id ? { ...p, isUploading: true } : p)
                }));

                try {
                    const url = await uploadFileBinary(photo.file);

                    // Success Update
                    setProductData(prev => ({
                        ...prev,
                        photos: prev.photos.map(p => p.id === photo.id ? {
                            ...p,
                            isUploading: false,
                            uploadUrl: url
                        } : p)
                    }));
                } catch (error: any) {
                    console.error("Photo upload error:", error);
                    // Error Update
                    setProductData(prev => ({
                        ...prev,
                        photos: prev.photos.map(p => p.id === photo.id ? {
                            ...p,
                            isUploading: false,
                            uploadError: "Failed"
                        } : p)
                    }));
                    toast.error(`Failed to upload ${photo.label}`);
                }
            }
        });

        // We don't await Promise.all here inside the handler to avoid blocking UI
        // The individual async tasks will update state as they finish
    };

    const handleVideoChange = async (video: string | null) => {
        // This is called when video is REMOVED
        if (video === null) {
            updateProductData({ video: null, videoFile: null });
            return;
        }
        // If it's a string update from input? (Usually this is file upload)
    };

    // Custom wrapper if we want to support video file selection similar to photos
    // But currently UploadVideoStep might just pass the URL or file?
    // Let's assume standard update pattern for now, but hook into VideoFile change if needed.

    // --- VALIDATION & NAVIGATION ---

    const handleNext = async () => {
        if (addProductStep < addProductSteps.length) {
            let isValid = false;
            let schema;

            // Select Schema
            switch (addProductStep) {
                case 1: schema = step1Schema; break;
                case 2: schema = step2Schema; break;
                case 3: schema = step3Schema; break;
            }

            if (schema) {
                const result = schema.safeParse(productData);
                if (!result.success) {
                    const firstError = result.error.errors[0];
                    toast.error(firstError.message);
                    return;
                }
                isValid = true;
            }

            // Step 1 Specific: Check for pending/failed uploads
            if (addProductStep === 1) {
                const hasPending = productData.photos.some(p => p.isUploading);
                if (hasPending) {
                    toast.info("Please wait for images to finish uploading.");
                    return;
                }
            }

            if (isValid) {
                setAddProductStep(addProductStep + 1);
            }
        } else {
            // SUBMIT STEP (4)
            if (isSubmittingRef.current) return;

            // Final Validation
            const pendingUploads = productData.photos.some(p => p.isUploading);
            if (pendingUploads) {
                toast.info("Uploads are still in progress. Please wait.");
                return;
            }

            // Prepare Payload
            // Filter photos: Must have a URL (either uploadUrl or existing image)
            const validPhotos = productData.photos.filter(p => !p.uploadError && (p.uploadUrl || p.image || p.file));

            if (validPhotos.length === 0) {
                toast.error("Please upload at least one valid photo.");
                return;
            }

            isSubmittingRef.current = true;
            setIsSubmitting(true);

            try {
                // Prepare final image list
                const finalImages = validPhotos.map((p, index) => {
                    // Critical: Prefer uploadUrl (new), fallback to image (edit mode existing), fallback to error
                    const url = p.uploadUrl || p.image;
                    if (!url || url.startsWith('blob:')) {
                        throw new Error(`Image ${index + 1} is not uploaded. Please retry.`);
                    }
                    return {
                        url: url,
                        alt: p.label,
                        order: index,
                        isPrimary: index === 0
                    };
                });

                // Video Logic (if needed) - Assuming similar optimistic pattern or direct
                let videoUrl = productData.video;
                // If video file exists but no URL, we might need to handle it.
                // For now, assuming video implementation hooks into similar logic or is optional.

                // Payload
                const { photos, videoFile, ...cleanProductData } = productData;
                const finalPrice = parseFloat(String(cleanProductData.price));
                const finalComparePrice = cleanProductData.comparePrice ? parseFloat(String(cleanProductData.comparePrice)) : undefined;

                const payload = {
                    ...cleanProductData,
                    price: finalPrice,
                    images: finalImages,
                    video: videoUrl,
                    comparePrice: (finalComparePrice && !isNaN(finalComparePrice)) ? finalComparePrice : undefined,
                    dressStyleId: cleanProductData.dressStyleId || undefined,
                };

                const url = isEditMode ? `/api/products/${editProductId}` : "/api/products";
                const method = isEditMode ? "PUT" : "POST";

                const res = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) {
                    const text = await res.text();
                    let errorData: any = {};
                    try { errorData = JSON.parse(text); } catch (e) { }
                    const errorMessage = errorData.error || (isEditMode ? "Failed to update" : "Failed to create");
                    throw new Error(errorMessage);
                }

                toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
                clearPersistence();
                router.push("/seller/manage-listings");

            } catch (error: any) {
                console.error("Submission error:", error);
                toast.error(error.message);
            } finally {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => {
        if (addProductStep > 1) {
            setAddProductStep(addProductStep - 1);
        }
    };

    if (isLoadingProduct) {
        return (
            <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
                <EcommerceHeader />
                <FormSkeleton />
                <FooterSection />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans sm:mt-[-6rem] mt-[-4.2rem]">
            <EcommerceHeader />

            <main className="mx-auto w-full flex-1 bg-white pt-20 sm:pt-24">
                <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <div className="mb-6 sm:mb-8 scroll-mt-24">
                        <h1 className="mb-1 text-xl font-bold text-gray-900 sm:mb-2 sm:text-3xl">
                            {isEditMode ? "Edit product" : "Add a new product"}
                        </h1>
                        <p className="text-xs text-gray-400 sm:text-base">
                            {isEditMode ? "Update your product details." : "Share info about your product."}
                        </p>
                    </div>

                    <div className="mb-8 sm:mb-12">
                        <AddProductStepper currentStep={addProductStep} steps={addProductSteps} />
                    </div>

                    <div className="min-h-[350px] sm:min-h-[400px]">
                        {addProductStep === 1 && (
                            <UploadPhotosStep
                                photos={productData.photos}
                                onPhotosChange={handlePhotosChange} // OPTIMISTIC HANDLER
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

                    {/* Step 1 Validation state for button */}
                    {addProductStep === 1 && !productData.photos.some(p => p.image || p.uploadUrl) && (
                        <p className="mt-4 text-center text-sm text-orange-600 font-medium animate-in fade-in slide-in-from-top-2">
                            Please upload at least one image to proceed.
                        </p>
                    )}

                    <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={addProductStep === 1}
                            className={`h-[48px] sm:h-[52px] w-full sm:min-w-[140px] sm:w-auto rounded-[50px] text-sm sm:text-base font-semibold transition-colors ${addProductStep === 1 ? "hidden" : "bg-white text-gray-500 hover:bg-gray-50 shadow-sm border border-gray-100"}`}
                        >
                            Go Back
                        </Button>

                        <StatefulButton
                            onClick={handleNext}
                            isLoading={isSubmitting}
                            disabled={addProductStep === 1 && (!productData.photos.some(p => p.image || p.uploadUrl) || productData.photos.some(p => p.isUploading))}
                            loadingText={isEditMode ? "Saving..." : "Creating..."}
                            className="h-[48px] sm:h-[52px] w-full sm:min-w-[140px] sm:w-auto rounded-[50px] text-sm sm:text-base font-semibold text-white bg-[#E87A3F] hover:bg-[#d96d34] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {addProductStep === 4 ? (isEditMode ? "Save Changes" : "Create Product") : "Next"}
                        </StatefulButton>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}
