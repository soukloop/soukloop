import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import OverviewTab from "@/components/admin/products/tabs/overview-tab";
import ChatsTab from "@/components/admin/products/tabs/chats-tab";
import ReviewsTab from "@/components/admin/products/tabs/reviews-tab";
import ReturnsTab from "@/components/admin/products/tabs/returns-tab";
import DeliveryTab from "@/components/admin/products/tabs/delivery-tab";
import ReportsTab from "@/components/admin/products/tabs/reports-tab";

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage(props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ tab?: string }>;
}) {
    const searchParams = await props.searchParams;
    const params = await props.params;

    const activeTab = searchParams.tab || 'overview';
    const id = params.id;

    if (!id) return <div>Invalid Product ID</div>;

    return (
        <Suspense fallback={<TabContentSkeleton />}>
            {renderTabContent(activeTab, id)}
        </Suspense>
    );
}

function renderTabContent(tab: string, id: string) {
    switch (tab) {
        case 'overview': return <OverviewTab productId={id} />;
        case 'chats': return <ChatsTab productId={id} />;
        case 'reviews': return <ReviewsTab productId={id} />;
        case 'returns': return <ReturnsTab productId={id} />;
        case 'delivery': return <DeliveryTab productId={id} />;
        case 'reports': return <ReportsTab productId={id} />;
        default: return <OverviewTab productId={id} />;
    }
}

function TabContentSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="aspect-video w-full rounded-2xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-40 w-full rounded-xl" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}
