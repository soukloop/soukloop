import { prisma } from "@/lib/prisma";

export async function getAllCategories() {
    const categories = await prisma.category.findMany({
        where: {
            status: "Active"
        },
        select: {
            id: true,
            name: true,
            slug: true
        },
        orderBy: [
            { sortOrder: 'asc' },
            { name: 'asc' }
        ]
    });

    return categories;
}
