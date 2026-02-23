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
import { FormSkeleton } from "@/components/ui/skeletons";
import { useAuth } from "@/hooks/useAuth";
import { useProductPersistence } from "@/hooks/useProductPersistence";
import { step1Schema, step2Schema, step3Schema } from "./schemas";
import { toast } from "sonner";

export default function PostNewProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const editProductId = searchParams?.get("edit");
    const isEditMode = !!editProductId;

    const [addProductStep, setAddProductStep] = useState(1);
    const [productData, setProductData] = useState<ProductData>(initialProductData);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingProduct, setIsLoadingProduct] = useState(false);

    const isSubmittingRef = useRef(false);
    const { isSeller, isLoading: isAuthLoading } = useSellerAuth();

    useEffect(() => {
        async function fetchProduct() {
            if (!editProductId) return;
            try {
                setIsLoadingProduct(true);
                const res = await fetch(`/api/products/${editProductId}?mode=edit`);
                if (res.ok) {
                    // Map product data to form format
                    const product = await res.json();
                    const photos = product.images?.map((img: any, index: number) => ({
                        id: String(index + 1),
                        label: img.alt || `Photo ${index + 1}`,
                        image: img.url,
                        file: null,
                    })) || [];

                    // Fill in empty photo slots
                    while (photos.length < 10) {
                        photos.push({
                            id: String(photos.length + 1),
                            label: photos.length === 0 ? "Add a photo" : `Photo ${photos.length + 1}`,
                            image: null,
                            file: null,
                        });
                    }

                    setProductData({
                        photos,
                        name: product.name || "",
                        title: product.name || "",
                        category: product.category || "",
                        categoryId: product.categoryId || "",
                        condition: product.condition || "",
                        occasion: product.occasion || "",
                        occasionId: product.occasionId || "",
                        gender: product.gender || "",
                        size: product.size || "",
                        color: product.color || "",
                        colorId: product.colorId || "",
                        fabric: product.fabric || "",
                        materialId: product.materialId || "",
                        brand: product.brand || "",
                        brandId: product.brandId || "",
                        price: product.price ? String(product.price) : "",
                        comparePrice: product.comparePrice ? String(product.comparePrice) : "",
                        description: product.description || "",
                        tags: product.tags || "",
                        dress: product.dress || "",
                        dressStyleId: product.dressStyleId || "",
                        hasPendingStyle: product.hasPendingStyle || false,
                        state: product.location || "",
                        video: product.video || null,
                        videoFile: null,
                        videoIsUploading: false,
                        videoUploadUrl: null,
                        videoUploadError: null,
                        videoUploadProgress: 0,
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
    }, [editProductId, router]);

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

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
        return () => clearTimeout(timeoutId);
    }, [addProductStep]);

    const draftIdParam = searchParams?.get("draftId");
    const [draftId, setDraftId] = useState(draftIdParam);

    useEffect(() => {
        if (!searchParams) return;
        if (!isEditMode && !draftIdParam) {
            const newId = crypto.randomUUID();
            setDraftId(newId);
            const params = new URLSearchParams(searchParams.toString());
            params.set("draftId", newId);
            router.replace(`?${params.toString()}`);
        } else if (draftIdParam && draftIdParam !== draftId) {
            setDraftId(draftIdParam);
        }
    }, [isEditMode, draftIdParam, router, searchParams]);

    const storageKey = isEditMode ? `product_edit_${editProductId}` : draftId ? `product_draft_${draftId}` : "";

    const { clearPersistence } = useProductPersistence(
        storageKey,
        productData,
        addProductStep,
        (loadedData, loadedStep) => {
            if (!isEditMode && storageKey) {
                setProductData(loadedData);
                setAddProductStep(loadedStep);
            }
        }
    );

    const addProductSteps = [
        { number: 1, label: "Upload Photos" },
        { number: 2, label: "About Product" },
        { number: 3, label: "Product Details" },
        { number: 4, label: "Upload Video" },
    ];

    const uploadFileBinary = async (file: File): Promise<string> => {
        const headers: HeadersInit = {
            "Content-Type": file.type || "application/octet-stream",
            "X-Filename": file.name.replace(/\s+/g, '-'),
        };
        const res = await fetch("/api/upload", { method: "POST", headers, body: file });
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const data = await res.json();
        return data.url;
    };

    const uploadVideoBinaryXHR = (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    updateProductData({ videoUploadProgress: progress });
                }
            });
            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.url);
                    } catch (e) {
                        reject(new Error("Invalid response"));
                    }
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });
            xhr.addEventListener("error", () => reject(new Error("Network error")));
            xhr.open("POST", "/api/upload");
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
            xhr.setRequestHeader("X-Filename", file.name.replace(/\s+/g, '-'));
            xhr.send(file);
        });
    };

    const handlePhotosChange = async (updatedPhotos: PhotoSlot[]) => {
        setProductData(prev => ({ ...prev, photos: updatedPhotos }));
        updatedPhotos.forEach(async (photo) => {
            if (photo.file && !photo.uploadUrl && !photo.isUploading && !photo.uploadError) {
                setProductData(prev => ({
                    ...prev,
                    photos: prev.photos.map(p => p.id === photo.id ? { ...p, isUploading: true } : p)
                }));
                try {
                    const url = await uploadFileBinary(photo.file);
                    setProductData(prev => ({
                        ...prev,
                        photos: prev.photos.map(p => p.id === photo.id ? { ...p, isUploading: false, uploadUrl: url } : p)
                    }));
                } catch (error) {
                    setProductData(prev => ({
                        ...prev,
                        photos: prev.photos.map(p => p.id === photo.id ? { ...p, isUploading: false, uploadError: "Failed" } : p)
                    }));
                }
            }
        });
    };

    const handleVideoChange = async (videoUrl: string | null, file?: File | null) => {
        if (videoUrl === null) {
            updateProductData({ video: null, videoFile: null, videoIsUploading: false, videoUploadUrl: null, videoUploadProgress: 0, videoUploadError: null });
            return;
        }
        updateProductData({ video: videoUrl, videoFile: file, videoIsUploading: true, videoUploadUrl: null, videoUploadProgress: 0, videoUploadError: null });
        if (file) {
            try {
                const url = await uploadVideoBinaryXHR(file);
                updateProductData({ videoIsUploading: false, videoUploadUrl: url, videoUploadProgress: 100 });
                toast.success("Video ready to post!");
            } catch (error) {
                updateProductData({ videoIsUploading: false, videoUploadError: "Failed" });
                toast.error("Video upload failed.");
            }
        }
    };

    const handleNext = async () => {
        if (addProductStep < addProductSteps.length) {
            let schema;
            switch (addProductStep) {
                case 1: schema = step1Schema; break;
                case 2: schema = step2Schema; break;
                case 3: schema = step3Schema; break;
            }
            if (schema) {
                const result = schema.safeParse(productData);
                if (!result.success) {
                    toast.error(result.error.errors[0].message);
                    return;
                }
            }
            if (addProductStep === 1 && productData.photos.some(p => p.isUploading)) {
                toast.info("Please wait for images to finish uploading.");
                return;
            }
            setAddProductStep(addProductStep + 1);
        } else {
            if (isSubmittingRef.current) return;
            if (productData.photos.some(p => p.isUploading)) {
                toast.info("Uploads in progress.");
                return;
            }
            const validPhotos = productData.photos.filter(p => !p.uploadError && (p.uploadUrl || p.image));
            if (validPhotos.length === 0) {
                toast.error("Upload at least one photo.");
                return;
            }
            isSubmittingRef.current = true;
            setIsSubmitting(true);
            try {
                const finalImages = validPhotos.map((p, index) => ({
                    url: p.uploadUrl || p.image!,
                    alt: p.label,
                    order: index,
                    isPrimary: index === 0
                }));

                let videoUrl = productData.videoUploadUrl || productData.video;
                if (videoUrl?.startsWith('blob:')) videoUrl = null;

                const { photos, videoFile, ...cleanProductData } = productData;
                const payload = {
                    ...cleanProductData,
                    price: parseFloat(String(cleanProductData.price)),
                    images: finalImages,
                    video: videoUrl,
                    comparePrice: cleanProductData.comparePrice ? parseFloat(String(cleanProductData.comparePrice)) : undefined,
                    dressStyleId: cleanProductData.dressStyleId || undefined,
                };

                const res = await fetch(isEditMode ? `/api/products/${editProductId}` : "/api/products", {
                    method: isEditMode ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });

                if (!res.ok) throw new Error("Submission failed");
                toast.success("Product saved!");
                clearPersistence();
                router.push("/seller/manage-listings");
            } catch (error: any) {
                toast.error(error.message);
            } finally {
                isSubmittingRef.current = false;
                setIsSubmitting(false);
            }
        }
    };

    const handleBack = () => addProductStep > 1 && setAddProductStep(addProductStep - 1);

    if (isLoadingProduct) return (
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col font-sans">
            <EcommerceHeader />
            <FormSkeleton />
            <FooterSection />
        </div>
    );

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
                        {addProductStep === 1 && <UploadPhotosStep photos={productData.photos} onPhotosChange={handlePhotosChange} />}
                        {addProductStep === 2 && <AboutProductStep data={productData} onUpdate={updateProductData} />}
                        {addProductStep === 3 && <ProductDetailsStep data={productData} onUpdate={updateProductData} />}
                        {addProductStep === 4 && (
                            <UploadVideoStep
                                video={productData.video}
                                isUploading={productData.videoIsUploading}
                                progress={productData.videoUploadProgress}
                                error={productData.videoUploadError}
                                onVideoChange={handleVideoChange}
                            />
                        )}
                    </div>
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
                            disabled={
                                (addProductStep === 1 && (!productData.photos.some(p => p.image || p.uploadUrl) || productData.photos.some(p => p.isUploading))) ||
                                (addProductStep === 4 && productData.videoIsUploading)
                            }
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
