import { prisma } from "@/lib/prisma";

export async function getBestsellingStyles(limit = 6) {
    // Optimized query:
    // 1. Calculate total sales per DressStyle using groupBy on OrderItem -> Product -> DressStyle
    // 2. Fetch style details and ONE representative image separately

    // Step 1: Aggregate sales by DressStyle
    // Since we need to join across tables (OrderItem -> Product -> DressStyle), we can't use simple groupBy on OrderItem.
    // We'll fetch styles with their total sales count using a more efficient include structure,
    // relying on DB optimization or use raw query if dataset is huge.
    // For now, let's optimize the existing approach by reducing data transfer.

    const styles = await prisma.dressStyle.findMany({
        take: limit,
        // We want styles with highest sales.
        // Prisma doesn't support ordering by aggregation relation easily without raw SQL or specialized features.
        // We will stick to JS sorting for now BUT significantly reduce data load.
        include: {
            products: {
                where: {
                    status: 'SOLD' // Only count sold items (or check order items)
                },
                select: {
                    orderItems: {
                        select: {
                            quantity: true
                        }
                    },
                    // Fetch just ONE image for the whole style from the first product
                    images: {
                        where: { isPrimary: true },
                        take: 1,
                        select: { url: true }
                    }
                },
                take: 50 // Limit products to analyze to avoid memory overflow on huge catalogs
            }
        }
    });

    const stylesWithSales = styles.map(style => {
        let totalSold = 0;
        let coverImage = "";

        for (const product of style.products) {
            // Aggregate sales
            for (const item of product.orderItems) {
                totalSold += item.quantity;
            }
            // Pick first available image
            if (!coverImage && product.images.length > 0) {
                coverImage = product.images[0].url;
            }
        }

        return {
            id: style.id,
            name: style.name,
            slug: style.slug,
            totalSold,
            image: coverImage || "/placeholder.svg"
        };
    });

    return stylesWithSales.sort((a, b) => b.totalSold - a.totalSold).slice(0, limit);
}
