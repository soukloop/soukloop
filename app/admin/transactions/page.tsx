import { getAdminTransactions, getAdminPayouts } from "@/src/features/admin/transactions/actions";
import TransactionsClient from "./TransactionsClient";

export const dynamic = 'force-dynamic';

export default async function TransactionsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 15;
    const type = (searchParams.type as 'transactions' | 'payouts') || 'transactions';
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
    const method = typeof searchParams.method === 'string' ? searchParams.method : undefined;

    let data = [];
    let totalCount = 0;
    let stats = {};
    let totalPages = 0;

    if (type === 'transactions') {
        const result = await getAdminTransactions({
            page,
            limit,
            search,
            status,
            method
        });
        data = result.transactions;
        totalCount = result.totalCount;
        stats = result.stats;
        totalPages = result.totalPages;
    } else if (type === 'payouts') {
        const result = await getAdminPayouts({
            page,
            limit,
            search,
            status,
            method
        });
        data = result.payouts;
        totalCount = result.totalCount;
        stats = result.stats;
        totalPages = result.totalPages;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    Transactions & Payouts
                    <span className="ml-2 text-gray-500 font-normal">[{totalCount}]</span>
                </h1>
            </div>

            <TransactionsClient
                data={data}
                stats={stats}
                totalCount={totalCount}
                page={page}
                limit={limit}
                activeTab={type}
            />
        </div>
    );
}
