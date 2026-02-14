import { getPaginatedUsers } from '@/lib/admin/user-service';
import UsersTable from '@/components/admin/users/UsersTable';

export const dynamic = 'force-dynamic'; // Ensure fresh data on every request

export default async function UserManagementPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // 1. Parse Search Params
    const resolvedParams = await searchParams;
    const page = Number(resolvedParams?.page) || 1;
    const role = resolvedParams?.role as string | undefined;
    const status = resolvedParams?.status as string | undefined;
    const search = resolvedParams?.search as string | undefined;

    // 2. Fetch Data (Server Side)
    const { users, total, currentPage } = await getPaginatedUsers({
        page,
        pageSize: 10,
        role,
        status,
        search
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">All Users <span className="text-gray-500 font-normal">[{total}]</span></h1>
            </div>

            {/* Client Component Wrapper */}
            <UsersTable
                initialUsers={users}
                totalRecords={total}
                initialPage={currentPage}
            />
        </div>
    );
}

