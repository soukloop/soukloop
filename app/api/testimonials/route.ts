import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/testimonials
 * Fetch active testimonials for homepage display
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');

        const testimonials = await prisma.testimonial.findMany({
            where: {
                isActive: true,
            },
            include: {
                product: {
                    select: {
                        images: {
                            select: {
                                url: true,
                                isPrimary: true,
                                order: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        });

        // Map to include product image if not set on testimonial
        const formattedTestimonials = testimonials.map(t => {
            // Sort images: Primary first, then by order
            const sortedImages = t.product?.images?.sort((a, b) => {
                if (a.isPrimary === b.isPrimary) {
                    return a.order - b.order;
                }
                return a.isPrimary ? -1 : 1;
            });
            
            return {
                id: t.id,
                name: t.name,
                location: t.location,
                rating: t.rating,
                text: t.text,
                profileImage: t.profileImage,
                productImage: t.productImage || (sortedImages?.[0]?.url ?? null),
            };
        });

        return NextResponse.json(formattedTestimonials);
    } catch (error) {
        console.error('[Testimonials API] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        return NextResponse.json(
            { error: 'Failed to fetch testimonials' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/testimonials
 * Create a new testimonial (admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, location, rating, text, profileImage, productImage, productId } = body;

        if (!name || !text) {
            return NextResponse.json(
                { error: 'Name and text are required' },
                { status: 400 }
            );
        }

        const testimonial = await prisma.testimonial.create({
            data: {
                name,
                location,
                rating: rating || 5,
                text,
                profileImage,
                productImage,
                productId,
                isActive: body.isActive ?? true,
            },
        });

        return NextResponse.json(testimonial, { status: 201 });
    } catch (error) {
        console.error('[Testimonials API] Error creating testimonial:', error);
        return NextResponse.json(
            { error: 'Failed to create testimonial' },
            { status: 500 }
        );
    }
}
