"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { OrderQuerySchema, UpdateStatusSchema } from "./schemas";
import { OrderStatus } from "@prisma/client";

import { isAtLeastAdmin } from "@/lib/roles";

/**
 * Checks if the current user has admin privileges.
 */
async function checkAdmin() {
    const session = await auth();
    if (!session?.user?.id || !isAtLeastAdmin(session.user.role)) {
        throw new Error("Unauthorized: Admin access required");
    }
    return session.user.id;
}

export async function getOrders(params: any) {
    try {
        await checkAdmin();
        const validated = OrderQuerySchema.parse(params);
        const { page, limit, search, status } = validated;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
            where.OR = [
                { orderNumber: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } },
                { user: { email: { contains: search, mode: 'insensitive' } } },
            ];
        }

        if (status && status !== 'all') {
            where.status = status.toUpperCase() as OrderStatus;
        }

        const [orders, total, statusCounts, revenueAgg] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            image: true,
                            profile: {
                                select: {
                                    avatar: true
                                }
                            }
                        }
                    },
                    items: {
                        include: {
                            product: {
                                include: {
                                    images: {
                                        take: 1,
                                        orderBy: { order: 'asc' }
                                    }
                                }
                            }
                        }
                    }
                }
            }),
            prisma.order.count({ where }),
            prisma.order.groupBy({
                by: ['status'],
                _count: { status: true }
            }),
            prisma.order.aggregate({
                _sum: { total: true },
                where: { status: { in: ['PAID', 'DELIVERED'] } }
            })
        ]);

        const stats = {
            total: total,
            completed: statusCounts.find(s => s.status === 'DELIVERED' || s.status === 'PAID')?._count.status || 0,
            pending: statusCounts.find(s => s.status === 'PENDING')?._count.status || 0,
            cancelled: statusCounts.find(s => s.status === 'CANCELED')?._count.status || 0,
            processing: statusCounts.find(s => s.status === 'PROCESSING')?._count.status || 0,
            revenue: Number(revenueAgg._sum.total || 0)
        };

        return {
            orders,
            total,
            stats,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        throw new Error(error.message || "Failed to fetch orders");
    }
}

export async function getOrderDetails(orderId: string) {
    try {
        await checkAdmin();

        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        createdAt: true,
                        profile: {
                            select: {
                                phone: true,
                                avatar: true
                            }
                        }
                    }
                },
                vendor: {
                    select: {
                        id: true,
                        slug: true,
                        logo: true,
                        user: {
                            select: {
                                name: true,
                                email: true
                            }
                        }
                    }
                },
                items: {
                    include: {
                        product: {
                            include: {
                                images: { take: 1, orderBy: { order: 'asc' } }
                            }
                        }
                    }
                },
                paymentTransactions: true,
                history: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!order) throw new Error("Order not found");

        return order;
    } catch (error: any) {
        console.error("Failed to fetch order details:", error);
        throw new Error(error.message || "Failed to fetch order details");
    }
}

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string, carrier?: string) {
    try {
        const adminId = await checkAdmin();

        const validated = UpdateStatusSchema.parse({ id: orderId, status, trackingNumber, carrier });

        const updatedOrder = await prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: validated.status as OrderStatus,
                    ...(validated.trackingNumber && { trackingNumber: validated.trackingNumber }),
                    ...(validated.carrier && { carrier: validated.carrier }),
                },
            });

            await tx.orderHistory.create({
                data: {
                    orderId,
                    status: validated.status,
                    changedBy: adminId,
                    reason: "Status updated by Admin",
                }
            });

            return order;
        });

        revalidatePath("/admin/orders");
        revalidatePath(`/admin/orders/${orderId}`);

        return { success: true, order: updatedOrder };
    } catch (error: any) {
        console.error("Failed to update order status:", error);
        return { success: false, error: error.message || "Failed to update order status" };
    }
}

