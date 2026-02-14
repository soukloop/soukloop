import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="container mx-auto px-4 pt-6 sm:px-6 lg:px-8">
                {/* Progress Steps Skeleton */}
                <div className="mb-8 flex justify-center">
                    <div className="flex gap-4">
                        <Skeleton className="h-10 w-24 rounded-full" />
                        <Skeleton className="h-10 w-24 rounded-full" />
                        <Skeleton className="h-10 w-24 rounded-full" />
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
                    {/* Cart Items Column */}
                    <section className="lg:col-span-7">
                        <div className="mb-6 flex items-center justify-between">
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-6 w-24" />
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <CartItemSkeleton key={i} />
                            ))}
                        </div>
                    </section>

                    {/* Order Summary Column */}
                    <section className="mt-16 rounded-2xl bg-white px-4 py-6 shadow-sm border border-gray-100 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
                        <Skeleton className="h-8 w-48 mb-6" />

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="border-t border-gray-200 pt-4 flex justify-between">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-20" />
                            </div>

                            <Skeleton className="h-12 w-full rounded-full mt-6" />
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export function CartItemSkeleton() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            {/* Checkbox Placeholder */}
            <div className="flex items-center self-center sm:self-start mt-0 sm:mt-10 mr-2">
                <Skeleton className="size-5 rounded" />
            </div>

            {/* Image Placeholder */}
            <Skeleton className="h-24 w-24 shrink-0 rounded-xl" />

            {/* Content Placeholder */}
            <div className="flex flex-1 flex-col justify-between min-w-0">
                <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 w-full">
                        <Skeleton className="h-5 w-3/4 max-w-[200px]" />
                        <Skeleton className="h-4 w-1/2 max-w-[150px]" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>

                <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div />
                    <div className="flex items-center gap-1.5">
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>
            </div>
        </div>
    )
}
