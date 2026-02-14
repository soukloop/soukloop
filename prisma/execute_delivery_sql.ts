import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Starting Delivery verification...");

    // 1. Create a dummy user
    const user = await prisma.user.create({
        data: {
            email: `test-delivery-${Date.now()}@example.com`,
            name: "Delivery Test User",
        },
    });
    console.log("Created user:", user.id);

    // 2. Create a dummy vendor
    const vendor = await prisma.vendor.create({
        data: {
            userId: user.id,
            storeName: `Delivery Store ${Date.now()}`,
            slug: `delivery-store-${Date.now()}`,
            description: "Test vendor for delivery",
        },
    });
    console.log("Created vendor:", vendor.id);

    // 3. Create a dummy order
    const order = await prisma.order.create({
        data: {
            userId: user.id,
            vendorId: vendor.id,
            orderNumber: `ORD-${Date.now()}`,
            subtotal: 100,
            total: 110,
            shippingAddress: {},
            billingAddress: {},
        },
    });
    console.log("Created order:", order.id);

    // 4. Create a delivery record
    const delivery = await prisma.delivery.create({
        data: {
            orderId: order.id,
            carrier: "Test Carrier",
            trackingNumber: "TRACK123",
            shippingCost: 15.50,
            status: "pending",
        },
    });
    console.log("Created delivery:", delivery);

    // 5. Fetch delivery verification
    const fetchedDelivery = await prisma.delivery.findUnique({
        where: { id: delivery.id },
        include: { order: true },
    });
    console.log("Fetched delivery:", fetchedDelivery);

    // Cleanup
    await prisma.delivery.delete({ where: { id: delivery.id } });
    await prisma.order.delete({ where: { id: order.id } });
    await prisma.vendor.delete({ where: { id: vendor.id } });
    await prisma.user.delete({ where: { id: user.id } });

    console.log("Cleanup complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
