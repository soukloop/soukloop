
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from "@/auth";

// GET /api/categories
export async function GET() {
    try {
        console.time('Categories_API');
        const [categories, productCounts] = await Promise.all([
            prisma.category.findMany({
                orderBy: { name: 'asc' },
            }),
            prisma.product.groupBy({
                by: ['category'],
                where: { isActive: true },
                _count: { category: true }
            })
        ]);
        console.timeEnd('Categories_API');

        // Create a map for quick lookup: normalized category name -> count
        const countMap = new Map<string, number>();
        productCounts.forEach(item => {
            if (item.category) {
                const key = item.category.toLowerCase();
                countMap.set(key, (countMap.get(key) || 0) + item._count.category);
            }
        });

        const categoriesWithCounts = categories.map((cat) => ({
            ...cat,
            productCount: countMap.get(cat.name.toLowerCase()) || 0
        }));

        // Apply priority sorting: Men, Women, Kids first, then others
        const priority = ["men", "women", "kids"];
        const sortedCategories = categoriesWithCounts.sort((a, b) => {
            const aSlug = a.slug.toLowerCase();
            const bSlug = b.slug.toLowerCase();

            const aIndex = priority.indexOf(aSlug);
            const bIndex = priority.indexOf(bSlug);

            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;

            return a.name.localeCompare(b.name);
        });

        // Cache for 1 hour (3600s), stale for 1 day (86400s)
        return NextResponse.json(sortedCategories, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            }
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
}

// POST /api/categories (Admin only, mostly for descriptions)
export async function POST(req: Request) {
    try {
        const session = await auth();
        const user = await prisma.user.findUnique({ where: { email: session?.user?.email || '' } });
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, description, status } = body;

        // Currently only supporting updates to description/status for existing categories
        if (id) {
            const updated = await prisma.category.update({
                where: { id },
                data: { description, status }
            });
            return NextResponse.json(updated);
        }

        return NextResponse.json({ error: "Creation not supported via this endpoint yet" }, { status: 400 });

    } catch (error) {
        console.error('Error updating category:', error);
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}
