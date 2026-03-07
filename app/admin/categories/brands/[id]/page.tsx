import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBrandById, getProductsByBrand } from "@/lib/admin/brands-service";
import BrandProducts from "./components/BrandProducts";
import { requirePermission } from "@/lib/admin/permissions";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

interface BrandDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BrandDetailPage({ params, searchParams }: BrandDetailPageProps) {
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

    // Fetch brand details and products
    const [brand, productsData] = await Promise.all([
        getBrandById(id),
        getProductsByBrand(id, {
            page,
            pageSize: 20,
            status: status as 'all' | 'active' | 'inactive',
            search: searchQuery
        })
    ]);

    if (!brand) {
        notFound();
    }

    const { products, total, totalPages } = productsData;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/categories?tab=brands">
                    <Button variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {brand.isActive ? 'Active' : 'Suspended'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Brand Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Brand Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Total Products</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{brand._count?.products || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <p className="text-gray-900 mt-1">{brand.isActive ? 'Active' : 'Suspended'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="text-gray-900 mt-1">{new Date(brand.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                        {brand.logo && (
                            <div className="mt-4">
                                <p className="text-gray-500 text-sm mb-2">Logo</p>
                                <img src={brand.logo} alt={brand.name} className="h-16 w-auto object-contain border rounded-md p-2 bg-white" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <BrandProducts
                products={products}
                total={total}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
