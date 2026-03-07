import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StatusBadge from "@/components/admin/StatusBadge";
import { getDressStyleById, getProductsByDressStyle } from "@/lib/admin/dress-styles-service";
import DressStyleHeader from "./components/DressStyleHeader";
import DressStyleProducts from "./components/DressStyleProducts";
import { requirePermission } from "@/lib/admin/permissions";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

interface DressStyleDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DressStyleDetailPage({ params, searchParams }: DressStyleDetailPageProps) {
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

    // Fetch dress style details
    const style = await getDressStyleById(id);

    if (!style) {
        notFound();
    }

    // Fetch paginated products
    const { products, total, totalPages } = await getProductsByDressStyle(id, {
        page,
        pageSize: 20,
        status: status as 'all' | 'active' | 'inactive',
        search: searchQuery
    });

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/categories?tab=dress-styles">
                    <Button variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900">{style.name}</h1>
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                            {style.categoryType}
                        </span>
                        <StatusBadge status={style.status} />
                    </div>
                </div>
            </div>

            {/* Style Info Card */}
            <DressStyleHeader style={style} />

            {/* Products Section */}
            <DressStyleProducts
                products={products}
                total={total}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
