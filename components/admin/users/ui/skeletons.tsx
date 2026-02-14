import { Skeleton } from "@/components/ui/skeleton";

export function DataTableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-[200px]" />
                <Skeleton className="h-8 w-[100px]" />
            </div>
            <div className="border rounded-md">
                <div className="h-10 border-b bg-slate-50 px-4 flex items-center gap-4">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px] ml-auto" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 border-b px-4 flex items-center gap-4 last:border-0">
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-6 w-[80px] rounded-full ml-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}