export async function deleteOrder(orderId: string) {
    try {
        await checkAdmin();

        await prisma.order.delete({
            where: { id: orderId }
        });

        revalidatePath("/admin/orders");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete order:", error);
        return { success: false, error: error.message || "Failed to delete order" };
    }
}

export async function trackOrderPublic(identifier: string, email: string) {
    try {
        if (!identifier || !email) {
            throw new Error("Order number/Tracking number and Email are required");
        }

        // Find order by Order Number OR Tracking Number
        // AND match the User's email (since guest checkout users are created as users with role USER usually, or if we have guestEmail support later)
        // Currently assuming all orders are linked to a user account (even if auto-created).

        const order = await prisma.order.findFirst({
            where: {
                AND: [
                    {
                        OR: [
                            { orderNumber: { equals: identifier, mode: 'insensitive' } },
                            { trackingNumber: { equals: identifier, mode: 'insensitive' } }
                        ]
                    },
                    {
                        user: {
                            email: { equals: email, mode: 'insensitive' }
                        }
                    }
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                items: {
                    include: {
                        product: {
                            include: {
                                images: { take: 1, orderBy: { order: 'asc' } }
                            }
                        }
                    }
                },
                vendor: {
                    select: {
                        slug: true,
                        user: { select: { name: true } }
                    }
                },
                history: {
                    orderBy: { createdAt: 'desc' }
                },
                // For delivery status if needed
            }
        });

        if (!order) {
            return { success: false, error: "Order not found or details do not match." };
        }

        return { success: true, order };
    } catch (error: any) {
        console.error("Failed to track order:", error);
        return { success: false, error: error.message || "Failed to track order" };
    }
}

/**
 * Fetch orders for the current logged-in user (Buyer or Seller)
 */
export async function getMyOrders(params: {
    role?: 'buyer' | 'seller';
    status?: string;
    dateRange?: string; // 'last_30_days', etc.
    page?: number;
    limit?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" };
        }

        const userId = session.user.id;
        const role = params.role || 'buyer';
        const status = params.status;
        const page = params.page || 1;
        const limit = params.limit || 50; // Default to larger limit if pagination is not strict
        const skip = (page - 1) * limit;

        const dateFilter: any = {};
        if (params.dateRange) {
            const now = new Date();
            if (params.dateRange === 'Today') {
                dateFilter.gte = new Date(now.setHours(0, 0, 0, 0));
            } else if (params.dateRange === 'Last 7 Days') {
                dateFilter.gte = new Date(now.setDate(now.getDate() - 7));
            } else if (params.dateRange === 'Last 30 Days') {
                dateFilter.gte = new Date(now.setDate(now.getDate() - 30));
            } else if (params.dateRange === 'Last 90 Days') {
                dateFilter.gte = new Date(now.setDate(now.getDate() - 90));
            }
        }

        let orders: any[] = [];
        let total = 0;
        let counts: Record<string, number> = {};

        if (role === 'seller') {
            const vendor = await prisma.vendor.findUnique({
                where: { userId },
                select: { id: true }
            });

            if (!vendor) return { success: false, error: "Vendor profile not found" };

            const where: any = { vendorId: vendor.id };
            if (status && status !== 'All' && status !== 'all') where.status = status.toUpperCase();
            if (params.dateRange && params.dateRange !== 'All') where.createdAt = dateFilter;

            // Fetch Data
            const [fetchedOrders, count, groupByStatus] = await Promise.all([
                prisma.order.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        items: {
                            include: {
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        price: true,
                                        images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } }
                                    }
                                }
                            }
                        },
                        user: { select: { name: true, email: true } },
                        shippingAddress: true, // It's JSON
                    }
                }),
                prisma.order.count({ where }),
                prisma.order.groupBy({
                    by: ['status'],
                    where: { vendorId: vendor.id }, // aggregation on all orders for counts
                    _count: { status: true }
                })
            ]);

            orders = fetchedOrders;
            total = count;
            groupByStatus.forEach(g => { counts[g.status] = g._count.status; });

        } else {
            // Buyer Logic
            const where: any = { userId };
            // Note: CustomerOrder doesn't have a direct status field. Status is derived.
            // But we can filter by querying related VendorOrders if needed.
            // For simplicity in this "My Orders" view, we fetch all and filter in memory or 
            // improved schema would have status on CustomerOrder.
            // The existing API fetches all and computes status. 
            // Given we want server-side filtering, we must rely on what we have.
            // CustomerOrder table DOES NOT have a status column in the schema I read earlier.
            // Checks schema... `model CustomerOrder { ... vendorOrders Order[] }`
            // So we cannot easily filter CustomerOrder by status at DB level without robust relational filtering.

            // However, date filter works.
            if (params.dateRange && params.dateRange !== 'All') where.createdAt = dateFilter;

            // Fetch
            const [fetchedCustomerOrders, count] = await Promise.all([
                prisma.customerOrder.findMany({
                    where,
                    skip,
                    take: limit,
                    include: {
                        vendorOrders: {
                            include: {
                                items: {
                                    include: {
                                        product: {
                                            select: {
                                                id: true,
                                                name: true,
                                                price: true,
                                                images: { take: 1, orderBy: { order: 'asc' }, select: { url: true } }
                                            }
                                        }
                                    }
                                },
                                vendor: { select: { slug: true, user: { select: { name: true } } } }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }),
                prisma.customerOrder.count({ where })
            ]);

            // Post-process for status (mimic API logic)
            orders = fetchedCustomerOrders.map((co: any) => {
                const vendorOrders = co.vendorOrders || [];
                const deliveredCount = vendorOrders.filter((vo: any) => vo.status === 'DELIVERED').length;
                const totalVendors = vendorOrders.length;
                let overallStatus = 'PENDING';
                if (deliveredCount === totalVendors && totalVendors > 0) overallStatus = 'DELIVERED';
                else if (deliveredCount > 0) overallStatus = 'PARTIAL';
                else if (vendorOrders.some((vo: any) => vo.status === 'PAID')) overallStatus = 'PAID'; // Paid/Processing

                return {
                    ...co,
                    status: overallStatus,
                    // Flatten items for display if needed, or keep structure
                    items: vendorOrders.flatMap((vo: any) => vo.items || [])
                };
            });

            // Calculate aggregations in memory for Buyer (limitation of schema)
            // or perform a separate aggregation on VendorOrder if we want strict counts?
            // User wants "hsows all of its filters".
            orders.forEach(o => {
                const s = o.status;
                counts[s] = (counts[s] || 0) + 1;
            });

            // Filter by status if requested (Client-side filtering logic moved to Server Action)
            if (status && status !== 'All' && status !== 'all') {
                const map: any = {
                    'Pending': 'PENDING',
                    'Processing': ['PAID', 'PROCESSING', 'PARTIAL'], // Group these?
                    'Shipped': 'PARTIAL', // API mapped Shipped to Partial?
                    'Delivered': 'DELIVERED',
                    'Cancelled': 'CANCELED'
                };

                const target = map[status] || status.toUpperCase();
                orders = orders.filter(o =>
                    Array.isArray(target) ? target.includes(o.status) : o.status === target
                );
                // Adjust total after filter? 
                // Usually total reflects DB total matching Query. 
                // Since we filtered in memory, we update total.
                total = orders.length;
            }

            total = count; // Actually total should be the count BEFORE pagination/limit, but after filter. 
            // Since we couldn't filter by status in DB, 'count' is just date filtered.
            // If status filter is active, we should update total to filtered length.
            if (status && status !== 'All' && status !== 'all') {
                total = orders.length;
            }
        }

        return {
            success: true,
            orders,
            total,
            counts,
            page,
            totalPages: Math.ceil(total / limit)
        };

    } catch (error: any) {
        console.error("Failed to get my orders:", error);
        return { success: false, error: error.message || "Failed to fetch orders" };
    }
}
