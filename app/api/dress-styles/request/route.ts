import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * Helper to create slug from name
 */
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[\/\s]+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

/**
 * POST /api/dress-styles/request
 * Submit a new dress style request
 * Body: { name: string, categoryType: string, message?: string }
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { name, categoryType, message, categoryId } = body;

        // Validate required fields
        if (!name || !categoryType) {
            return NextResponse.json(
                { error: 'Name and categoryType are required' },
                { status: 400 }
            );
        }

        // Validate categoryType
        if (!['Kids', 'Men', 'Women'].includes(categoryType)) {
            return NextResponse.json(
                { error: 'categoryType must be Kids, Men, or Women' },
                { status: 400 }
            );
        }

        const slug = createSlug(name);

        // Check if style already exists (approved or pending)
        let existingStyle = await prisma.dressStyle.findUnique({
            where: {
                slug_categoryType: {
                    slug,
                    categoryType
                }
            },
            include: {
                requests: {
                    where: { requesterId: session.user.id }
                }
            }
        });

        // If approved style exists, just return it
        if (existingStyle?.status === 'approved') {
            return NextResponse.json({
                success: true,
                message: 'This style already exists and is approved',
                dressStyle: existingStyle,
                alreadyApproved: true
            });
        }

        // If pending style exists, check if user already requested
        if (existingStyle?.status === 'pending') {
            if (existingStyle.requests.length > 0) {
                return NextResponse.json({
                    success: true,
                    message: 'You have already requested this style',
                    dressStyle: existingStyle,
                    alreadyRequested: true
                });
            }

            // Add user to existing pending request
            await prisma.dressStyleRequest.create({
                data: {
                    dressStyleId: existingStyle.id,
                    requesterId: session.user.id,
                    message
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Your request has been added to the existing pending style',
                dressStyle: existingStyle,
                addedToExisting: true
            });
        }

        // Create new pending dress style with request
        // Prioritize categoryId if provided, otherwise fallback to finding by slug
        let targetCategoryId = categoryId;

        if (!targetCategoryId) {
            const category = await prisma.category.findFirst({
                where: { slug: { equals: categoryType, mode: 'insensitive' } }
            });
            targetCategoryId = category?.id;
        }

        const newDressStyle = await prisma.dressStyle.create({
            data: {
                name: name.trim(),
                slug,
                categoryType,
                status: 'pending',
                categoryId: targetCategoryId,
                requests: {
                    create: {
                        requesterId: session.user.id,
                        message
                    }
                }
            },
            include: {
                requests: true
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Dress style request submitted successfully',
            dressStyle: newDressStyle,
            created: true
        });

    } catch (error) {
        console.error('DressStyleRequest POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
