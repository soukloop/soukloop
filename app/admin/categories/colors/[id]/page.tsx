import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getColorById, getProductsByColor } from "@/lib/admin/colors-service";
import ColorProducts from "./components/ColorProducts";

interface ColorDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ColorDetailPage({ params, searchParams }: ColorDetailPageProps) {
    const { id } = await params;
    const search = await searchParams;

    // Parse search params
    const page = Number(search.page) || 1;
    const status = (search.status as string) || 'all';
    const searchQuery = (search.search as string) || '';

    // Fetch color details and products
    const [color, productsData] = await Promise.all([
        getColorById(id),
        getProductsByColor(id, {
            page,
            pageSize: 20,
            status: status as 'all' | 'active' | 'inactive',
            search: searchQuery
        })
    ]);

    if (!color) {
        notFound();
    }

    const { products, total, totalPages } = productsData;

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/categories?tab=colors">
                    <Button variant="ghost" className="h-10 w-10 p-0 text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <div
                            className="h-8 w-8 rounded-full border-2 border-gray-300 shadow-sm"
                            style={{ backgroundColor: color.hexCode }}
                        />
                        <h1 className="text-2xl font-bold text-gray-900">{color.name}</h1>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${color.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {color.isActive ? 'Active' : 'Suspended'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Color Info Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Color Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Total Products</p>
                                <p className="text-xl font-bold text-gray-900 mt-1">{color._count?.products || 0}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Hex Code</p>
                                <p className="text-gray-900 mt-1 font-mono text-sm">{color.hexCode}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Status</p>
                                <p className="text-gray-900 mt-1">{color.isActive ? 'Active' : 'Suspended'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Created</p>
                                <p className="text-gray-900 mt-1">{new Date(color.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                            <div>
                                <p className="text-gray-500 text-sm mb-2">Color Preview</p>
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-16 w-16 rounded-lg border-2 border-gray-200 shadow-md"
                                        style={{ backgroundColor: color.hexCode }}
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{color.name}</p>
                                        <p className="text-sm text-gray-500 font-mono">{color.hexCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <ColorProducts
                products={products}
                total={total}
                currentPage={page}
                totalPages={totalPages}
            />
        </div>
    );
}
