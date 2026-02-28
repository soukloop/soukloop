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
            orderBy: {
                totalSold: 'desc'
            },
            take: 6,
            include: {
                products: {
                    where: { isActive: true },
                    take: 1,
                    select: {
                        images: {
                            take: 1,
                            select: { url: true }
                        }
                    }
                }
            }
        });

        // specific static images map for fallback (from categories-section.tsx context)
        const staticImages: Record<string, string> = {
            "Men's Style": "/categories_images/men's_Style.png",
            "Women's Style": "/categories_images/women's_Style.png",
            "Casual Wear": "/categories_images/casual_wear.png",
            "Kids Style": "/categories_images/kids_style.png",
            "Bridal Styles": "/categories_images/bridal_styles.png",
            "Event Styles": "/categories_images/event_styles.png",
        };

        const result = styles.map(style => {
            let coverImage = null;

            if (style.products.length > 0 && style.products[0].images.length > 0) {
                coverImage = style.products[0].images[0].url;
            } else {
                coverImage = staticImages[style.name] || "/placeholder.svg";
            }

            return {
                id: style.id,
                name: style.name,
                slug: style.slug,
                totalSold: style.totalSold || 0,
                image: coverImage
            };
        });

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('Error fetching bestselling styles:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
