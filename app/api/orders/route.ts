import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { RewardService } from '@/features/rewards/service'
import { REWARD_RULES, ACTION_TYPES, REFERENCE_TYPES } from '@/features/rewards/constants'
import { notifyOrderPlaced, notifySellersNewOrder } from '@/lib/notifications/templates/order-templates'
import { SUBSCRIPTION_PLANS } from '@/config/subscriptions';

export const dynamic = 'force-dynamic'

// Helper to compute delivery status for a CustomerOrder
function computeDeliveryStatus(vendorOrders: { status: string }[]) {
  const total = vendorOrders.length
  const delivered = vendorOrders.filter(vo => vo.status === 'DELIVERED').length

  return {
    deliveredCount: delivered,
    totalShipments: total,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const cursor = searchParams.get('cursor')
    const role = searchParams.get('role')
    const status = searchParams.get('status')

    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Pagination Params
    const take = limit + 1
    const cursorObj = cursor && cursor !== 'null' ? { id: cursor } : undefined
    const skip = cursor && cursor !== 'null' ? 1 : (page - 1) * limit

    // SELLER: Return VendorOrders (Order model) for their specific vendor
    if (role === 'seller') {
      const vendor = await prisma.vendor.findUnique({
        where: { userId },
        select: { id: true }
      })

      if (!vendor) {
        return NextResponse.json({
          items: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
          nextCursor: null
        })
      }

      const where: any = { vendorId: vendor.id }
      if (status) {
        where.status = status as any
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          select: {
            id: true,
            orderNumber: true,
            createdAt: true,
            status: true,
            total: true,
            items: {
              select: {
                product: {
                  select: {
                    name: true,
                    images: { take: 1, select: { url: true } }
                  }
                }
              }
            }
          },
          // Conditional Pagination
          ...(cursor ? {
            take,
            skip: cursor !== 'null' ? 1 : 0,
            cursor: cursor !== 'null' ? { id: cursor } : undefined,
          } : {
            take: limit,
            skip: (page - 1) * limit,
          }),
          orderBy: { createdAt: 'desc' }
        }),
        prisma.order.count({ where })
      ])

      let nextCursor: string | null = null;
      let items = orders;

      if (cursor) {
        if (orders.length > limit) {
          const nextItem = orders.pop();
          nextCursor = nextItem?.id || orders[limit - 1].id;
          items = orders; // popped
        }
      }

      return NextResponse.json({
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        nextCursor
      })
    }

    const mode = searchParams.get('mode') // 'lite' or 'full'

    // BUYER: Return CustomerOrders (parent orders) with nested vendorOrders
    const where: any = { userId }

    // Select optimization based on mode
    const includeQuery = mode === 'lite'
      ? {
        // LITE MODE: Fetch only essential data for list view
        vendorOrders: {
          select: {
            id: true,
            status: true,
            items: {
              take: 2, // Only show first 2 items in list for preview, as UI only displays up to 2
              select: {
                quantity: true,
                price: true,
                product: {
                  select: {
                    slug: true,
                    name: true,
                    images: { take: 1, select: { url: true } }
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
      : {
        // FULL MODE: Refactored to SELECT instead of heavy nested INCLUDE
        vendorOrders: {
          select: {
            id: true,
            status: true,
            orderNumber: true,
            total: true,
            createdAt: true,
            items: {
              select: {
                quantity: true,
                price: true,
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    description: false, // Omit heavy string columns if not needed on list
                    images: { take: 1, select: { url: true } }
                  }
                }
              }
            },
            vendor: {
              select: {
                id: true,
                storeName: true
              }
            },
            payments: {
              select: {
                status: true,
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      } as any; // Type assertion needed for dynamic select/include swap

    const [customerOrders, total] = await Promise.all([
      prisma.customerOrder.findMany({
        where,
        // @ts-ignore - Dynamic include/select switch is tricky for Prisma types
        include: includeQuery,
        // Conditional Pagination
        ...(cursor ? {
          take,
          skip: cursor !== 'null' ? 1 : 0,
          cursor: cursor !== 'null' ? { id: cursor } : undefined,
        } : {
          take: limit,
          skip: (page - 1) * limit,
        }),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customerOrder.count({ where })
    ])

    let nextCursor: string | null = null;
    let items = customerOrders;

    if (cursor && customerOrders.length > limit) {
      const nextItem = customerOrders.pop();
      nextCursor = nextItem?.id || customerOrders[limit - 1].id;
      items = customerOrders;
    }

    // Add computed delivery status to each order
    const ordersWithStatus = customerOrders.map(order => ({
      ...order,
      ...computeDeliveryStatus(order.vendorOrders)
    }))

    return NextResponse.json({
      items: ordersWithStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      nextCursor
    })

  } catch (error: any) {
    console.error('Orders GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, shippingAddress, notes, shippingMethodId, tax: taxTotalInCents, redeemedPoints, paymentMethod, couponId } = await request.json()

    // Server-side Shipping Validation
    const getShippingCost = (methodId: string) => {
      switch (methodId) {
        case 'express': return 1500;
        case 'pickup': return 2100;
        case 'free': default: return 0;
      }
    }
    const shippingTotal = getShippingCost(shippingMethodId);

    if (!items?.length) {
      return NextResponse.json({ error: 'No items in order' }, { status: 400 })
    }

    // Every order starts as PENDING until Stripe webhook confirms payment
    const initialStatus = 'PENDING';

    // 1. Group items by vendor
    const productIds = items.map((i: any) => i.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        price: true,
        vendorId: true,
        name: true,
        status: true,
        vendor: { select: { userId: true } }
      }
    })

    const productMap = new Map(products.map(p => [p.id, p]))

    // Check Stock Availability before creating any records
    for (const item of items) {
      const product = productMap.get(item.productId) as any
      if (!product) {
        return NextResponse.json({ error: `Product not found` }, { status: 404 })
      }
      if (product.status === 'SOLD') {
        return NextResponse.json({ error: `Product ${product.name} is already sold` }, { status: 400 })
      }
    }

    const vendorGroups: Record<string, { items: typeof items }> = {}

    for (const item of items) {
      const product = productMap.get(item.productId) as any
      if (!product) continue

      const vendorId = product.vendorId
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = { items: [] }
      }
      vendorGroups[vendorId].items.push({ ...item, actualPrice: product.price })
    }

    // Calculate grand total
    const grandSubtotal = Object.values(vendorGroups).flatMap(group => group.items).reduce((sum: number, item: any) =>
      sum + (Number(item.actualPrice) * item.quantity), 0
    )
    const grandShipping = Number(shippingTotal) / 100 || 0

    // START: Dynamic Tax Logic
    // Use the tax passed from frontend (Stripe Location-Based), or 0 if not provided
    const grandTax = Number(taxTotalInCents) / 100 || 0;
    // END: Dynamic Tax Logic

    // Coupon Calculation
    let couponDiscount = 0;
    let validCoupon: any = null;

    if (couponId) {
      // @ts-ignore
      validCoupon = await prisma.coupon.findUnique({ where: { id: couponId } });
      if (validCoupon && validCoupon.isActive) {
        const now = new Date();
        const isValidDate = now >= new Date(validCoupon.startDate) && (!validCoupon.endDate || now <= new Date(validCoupon.endDate));
        const isValidUses = validCoupon.maxUses === null || validCoupon.currentUses < validCoupon.maxUses;

        // Find the valid vendor subtotal for this coupon
        const couponVendorGroup = vendorGroups[validCoupon.vendorId];
        if (isValidDate && isValidUses && couponVendorGroup) {
          const couponVendorSubtotal = couponVendorGroup.items.reduce((sum: number, item: any) =>
            sum + (Number(item.actualPrice) * item.quantity), 0
          );

          if (validCoupon.minOrderValue === null || couponVendorSubtotal >= validCoupon.minOrderValue) {
            if (validCoupon.discountType === "PERCENTAGE") {
              couponDiscount = couponVendorSubtotal * (validCoupon.discountValue / 100);
            } else if (validCoupon.discountType === "FIXED") {
              couponDiscount = validCoupon.discountValue;
              if (couponDiscount > couponVendorSubtotal) couponDiscount = couponVendorSubtotal;
            }
          } else {
            validCoupon = null; // Minimum order value not met, ignore coupon
          }
        } else {
          validCoupon = null; // Invalid date/uses or no items for this vendor, ignore
        }
      } else {
        validCoupon = null;
      }
    }

    // Reward Calculation
    const POINT_VALUE = 0.01
    const rewardDiscountAmount = redeemedPoints ? (redeemedPoints * POINT_VALUE) : 0
    const grandTotal = Math.max(0, grandSubtotal + grandShipping + grandTax - rewardDiscountAmount - couponDiscount)

    // Generate parent order number
    const parentOrderNumber = `ORD-${Date.now()}`

    // 2. Create CustomerOrder + VendorOrders in transaction
    const result = await prisma.$transaction(async (tx) => {

      // Handle Redemption (Deduct Points)
      // POINTS ARE NO LONGER DEDUCTED HERE to prevent loss on Stripe cancellation.
      // We only verify they have enough points. The Stripe webhook handles deduction.
      if (redeemedPoints && redeemedPoints > 0) {
        const balance = await tx.rewardBalance.findUnique({ where: { userId: session.user.id } })
        if (!balance || balance.currentBalance < redeemedPoints) {
          throw new Error("Insufficient reward points")
        }
      }

      // Record Coupon Usage
      // COUPON USAGE IS NO LONGER LOGGED HERE to prevent loss on Stripe cancellation.
      // We only verify they have a valid coupon. The Stripe webhook handles the increment.

      // Create parent CustomerOrder
      const parentOrder = await tx.customerOrder.create({
        data: {
          userId: session.user.id,
          orderNumber: parentOrderNumber,
          totalAmount: grandTotal,
          shippingAddress: shippingAddress || {},
          billingAddress: shippingAddress || {},
          notes: notes || null,
        }
      })

      // Create VendorOrder for each vendor
      const vendorEntries = Object.entries(vendorGroups)

      await Promise.all(vendorEntries.map(async ([vendorId, groupData], i) => {
        const vendorItems = groupData.items

        const subtotal = vendorItems.reduce((sum: number, item: any) =>
          sum + (Number(item.actualPrice) * item.quantity), 0
        )
        const shipping = i === 0 ? grandShipping : 0

        // Distribution of Dynamic Tax
        const tax = grandSubtotal > 0 ? (subtotal / grandSubtotal) * grandTax : 0;

        const total = subtotal + shipping + tax

        // Fixed 12% commission for all vendors
        const commissionBps = 1200;
        const COMMISSION_RATE = commissionBps / 10000; // e.g. 1200 -> 0.12
        const platformFee = subtotal * COMMISSION_RATE

        // Net payout = (subtotal after commission) + shipping reimbursement
        // TAX IS RETAINED BY PLATFORM to pay government
        // Subtract coupon discount from net payout if they are the one who issued it
        const thisVendorCouponDiscount = (validCoupon && validCoupon.vendorId === vendorId) ? couponDiscount : 0;
        const netPayout = (subtotal * (1 - COMMISSION_RATE)) + shipping - thisVendorCouponDiscount;

        // Apply Points Discount Proportionally
        let thisVendorPointsDiscount = 0;
        if (rewardDiscountAmount > 0 && grandSubtotal > 0) {
          // Distribute points discount based on this vendor's subtotal share
          thisVendorPointsDiscount = (subtotal / grandSubtotal) * rewardDiscountAmount;
        }

        const vendorOrderNumber = `${parentOrderNumber}-V${i + 1}`

        // Final discounted total for this specific vendor
        const discountedTotal = Math.max(0, subtotal + shipping + tax - thisVendorCouponDiscount - thisVendorPointsDiscount);

        const createdOrderRecord = await tx.order.create({
          data: {
            customerOrderId: parentOrder.id,
            userId: session.user.id,
            vendorId,
            orderNumber: vendorOrderNumber,
            status: initialStatus,
            subtotal,
            tax,
            shipping,
            total: discountedTotal,
            commissionRate: COMMISSION_RATE,
            platformFee,
            netPayout,
            currency: 'USD',
            shippingAddress: shippingAddress || {},
            billingAddress: shippingAddress || {},
            notes: notes || '',
            couponId: validCoupon && validCoupon.vendorId === vendorId ? validCoupon.id : null, // Record if coupon was used
            items: {
              create: vendorItems.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.actualPrice)
              }))
            },
            payments: {
              create: {
                provider: 'STRIPE',
                status: 'PENDING',
                amount: discountedTotal,
                currency: 'USD'
              }
            }
          }
        })

        // Create PaymentTransaction (Ledger entry)
        await tx.paymentTransaction.create({
          data: {
            orderId: createdOrderRecord.id,
            userId: session.user.id,
            amount: new Prisma.Decimal(discountedTotal),
            currency: 'USD',
            provider: 'STRIPE',
            status: 'PENDING',
            providerTransactionId: null // To be updated by Stripe or on delivery
          }
        })

      }))

      /* 
      // Inventory and Rewards are now handled by Stripe Webhook
      // to ensure payment is successful before taking stock or giving points.
      */

      return { customerOrderId: parentOrder.id, vendorGroups } // Return both for notification logic
    }, {
      maxWait: 5000,
      timeout: 15000 // Extended timeout to prevent Prisma P2028
    })

    // Fetch the deeply nested order AFTER the transaction lock is released
    const createdOrder = await prisma.customerOrder.findUnique({
      where: { id: result.customerOrderId },
      include: {
        vendorOrders: {
          include: {
            items: {
              include: {
                product: { include: { images: true } }
              }
            },
            vendor: true
          }
        }
      }
    })

    // Notifications are now triggered by Stripe Webhook upon successful payment
    /*
    if (paymentMethod !== 'card') {
      ...
    }
    */

    // ➤ CLEANUP: Remove purchased items from Cart
    // ➤ CLEANUP: Cart clearing moved to Payment Success / Webhook
    // This prevents the cart from being emptied if the subsequent payment redirection fails.
    /*
    try {
      const purchasedProductIds = items.map((i: any) => i.productId);

      const userCart = await prisma.cart.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
      });

      if (userCart && purchasedProductIds.length > 0) {
        await prisma.cartItem.deleteMany({
          where: {
            cartId: userCart.id,
            productId: { in: purchasedProductIds }
          }
        });
      }
    } catch (cleanupError) {
      console.error('Failed to clear cart items:', cleanupError);
      // Don't fail the request, just log it. Order is already created.
    }
    */

    return NextResponse.json({
      success: true,
      customerOrder: createdOrder,
      redeemedPoints: redeemedPoints || 0,
      message: `Created order with ${Object.keys(result.vendorGroups).length} shipments`
    })

  } catch (error) {
    console.error('Create Order Error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}
