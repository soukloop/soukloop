// Imports updated
import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils'
import { prisma } from '@/lib/prisma'
import { Role } from '@prisma/client'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const product = await prisma.product.findUnique({
            where: { id },
            // ... rest of GET ...
            // Use multi-file replacement chunks for other handlers below

            include: {
                vendor: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                                role: true,
                                profile: true
                            }
                        }
                    }
                },
                images: true,
                reviews: {
                    include: { user: true },
                    orderBy: { createdAt: 'desc' }
                },
                reports: {
                    include: { reporter: true },
                    orderBy: { createdAt: 'desc' }
                },
                // Assuming chatConversations relation exists on Product
                chatConversations: {
                    include: {
                        buyer: {
                            select: {
                                id: true, name: true, image: true,
                                vendor: { select: { logo: true } },
                                profile: { select: { avatar: true } }
                            }
                        },
                        seller: {
                            select: {
                                id: true, name: true, image: true,
                                vendor: { select: { logo: true } },
                                profile: { select: { avatar: true } }
                            }
                        },
                        messages: {
                            orderBy: { createdAt: 'desc' },
                            take: 1
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                dressStyle: true // Ensure dressStyle relation is fetched
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json(product);

    } catch (error) {
        return handleApiError(error);
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();

        // Define allowed fields for update
        const allowedUpdates = [
            'name', 'description', 'price', 'comparePrice', 'stock',
            'category', 'condition', 'gender', 'isActive',
            'size', 'tags', 'brand', 'color', 'fabric', 'dress', 'occasion',
            'dressStyleId', 'hasPendingStyle', 'video'
        ];

        // Filter body to only allowed updates
        const updateData: any = {};
        for (const key of allowedUpdates) {
            if (body[key] !== undefined) {
                // Parse numbers if necessary
                if (['price', 'comparePrice', 'stock'].includes(key)) {
                    updateData[key] = Number(body[key]);
                } else if (key === 'dressStyleId') {
                    // Handle empty string for dressStyleId by converting to null to avoid FK constraint errors
                    updateData[key] = body[key] && body[key] !== "" ? body[key] : null;
                } else {
                    updateData[key] = body[key];
                }
            }
        }

        // Handle Images Update if provided in payload
        if (body.images && Array.isArray(body.images)) {
            updateData.images = {
                deleteMany: {}, // Remove existing images
                create: body.images.map((img: any) => ({
                    url: img.url,
                    alt: img.alt || '',
                    order: img.order || 0,
                    isPrimary: img.isPrimary || false
                }))
            };
        }

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(updatedProduct);

    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Delete the product
        await prisma.product.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully'
        })

    } catch (error) {
        return handleApiError(error);
    }
}
