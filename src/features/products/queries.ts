import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type FeaturedProduct = Prisma.ProductGetPayload<{
    include: {
        images: true;
        vendor: {
            select: {
                userId: true;
            }
        }
    }
}>;

export async function getFeaturedProducts(limit = 9) {
    return await prisma.product.findMany({
        where: {
            isActive: true,
            hasPendingStyle: false,
            status: 'ACTIVE'
        },
        include: {
            images: true,
            vendor: {
                select: {
                    userId: true,
                }
            }
        },
        orderBy: {
            viewCount: 'desc'
        },
        take: limit
    });
}

export async function getBrands() {
    return await prisma.brand.findMany({
        orderBy: {
            name: 'asc',
        },
        select: {
            id: true,
            name: true,
        },
    });
}

export async function getDressStyles() {
    return await prisma.dressStyle.findMany({
        where: {
            status: 'approved'
        },
        select: {
            id: true,
            name: true,
            categoryType: true,
        },
        orderBy: {
            name: 'asc'
        }
    });
}

export async function getOccasions() {
    return await prisma.occasion.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });
}

export async function getMaterials() {
    return await prisma.material.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' }
    });
}

export async function getProductDetail(idOrSlug: string) {
    const freshPendingThreshold = new Date(Date.now() - 15 * 60 * 1000);

    const productIncludes: any = {
        vendor: {
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        profile: {
                            select: { avatar: true }
                        }
                    }
                }
            }
        },
        images: true,
        _count: {
            select: { reviews: true }
        },
        orderItems: {
            where: {
                order: {
                    OR: [
                        { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
                        {
                            status: 'PENDING',
                            createdAt: { gte: freshPendingThreshold }
                        }
                    ]
                }
            }
        }
    };

    // 1. Fetch main product
    let product = await prisma.product.findUnique({
        where: { id: idOrSlug },
        include: productIncludes
    }) as any;

    if (!product) {
        product = await prisma.product.findFirst({
            where: { slug: idOrSlug },
            include: productIncludes
        });
    }

    if (!product) return null;

    // Simplified include for recommendations (Performance optimized like /products page)
    const recommendationInclude = {
        images: true,
        vendor: {
            select: { userId: true }
        }
    };

    // 2. Fetch recommendations in parallel
    const [sellerProducts, occasionProducts, brandProducts, colorProducts, locationProducts, categoryProducts] = await Promise.all([
        prisma.product.findMany({
            where: {
                vendorId: product.vendorId,
                id: { not: product.id },
                isActive: true,
                status: 'ACTIVE'
            },
            include: recommendationInclude,
            take: 6
        }),
        product.occasion ? prisma.product.findMany({
            where: {
                occasion: product.occasion,
                id: { not: product.id },
                isActive: true,
                status: 'ACTIVE'
            },
            include: recommendationInclude,
            take: 6
        }) : Promise.resolve([]),
        product.brand ? prisma.product.findMany({
            where: {
                brand: product.brand,
                id: { not: product.id },
                isActive: true,
                status: 'ACTIVE'
            },
            include: recommendationInclude,
            take: 6
        }) : Promise.resolve([]),
        product.color ? prisma.product.findMany({
            where: {
                color: product.color,
                id: { not: product.id },
                isActive: true,
                status: 'ACTIVE'
            },
            include: recommendationInclude,
            take: 6
        }) : Promise.resolve([]),
        product.location ? prisma.product.findMany({
            where: {
                location: product.location,
                id: { not: product.id },
                isActive: true,
                status: 'ACTIVE'
            },
            include: recommendationInclude,
            take: 6
        }) : Promise.resolve([]),
        product.category ? prisma.product.findMany({
            where: {
                category: product.category,
                id: { not: product.id },
                isActive: true,
                status: 'ACTIVE'
            },
            include: recommendationInclude,
            take: 6
        }) : Promise.resolve([]),
    ]);

    // 3. Serialize Decimals for Client Components
    const serializeProduct = (p: any) => ({
        ...p,
        price: p.price ? Number(p.price) : 0,
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
        averageRating: p.averageRating ? Number(p.averageRating) : 0,
        reviewCount: p.reviewCount ? Number(p.reviewCount) : 0,
        vendor: p.vendor ? {
            ...p.vendor,
            walletBalance: p.vendor.walletBalance ? Number(p.vendor.walletBalance) : 0,
            rewardBalance: p.vendor.rewardBalance ? Number(p.vendor.rewardBalance) : 0,
            commissionBps: p.vendor.commissionBps ? Number(p.vendor.commissionBps) : 0,
            averageRating: p.vendor.averageRating ? Number(p.vendor.averageRating) : 0,
            reviewCount: p.vendor.reviewCount ? Number(p.vendor.reviewCount) : 0,
        } : null
    });

    const serializedProduct = serializeProduct(product);
    const hasActiveOrder = (product.orderItems && product.orderItems.length > 0);
    if (!product.isActive) {
        serializedProduct.status = 'INACTIVE';
    } else if (hasActiveOrder || product.status === 'SOLD') {
        serializedProduct.status = 'SOLD';
    }

    return {
        product: serializedProduct,
        recommendations: {
            seller: sellerProducts.map(serializeProduct),
            occasion: (occasionProducts as any[]).map(serializeProduct),
            brand: (brandProducts as any[]).map(serializeProduct),
            color: (colorProducts as any[]).map(serializeProduct),
            location: (locationProducts as any[]).map(serializeProduct),
            category: (categoryProducts as any[]).map(serializeProduct)
        }
    };
}
