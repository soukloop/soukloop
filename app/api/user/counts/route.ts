import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import jwt from 'jsonwebtoken'

const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;

async function getAdminSession(request: NextRequest) {
    const token = request.cookies.get('admin_session')?.value
    if (!token) return null
    try {
        const decoded = jwt.verify(token, ADMIN_SESSION_SECRET!) as any
        if (decoded.exp && Date.now() > decoded.exp) return null
        return decoded
    } catch {
        return null
    }
}

export async function GET(request: NextRequest) {
    try {
        let userId: string | null = null;
        let isAuthenticated = false;

        // 1. Try Standard User Auth
        const session = await auth();
        if (session?.user?.id) {
            userId = session.user.id;
            isAuthenticated = true;
        } else {
            // 2. Try Admin Auth
            try {
                const adminSession = await getAdminSession(request);
                if (adminSession) {
                    userId = adminSession.id;
                    isAuthenticated = true;
                }
            } catch (e) {
                console.error('[API/Counts] Admin Session Check Failed:', e);
            }
        }

        if (!isAuthenticated || !userId) {
            return NextResponse.json({
                cartCount: 0,
                notificationCount: 0,
                favoritesCount: 0,
                isAuthenticated: false
            });
        }

        // Run lightweight count queries in parallel
        const [cartItemsCount, notificationCount, favoritesCount] = await Promise.all([
            // Count cart items
            prisma.cartItem.count({
                where: {
                    cart: {
                        userId: userId
                    }
                }
            }),
            // Count unread notifications
            prisma.notification.count({
                where: {
                    userId: userId,
                    isRead: false
                }
            }),
            // Count wishlist items
            prisma.favorite.count({
                where: {
                    userId: userId
                }
            })
        ]);

        return NextResponse.json({
            cartCount: cartItemsCount,
            notificationCount: notificationCount,
            favoritesCount: favoritesCount,
            isAuthenticated: true
        });

    } catch (error) {
        console.error('Counts GET error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
