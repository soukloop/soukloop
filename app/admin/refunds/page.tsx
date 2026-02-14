import { Suspense } from 'react';
import RefundsClient from './RefundsClient';
import { getRefunds } from './actions';
import AccessDenied from "@/components/admin/AccessDenied";

export const metadata = {
    title: 'Admin - Refund Requests',
    description: 'Manage return and refund requests',
};

export default async function AdminRefundsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

    const result = await getRefunds({
        page,
        pageSize: 15,
        search,
        status
    });

    if (!result.success || !result.data) {
        if (result.error === 'Unauthorized' || result.error === 'Insufficient permissions') {
            return <AccessDenied message="You do not have permission to view refund requests." />;
        }
        return (
            <div className="p-4 text-red-500 bg-red-50 rounded-lg">
                Error loading refunds: {result.error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Returns & Refund Requests</h1>
            </div>

            <RefundsClient
                data={result.data}
                totalCount={result.totalCount || 0}
                pageCount={result.pageCount || 0}
                currentPage={page}
            />
        </div>
    );
}
