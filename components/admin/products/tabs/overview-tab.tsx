
import { prisma } from "@/lib/prisma";
import ProductGallery from "./product-gallery";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    CreditCard,
    Package,
    ShieldCheck,
    User,
    Truck
} from "lucide-react";

interface OverviewTabProps {
    productId: string;
}

export default async function OverviewTab({ productId }: OverviewTabProps) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
            images: { orderBy: { order: 'asc' } },
            categoryRel: true,
            dressStyle: true,
            colorRel: true,
            occasionRel: true,
            material: true,
            brandRel: true,
            vendor: {
                include: {
                    user: {
                        include: {
                            profile: true,
                            addresses: {
                                where: { isBusiness: true },
                                take: 1
                            }
                        }
                    }
                }
            },
            // For sold items, we need order info to show buyer
            orderItems: {
                include: {
                    order: {
                        include: {
                            user: {
                                include: {
                                    profile: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!product) return null;

    const images = product.images.map(img => img.url);

    // Find valid order if sold
    const soldOrder = product.status === 'SOLD' ? product.orderItems[0]?.order : null;
    const buyer = soldOrder?.user;

    const storeAddress = product.vendor.user.addresses[0];

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 animate-in fade-in duration-500">
            {/* Left Column - Gallery & Description */}
            <div className="lg:col-span-8 space-y-8">
                {/* Gallery */}
                <ProductGallery
                    images={images}
                    video={product.video}
                    productName={product.name}
                />

                {/* Description */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-bold text-gray-900">Description</h3>
                    <div className="prose prose-sm max-w-none text-gray-600">
                        <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                    </div>
                </div>

                {/* Attributes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Product Details</h3>
                        <div className="space-y-4">
                            <AttributeRow label="Category" value={product.categoryRel?.name ?? product.category} link={`/admin/categories/${product.categoryId}`} />
                            <AttributeRow label="Dress Style" value={product.dressStyle?.name ?? product.dress} link={`/admin/dress-styles/${product.dressStyleId}`} />
                            <AttributeRow label="Brand" value={product.brandRel?.name ?? product.brand} link={`/admin/brands/${product.brandId}`} />
                            <AttributeRow label="Material" value={product.material?.name ?? product.fabric} />
                            <AttributeRow label="Condition" value={product.condition} />
                            <AttributeRow label="Gender" value={product.gender} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Specifications</h3>
                        <div className="space-y-4">
                            <AttributeRow label="Color" value={product.colorRel?.name ?? product.color} link={`/admin/colors/${product.colorId}`} />
                            <AttributeRow label="Occasion" value={product.occasionRel?.name ?? product.occasion} link={`/admin/occasions/${product.occasionId}`} />
                            <AttributeRow label="Size" value={product.size} />
                            <AttributeRow label="Original Price" value={product.comparePrice ? `$${product.comparePrice.toFixed(2)}` : '-'} />
                            <AttributeRow label="Listing Price" value={`$${product.price.toFixed(2)}`} isPrice />
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="lg:col-span-4 space-y-6">

                {/* Sold Information Card */}
                {product.status === 'SOLD' && soldOrder && (
                    <div className="overflow-hidden rounded-2xl border border-blue-100 bg-blue-50/50 shadow-sm">
                        <div className="bg-blue-100/50 px-6 py-4 border-b border-blue-100">
                            <h3 className="flex items-center gap-2 font-bold text-blue-900">
                                <Package className="h-5 w-5" /> Sold Information
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">Date Sold</p>
                                <p className="font-medium text-blue-900 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(soldOrder.createdAt), "MMM d, yyyy")}
                                </p>
                            </div>

                            {buyer && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-3">Buyer</p>
                                    <Link href={`/admin/users/${buyer.id}`} className="group flex items-center gap-3 rounded-xl bg-white p-3 border border-blue-100 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                            {buyer.profile?.avatar ? (
                                                <img src={buyer.profile.avatar} alt={buyer.name || ""} className="h-full w-full object-cover" />
                                            ) : (
                                                (buyer.name?.[0] || "B").toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{buyer.name}</p>
                                            <p className="text-xs text-gray-500">{buyer.email}</p>
                                        </div>
                                    </Link>
                                </div>
                            )}

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-blue-400 mb-1">Order ID</p>
                                <Link href={`/admin/orders/${soldOrder.id}`} className="font-mono text-sm text-blue-600 hover:underline">
                                    #{soldOrder.id.slice(-8).toUpperCase()}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Seller Information */}
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                        <h3 className="flex items-center gap-2 font-bold text-gray-900">
                            <User className="h-5 w-5 text-gray-500" /> Seller Profile
                        </h3>
                    </div>
                    <div className="p-6">
                        <Link href={`/admin/users/${product.vendor.userId}`} className="flex items-center gap-4 group mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden">
                                {product.vendor.user.profile?.avatar ? (
                                    <img src={product.vendor.user.profile.avatar} alt="Seller" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold">
                                        {product.vendor.user.name?.[0]?.toUpperCase() || 'S'}
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{product.vendor.user.name}</p>
                                <p className="text-xs text-gray-500">@{product.vendor.slug || 'store'}</p>
                            </div>
                        </Link>

                        <div className="space-y-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <ShieldCheck className="h-4 w-4 text-green-500" />
                                <span>KYC Status: <span className="font-medium capitalize">{product.vendor.kycStatus}</span></span>
                            </div>
                            {storeAddress && (
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <Truck className="h-4 w-4 text-gray-400 mt-0.5" />
                                    <span className="line-clamp-2">{storeAddress.address1}, {storeAddress.city}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Admin Tags/Notes - Placeholder for now */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-gray-500">Internal Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {product.tags ? product.tags.split(',').map((tag, i) => (
                            <Badge key={i} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                                {tag.trim()}
                            </Badge>
                        )) : (
                            <span className="text-sm text-gray-400 italic">No tags added.</span>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}

function AttributeRow({ label, value, link, isPrice }: { label: string, value: string | number | null | undefined, link?: string, isPrice?: boolean }) {
    if (!value) return null;

    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-sm text-gray-500">{label}</span>
            {link ? (
                <Link href={link} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline px-2 py-0.5 rounded-md hover:bg-blue-50 transition-colors">
                    {value}
                </Link>
            ) : (
                <span className={`text-sm font-medium ${isPrice ? 'text-green-600' : 'text-gray-900'}`}>
                    {value}
                </span>
            )}
        </div>
    );
}
