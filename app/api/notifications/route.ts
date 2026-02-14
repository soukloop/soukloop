import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
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
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor'); // notification ID
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const take = limit + 1; // Fetch 1 extra to check if there are more
    let skip = 0;
    if (cursor && cursor !== 'null') {
      skip = 1; // Skip the cursor itself
    }

    // Common query options
    const queryOptions = {
      take,
      skip: cursor && cursor !== 'null' ? 1 : 0,
      cursor: cursor && cursor !== 'null' ? { id: cursor } : undefined,
      orderBy: { createdAt: 'desc' } as const,
    };

    let notifications: any[] = [];
    let userId: string | null = null;
    let isAuthenticated = false;

    // 1. Try Standard User Auth
    const session = await auth()
    console.log('[API/Notifications] Auth Session:', session?.user?.id ? 'Found' : 'Missing');

    if (session?.user?.id) {
      userId = session.user.id;
      isAuthenticated = true;
    } else {
      // 2. Try Admin Auth
      try {
        const adminSession = await getAdminSession(request);
        console.log('[API/Notifications] Admin Session (Cookie):', adminSession ? 'Found' : 'Missing');
        if (adminSession) {
          userId = adminSession.id;
          isAuthenticated = true;
        }
      } catch (e) {
        console.error('[API/Notifications] Admin Session Check Failed:', e);
      }
    }

    if (isAuthenticated && userId) {
      notifications = await prisma.notification.findMany({
        where: { userId },
        ...queryOptions,
      });

      let nextCursor: string | null = null;
      if (notifications.length > limit) {
        const nextItem = notifications.pop(); // Remove the extra item
        nextCursor = nextItem?.id || notifications[limit - 1].id;
      }

      return NextResponse.json({
        items: notifications,
        nextCursor
      });
    }

    // 3. Unauthorized
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )

  } catch (error: any) {
    console.error('Notifications GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (session?.user?.id) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true }
      })
      return NextResponse.json({ success: true })
    }

    const adminSession = await getAdminSession(request)

    if (adminSession) {
      await prisma.notification.updateMany({
        where: { userId: adminSession.id, isRead: false },
        data: { isRead: true }
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )

  } catch (error) {
    console.error('Notifications PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
