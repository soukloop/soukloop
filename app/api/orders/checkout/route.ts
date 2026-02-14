import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from "@/auth"
import { notifyOrderPlaced, notifySellersNewOrder } from '@/lib/notifications/index'
import { handleApiError } from '@/lib/api-wrapper'
import { z } from 'zod'

// Schema for checkout payload
const checkoutSchema = z.object({
  paymentMethod: z.string(),
  notes: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().min(1, 'Full name required'),
    streetAddress: z.string().min(1, 'Street address required'),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    postalCode: z.string().min(1, 'Postal code required'),
    country: z.string().min(1, 'Country required'),
    phoneNumber: z.string().optional(),
  }),
  billingAddress: z.object({
    fullName: z.string().min(1, 'Full name required'),
    streetAddress: z.string().min(1, 'Street address required'),
    city: z.string().min(1, 'City required'),
    state: z.string().min(1, 'State required'),
    postalCode: z.string().min(1, 'Postal code required'),
    country: z.string().min(1, 'Country required'),
    phoneNumber: z.string().optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validationResult = checkoutSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { shippingAddress, billingAddress, notes, paymentMethod } = validationResult.data;

    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Get user's cart with products
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Group cart items by vendor
    const itemsByVendor: Record<string, typeof cart.items> = {}
    for (const item of cart.items) {
      const vendorId = item.product.vendorId
      if (!itemsByVendor[vendorId]) {
        itemsByVendor[vendorId] = []
      }
      itemsByVendor[vendorId].push(item)
    }

    // Calculate grand total for parent order
    const grandSubtotal = cart.items.reduce((sum, item) =>
      sum + (item.product.price * item.quantity), 0
    )
    const grandTax = grandSubtotal * 0.08 // 8% tax
    const grandShipping = grandSubtotal > 100 ? 0 : 10 // Free shipping over $100
    const grandTotal = grandSubtotal + grandTax + grandShipping

    // Generate parent order number
    const parentOrderNumber = `ORD-${Date.now()}`

    // Create parent CustomerOrder and child VendorOrders in a transaction
    const customerOrder = await prisma.$transaction(async (tx) => {
      // Step 1: Create parent CustomerOrder
      const parentOrder = await tx.customerOrder.create({
        data: {
          userId,
          orderNumber: parentOrderNumber,
          totalAmount: grandTotal,
          shippingAddress: shippingAddress,
          billingAddress: billingAddress || shippingAddress,
          notes: body.notes || null,
        }
      })

      // Step 2: Create VendorOrder for each vendor
      const vendorOrderIds: string[] = []
      const vendorEntries = Object.entries(itemsByVendor)

      for (let i = 0; i < vendorEntries.length; i++) {
        const [vendorId, items] = vendorEntries[i]

        // Calculate vendor-specific totals
        const vendorSubtotal = items.reduce((sum, item) =>
          sum + (item.product.price * item.quantity), 0
        )
        // Split shipping proportionally (first vendor gets shipping if applicable)
        const vendorShipping = i === 0 ? grandShipping : 0
        const vendorTax = vendorSubtotal * 0.08
        const vendorTotal = vendorSubtotal + vendorTax + vendorShipping

        // Generate vendor sub-order number (parent + suffix)
        const vendorOrderNumber = `${parentOrderNumber}-V${i + 1}`

        const vendorOrder = await tx.order.create({
          data: {
            customerOrderId: parentOrder.id,  // Link to parent
            userId,
            vendorId,
            orderNumber: vendorOrderNumber,
            subtotal: vendorSubtotal,
            tax: vendorTax,
            shipping: vendorShipping,
            total: vendorTotal,
            shippingAddress: shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            notes: body.notes || null,
            items: {
              create: items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price
              }))
            }
          }
        })

        vendorOrderIds.push(vendorOrder.id)

        // Update inventory for each item
        for (const item of items) {
          // 1. First, fetch current stock (Row Lock if possible, or usually just check)
          const currentProduct = await tx.product.findUnique({
            where: { id: item.productId }
          });

          if (!currentProduct) throw new Error(`Product ${item.productId} not found`);

          if (currentProduct.status === 'SOLD') {
            throw new Error(`Item "${currentProduct.name}" is already sold.`);
          }

          // 2. Perform the update if check passes
          const product = await tx.product.update({
            where: { id: item.productId },
            data: { status: 'PROCESSING' },
            select: { id: true, status: true }
          })
        }
      }

      // Return the parent order with all vendor orders
      return tx.customerOrder.findUnique({
        where: { id: parentOrder.id },
        include: {
          vendorOrders: {
            include: {
              items: {
                include: {
                  product: {
                    include: {
                      images: true
                    }
                  }
                }
              },
              vendor: true
            }
          }
        }
      })
    })

    // Clear cart after successful order creation
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    })

    // ===== SEND NOTIFICATIONS =====
    // ===== SEND NOTIFICATIONS =====
    // Notify buyer
    notifyOrderPlaced(userId, {
      orderId: customerOrder!.id,
      orderNumber: parentOrderNumber,
      total: grandTotal,
      itemCount: cart.items.length,
      // New Data
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      estimatedDelivery: '3-5 Business Days' // Defaulting for now
    }).catch(err => console.error('[Checkout] Buyer notification failed:', err))

    // Notify all sellers about new order
    const vendorUserIds = await prisma.vendor.findMany({
      where: { id: { in: Object.keys(itemsByVendor) } },
      select: { userId: true }
    }).then(vendors => vendors.map(v => v.userId))

    if (vendorUserIds.length > 0) {
      notifySellersNewOrder(vendorUserIds, {
        orderId: customerOrder!.id,
        orderNumber: parentOrderNumber,
        buyerName: session.user.name || undefined,
        // New Data
        shippingAddress: shippingAddress,
        notes: body.notes
      }).catch(err => console.error('[Checkout] Seller notification failed:', err))
    }

    return NextResponse.json(customerOrder, { status: 201 })

  } catch (error) {
    return handleApiError(error);
  }
}

