import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Ensure no caching for analytics

export async function GET(request: NextRequest) {
    try {
        // Fetch styles with their products and order items to calculate sales
        // limit to a reasonable amount to aggregate in memory (e.g. 50 or 100 styles)
        // If there are thousands of styles, this needs a raw SQL query for performance.
        // Verify DB connectivity
        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (dbError) {
            console.error('Database connection lost:', dbError);
            return NextResponse.json(
                { error: 'Service Unavailable', message: 'Database is currently unreachable.' },
                { status: 503 }
            );
        }

        const styles = await prisma.dressStyle.findMany({
            where: {
                status: 'approved'
            },
            include: {
                products: {
                    select: {
                        id: true,
                        images: {
                            take: 1,
                            select: { url: true }
                        },
                        orderItems: {
                            select: {
                                quantity: true
                            }
                        }
                    }
                }
            }
        });

        // specific static images map for fallback (from categories-section.tsx context)
        // User mentioned re-using them.
        const staticImages: Record<string, string> = {
            "Men's Style": "/categories_images/men's_Style.png",
            "Women's Style": "/categories_images/women's_Style.png",
            "Casual Wear": "/categories_images/casual_wear.png",
            "Kids Style": "/categories_images/kids_style.png",
            "Bridal Styles": "/categories_images/bridal_styles.png",
            "Event Styles": "/categories_images/event_styles.png",
        };

        const aggregated = styles.map(style => {
            let totalSold = 0;
            let coverImage = null;

            // Calculate total sold and find a cover image
            for (const product of style.products) {
                // Sum quantities
                const productSold = product.orderItems.reduce((sum, item) => sum + item.quantity, 0);
                totalSold += productSold;

                // Pick image from the first product that has one (or the one with most sales ideally)
                // For simplicity, just grab the first available one found.
                if (!coverImage && product.images && product.images.length > 0) {
                    coverImage = product.images[0].url;
                }
            }

            // Fallback image if no product image found
            if (!coverImage) {
                // Try to match name to static images or use placeholder
                coverImage = staticImages[style.name] || "/placeholder.svg";
            }

            return {
                id: style.id,
                name: style.name,
                slug: style.slug,
                totalSold,
                image: coverImage
            };
        });

        // Sort by sales descending
        aggregated.sort((a, b) => b.totalSold - a.totalSold);

        // Take top 6
        const top6 = aggregated.slice(0, 6);

        return NextResponse.json(top6);

    } catch (error: any) {
        console.error('Error fetching bestselling styles:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
