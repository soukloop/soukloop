"use client";

import { useState, useEffect } from "react";
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
import { useRef } from "react";
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
import { createBanner, updateBanner } from "../actions";
import { Banner } from "@prisma/client";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";

const bannerSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    imageUrl: z.string().url("Invalid image URL"),
    link: z.string().optional().nullable(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean().default(true),
});

type BannerFormValues = z.infer<typeof bannerSchema>;

interface BannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    banner?: Banner | null;
}

export function BannerModal({ isOpen, onClose, banner }: BannerModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema),
        defaultValues: {
            title: "",
            description: "",
            imageUrl: "",
            link: "",
            startDate: format(new Date(), "yyyy-MM-dd"),
            endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
            isActive: true,
        },
    });

    useEffect(() => {
        if (banner) {
            form.reset({
                id: banner.id,
                title: banner.title,
                description: banner.description,
                imageUrl: banner.imageUrl,
                link: banner.link || "",
                startDate: format(new Date(banner.startDate), "yyyy-MM-dd"),
                endDate: format(new Date(banner.endDate), "yyyy-MM-dd"),
                isActive: banner.isActive,
            });
        } else {
            form.reset({
                title: "",
                description: "",
                imageUrl: "",
                link: "",
                startDate: format(new Date(), "yyyy-MM-dd"),
                endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
                isActive: true,
            });
        }
    }, [banner, form, isOpen]);

    const onSubmit = async (values: BannerFormValues) => {
        setIsSubmitting(true);
        try {
            const result = banner
                ? await updateBanner(values)
                : await createBanner(values);

            if (result.success) {
                toast.success(`Banner ${banner ? "updated" : "created"} successfully`);
                onClose();
            } else {
                toast.error(result.error || "Failed to save banner");
            }
        } catch (error) {
            toast.error("An unexpected error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (!file.type.startsWith("image/")) {
            toast.error("Please upload an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            // Using raw fetch with headers as expected by /api/upload route
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: {
                    "x-filename": file.name,
                    "content-type": file.type,
                },
                body: file,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || "Upload failed");
            }

            const data = await res.json();
            form.setValue("imageUrl", data.url);
            toast.success("Image uploaded successfully");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast.error(error.message || "Failed to upload image");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const imageUrl = form.watch("imageUrl");

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] border border-gray-100 bg-white p-6 shadow-xl rounded-2xl">
                <DialogHeader className="mb-6 text-left sm:text-left">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        {banner ? "Edit Promotion" : "Create New Promotion"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-semibold">Banner Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Summer Sale 2024" {...field} className="rounded-xl border-gray-200 focus:border-orange-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-semibold">Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Get up to 50% off..."
                                                    className="resize-none rounded-xl border-gray-200 focus:border-orange-500 text-gray-900"
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="link"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-semibold">Redirect Link</FormLabel>
                                            <FormControl>
                                                <Input placeholder="/products?sale=summer" {...field} value={field.value || ""} className="rounded-xl border-gray-200 focus:border-orange-500 text-gray-900" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="space-y-4">
                                <div
                                    className="relative aspect-video rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:border-orange-500 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imageUrl ? (
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/images/placeholder.png';
                                            }}
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500">
                                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                                            <span className="text-xs font-bold text-gray-600">Click to upload banner</span>
                                        </div>
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                                            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                                        </div>
                                    )}
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />

                                <FormField
                                    control={form.control}
                                    name="imageUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-gray-900 font-bold">Image URL</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input placeholder="Alt URL (optional)..." {...field} className="rounded-xl border-gray-200 focus:border-orange-500 text-gray-900 font-medium" />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="shrink-0 rounded-xl"
                                                    onClick={() => fileInputRef.current?.click()}
                                                >
                                                    Upload
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-900 font-semibold">Start Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="rounded-xl border-gray-200 focus:border-orange-500 text-gray-900" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-gray-900 font-semibold">End Date</FormLabel>
                                                <FormControl>
                                                    <Input type="date" {...field} className="rounded-xl border-gray-200 focus:border-orange-500 text-gray-900" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="space-y-0.5">
                                <FormLabel className="text-sm font-semibold text-gray-900">Active Status</FormLabel>
                                <p className="text-xs text-gray-500">Enable or disable this banner on the site.</p>
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

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="rounded-full px-6 border-gray-200 text-gray-900"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-full px-8 bg-orange-500 hover:bg-orange-600 text-white shadow-sm font-semibold"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    banner ? "Save Changes" : "Create Banner"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
