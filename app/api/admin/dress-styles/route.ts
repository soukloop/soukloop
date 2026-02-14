import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';


/**
 * GET /api/admin/dress-styles
 * Returns all dress styles with request counts for admin management
 * Query: ?status=pending&categoryType=Women
 */
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const categoryType = searchParams.get('categoryType');

        const where: any = {};
        if (status) where.status = status;
        if (categoryType) where.categoryType = categoryType;

        const dressStyles = await prisma.dressStyle.findMany({
            where,
            include: {
                requests: {
                    include: {
                        requester: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true
                            }
                        }
                    }
                },
                _count: {
                    select: {
                        products: true
                    }
                }
            },
            orderBy: [
                { status: 'asc' }, // pending first
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(dressStyles);

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * POST /api/admin/dress-styles
 * Create a new approved dress style (admin bypass)
 * Body: { name, categoryType }
 */
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const { name, categoryType } = body;

        if (!name || !categoryType) {
            return NextResponse.json({ error: 'Name and categoryType required' }, { status: 400 });
        }

        const slug = name
            .toLowerCase()
            .replace(/[\/\s]+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');

        // Automatically find and link category
        const category = await prisma.category.findFirst({
            where: { slug: { equals: categoryType, mode: 'insensitive' } }
        });

        const dressStyle = await prisma.dressStyle.create({
            data: {
                name: name.trim(),
                slug,
                categoryType,
                status: 'approved',
                categoryId: category?.id
            }
        });

        return NextResponse.json({ success: true, dressStyle });

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * PATCH /api/admin/dress-styles
 * Approve or reject a dress style request
 * Body: { id, action: 'approve' | 'reject' }
 */
export async function PATCH(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const { id, action } = body;

        if (!id || !['approve', 'reject', 'suspend', 'activate'].includes(action)) {
            return NextResponse.json({ error: 'Valid id and action (approve/reject/suspend/activate) required' }, { status: 400 });
        }

        // Get the dress style with its requests and products
        const dressStyle = await prisma.dressStyle.findUnique({
            where: { id },
            include: {
                requests: {
                    include: { requester: true }
                },
                products: true
            }
        });

        if (!dressStyle) {
            return NextResponse.json({ error: 'Dress style not found' }, { status: 404 });
        }

        if (action === 'approve' || action === 'activate') {
            // Find category to link if missing
            let updateData: any = { status: 'approved' };
            if (!dressStyle.categoryId) {
                const category = await prisma.category.findFirst({
                    where: { slug: { equals: dressStyle.categoryType, mode: 'insensitive' } }
                });
                if (category) updateData.categoryId = category.id;
            }

            // Update status to approved
            await prisma.dressStyle.update({
                where: { id },
                data: updateData
            });

            // Update all products with this style to remove pending flag
            await prisma.product.updateMany({
                where: { dressStyleId: id },
                data: { hasPendingStyle: false }
            });

            // Notify all requesters (only if approving)
            if (action === 'approve') {
                for (const req of dressStyle.requests) {
                    await prisma.notification.create({
                        data: {
                            userId: req.requesterId,
                            type: 'dress_style_approved',
                            title: 'Dress Style Approved',
                            message: `Your requested dress style "${dressStyle.name}" has been approved! Your products are now visible to buyers.`,
                            data: { dressStyleId: id, dressStyleName: dressStyle.name }
                        }
                    });
                }
            }

            return NextResponse.json({
                success: true,
                message: `Dress style "${dressStyle.name}" ${action === 'approve' ? 'approved' : 'activated'}`,
                productsActivated: dressStyle.products.length
            });

        } else if (action === 'suspend') {
            // SUSPEND: Update status and Hide products
            await prisma.dressStyle.update({
                where: { id },
                data: { status: 'suspended' }
            });

            // Update all products with this style to HAS PENDING (Hidden from public)
            await prisma.product.updateMany({
                where: { dressStyleId: id },
                data: { hasPendingStyle: true }
            });

            return NextResponse.json({
                success: true,
                message: `Dress style "${dressStyle.name}" suspended`,
                productsHidden: dressStyle.products.length
            });

        } else {
            // REJECT: Delete all products with this style
            const deletedProducts = await prisma.product.deleteMany({
                where: { dressStyleId: id }
            });

            // Notify all requesters about rejection
            for (const req of dressStyle.requests) {
                await prisma.notification.create({
                    data: {
                        userId: req.requesterId,
                        type: 'dress_style_rejected',
                        title: 'Dress Style Rejected',
                        message: `Your requested dress style "${dressStyle.name}" has been rejected. Any products using this style have been removed.`,
                        data: { dressStyleId: id, dressStyleName: dressStyle.name }
                    }
                });
            }

            // Update status to rejected (or delete entirely)
            await prisma.dressStyle.update({
                where: { id },
                data: { status: 'rejected' }
            });

            return NextResponse.json({
                success: true,
                message: `Dress style "${dressStyle.name}" rejected`,
                productsDeleted: deletedProducts.count
            });
        }

    } catch (error) {
        return handleApiError(error);
    }
}

/**
 * DELETE /api/admin/dress-styles
 * Delete a dress style (only if no products linked)
 * Body: { id }
 */
export async function DELETE(request: NextRequest) {
    try {
        const isAdmin = await verifyAdmin(request);
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 });
        }

        // Check if products exist
        const productCount = await prisma.product.count({
            where: { dressStyleId: id }
        });

        if (productCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${productCount} products are using this style` },
                { status: 400 }
            );
        }

        await prisma.dressStyle.delete({
            where: { id }
        });

        return NextResponse.json({ success: true, message: 'Dress style deleted' });

    } catch (error) {
        return handleApiError(error);
    }
}
