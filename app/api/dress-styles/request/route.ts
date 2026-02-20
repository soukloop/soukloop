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
 * Body: { name: string, categoryId: string, message?: string }
 *
 * Rules:
 *  - Same style name is ALLOWED across different categories
 *  - Same style name in the SAME category is blocked (returns existing record)
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
        const { name, categoryId, message } = body;

        // Validate required fields
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Dress style name is required' },
                { status: 400 }
            );
        }

        if (!categoryId) {
            return NextResponse.json(
                { error: 'categoryId is required — please select a category in Step 2 first' },
                { status: 400 }
            );
        }

        // Validate category exists in DB (replaces hardcoded ['Kids','Men','Women'] check)
        const category = await prisma.category.findUnique({
            where: { id: categoryId },
            select: { id: true, name: true }
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Invalid category. Please select a valid category first.' },
                { status: 400 }
            );
        }

        const slug = createSlug(name.trim());
        const categoryType = category.name; // derived from DB, never hardcoded

        // Check if style already exists in THIS category (unique per [slug, categoryId])
        let existingStyle = await prisma.dressStyle.findUnique({
            where: {
                slug_categoryId: {
                    slug,
                    categoryId
                }
            },
            include: {
                requests: {
                    where: { requesterId: session.user.id }
                }
            }
        });

        // If approved style exists in this category, just return it
        if (existingStyle?.status === 'approved') {
            return NextResponse.json({
                success: true,
                message: 'This style already exists and is approved for this category',
                dressStyle: existingStyle,
                alreadyApproved: true
            });
        }

        // If pending style exists in this category, handle deduplication
        if (existingStyle?.status === 'pending') {
            if (existingStyle.requests.length > 0) {
                return NextResponse.json({
                    success: true,
                    message: 'You have already requested this style for this category',
                    dressStyle: existingStyle,
                    alreadyRequested: true
                });
            }

            // Add user to existing pending request
            await prisma.dressStyleRequest.create({
                data: {
                    dressStyleId: existingStyle.id,
                    requesterId: session.user.id,
                    message: message?.trim() || undefined
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Your request has been added to the existing pending style',
                dressStyle: existingStyle,
                addedToExisting: true
            });
        }

        // Create new pending dress style for this specific category
        const newDressStyle = await prisma.dressStyle.create({
            data: {
                name: name.trim(),
                slug,
                categoryType,  // stored for display purposes (e.g. "Accessories", "Men", "Custom")
                status: 'pending',
                categoryId,
                requests: {
                    create: {
                        requesterId: session.user.id,
                        message: message?.trim() || undefined
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
