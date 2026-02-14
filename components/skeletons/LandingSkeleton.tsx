import { Skeleton } from "@/components/ui/skeleton"

export default function LandingSkeleton() {
    return (
        <div className="w-full space-y-8 animate-pulse p-4">
            {/* Hero Section Skeleton */}
            <div className="relative h-[400px] w-full bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-10 w-1/3 bg-gray-200 rounded" />
                </div>
            </div>

            {/* Search Section Skeleton */}
            <div className="container mx-auto px-4 py-8">
                <div className="h-12 w-full max-w-2xl mx-auto bg-gray-100 rounded-full" />
            </div>

            {/* Categories Skeleton */}
            <div className="container mx-auto px-4 space-y-4">
                <div className="h-8 w-48 bg-gray-200 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-32 bg-gray-100 rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Products Skeleton */}
            <div className="container mx-auto px-4 space-y-4">
                <div className="h-8 w-64 bg-gray-200 rounded" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[300px] bg-gray-100 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}
