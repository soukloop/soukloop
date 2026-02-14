import { prisma } from "@/lib/prisma";
import ProductHeader from "@/components/admin/products/product-header";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

export default async function ProductLayout(props: {
    children: React.ReactNode;
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const { id } = params;

    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            dressStyle: true,
        },
    });

    if (!product) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900">Product Not Found</h1>
                    <p className="mt-2 text-gray-500">The product you are looking for does not exist.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Header - Cached across tab navigation */}
            <Suspense fallback={<HeaderSkeleton />}>
                <ProductHeader product={product} />
            </Suspense>

            {/* Main Content Area (Tabs) */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {props.children}
            </main>
        </div>
    );
}

function HeaderSkeleton() {
    return (
        <div className="w-full bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 pt-6">
                <div className="flex justify-between mb-6">
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-6 border-b border-gray-200">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="pb-3">
                            <Skeleton className="h-4 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
