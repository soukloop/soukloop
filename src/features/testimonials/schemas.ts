
import * as z from "zod";

export const testimonialSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    location: z.string().optional().nullable(),
    rating: z.number().min(1).max(5),
    text: z.string().min(1, "Review text is required"),
    profileImage: z.string().optional().nullable(),
    productImage: z.string().optional().nullable(),
    productId: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
}).refine((data) => {
    // Either productId OR productImage must be present
    // If productId is present, we assume the product has an image (or handled by display logic), 
    // but strictly speaking user can just enforce "Product Associated"
    // User message: "it should be showing the image from the product... or... upload the image (or url)"
    if (!data.productId && !data.productImage) {
        return false;
    }
    return true;
}, {
    message: "You must either link a product or upload a product image.",
    path: ["productId"], // Attach error to productId field (or show general error)
});

export type TestimonialFormValues = z.infer<typeof testimonialSchema>;
