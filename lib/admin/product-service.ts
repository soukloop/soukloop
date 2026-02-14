
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export type ProductFilterParams = {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    category?: string;
    dressStyle?: string;
};

export type PaginatedProductsResult = {
    products: any[];
    total: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};

export async function getPaginatedProducts({
    page = 1,
    pageSize = 10,
    search = '',
    status,
    category,
    dressStyle
}: ProductFilterParams): Promise<PaginatedProductsResult> {
    const skip = (page - 1) * pageSize;

    const where: Prisma.ProductWhereInput = {};

    // 1. Search
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            // Also search by User name if store name is missing
            {
                vendor: {
                    user: {
                        name: { contains: search, mode: 'insensitive' }
                    }
                }
            }
        ];
    }

    // 2. Status Filter
    if (status) {
        if (status === 'Active') {
            where.isActive = true;
            // Ensure not pending style?
            // "Active" usually means fully active.
            // But if hasPendingStyle is true, it might be hidden? 
            // Let's assume standard Active means isActive=true.
        } else if (status === 'Blocked') {
            where.isActive = false;
        } else if (status === 'Pending Style') {
            where.OR = [
                { hasPendingStyle: true },
                { dressStyle: { is: { status: 'pending' } } } // Fixed relation filter syntax
            ];
        }
    }

    // 3. Category Filter
    if (category && category !== 'All') {
        where.category = category;
    }

    // 4. Dress Style Filter
    if (dressStyle && dressStyle !== 'All') {
        where.dressStyle = { is: { name: dressStyle } }; // Fixed relation filter syntax
    }

    // Execute Transaction for Count + Data
    const [total, products] = await prisma.$transaction([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
                vendor: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                },
                images: {
                    take: 1,
                    orderBy: { order: 'asc' }
                },
                dressStyle: {
                    select: { id: true, name: true, status: true }
                }
            }
        })
    ]);

    const formattedProducts = products.map(p => {
        // Determine status display
        let displayStatus = p.isActive ? 'Active' : 'Blocked';
        if (p.hasPendingStyle || p.dressStyle?.status === 'pending') {
            displayStatus = 'Pending Style';
        }

        return {
            id: p.id,
            thumbnail: p.images?.[0]?.url || '/images/placeholder.png',
            productName: p.name,
            sellerName: p.vendor?.user?.name || 'Unknown Seller',
            sellerId: p.vendor?.userId,
            category: p.category || 'Uncategorized',
            dressStyle: p.dressStyle?.name || 'N/A',
            dressStyleId: p.dressStyle?.id,
            dressStyleStatus: p.dressStyle?.status || 'approved',
            hasPendingStyle: p.hasPendingStyle,
            submittedOn: p.createdAt.toISOString().split('T')[0],
            status: displayStatus,
            isActive: p.isActive,
            price: p.price,
            description: p.description
        };
    });

    return {
        products: formattedProducts,
        total,
        totalPages: Math.ceil(total / pageSize),
        currentPage: page,
        pageSize
    };
}
