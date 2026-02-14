import { z } from 'zod';

// --- Auth Schemas ---

export const RegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const LoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;

export const ForgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
    token: z.string().min(1, 'Token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().optional()
}).refine((data) => {
    if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;


// --- Product Schemas ---

export const ProductSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().positive('Price must be positive'), // coerce handles string "100" -> number 100
    category: z.string().min(1, 'Category is required'),
    categoryId: z.string().optional().nullable(),

    // Optional / Nullable fields
    comparePrice: z.coerce.number().positive().optional().nullable(),
    brand: z.string().optional().nullable(),
    brandId: z.string().optional().nullable(),
    condition: z.string().optional(),
    gender: z.string().optional(),
    size: z.string().optional(),
    color: z.string().optional(),
    colorId: z.string().optional().nullable(),
    fabric: z.string().optional(),
    materialId: z.string().optional().nullable(),
    occasion: z.string().optional(),
    occasionId: z.string().optional().nullable(),
    dress: z.string().optional(), // Dress Type
    dressStyleId: z.string().optional().nullable(),
    video: z.string().optional().nullable(),
    location: z.string().optional().nullable(), // Seller Location (State)
    state: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    cityId: z.string().optional().nullable(),
    tags: z.union([z.string(), z.array(z.string())]).optional(), // Handle tags as string (comma separated) or array

    // Images
    images: z.array(z.object({
        url: z.string().min(1, "Image URL is required"), // Relaxed from .url() to allow relative paths
        alt: z.string().optional(),
        isPrimary: z.boolean().optional(),
        order: z.number().optional()
    })).optional()
});

export type ProductInput = z.infer<typeof ProductSchema>;


// --- Address Schemas ---

export const AddressSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().min(5, 'Phone number is required'),
    street: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(2, 'Zip code is required'),
    country: z.string().min(2, 'Country is required'),
    isDefault: z.boolean().optional(),
    isBilling: z.boolean().optional(),
    isShipping: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof AddressSchema>;
