import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

const updateItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater')
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validationResult = updateItemSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const { quantity } = validationResult.data

    if (quantity === 0) {
      // Remove item if quantity is 0
      await prisma.cartItem.delete({
        where: { id }
      })
      return NextResponse.json({ success: true })
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product: {
          include: {
            images: true,
            vendor: true
          }
        }
      }
    })

    return NextResponse.json(cartItem)

  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.cartItem.delete({
      where: { id }
    })

    revalidatePath('/cart')

    return NextResponse.json({ success: true })

  } catch (error) {
    return handleApiError(error)
  }
}
