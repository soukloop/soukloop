import { prisma } from "@/lib/prisma";
import OrdersClient, { DisplayOrder } from "./orders-client";

import { getOverallStatus, getDeliveryStatusText } from "@/services/orders.service";
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
        status: getOverallStatus(order as any),
        total: Number(order.totalAmount),
        type: "buyer",
        productNames,
        productImages,
        deliveryText: getDeliveryStatusText(order as any)
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
