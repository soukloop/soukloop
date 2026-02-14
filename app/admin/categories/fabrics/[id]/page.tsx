
import { notFound } from "next/navigation";
import { ArrowLeft, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/admin/StatusBadge";
import ProductCard from "@/components/admin/ProductCard";

interface FabricDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function FabricDetailPage({ params }: FabricDetailPageProps) {
    const { id } = await params;

    const fabric = await prisma.material.findUnique({
        where: { id },
        include: {
            _count: {
                select: { products: true }
            },
            products: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    images: { take: 1 },
                    vendor: { include: { user: { select: { name: true, email: true } } } }
                }
            }
        }
    });

    if (!fabric) {
        notFound();
    }

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/categories?tab=fabrics">
                    <Button variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{fabric.name}</h1>
                        <StatusBadge status={fabric.isActive ? 'Active' : 'Suspended'} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Fabric details and associated products</p>
                </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fabric Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <p className="text-sm text-gray-500 text-sm">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{fabric._count.products}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 text-sm">Slug</p>
                        <p className="text-lg font-medium text-gray-900 mt-1">{fabric.slug}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 text-sm">Created</p>
                        <p className="text-gray-900 mt-1">{new Date(fabric.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Recent Products */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Scissors className="h-5 w-5 text-gray-500" />
                    <h2 className="text-xl font-bold text-gray-900">Recent Products</h2>
                </div>

                {fabric.products.length === 0 ? (
                    <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-12 text-center">
                        <p className="text-gray-500">No products assigned to this fabric yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {fabric.products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={{
                                    ...product,
                                    price: Number(product.price)
                                } as any}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
