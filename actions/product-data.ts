"use server";

import { prisma } from "@/lib/prisma";
import type { GroupedDressStyles, MegaMenuProduct } from "@/types/product";

/**
 * Fetches all approved dress styles and groups them by category (men, women, kids).
 * Used for the Mega Menu navigation.
 */
export async function getGroupedDressStyles(): Promise<GroupedDressStyles> {
    try {
        const styles = await prisma.dressStyle.findMany({
            where: {
                status: "approved"
            },
            select: {
                id: true,
                name: true,
                slug: true,
                categoryType: true
            },
            orderBy: {
                name: "asc"
            }
        });

        // Initialize groups
        const grouped: GroupedDressStyles = {
            women: [],
            men: [],
            kids: []
        };

        // Categorize styles
        styles.forEach(style => {
            const cat = style.categoryType.toLowerCase();
            const simpleStyle = { id: style.id, name: style.name, slug: style.slug };

            if (cat === "women" || cat === "women's") {
                grouped.women.push(simpleStyle);
            } else if (cat === "men" || cat === "men's") {
                grouped.men.push(simpleStyle);
            } else if (cat === "kids" || cat === "kid's" || cat === "child") {
                grouped.kids.push(simpleStyle);
            }
        });

        return grouped;

    } catch (error) {
        console.error("Error fetching grouped dress styles:", error);
        return { women: [], men: [], kids: [] };
    }
}

/**
 * Fetches the latest 3 active products for a specific dress style.
 * Used for the Mega Menu preview.
 */
export async function getLatestProductsByDressStyle(styleSlug: string): Promise<MegaMenuProduct[]> {
    try {
        if (!styleSlug) return [];

        // Use findFirst as slug is unique per categoryType but not globally unique in schema
        const style = await prisma.dressStyle.findFirst({
            where: { slug: styleSlug }
        });

        if (!style) return [];

        const products = await prisma.product.findMany({
            where: {
                dressStyleId: style.id,
                isActive: true,
                status: "ACTIVE",
                vendor: {
                    isActive: true,
                    kycStatus: "APPROVED"
                }
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                comparePrice: true,
                vendor: {
                    select: {
                        userId: true
                    }
                },
                images: {
                    take: 1,
                    orderBy: {
                        order: "asc"
                    },
                    select: {
                        url: true
                    }
                },
                boosts: {
                    where: {
                        status: 'active',
                        startDate: { lte: new Date() },
                        endDate: { gte: new Date() }
                    },
                    select: { id: true }
                }
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 3
        });

        return products.map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            comparePrice: p.comparePrice,
            image: p.images[0]?.url || "/placeholder.png",
            isFeatured: (p.boosts?.length ?? 0) > 0,
            vendorUserId: p.vendor?.userId
        }));

    } catch (error) {
        console.error("Error fetching products by style:", error);
        return [];
    }
}
