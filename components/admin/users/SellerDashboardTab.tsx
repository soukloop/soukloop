"use client";

import { SellerMetricsCards } from '@/app/seller/components/dashboard/seller-metrics-cards';
import { SellerSalesChart } from '@/app/seller/components/dashboard/seller-sales-chart';
import { OrderListTable, DisplayOrder } from '@/app/editprofile/components/my-orders';

interface SellerDashboardTabProps {
    stats: any;
    chartData: any[];
    recentOrders: DisplayOrder[];
}

export default function SellerDashboardTab({ stats, chartData, recentOrders }: SellerDashboardTabProps) {
    return (
        <div className="space-y-8">
            <SellerMetricsCards stats={stats} isLoading={false} />
            <SellerSalesChart data={chartData} />
            <div className="rounded-[20px] border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Sales</h3>
                <OrderListTable orders={recentOrders} showAcceptColumn={false} isLoading={false} sourceTab="all" />
            </div>
        </div>
    );
}
