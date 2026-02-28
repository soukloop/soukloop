import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import { notifyOrderPlaced, notifySellersNewOrder } from '@/lib/notifications/templates/order-templates';
import { notifyPaymentSuccess } from '@/lib/notifications/templates/payment-templates';
import { RewardService } from '@/features/rewards/service';
import { REWARD_RULES, ACTION_TYPES, REFERENCE_TYPES } from '@/features/rewards/constants';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerOrderId = session.metadata?.customerOrderId;

        if (!customerOrderId) {
          console.error('Missing customerOrderId in session metadata');
          break;
        }

        // 1. Fetch the CustomerOrder to get all sub-orders (Vendor Orders)
        const customerOrder = await prisma.customerOrder.findUnique({
          where: { id: customerOrderId },
          include: {
            vendorOrders: {
              include: { items: true }
            }
          }
        });

        if (!customerOrder) {
          console.error(`CustomerOrder ${customerOrderId} not found.`);
          break;
        }

        // IDEMPOTENCY CHECK (Critical for Production):
        // Check if this order was already processed to prevent double stock deduction and duplicate notifications.
        const existingCompletedOrder = await prisma.order.findFirst({
          where: {
            id: { in: customerOrder.vendorOrders.map(o => o.id) },
            status: 'PAID'
          }
        });

        if (existingCompletedOrder) {
          console.log(`⚠️ Idempotency Check: CustomerOrder ${customerOrderId} already processed. Skipping duplicate webhook event.`);
          return NextResponse.json({ received: true });
        }

        console.log(`Processing payment for CustomerOrder: ${customerOrderId}, found ${customerOrder.vendorOrders.length} vendor orders.`);

        // 2. Iterate and update EACH vendor order
        await prisma.$transaction(async (tx) => {
          for (const order of customerOrder.vendorOrders) {

            // Update Status
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'PAID', // Updated from invalid 'CONFIRMED'
              }
            });

            // Create Payment Record (Split amount or link full logic? For now, linking full payment ref to each for traceability, or we allocate 'total' of that order)
            // Ideally we record that THIS specific order's `total` was paid via this transaction.

            await tx.payment.updateMany({
              where: {
                orderId: order.id,
                status: 'PENDING'
              },
              data: {
                status: 'SUCCEEDED',
                transactionId: session.payment_intent as string,
                providerRef: session.id,
                processedAt: new Date(),
              }
            });

            // Also create Legacy PaymentTransaction if needed (seems duplicative based on schema, but sticking to Payment model as primary for now)
            // Schema has both `Payment` and `PaymentTransaction`. Model `PaymentTransaction` is used in schema.
            // Let's populate BOTH to be safe or check usages. Schema has `paymentTransactions` on Order.

            // 3. Update existing PaymentTransaction (Ledger entry)
            // This record was created as PENDING when the order was initiated.
            await tx.paymentTransaction.updateMany({
              where: {
                orderId: order.id,
                status: 'PENDING'
              },
              data: {
                status: 'COMPLETED',
                providerTransactionId: session.payment_intent as string,
                currency: session.currency || 'usd',
                createdAt: new Date()
              }
            });
          }

          // 3. Deduct Stock (Deferred from Order Creation for Card Payments)
          for (const order of customerOrder.vendorOrders) {
            for (const item of (order as any).items) {
              if (item.productId) {
                const product = await tx.product.update({
                  where: { id: item.productId },
                  data: {
                    status: 'SOLD'
                  },
                  select: { id: true, status: true, dressStyleId: true }
                });

                // Increment the dress style's totalSold
                if (product.dressStyleId) {
                  await tx.dressStyle.update({
                    where: { id: product.dressStyleId },
                    data: { totalSold: { increment: item.quantity || 1 } }
                  });
                }

                // Socket update if possible
                if ((global as any).io) {
                  (global as any).io.emit('product:stock-update', {
                    productId: product.id,
                    status: 'SOLD'
                  });
                }
              }
            }
          }
          // 4. Increment Coupon Usage
          for (const order of customerOrder.vendorOrders) {
            if ((order as any).couponId) {
              await tx.coupon.update({
                where: { id: (order as any).couponId },
                data: { currentUses: { increment: 1 } }
              });
            }
          }
        });

        // 2. Process Reward Points (Logic from previous steps)
        let pointsEarned = 0;
        session.line_items?.data.forEach((item: any) => {
          const rewardPoints = item.price?.product?.metadata?.reward_points;
          if (rewardPoints) {
            pointsEarned += (parseInt(rewardPoints) * (item.quantity || 1));
          }
        });

        if (pointsEarned > 0) {
          await prisma.rewardPoint.create({
            data: {
              userId: customerOrder.userId,
              points: pointsEarned,
              actionType: ACTION_TYPES.PURCHASE,
              referenceId: customerOrder.id,
              referenceType: REFERENCE_TYPES.ORDER,
              note: `Earned ${pointsEarned} points for Order #${customerOrder.orderNumber}`
            }
          });
        }

        // Deduct Redeemed Points (Passed via Metadata to ensure they aren't lost on cancellation)
        const pointsToDeductRaw = session.metadata?.pointsToDeduct;
        const pointsToDeduct = pointsToDeductRaw ? parseInt(pointsToDeductRaw, 10) : 0;

        if (pointsToDeduct > 0) {
          // Deduct from Balance
          await prisma.user.update({
            where: { id: customerOrder.userId },
            data: {
              rewardBalance: {
                update: {
                  totalRedeemed: { increment: pointsToDeduct },
                  currentBalance: { decrement: pointsToDeduct }
                }
              }
            }
          });

          // Log Redemption
          await prisma.rewardPoint.create({
            data: {
              userId: customerOrder.userId,
              points: -pointsToDeduct,
              actionType: ACTION_TYPES.REDEEMED,
              referenceId: customerOrder.orderNumber,
              referenceType: REFERENCE_TYPES.REDEMPTION,
              note: `Redeemed ${pointsToDeduct} points for discount on Order #${customerOrder.orderNumber}`
            }
          });
        }

        // 3. Send Notifications
        try {
          // A. Notify Buyer: Payment Success
          await notifyPaymentSuccess(customerOrder.userId, {
            orderId: customerOrder.id,
            orderNumber: customerOrder.orderNumber,
            amount: customerOrder.totalAmount,
            currency: session.currency || 'usd'
          });

          // PREPARE ENHANCED DATA
          const shippingTotal = customerOrder.vendorOrders.reduce((sum, vo) => sum + (vo.shipping || 0), 0);
          const subtotalTotal = customerOrder.vendorOrders.reduce((sum, vo) => sum + (vo.subtotal || 0), 0);

          // Get Points Used
          const pointsRedemption = await prisma.rewardPoint.findFirst({
            where: {
              userId: customerOrder.userId,
              actionType: ACTION_TYPES.REDEEMED,
              referenceId: customerOrder.orderNumber
            }
          });
          const pointsUsedNum = pointsRedemption ? Math.abs(Number(pointsRedemption.points)) : 0;

          // Get Coupon Info (if any)
          const firstVendorOrderWithCoupon = customerOrder.vendorOrders.find(vo => (vo as any).couponId);
          let couponCode = undefined;
          let couponDiscountTotal = 0;

          if ((firstVendorOrderWithCoupon as any)?.couponId) {
            const coupon = await prisma.coupon.findUnique({
              where: { id: (firstVendorOrderWithCoupon as any).couponId }
            });
            if (coupon) {
              couponCode = coupon.code;
            }
          }

          // In our Orders API, we subtract the coupon from the net payout, but the buyer pays:
          // grandTotal = totalPriceDollars + shippingDollars - (pointsDiscount) - (promoDiscount)
          // So the CustomerOrder.totalAmount ALREADY has promoDiscount subtracted.
          // To show it in the email summary as "Subtotal - Promo", we need to know what that Promo amount was.
          // We can calculate it by comparing (Subtotal + Shipping + Tax) vs (TotalAmount + PointsDiscount)
          const grandTax = customerOrder.vendorOrders.reduce((sum, vo) => sum + (vo.tax || 0), 0);
          const pointsDiscountDollars = pointsUsedNum * 0.01;
          const expectedTotalWithoutPromo = subtotalTotal + shippingTotal + grandTax;
          couponDiscountTotal = Math.max(0, expectedTotalWithoutPromo - (Number(customerOrder.totalAmount) + pointsDiscountDollars));

          // B. Notify Buyer: Order Confirmed
          await notifyOrderPlaced(customerOrder.userId, {
            orderId: customerOrder.id,
            orderNumber: customerOrder.orderNumber,
            total: Number(customerOrder.totalAmount),
            itemCount: customerOrder.vendorOrders.reduce((acc, vo: any) => acc + (vo.items?.length || 0), 0),
            // New Data
            shippingAddress: (customerOrder as any).shippingAddress,
            paymentMethod: 'Credit Card (Stripe)',
            estimatedDelivery: '3-5 Business Days',
            subtotal: subtotalTotal,
            shipping: shippingTotal,
            pointsUsed: pointsUsedNum,
            pointsGained: pointsEarned,
            couponCode: couponCode,
            couponDiscount: couponDiscountTotal
          });

          // C. Notify Sellers: New Order
          const vendorIds = customerOrder.vendorOrders.map(vo => vo.vendorId);
          const vendors = await prisma.vendor.findMany({
            where: { id: { in: vendorIds } },
            select: { id: true, userId: true }
          });

          const user = await prisma.user.findUnique({
            where: { id: customerOrder.userId },
            select: { name: true }
          });

          for (const vo of customerOrder.vendorOrders) {
            const vendor = vendors.find(v => v.id === vo.vendorId);
            if (vendor) {
              await notifySellersNewOrder([vendor.userId], {
                orderId: vo.id,
                orderNumber: vo.orderNumber,
                total: vo.total,
                buyerName: user?.name || 'A Customer',
                // New Data
                shippingAddress: (vo as any).shippingAddress || (customerOrder as any).shippingAddress,
                notes: (vo as any).notes || (customerOrder as any).notes,
                couponCode: (vo as any).couponId === (firstVendorOrderWithCoupon as any)?.couponId ? couponCode : undefined,
                couponDiscount: (vo as any).couponId === (firstVendorOrderWithCoupon as any)?.couponId ? couponDiscountTotal : 0
              });
            }
          }
        } catch (notifError) {
          console.error('Failed to send post-payment notifications:', notifError);
        }

        console.log(`Successfully confirmed all orders for CustomerOrder ${customerOrderId}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`Payment failed: ${paymentIntent.id}`);
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
