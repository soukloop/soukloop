"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Image as ImageIcon, Search, X } from "lucide-react";
import { testimonialSchema, TestimonialFormValues } from "../schemas";
import { createTestimonial, updateTestimonial, searchProducts } from "../actions";
import LocationSelector from "@/components/ui/LocationSelector";

interface TestimonialModalProps {
    isOpen: boolean;
    onClose: () => void;
    testimonial?: any;
}

export function TestimonialModal({ isOpen, onClose, testimonial }: TestimonialModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingProfile, setIsUploadingProfile] = useState(false);
    const [isUploadingProduct, setIsUploadingProduct] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [productResults, setProductResults] = useState<any[]>([]);
    const [isSearchingProducts, setIsSearchingProducts] = useState(false);

    const profileInputRef = useRef<HTMLInputElement>(null);
    const productInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<TestimonialFormValues>({
        resolver: zodResolver(testimonialSchema),
        defaultValues: {
            name: "",
            location: "",
            rating: 5,
            text: "",
            profileImage: "",
            productImage: "",
            productId: "",
            isActive: true,
        },
    });

    useEffect(() => {
        if (testimonial) {
            form.reset({
                id: testimonial.id,
                name: testimonial.name,
                location: testimonial.location || "",
                rating: testimonial.rating,
                text: testimonial.text,
                profileImage: testimonial.profileImage || "",
                productImage: testimonial.productImage || "",
                productId: testimonial.productId || "",
                isActive: testimonial.isActive,
            });
        } else {
            form.reset({
                name: "",
                location: "",
                rating: 5,
                text: "",
                profileImage: "",
                productImage: "",
                productId: "",
                isActive: true,
            });
        }
    }, [testimonial, form, isOpen]);

    // Product Search Debounce
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (productSearch.length >= 2) {
                setIsSearchingProducts(true);
                const results = await searchProducts(productSearch);
                setProductResults(results);
                setIsSearchingProducts(false);
            } else {
                setProductResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [productSearch]);

    const onSubmit = async (values: TestimonialFormValues) => {
        setIsSubmitting(true);
        try {
            if (testimonial?.id) {
                values.id = testimonial.id;
                await updateTestimonial(values);
                toast.success("Testimonial updated successfully");
            } else {
                await createTestimonial(values);
                toast.success("Testimonial created successfully");
            }
            onClose();
        } catch (error) {
            toast.error("An error occurred");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profile' | 'product') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        const setIsUploading = type === 'profile' ? setIsUploadingProfile : setIsUploadingProduct;
        const fieldName = type === 'profile' ? 'profileImage' : 'productImage';

        setIsUploading(true);
        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "x-filename": file.name,
                    "content-type": file.type,
                },
                body: file,
            });

            if (!res.ok) {
                throw new Error("Upload failed");
            }

            const data = await res.json();
            form.setValue(fieldName, data.url);

            // If uploading product image, clear productId to avoid conflict/confusion? 
            // Or allow both but prioritize one? User said "either... or".
            // Let's clear the other to be clean.
            if (type === 'product') {
                form.setValue("productId", "");
            }

            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
            if (type === 'profile' && profileInputRef.current) profileInputRef.current.value = "";
            if (type === 'product' && productInputRef.current) productInputRef.current.value = "";
        }
    };

    const currentProductId = form.watch("productId");
    const currentProductImage = form.watch("productImage");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto border border-gray-100 bg-white p-6 shadow-xl rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {testimonial ? "Edit Testimonial" : "Create New Testimonial"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-6">

                            {/* Left Column: Profile Image Upload (Reduced Size) */}
                            <div className="space-y-2 flex flex-col items-center">
                                <div
                                    className="relative aspect-square rounded-full border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-orange-500 transition-colors w-24 h-24"
                                    onClick={() => profileInputRef.current?.click()}
                                >
                                    {form.watch("profileImage") ? (
                                        <img
                                            src={form.watch("profileImage") || ""}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400">
                                            <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                                            <span className="text-[10px] font-bold">Upload</span>
                                        </div>
                                    )}
                                    {isUploadingProfile && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                                            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={profileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e, 'profile')}
                                />
                                <p className="text-[10px] text-gray-400 text-center">Profile Photo</p>
                            </div>

                            {/* Right Column: Basic Info */}
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-semibold text-sm">Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} className="rounded-xl h-10" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="location"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-semibold text-sm">Location</FormLabel>
                                            <FormControl>
                                                <LocationSelector
                                                    type="state"
                                                    value={field.value || ""}
                                                    onChange={(val) => field.onChange(val)}
                                                    placeholder="Select State"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="rating"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-semibold text-sm">Rating</FormLabel>
                                            <FormControl>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => field.onChange(star)}
                                                            className={`focus:outline-none transition-transform hover:scale-110 ${field.value >= star ? "text-yellow-400" : "text-gray-300"}`}
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="currentColor"
                                                                className="w-8 h-8"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                                                                    clipRule="evenodd"
                                                                />
                                                            </svg>
                                                        </button>
                                                    ))}
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-gray-900 font-semibold text-sm">Review Text</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write the review..."
                                            className="resize-none rounded-xl text-sm"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Product Link Section */}
                        <div className="space-y-4 border-t border-gray-100 pt-4">
                            <div className="flex flex-col gap-1">
                                <FormLabel className="text-gray-900 font-semibold text-sm">Associated Product</FormLabel>
                                <p className="text-xs text-gray-500">You must either link a product or upload a product image.</p>
                            </div>

                            {/* Manual Error Message Display for productId (which holds the custom validation error) */}
                            {form.formState.errors.productId && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                                    <X className="w-4 h-4" />
                                    {form.formState.errors.productId.message}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Search Product */}
                                <div className="space-y-2">
                                    <span className="text-xs text-gray-500 font-medium">Link Existing Product (Auto-fetches image)</span>
                                    {currentProductId ? (
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                                            <span className="text-sm font-medium text-gray-700 truncate">Product Linked (ID: {currentProductId.slice(0, 8)}...)</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => form.setValue("productId", null)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0 rounded-full"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Search by name..."
                                                value={productSearch}
                                                onChange={(e) => setProductSearch(e.target.value)}
                                                disabled={!!currentProductImage} // Disable if custom image is uploaded
                                                className="pl-9 rounded-xl h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                            />
                                            {productResults.length > 0 && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {productResults.map(product => (
                                                        <div
                                                            key={product.id}
                                                            className="p-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                                                            onClick={() => {
                                                                form.setValue("productId", product.id);
                                                                form.setValue("productImage", null); // Clear custom image
                                                                setProductSearch("");
                                                                setProductResults([]);
                                                            }}
                                                        >
                                                            <div className="h-8 w-8 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                                                {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-cover" />}
                                                            </div>
                                                            <span className="text-sm text-gray-700 truncate">{product.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {isSearchingProducts && (
                                                <div className="absolute right-3 top-3">
                                                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Custom Product Image Upload */}
                                <div className="space-y-2">
                                    <span className="text-xs text-gray-500 font-medium">Or Upload Custom Product Image</span>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`relative h-10 w-10 shrink-0 rounded-lg border border-dashed border-gray-200 bg-gray-50 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors ${currentProductId ? 'opacity-50 pointer-events-none' : ''}`}
                                            onClick={() => !currentProductId && productInputRef.current?.click()}
                                        >
                                            {currentProductImage ? (
                                                <img
                                                    src={currentProductImage}
                                                    alt="Product"
                                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                                />
                                            ) : (
                                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                            )}
                                            {isUploadingProduct && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-lg">
                                                    <Loader2 className="w-3 h-3 text-orange-500 animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            ref={productInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileUpload(e, 'product')}
                                        />

                                        <div className="flex flex-col">
                                            {currentProductImage ? (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => form.setValue("productImage", null)}
                                                    className="text-red-500 text-xs h-6 px-2 justify-start hover:bg-transparent"
                                                >
                                                    Remove Image
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => productInputRef.current?.click()}
                                                    disabled={!!currentProductId} // Disable if product is linked
                                                    className="text-xs h-8 rounded-lg"
                                                >
                                                    Upload Image
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm font-semibold text-gray-900">Active Status</FormLabel>
                                <p className="text-xs text-gray-500">Show this testimonial on the website.</p>
                            </div>
                            <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-orange-500"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-full px-6"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-full px-8 bg-orange-500 hover:bg-orange-600 text-white"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    testimonial ? "Save Changes" : "Create Testimonial"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
