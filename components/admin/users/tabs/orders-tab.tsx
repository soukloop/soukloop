import { prisma } from "@/lib/prisma";
import OrdersClient, { DisplayOrder } from "./orders-client";

// Helper to calculate overall status for Customer Order (Buyer View)
function getOverallStatus(order: any): string {
    if (order.status) return order.status; // Fallback
    // If we had computed status logic based on vendor orders, it would go here.
    // For now, assuming direct status or defaulting to PENDING if not present.
    // In real app, CustomerOrder might not have status, it's derived.
    // Checking api.ts: CustomerOrder has no status. VendorOrders have status.
    // Logic from hooks/useOrders.ts service: getOverallStatus
    // We'll simplify: If all vendor orders delivered -> DELIVERED. Else PENDING/PROCESSING.
    const statuses = order.vendorOrders?.map((vo: any) => vo.status) || [];
    if (statuses.length === 0) return 'PENDING';
    if (statuses.every((s: string) => s === 'DELIVERED')) return 'DELIVERED';
    if (statuses.every((s: string) => s === 'CANCELED')) return 'CANCELED';
    if (statuses.some((s: string) => s === 'SHIPPED')) return 'SHIPPED';
    return 'PROCESSING';
}

function customerOrderToDisplay(order: any): DisplayOrder {
    const productNames: string[] = [];
    const productImages: string[] = [];

    order.vendorOrders?.forEach((vo: any) => {
        vo.items?.forEach((item: any) => {
            if (item.product?.name) productNames.push(item.product.name);
            const imgUrl = item.product?.images?.[0]?.url;
            if (imgUrl) productImages.push(imgUrl);
        });
    });

    return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toString(),
        status: getOverallStatus(order),
        total: Number(order.totalAmount),
        type: "buyer",
        productNames,
        productImages,
        deliveryText: "" // Simplify for admin
    };
}

function vendorOrderToDisplay(order: any): DisplayOrder {
    const productNames = order.items?.map((item: any) => item.product?.name || 'Product') || [];
    const productImages = order.items?.map((item: any) => item.product?.images?.[0]?.url).filter(Boolean) || [];

    return {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toString(),
        status: order.status,
        total: Number(order.total),
        type: "seller",
        productNames,
        productImages
    };
}

export default async function OrdersTab({ userId }: { userId: string }) {
    // 1. Fetch User to check if vendor
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { vendor: true }
    });

    if (!user) return null;

    // 2. Fetch Buying Orders (CustomerOrder)
    const buyingOrdersRaw = await prisma.customerOrder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            vendorOrders: {
                include: {
                    items: {
                        include: {
                            product: {
                                include: { images: { take: 1, orderBy: { order: 'asc' } } }
                            }
                        }
                    }
                }
            }
        },
        take: 50
    });

    const buyerOrders = buyingOrdersRaw.map(customerOrderToDisplay);

    // 3. Fetch Selling Orders (VendorOrder) - ONLY if vendor
    let sellerOrders: DisplayOrder[] = [];
    if (user.vendor) {
        const sellingOrdersRaw = await prisma.order.findMany({
            where: { vendorId: user.vendor.id },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: {
                            include: { images: { take: 1, orderBy: { order: 'asc' } } }
                        }
                    }
                }
            },
            take: 50
        });
        sellerOrders = sellingOrdersRaw.map(vendorOrderToDisplay);
    }

    return (
        <OrdersClient
            buyerOrders={buyerOrders}
            sellerOrders={sellerOrders}
            initialViewMode={user.vendor ? 'selling' : 'buying'}
        />
    );
}
