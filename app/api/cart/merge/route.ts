import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/auth";
import { prisma } from '@/lib/prisma';
import { handleApiError } from '@/lib/api-wrapper';
import { z } from 'zod';

const mergeCartSchema = z.object({
    guestItems: z.array(z.object({
        productId: z.string().min(1, 'Product ID required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1')
    })).min(1, 'Guest items cannot be empty')
});

/**
 * POST /api/cart/merge
 * 
 * Merges guest cart items (from localStorage) with authenticated user's cart.
 * Called after user logs in to preserve guest cart items.
 */
export async function POST(req: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const validationResult = mergeCartSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validationResult.error.flatten() },
                { status: 400 }
            );
        }

        const { guestItems } = validationResult.data;

        const userId = session.user.id;

        // Get or create user's cart
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: { items: true }
        });

        if (!cart) {
            // Create cart if doesn't exist
            cart = await prisma.cart.create({
                data: {
                    userId,
                    items: { create: [] }
                },
                include: { items: true }
            });
        }

        // Merge guest items into user cart
        const mergedItems: { productId: string; quantity: number }[] = [];

        for (const guestItem of guestItems) {
            const { productId, quantity } = guestItem;

            // Validate product exists
            const product = await prisma.product.findUnique({
                where: { id: productId }
            });

            if (!product) {
                console.warn(`Product ${productId} not found, skipping`);
                continue;
            }

            // Check if item already exists in user's cart
            const existingItem = cart.items.find(item => item.productId === productId);

            if (existingItem) {
                // Item already exists, do nothing (preserve existing quantity, don't sum)
                mergedItems.push({ productId, quantity: existingItem.quantity });
            } else {
                // Add new item
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        productId,
                        quantity
                    }
                });
                mergedItems.push({ productId, quantity });
            }
        }

        // Get updated cart
        const updatedCart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                images: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            message: `Merged ${mergedItems.length} items`,
            cart: updatedCart
        });

    } catch (error) {
        return handleApiError(error);
    }
}
