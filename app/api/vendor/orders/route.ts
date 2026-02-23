import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || ''
    const mode = searchParams.get('mode') || 'full'
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get vendor
    const vendor = await prisma.vendor.findUnique({
      where: { userId }
    })

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      )
    }

    const where: any = {
      vendorId: vendor.id,
      ...(status && { status: status as any })
    }

    const limitParam = parseInt(searchParams.get('limit') || '10')
    const pageParam = parseInt(searchParams.get('page') || '1')

    const includeQuery = mode === 'lite'
      ? {
        items: {
          take: 3,
          select: {
            quantity: true,
            price: true,
            product: {
              select: {
                name: true,
                images: { take: 1, select: { url: true } }
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
      : {
        items: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        payments: true
      }

    // Run count and query in parallel
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limitParam,
        skip: (pageParam - 1) * limitParam,
        include: includeQuery as any,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.order.count({ where })
    ])

    return NextResponse.json({
      items: orders,
      total,
      page: pageParam,
      limit: limitParam,
      totalPages: Math.ceil(total / limitParam),
    })

  } catch (error) {
    console.error('Vendor orders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
