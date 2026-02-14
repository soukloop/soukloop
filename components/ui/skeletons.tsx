
import { Skeleton } from "@/components/ui/skeleton"

export function FormSkeleton() {
    return (
        <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </div>

            {/* Stepper */}
            <div className="flex justify-between items-center max-w-2xl mx-auto mb-12">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-6 max-w-3xl mx-auto">
                <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </div>
            </div>
        </div>
    )
}

export function CheckoutSkeleton() {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                </div>

                {/* Right Column (Summary) */}
                <div className="lg:col-span-1">
                    <div className="space-y-6 sticky top-24">
                        <Skeleton className="h-96 w-full rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function CardSkeleton() {
    return (
        <div className="flex flex-col h-full rounded-xl border border-gray-100 bg-white overflow-hidden shadow-sm">
            {/* Image */}
            <div className="relative aspect-square w-full md:aspect-[4/3] bg-gray-200 animate-pulse" />

            {/* Content */}
            <div className="p-3 space-y-2 flex-1 flex flex-col">
                <Skeleton className="h-4 w-3/4 bg-gray-100" />
                <Skeleton className="h-4 w-1/2 bg-gray-50" />

                <div className="mt-auto pt-3">
                    <Skeleton className="h-9 w-full rounded-lg bg-gray-100" />
                </div>
            </div>
        </div>
    )
}

export function ProductSkeleton() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Image Gallery Skeleton */}
                <div className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-2xl bg-gray-200" />
                    <div className="flex gap-2 pb-2 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="size-20 shrink-0 rounded-xl bg-gray-100" />
                        ))}
                    </div>
                </div>

                {/* Product Info Skeleton */}
                <div className="space-y-8">
                    {/* Title & Badge */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-3/4 bg-gray-200" />
                            <Skeleton className="h-6 w-24 rounded-full bg-gray-100" />
                        </div>
                        <Skeleton className="h-8 w-1/3 bg-gray-100" />
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-4">
                        <Skeleton className="h-12 w-32 bg-gray-200" />
                        <Skeleton className="h-8 w-24 bg-gray-100" />
                    </div>

                    {/* Info Grid */}
                    <div className="flex gap-8 py-4 border-y border-gray-100">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12 bg-gray-100" />
                            <Skeleton className="h-6 w-20 bg-gray-200" />
                        </div>
                        <div className="h-10 w-px bg-gray-100" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-16 bg-gray-100" />
                            <Skeleton className="h-6 w-24 bg-gray-200" />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-8 w-24 rounded-full bg-gray-100" />
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Skeleton className="h-12 flex-1 rounded-full bg-gray-200" />
                        <Skeleton className="h-12 flex-1 rounded-full bg-gray-100" />
                    </div>

                    {/* Description */}
                    <div className="space-y-2 pt-4">
                        <Skeleton className="h-4 w-32 bg-gray-100" />
                        <Skeleton className="h-24 w-full rounded-xl bg-gray-50" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function HeaderSkeleton() {
    return (
        <div className="w-full">
            {/* Top Bar */}
            <div className="h-6 sm:h-9 bg-gray-200 w-full animate-pulse" />

            {/* Middle Row */}
            <div className="border-b border-gray-200 bg-white">
                <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
                    {/* Logo Skeleton */}
                    <div className="flex-shrink-0">
                        <Skeleton className="h-10 w-32" />
                    </div>

                    {/* Actions Skeleton */}
                    <div className="flex items-center space-x-2">
                        <Skeleton className="size-10 rounded-full" />
                        <Skeleton className="size-10 rounded-full" />
                        <Skeleton className="size-10 rounded-full" />
                    </div>
                </div>
            </div>

            {/* Nav Bar */}
            <div className="container mx-auto flex h-9 items-center justify-between px-4 sm:px-6 lg:px-8 mt-2">
                <div className="flex items-center space-x-6">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-20" />
                </div>
            </div>
        </div>
    )
}
