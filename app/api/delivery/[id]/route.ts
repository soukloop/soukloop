
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: {
                order: {
                    include: { vendor: true }
                }
            }
        });

        if (!delivery) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        // Access control
        const isBuyer = delivery.order.userId === session.user.id;
        const isSeller = delivery.order.vendor.userId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        if (!isBuyer && !isSeller && !isAdmin) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        return NextResponse.json(delivery);
    } catch (error) {
        console.error("Error fetching delivery:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { status, carrier, trackingNumber, shippingCost } = body;

        const delivery = await prisma.delivery.findUnique({
            where: { id },
            include: {
                order: {
                    include: { vendor: true }
                }
            }
        });

        if (!delivery) {
            return NextResponse.json({ error: "Delivery not found" }, { status: 404 });
        }

        // Only Seller (Vendor) or Admin can update delivery details
        const isSeller = delivery.order.vendor.userId === session.user.id;
        const isAdmin = session.user.role === "ADMIN";

        if (!isSeller && !isAdmin) {
            return NextResponse.json({ error: "Forbidden: Only seller can update delivery" }, { status: 403 });
        }

        const updatedDelivery = await prisma.delivery.update({
            where: { id },
            data: {
                status: status ?? undefined,
                carrier: carrier ?? undefined,
                trackingNumber: trackingNumber ?? undefined,
                shippingCost: shippingCost ?? undefined,
            },
        });

        return NextResponse.json(updatedDelivery);
    } catch (error) {
        console.error("Error updating delivery:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
