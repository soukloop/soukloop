import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await request.json().catch(() => ({})); // Handle empty body safely
        const { productIds } = body;

        // Find the user's cart
        const cart = await prisma.cart.findUnique({
            where: { userId },
            select: { id: true }
        });

        if (!cart) {
            return NextResponse.json({ success: true, message: 'No cart found' });
        }

        if (productIds && Array.isArray(productIds) && productIds.length > 0) {
            // Partial Clear: Only remove specific items (purchased)
            await prisma.cartItem.deleteMany({
                where: {
                    cartId: cart.id,
                    productId: { in: productIds }
                }
            });
            return NextResponse.json({ success: true, message: `Cleared ${productIds.length} items from cart` });
        } else {
            // Full Clear (Fallback)
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });
            return NextResponse.json({ success: true, message: 'Cart cleared successfully' });
        }

    } catch (error: any) {
        console.error('Clear Cart Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', message: error.message },
            { status: 500 }
        );
    }
}
