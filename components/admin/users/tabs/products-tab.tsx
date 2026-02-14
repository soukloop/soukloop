import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/admin/ProductCard";
import { ProductGridSkeleton } from "@/components/admin/ProductCardSkeleton";

export default async function ProductsTab({ userId }: { userId: string }) {
    // Only fetch if user is a vendor
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { vendor: { select: { id: true } } }
    });

    if (!user?.vendor) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed text-center">
                <div className="p-3 bg-slate-50 rounded-full mb-4">
                    <span className="text-2xl">🛍️</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">Not a Vendor</h3>
                <p className="text-slate-500 max-w-sm mt-1">This user has not registered as a seller.</p>
            </div>
        );
    }

    const products = await prisma.product.findMany({
        where: { vendorId: user.vendor.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            images: {
                take: 1
            },
            dressStyle: { select: { name: true } },
            vendor: {
                select: {
                    id: true,
                    slug: true,
                    user: { select: { name: true } }
                }
            }
        }
    });

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-dashed text-center">
                <div className="p-3 bg-slate-50 rounded-full mb-4">
                    <span className="text-2xl">📦</span>
                </div>
                <h3 className="text-lg font-medium text-slate-900">No Products Listed</h3>
                <p className="text-slate-500 max-w-sm mt-1">This vendor hasn't listed any products yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Vendor Products</h2>
                <span className="text-sm text-gray-500">{products.length} Items</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={{
                            ...product,
                            price: Number(product.price)
                        } as any}
                    />
                ))}
            </div>
        </div>
    );
}
