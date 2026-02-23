import { getPaginatedSellers } from '@/lib/admin/seller-service';
import SellersTable from '@/components/admin/sellers/SellersTable';

export const dynamic = 'force-dynamic';

export default async function SellerManagementPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;

    // Parse Params
    const page = Number(searchParams?.page) || 1;
    const search = searchParams?.search as string | undefined;
    const status = (searchParams?.status as string) || 'ALL'; // Default to All

    // Server Side Fetch
    const { sellers, total, currentPage } = await getPaginatedSellers({
        page,
        pageSize: 10,
        search,
        status
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Seller Management</h1>
                <p className="text-sm text-gray-500 mt-1">Manage vendor applications and active stores</p>
            </div>

            <SellersTable
                initialSellers={sellers}
                totalRecords={total}
                initialPage={currentPage}
            />
        </div>
    );
}
