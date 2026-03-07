import { notFound } from "next/navigation";
import { ArrowLeft, Package2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { getCategoryById, getProductsByCategory, getDressStylesByCategory } from "@/lib/admin/categories-service";
import CategoryProducts from "./components/CategoryProducts";
import { requirePermission } from "@/lib/admin/permissions";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

interface CategoryDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryDetailPage({ params, searchParams }: CategoryDetailPageProps) {
    const request = new NextRequest('http://localhost', { headers: await headers() });
    const authResult = await verifyAdminAuth(request);

    if (authResult.success && authResult.admin) {
        await requirePermission(authResult.admin.id, 'categories', 'view');
    }
    const { id } = await params;
    const search = await searchParams;

    // Parse search params
    const page = Number(search.page) || 1;
    const status = (search.status as string) || 'all';
    const searchQuery = (search.search as string) || '';
    const dressStyleId = (search.dressStyle as string) || 'all';

    // Fetch category details and dress styles in parallel
    const [category, dressStyles] = await Promise.all([
        getCategoryById(id),
        getDressStylesByCategory(id)
    ]);

    if (!category) {
        notFound();
    }

    // Fetch paginated products
    const { products, total, totalPages } = await getProductsByCategory(id, {
        page,
        pageSize: 20,
        status: status as 'all' | 'active' | 'inactive',
        search: searchQuery,
        dressStyleId: dressStyleId !== 'all' ? dressStyleId : undefined
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/categories">
                    <Button variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
                        <StatusBadge status={category.status} />
                    </div>
                    {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                    )}
                </div>
            </div>

            {/* Category Stats Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Category Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Total Products</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{category._count?.products || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Available Styles</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{dressStyles.length}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="text-gray-900 mt-1">{new Date(category.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <CategoryProducts
                products={products}
                total={total}
                currentPage={page}
                totalPages={totalPages}
                dressStyles={dressStyles}
            />
        </div>
    );
}
