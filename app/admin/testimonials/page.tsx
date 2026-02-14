
import { prisma } from "@/lib/prisma";
import { TestimonialsClient } from "@/src/features/testimonials/components/TestimonialsClient";

export const dynamic = "force-dynamic";

interface SearchParams {
    page?: string;
    limit?: string;
    search?: string;
}

export default async function TestimonialsPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const page = parseInt(params.page || "1");
    const limit = parseInt(params.limit || "10");
    const search = params.search || "";

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { text: { contains: search, mode: "insensitive" as const } },
            ],
        }
        : {};

    // Fetch data with pagination
    const [data, total] = await Promise.all([
        prisma.testimonial.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
        }),
        prisma.testimonial.count({ where }),
    ]);

    // Fetch product names for linked products
    const productIds = data
        .map((t) => t.productId)
        .filter((id): id is string => !!id);

    let productsMap: Record<string, string> = {};

    if (productIds.length > 0) {
        const products = await prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
            },
            select: {
                id: true,
                name: true,
            },
        });

        products.forEach((p) => {
            productsMap[p.id] = p.name;
        });
    }

    // Format data for client component
    const formattedTestimonials = data.map((t) => ({
        ...t,
        product:
            t.productId && productsMap[t.productId]
                ? { name: productsMap[t.productId] }
                : null,
    }));

    return (
        <TestimonialsClient
            initialTestimonials={formattedTestimonials}
            total={total}
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
        />
    );
}
