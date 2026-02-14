"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { testimonialSchema, TestimonialFormValues } from "./schemas";

export async function createTestimonial(data: TestimonialFormValues) {
    try {
        const validated = testimonialSchema.parse(data);

        await prisma.testimonial.create({
            data: {
                ...validated,
                location: validated.location || null,
                profileImage: validated.profileImage || null,
                productImage: validated.productImage || null,
                productId: validated.productId || null,
            },
        });

        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error creating testimonial:", error);
        return { success: false, error: "Failed to create testimonial" };
    }
}

export async function updateTestimonial(data: TestimonialFormValues) {
    try {
        const validated = testimonialSchema.parse(data);

        if (!validated.id) {
            return { success: false, error: "Testimonial ID is required for update" };
        }

        await prisma.testimonial.update({
            where: { id: validated.id },
            data: {
                ...validated,
                location: validated.location || null,
                profileImage: validated.profileImage || null,
                productImage: validated.productImage || null,
                productId: validated.productId || null,
            },
        });

        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error updating testimonial:", error);
        return { success: false, error: "Failed to update testimonial" };
    }
}

export async function deleteTestimonial(id: string) {
    try {
        await prisma.testimonial.delete({
            where: { id },
        });

        revalidatePath("/admin/testimonials");
        return { success: true };
    } catch (error) {
        console.error("Error deleting testimonial:", error);
        return { success: false, error: "Failed to delete testimonial" };
    }
}

export async function searchProducts(query: string) {
    if (!query || query.length < 2) return [];

    try {
        const products = await prisma.product.findMany({
            where: {
                name: {
                    contains: query,
                    mode: "insensitive",
                },
            },
            select: {
                id: true,
                name: true,
                images: {
                    take: 1,
                    select: {
                        url: true,
                    },
                },
            },
            take: 5,
        });

        return products.map((p) => ({
            id: p.id,
            name: p.name,
            image: p.images[0]?.url || null,
        }));
    } catch (error) {
        console.error("Error searching products:", error);
        return [];
    }
}
