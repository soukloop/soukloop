import "server-only";
import { prisma } from "@/lib/prisma";

export async function getBrandById(id: string) {
    return await prisma.brand.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true }
            }
        }
    });
}

export async function getProductsByBrand(
    brandId: string,
    options: {
        page?: number;
        pageSize?: number;
        status?: 'all' | 'active' | 'inactive';
        search?: string;
    } = {}
) {
    const { page = 1, pageSize = 20, status = 'all', search = '' } = options;

    const where: any = {
        brandId,
    };

    // Status filter
    if (status !== 'all') {
        where.status = status === 'active' ? 'Active' : 'Inactive';
    }

    // Search filter
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            include: {
                brandRel: true,
                categoryRel: true,
                dressStyle: true,
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.product.count({ where })
    ]);

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
