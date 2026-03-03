import { Suspense } from "react";
import ProductsTable from "@/components/admin/products/ProductsTable";
import { getPaginatedProducts } from "@/lib/admin/product-service";
import { prisma } from "@/lib/prisma";
import TableSkeleton from "@/components/admin/TableSkeleton";

// Force dynamic rendering for admin dashboard
export const dynamic = "force-dynamic";

export default async function ProductManagementPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Parse query params (await searchParams for Next.js 16/15)
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const category =
    typeof searchParams.category === "string"
      ? searchParams.category
      : undefined;
  const dressStyle =
    typeof searchParams.dressStyle === "string"
      ? searchParams.dressStyle
      : undefined;

  // Fetch products
  const { products, total, currentPage } = await getPaginatedProducts({
    page,
    pageSize: 15,
    search,
    status,
    category,
    dressStyle,
  });

  // Fetch filters (Could be optimized to cache or fetched in parallel)
  const [categoriesData, dressStylesData] = await Promise.all([
    prisma.category.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.dressStyle.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // const categories = categoriesData.map(c => c.name);
  // const dressStyles = dressStylesData.map(d => d.name);
  const categories = categoriesData.map((c: { name: string }) => c.name);
  const dressStyles = dressStylesData.map((d: { name: string }) => d.name);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and approve product listings.
        </p>
      </div>

      {/* Stats Summary - Kept simple for now, can be extracted to a server component if needed */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-600">Total Products</p>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
        {/* 
                    Note: Stats below would need separate queries or aggregation if we want them to reflect 
                    the *entire* dataset, not just the filtered view. 
                    For performance in this refactor, I'm removing the specific filtered counts 
                    unless we add dedicated aggregation endpoints. 
                    Let's keep Total Products (from current filter or overall DB?)
                    Actually, `total` returned from `getPaginatedProducts` observes filters.
                    If we want "Overall Stats", we'd need separate `count` calls.
                    For now, showing strict Total from current view is safe and fast.
                 */}
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-gray-600">Visible</p>
          <p className="text-2xl font-bold text-blue-600">
            {products.length} (Page)
          </p>
        </div>
      </div>

      {/* Products Table */}
      <Suspense fallback={<TableSkeleton rowCount={10} columnCount={6} />}>
        <ProductsTable
          initialProducts={products}
          totalRecords={total}
          initialPage={currentPage}
          pageSize={15}
          categories={categories}
          dressStyles={dressStyles}
        />
      </Suspense>
    </div>
  );
}
