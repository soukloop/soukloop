import 'server-only';
import { prisma } from '@/lib/prisma';

export async function getDressStyleById(id: string) {
    const style = await prisma.dressStyle.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true }
            },
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    return style;
}

interface GetProductsByDressStyleOptions {
    page: number;
    pageSize: number;
    status?: 'all' | 'active' | 'inactive';
    search?: string;
}

export async function getProductsByDressStyle(
    dressStyleId: string,
    options: GetProductsByDressStyleOptions
) {
    const { page, pageSize, status = 'all', search } = options;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
        dressStyleId
    };

    // Status filter
    if (status === 'active') {
        where.isActive = true;
    } else if (status === 'inactive') {
        where.isActive = false;
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
                        name: true
                    }
                }
            },
            orderBy: [
                { hasPendingStyle: 'desc' }, // Pending first
                { createdAt: 'desc' }
            ],
            take: pageSize,
            skip
        }),
        prisma.product.count({ where })
    ]);

    // Serialize Decimal to number since this goes to client component
    const serializedProducts = products.map(p => ({
        ...p,
        price: Number(p.price)
    }));

    return {
        products: serializedProducts,
        total,
        totalPages: Math.ceil(total / pageSize)
    };
}
