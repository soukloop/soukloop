
import { prisma } from "@/lib/prisma";
import ReturnsDataTable from "./returns-data-table";

interface ReturnsTabProps {
    productId: string;
}

export default async function ReturnsTab({ productId }: ReturnsTabProps) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            orderItems: {
                select: {
                    id: true,
                    orderId: true,
                    order: {
                        select: {
                            refunds: {
                                include: {
                                    order: {
                                        select: {
                                            orderNumber: true,
                                            user: { select: { name: true, email: true } }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    refunds: { // Refunds linked directly to the item
                        include: {
                            order: {
                                select: {
                                    orderNumber: true,
                                    user: { select: { name: true, email: true } }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!product) return null;

    // Aggregate refunds
    const allRefunds = new Map();

    product.orderItems.forEach(item => {
        // Refunds directly on item
        item.refunds.forEach(r => allRefunds.set(r.id, r));

        // Refunds on the order 
        item.order.refunds.forEach(r => {
            if (!r.orderItemId || r.orderItemId === item.id) {
                allRefunds.set(r.id, r);
            }
        });
    });

    // Need to serialize Date objects because we are passing data to a Client Component
    const refundsList = Array.from(allRefunds.values())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(refund => ({
            ...refund,
            amount: Number(refund.amount), // Ensure number
            createdAt: refund.createdAt instanceof Date ? refund.createdAt.toISOString() : refund.createdAt,
            updatedAt: refund.updatedAt instanceof Date ? refund.updatedAt.toISOString() : (refund.updatedAt || null),
            processedAt: refund.processedAt instanceof Date ? refund.processedAt.toISOString() : (refund.processedAt || null)
        }));

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 rounded-lg bg-blue-50 p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Refund Policy</h4>
                <p className="text-xs text-blue-700">Displaying refnds associated with this products orders. If the product was part of a larger order, general order refunds are also shown.</p>
            </div>
            <ReturnsDataTable data={refundsList} />
        </div>
    );
}
