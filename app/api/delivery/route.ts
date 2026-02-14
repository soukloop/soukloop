
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { notifyOrderShipped } from '@/lib/notifications/index';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { orderId, carrier, trackingNumber, shippingCost, status } = body;

        if (!orderId) {
            return NextResponse.json(
                { error: "Missing required fields: orderId" },
                { status: 400 }
            );
        }

        // Verify order exists and user has access (e.g., is seller or admin)
        // For now, assuming any authenticated user can create for demo purposes or strictly checking vendor
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: { vendor: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        // Check if user is the vendor of the order or admin
        // This logic depends on Session User role/id structure. 
        // Assuming simple check for now:
        if (order.vendor.userId !== session.user.id && session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden: Not the vendor of this order" }, { status: 403 });
        }

        // Check if delivery already exists
        const existingDelivery = await prisma.delivery.findUnique({
            where: { orderId: orderId }
        });

        if (existingDelivery) {
            return NextResponse.json({ error: "Delivery already exists for this order" }, { status: 409 });
        }

        const delivery = await prisma.delivery.create({
            data: {
                orderId,
                carrier,
                trackingNumber,
                shippingCost,
                status: status || "pending",
            },
        });

        // ===== NOTIFY BUYER =====
        notifyOrderShipped(order.userId, {
            orderId: order.id,
            orderNumber: order.orderNumber,
            trackingNumber: trackingNumber || undefined,
            carrier: carrier || undefined
        }).catch(err => console.error('[Delivery] Notification failed:', err));

        return NextResponse.json(delivery, { status: 201 });
    } catch (error) {
        console.error("Error creating delivery:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const orderId = searchParams.get("orderId");

        // Build filter based on params and user role
        let whereClause: any = {};

        if (orderId) {
            whereClause.orderId = orderId;
        }

        // Access control: User sees deliveries for their orders (as buyer) or their sales (as vendor)
        if (session.user.role !== "ADMIN") {
            whereClause.order = {
                OR: [
                    { userId: session.user.id },
                    { vendor: { userId: session.user.id } }
                ]
            };
        }

        const deliveries = await prisma.delivery.findMany({
            where: whereClause,
            include: {
                order: {
                    select: {
                        orderNumber: true,
                        status: true,
                        vendor: {
                            select: {
                                user: {
                                    select: { name: true, email: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(deliveries);
    } catch (error) {
        console.error("Error fetching deliveries:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
