import { z } from "zod";

export const step1Schema = z.object({
    photos: z.array(z.object({
        id: z.string(),
        image: z.string().nullable(),
        file: z.any().optional(), // File object
        isUploading: z.boolean().optional(),
        uploadUrl: z.string().nullable().optional(),
        uploadError: z.string().nullable().optional()
    })).refine(
        (photos) => photos.some((p) => p.image !== null || !!p.uploadUrl),
        { message: "Please upload at least one photo." }
    )
});

export const step2Schema = z.object({
    name: z.string().min(3, "Product name must be at least 3 characters"),
    price: z.preprocess(
        (val) => Number(val),
        z.number().min(0.01, "Price must be greater than 0")
    ),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Please select a category"),
    size: z.string().min(1, "Please select a size"),
});

export const step3Schema = z.object({
    condition: z.string().min(1, "Please select condition"),
    gender: z.string().min(1, "Please select gender"),
    fabric: z.string().min(1, "Please select fabric"),
    dress: z.string().min(1, "Please select dress style"), // or dressStyleId check
    occasion: z.string().min(1, "Please select occasion"),
    // Location (Optional but recommended)
    state: z.string().optional(),
    city: z.string().optional(),
});

// Step 4 is Video (Optional) but if provided must be valid
export const step4Schema = z.object({
    video: z.string().nullable(),
    videoFile: z.any().optional(),
    videoIsUploading: z.boolean().optional(),
    videoUploadError: z.string().nullable().optional()
});
