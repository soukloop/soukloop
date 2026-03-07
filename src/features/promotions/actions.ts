"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bannerSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    imageUrl: z.string().url("Invalid image URL"),
    link: z.string().optional().nullable(),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
    isActive: z.boolean().default(true),
});

type BannerInput = z.infer<typeof bannerSchema>;

async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
        throw new Error("Unauthorized: Admin access required");
    }
}

export async function createBanner(data: BannerInput) {
    try {
        await checkAdmin();
        const validated = bannerSchema.parse(data);

        const banner = await prisma.banner.create({
            data: {
                title: validated.title,
                description: validated.description,
                imageUrl: validated.imageUrl,
                link: validated.link,
                startDate: new Date(validated.startDate),
                endDate: new Date(validated.endDate),
                isActive: validated.isActive,
            },
        });

        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true, data: banner };
    } catch (error: any) {
        console.error("Failed to create banner:", error);
        return { success: false, error: error.message || "Failed to create banner" };
    }
}

export async function updateBanner(data: BannerInput) {
    try {
        await checkAdmin();
        const validated = bannerSchema.parse(data);
        if (!validated.id) throw new Error("Banner ID is required for update");

        const banner = await prisma.banner.update({
            where: { id: validated.id },
            data: {
                title: validated.title,
                description: validated.description,
                imageUrl: validated.imageUrl,
                link: validated.link,
                startDate: new Date(validated.startDate),
                endDate: new Date(validated.endDate),
                isActive: validated.isActive,
            },
        });

        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true, data: banner };
    } catch (error: any) {
        console.error("Failed to update banner:", error);
        return { success: false, error: error.message || "Failed to update banner" };
    }
}

export async function deleteBanner(id: string) {
    try {
        await checkAdmin();
        await prisma.banner.delete({
            where: { id },
        });

        revalidatePath("/admin/banners");
        revalidatePath("/");
        return { success: true, message: "Banner deleted successfully" };
    } catch (error: any) {
        console.error("Failed to delete banner:", error);
        return { success: false, error: error.message || "Failed to delete banner" };
    }
}
