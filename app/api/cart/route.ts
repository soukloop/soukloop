import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

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

    // OPTIMIZATION: Removed redundant User check. Session ID is sufficient.

    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: { createdAt: 'asc' }, // Ensure consistent order
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                status: true,
                isActive: true, // Needed for cart validation
                images: {
                  take: 1,
                  select: { url: true }
                },
                vendor: {
                  select: {
                    id: true,
                    user: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!cart) {
      // Create empty cart if none exists
      // Optimization: No need to return full heavy object on creation
      const newCart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      })
      return NextResponse.json(newCart)
    }

    return NextResponse.json(cart)

  } catch (error) {
    console.error('Cart GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
