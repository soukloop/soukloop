import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getCategoryById(id: string) {
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });

    return category;
}

interface GetProductsByCategoryOptions {
    page: number;
    pageSize: number;
    status?: 'all' | 'active' | 'inactive';
    search?: string;
    dressStyleId?: string;
}

export async function getProductsByCategory(
    categoryId: string,
    options: GetProductsByCategoryOptions
) {
    const { page, pageSize, status = 'all', search, dressStyleId } = options;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
        categoryId
    };

    // Status filter
    if (status === 'active') {
        where.isActive = true;
    } else if (status === 'inactive') {
        where.isActive = false;
    }

    // Dress style filter
    if (dressStyleId && dressStyleId !== 'all') {
        where.dressStyleId = dressStyleId;
    }

    // Search filter
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    // Fetch products and total count in parallel
    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                price: true,
                description: true,
                images: {
                    take: 1,
                    orderBy: { order: 'asc' },
                    select: { url: true }
                },
                isActive: true,
                hasPendingStyle: true,
                status: true,
                condition: true,
                createdAt: true,
                vendorId: true,
                vendor: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                dressStyle: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: pageSize,
            skip
        }),
        prisma.product.count({ where })
    ]);

    return {
        products,
        total,
        totalPages: Math.ceil(total / pageSize)
    };
}

// Get all categories for the switcher dropdown
export async function getAllCategories() {
    return await prisma.category.findMany({
        select: {
            id: true,
            name: true
        },
        orderBy: { name: 'asc' }
    });
}

// Get dress styles for filtering
export async function getDressStylesByCategory(categoryId: string) {
    const products = await prisma.product.findMany({
        where: { categoryId },
        select: {
            dressStyle: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        distinct: ['dressStyleId']
    });

    // Extract unique dress styles
    const uniqueStyles = products
        .filter(p => p.dressStyle)
        .map(p => p.dressStyle!)
        .filter((style, index, self) =>
            index === self.findIndex(s => s.id === style.id)
        );

    return uniqueStyles;
}
