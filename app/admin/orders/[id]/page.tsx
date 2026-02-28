import { getOrderDetails } from "@/features/orders/actions";
import StatusBadge from "@/components/admin/StatusBadge";
import OrderStatusSelect from "@/components/admin/orders/OrderStatusSelect";
import OrderActions from "@/components/admin/orders/OrderActions";
import { ArrowLeft, Clock, MapPin, Search, Calendar, Package, MoreVertical, SearchIcon, Filter, X, RefreshCw, Mail, Phone, CalendarHeart, Trash2, Tag, Copy, HelpCircle, Truck, User, CreditCard, ChevronLeft, Store, ExternalLink } from "lucide-react";
import { getOverallStatus } from "@/services/orders.service";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/ui/copy-button";

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    let order;

    try {
        order = await getOrderDetails(params.id);
    } catch (error) {
        return notFound();
    }

    if (!order) return notFound();

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Breadcrumb & Navigation */}
            <div className="flex items-center justify-between">
                <Link
                    href="/admin/orders"
                    className="flex items-center text-sm font-medium text-gray-500 hover:text-orange-600 transition-colors"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Orders
                </Link>
                <div className="flex items-center gap-3">
                    <OrderActions orderId={order.id} />
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                            <span className="text-slate-400 font-medium">Order</span> #{order.orderNumber}
                            <StatusBadge status={getOverallStatus(order as any)} type="order" className="scale-110" />
                        </h1>
                        <div className="flex items-center gap-2 text-slate-500 mt-2">
                            <Calendar className="h-4 w-4" />
                            <span>Placed on {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <CreditCard className="h-4 w-4 text-orange-500" />
                                {order.currency} {order.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                    {!order.isParentOrder && (
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-1">
                                <span className="text-sm font-medium text-gray-400">Status</span>
                                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content: Items */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                        <div className="px-6 py-5 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="h-5 w-5 text-orange-500" />
                                Order Items
                            </h2>
                            <span className="text-sm font-medium text-gray-400">{order.items.length} items</span>
                        </div>

                        {/* Order Items Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase tracking-wider font-bold">
                                        <th className="py-4 font-semibold px-4">Item details</th>
                                        <th className="py-4 font-semibold text-center px-4">Price</th>
                                        <th className="py-4 font-semibold text-center px-4">Quantity</th>
                                        <th className="py-4 font-semibold text-right px-4">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items.map((item: any) => (
                                        <tr key={item.id} className="group hover:bg-orange-50/10 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-sm">
                                                        <Image
                                                            src={item.product?.images?.[0]?.url || "/placeholder.svg"}
                                                            alt={item.product?.name || "Product"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors cursor-pointer truncate">
                                                            {item.product?.name || "Product Deleted"}
                                                        </h3>
                                                        {item.product?.sku && (
                                                            <p className="text-xs text-gray-400 mt-0.5">
                                                                SKU: {item.product.sku}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm font-medium text-gray-700">
                                                ${item.price.toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm font-medium text-gray-700">
                                                {item.quantity}
                                            </td>
                                            <td className="py-4 px-4 text-right text-sm font-bold text-orange-600">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="bg-orange-50/30 p-8 flex flex-col items-end gap-3">
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-gray-500">Subtotal:</span>
                                <span className="text-gray-900 font-medium">${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-gray-500">Shipping:</span>
                                <span className="text-gray-900 font-medium">${order.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between w-full max-w-xs text-sm">
                                <span className="text-gray-500">Tax:</span>
                                <span className="text-gray-900 font-medium">${order.tax.toFixed(2)}</span>
                            </div>

                            {/* Discounts Section */}
                            {(order.couponCode || order.pointsDiscount > 0) && (
                                <div className="space-y-2 mt-2 pt-2 border-t border-orange-100/50 w-full max-w-xs">
                                    {order.couponCode && (
                                        <div className="flex justify-between w-full text-sm">
                                            <span className="text-orange-600 flex items-center gap-1">
                                                <Tag className="h-3 w-3" />
                                                Promo ({order.couponCode}):
                                            </span>
                                            <span className="text-orange-600 font-medium">
                                                -${(order.subtotal + order.shipping + order.tax - order.total - (order.pointsDiscount || 0)).toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                    {order.pointsDiscount > 0 && (
                                        <div className="flex justify-between w-full text-sm">
                                            <span className="text-orange-600 flex items-center gap-1">
                                                <CalendarHeart className="h-3 w-3" />
                                                Points Used ({order.pointsRedeemed}):
                                            </span>
                                            <span className="text-orange-600 font-medium">-${order.pointsDiscount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="h-px w-full max-w-xs bg-orange-100 my-1" />
                            <div className="flex justify-between w-full max-w-xs text-lg font-bold">
                                <span className="text-gray-900">Grand Total:</span>
                                <span className="text-orange-600">${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order History */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Order History
                        </h2>
                        <div className="space-y-6 relative">
                            {/* Timeline line */}
                            <div className="absolute left-[11px] top-2 bottom-0 w-0.5 bg-gray-50" />

                            {order.history.length > 0 ? order.history.map((log: any, idx: number) => (
                                <div key={log.id} className="relative pl-10">
                                    <div className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-gray-200 text-orange-600 shadow-sm z-10">
                                        <div className="h-2 w-2 rounded-full bg-orange-600" />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-gray-900">{log.status}</span>
                                            <span className="text-xs text-gray-400">{formatDate(log.createdAt)}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{log.reason || 'No details provided'}</p>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-400 italic pl-10">No activity logs found for this order.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Customer & Vendor Info */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <User className="h-5 w-5 text-orange-500" />
                            Customer
                        </h2>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-orange-100 overflow-hidden relative border border-orange-50 flex-shrink-0">
                                    {(order.user?.profile?.avatar || order.user?.image) ? (
                                        <Image src={order.user.profile?.avatar || order.user.image!} alt={order.user.name || "User"} fill className="object-cover" />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-orange-600 font-bold text-lg">
                                            {order.user?.name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{order.user?.name || "Guest"}</p>
                                    <p className="text-xs text-gray-400 truncate mt-0.5">{order.user?.email}</p>
                                </div>
                                <Link
                                    href={`/admin/users/${order.user?.id}`}
                                    className="ml-auto p-2 rounded-xl text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-all shadow-sm border border-transparent hover:border-orange-100"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-gray-50">
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Phone</p>
                                    <p className="text-sm text-gray-900 font-medium">{(order.user as any)?.profile?.phone || 'Not provided'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Shipping Address</p>
                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                            {(order.shippingAddress as any).firstName} {(order.shippingAddress as any).lastName}<br />
                                            {(order.shippingAddress as any).address1}<br />
                                            {(order.shippingAddress as any).address2 && <>{(order.shippingAddress as any).address2}<br /></>}
                                            {(order.shippingAddress as any).city}, {(order.shippingAddress as any).state} {(order.shippingAddress as any).postalCode}<br />
                                            {(order.shippingAddress as any).country}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vendor Info */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Store className="h-5 w-5 text-orange-500" />
                            {order.isParentOrder ? "Sellers Involved" : "Seller"}
                        </h2>
                        <div className="space-y-6">
                            {(order.isParentOrder ? (order.vendorOrders || []) : [order]).map((vo: any, idx: number) => {
                                const v = order.isParentOrder ? vo.vendor : order.vendor;
                                if (!v) return null;
                                return (
                                    <div key={v.id || idx} className={`flex items-center gap-4 ${idx > 0 ? 'pt-4 border-t border-gray-50' : ''}`}>
                                        <div className="h-12 w-12 rounded-2xl bg-gray-100 overflow-hidden relative border border-gray-100 flex-shrink-0">
                                            {v.logo ? (
                                                <Image src={v.logo} alt={v.slug} fill className="object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold text-lg">
                                                    {v.slug?.[0].toUpperCase() || 'V'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-gray-900 truncate">{v.slug}</p>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">{v.user?.name}</p>
                                            {order.isParentOrder && vo.status && (
                                                <StatusBadge status={vo.status} type="order" className="mt-1 scale-75 origin-left" />
                                            )}
                                        </div>
                                        <Link
                                            href={`/admin/sellers/${v.id}`}
                                            className="ml-auto p-2 rounded-xl text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-all shadow-sm border border-transparent hover:border-orange-100"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Logistics Info */}
                    <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Truck className="h-5 w-5 text-orange-500" />
                            Logistics
                        </h2>
                        <div className="space-y-4">
                            {order.isParentOrder ? (
                                <p className="text-sm text-gray-500 italic">Tracking details are managed individually by each seller for multi-vendor orders.</p>
                            ) : (
                                <div className="space-y-1.5">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Tracking Number</p>
                                    <div className="flex items-center justify-between gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        {order.trackingNumber ? (
                                            <CopyButton value={order.trackingNumber} className="text-sm font-bold text-gray-900 p-0 h-auto" variant="ghost" displayText={order.trackingNumber} />
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No tracking number</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
