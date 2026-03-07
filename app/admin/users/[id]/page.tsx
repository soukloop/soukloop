import { Suspense } from "react";
import UserProfileHeader from "@/components/admin/users/user-profile-header";
import { Skeleton } from "@/components/ui/skeleton";
import OverviewTab from "@/components/admin/users/tabs/overview-tab";
import OrdersTab from "@/components/admin/users/tabs/orders-tab";
import ProductsTab from "@/components/admin/users/tabs/products-tab";
import ChatTab from "@/components/admin/users/tabs/chat-tab";
import ReportsTab from "@/components/admin/users/tabs/reports-tab";
import DashboardTab from "@/components/admin/users/tabs/dashboard-tab";
import { requirePermission } from "@/lib/admin/permissions";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export default async function UniversalAdminUserPage(props: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> }) {
    const request = new NextRequest('http://localhost', { headers: await headers() });
    const authResult = await verifyAdminAuth(request);
    if (authResult.success && authResult.admin) {
        await requirePermission(authResult.admin.id, 'users', 'view');
    }

    const params = await props.params;
    const searchParams = await props.searchParams;
    const tab = searchParams.tab || "overview";

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header stays persistent and handles its own user fetch */}
            <UserProfileHeader userId={params.id} currentTab={tab} />

            {/* Content Area */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <Suspense fallback={<TabSkeleton />}>
                    {tab === "overview" && <OverviewTab userId={params.id} />}
                    {tab === "dashboard" && <DashboardTab userId={params.id} />}
                    {tab === "orders" && <OrdersTab userId={params.id} />}
                    {tab === "chat" && <ChatTab userId={params.id} />}
                    {tab === "products" && <ProductsTab userId={params.id} />}
                    {tab === "reports" && <ReportsTab userId={params.id} />}
                </Suspense>
            </main>
        </div>
    );
}

function TabSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32 w-full rounded-xl bg-slate-200" />
                <Skeleton className="h-32 w-full rounded-xl bg-slate-200" />
                <Skeleton className="h-32 w-full rounded-xl bg-slate-200" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl bg-slate-200" />
        </div>
    );
}
