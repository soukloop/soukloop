
import { prisma } from "@/lib/prisma";
import { Truck, MapPin, Calendar, ExternalLink, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/admin/StatusBadge";
import Link from "next/link";

interface DeliveryTabProps {
    productId: string;
}

export default async function DeliveryTab({ productId }: DeliveryTabProps) {
    // Find the latest order for this product
    // Assuming sold only once for now as per "preloved" context, but handling multiple just in case (e.g. cancelled/returned and resold)

    // We want the most recent *valid* order (not cancelled if possible, or just the latest one)
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            orderItems: {
                take: 1,
                orderBy: { createdAt: 'desc' },
                include: {
                    order: {
                        include: {
                            delivery: true,
                            user: { select: { name: true, email: true, id: true } },
                            vendor: { select: { user: { select: { name: true, email: true } } } }
                        }
                    }
                }
            }
        }
    });

    if (!product || product.orderItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Truck className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Delivery Info</h3>
                <p className="text-gray-500 max-w-sm text-center mt-2">This product hasn't been sold or shipped yet.</p>
            </div>
        );
    }

    const orderItem = product.orderItems[0];
    const order = orderItem.order;
    const delivery = order.delivery;

    // Parse Addresses (stored as JSON)
    const shippingAddress = order.shippingAddress as any;

    return (
        <div className="max-w-4xl animate-in fade-in duration-300 space-y-8">

            {/* Delivery Status Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                            Delivery Status
                            {delivery?.status && <StatusBadge status={delivery.status} type="transaction" />}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Order #{order.orderNumber}</p>
                    </div>
                    {delivery?.trackingNumber && (
                        <Button variant="outline" className="gap-2" onClick={() => {
                            // Logic to track logic (would need carrier URL)
                        }}>
                            Track Package <ExternalLink className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Carrier Details</h4>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Carrier</p>
                                    <p className="font-medium text-gray-900">{delivery?.carrier || 'Not assigned'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tracking Number</p>
                                    <p className="font-medium text-gray-900 font-mono tracking-wider">{delivery?.trackingNumber || 'Pending'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Timeline</h4>
                        <div className="space-y-4">
                            <EventRow
                                label="Order Placed"
                                date={order.createdAt}
                                icon={<Calendar className="h-4 w-4" />}
                                active={true}
                            />
                            <EventRow
                                label="Shipped"
                                date={order.shippedAt}
                                icon={<Truck className="h-4 w-4" />}
                                active={!!order.shippedAt}
                            />
                            <EventRow
                                label="Delivered"
                                date={order.deliveredAt}
                                icon={<MapPin className="h-4 w-4" />}
                                active={!!order.deliveredAt}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Shipping Destination</h3>
                {shippingAddress ? (
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-gray-50 rounded-xl">
                            <MapPin className="h-6 w-6 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium text-gray-900">{shippingAddress.firstName} {shippingAddress.lastName}</p>
                            <p className="text-gray-600">{shippingAddress.address1}</p>
                            {shippingAddress.address2 && <p className="text-gray-600">{shippingAddress.address2}</p>}
                            <p className="text-gray-600">
                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                            </p>
                            <p className="text-gray-600 font-medium mt-1">{shippingAddress.country}</p>
                            {shippingAddress.phone && (
                                <p className="text-gray-500 text-sm mt-2 flex items-center gap-2">
                                    Phone: <span className="font-mono">{shippingAddress.phone}</span>
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No shipping address available.</p>
                )}
            </div>

            <div className="flex justify-end">
                <Link href={`/admin/orders/${order.id}`}>
                    <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        View Full Order Details <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                    </Button>
                </Link>
            </div>

        </div>
    );
}

function EventRow({ label, date, icon, active }: { label: string, date?: Date | null, icon: any, active: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${active ? 'opacity-100' : 'opacity-40'}`}>
            <div className={`p-1.5 rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                {icon}
            </div>
            <div className="flex-1 flex justify-between items-center">
                <span className={`text-sm font-medium ${active ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
                <span className="text-xs text-gray-500 font-mono">
                    {date ? new Date(date).toLocaleDateString() : '--'}
                </span>
            </div>
        </div>
    );
}
