import { prisma } from "@/lib/prisma";
import { Banner } from "@prisma/client";

/**
 * Fetch all banners for the admin dashboard.
 */
export async function getBanners(): Promise<Banner[]> {
    return await prisma.banner.findMany({
        orderBy: { createdAt: "desc" },
    });
}

/**
 * Fetch active banners for the public site.
 * Filters by isActive and date range.
 */
export async function getActiveBanners(): Promise<Banner[]> {
    const now = new Date();
    return await prisma.banner.findMany({
        where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
        },
        orderBy: { createdAt: "desc" },
    });
}
