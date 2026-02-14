import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>
            <div className="h-[300px] w-full rounded-xl border bg-card shadow-sm p-6">
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    );
}
