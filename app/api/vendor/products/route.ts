import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

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

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where: { vendorId: vendor.id },
        include: {
          images: true,
          vendor: {
            select: {
              userId: true
            }
          },
          _count: {
            select: {
              reviews: true,
              orderItems: true
            }
          },
          orderItems: {
            where: {
              order: {
                status: {
                  in: ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                }
              }
            },
            include: {
              order: {
                select: {
                  status: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({
        where: { vendorId: vendor.id }
      })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    const mappedProducts = products.map(product => {
      let status = 'ACTIVE';

      // Check for active orders
      const hasActiveOrder = product.orderItems.some(item => {
        const orderStatus = item.order.status;
        return ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'FULFILLED'].includes(orderStatus);
      });

      if (!product.isActive) {
        status = 'INACTIVE';
      } else if (hasActiveOrder) {
        status = 'PROCESSING';
      } else if (product.status === 'SOLD') {
        status = 'SOLD';
      }

      return {
        ...product,
        // Remove orderItems to keep response clean (optional, keeping it clean is good practice)
        orderItems: undefined,
        status
      }
    })

    return NextResponse.json({
      items: mappedProducts,
      totalPages,
      currentPage: page,
      totalCount
    })

  } catch (error) {
    console.error('Vendor products GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
