
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AdminProductDetailsSkeleton() {
    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Header Skeleton */}
            <div className="w-full bg-white border-b">
                <div className="max-w-7xl mx-auto px-6 pt-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Skeleton className="h-6 w-48" />
                                    <Skeleton className="h-5 w-20 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-24" />
                        </div>
                    </div>
                    <div className="flex gap-6 border-b border-gray-200">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="pb-3">
                                <Skeleton className="h-4 w-20" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 py-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8 space-y-8">
                        <Skeleton className="aspect-video w-full rounded-2xl" />
                        <div className="flex gap-2">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="size-20 rounded-xl" />)}
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i}>
                                    <Skeleton className="h-3 w-16 mb-2" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 space-y-6">
                        <Skeleton className="h-40 w-full rounded-2xl" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                        <Skeleton className="h-40 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
