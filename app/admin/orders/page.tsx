import { getOrders } from "@/features/orders/actions";
import OrdersClient from "./OrdersClient";
import { Box, DollarSign, Clock, CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function OrderManagementPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const searchParams = await props.searchParams;
    const page = Number(searchParams.page) || 1;
    const limit = Number(searchParams.limit) || 10;
    const search = typeof searchParams.search === 'string' ? searchParams.search : undefined;
    const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;

    const { orders, total, stats, totalPages } = await getOrders({
        page,
        limit,
        search,
        status,
    });

    const statCards = [
        {
            title: "Total Orders",
            value: stats.total,
            icon: Box,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            title: "Revenue",
            value: `$${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            title: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600",
            bg: "bg-yellow-50"
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircle,
            color: "text-orange-600",
            bg: "bg-orange-50"
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                    All Orders <span className="text-gray-500 font-normal">[{total}]</span>
                </h1>
            </div>

            {/* Stats Boxes */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.title}</p>
                                <p className="text-lg font-bold text-gray-900 leading-none mt-1">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Orders Table */}
            <OrdersClient
                orders={orders}
                total={total}
                page={page}
                limit={limit}
            />
        </div>
    );
}
