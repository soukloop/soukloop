import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

const addItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = addItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { productId, quantity } = validationResult.data

    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get or create cart
    let cart = await prisma.cart.findUnique({
      where: { userId }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId }
      })
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId
        }
      }
    })

    if (existingItem) {
      // Product already in cart. Return existing item without updating quantity.
      return NextResponse.json(existingItem)
    }

    // Add new item to cart
    const cartItem = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity
      },
      include: {
        product: {
          include: {
            images: true,
            vendor: true
          }
        }
      }
    })

    return NextResponse.json(cartItem, { status: 201 })

  } catch (error) {
    return handleApiError(error)
  }
}
