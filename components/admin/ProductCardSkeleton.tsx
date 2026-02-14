import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-100 overflow-hidden bg-white h-full flex flex-col">
            <Skeleton className="aspect-square w-full bg-gray-100" />
            <div className="p-3 flex flex-col flex-1 gap-2">
                <Skeleton className="h-4 w-3/4 bg-gray-100" />
                <div className="flex justify-between items-center mt-auto pt-2">
                    <Skeleton className="h-4 w-1/3 bg-gray-100" />
                    <Skeleton className="h-5 w-16 rounded-full bg-gray-100" />
                </div>
                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                    <Skeleton className="h-3 w-24 bg-gray-100" />
                </div>
            </div>
        </div>
    );
}

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
