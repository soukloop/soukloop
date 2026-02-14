export default function PostNewProductLoading() {
    return (
        <div className="mx-auto w-full max-w-[1920px] bg-white min-h-screen flex flex-col" role="status" aria-label="Loading form">
            {/* Header skeleton */}
            <div className="h-20 bg-white border-b border-gray-200 animate-pulse" />

            <main className="mx-auto w-full flex-1 bg-white">
                <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    {/* Header Section skeleton */}
                    <div className="mb-6 sm:mb-8 animate-pulse space-y-2">
                        <div className="h-8 sm:h-10 bg-gray-200 rounded w-64" />
                        <div className="h-4 bg-gray-200 rounded w-96 max-w-full" />
                    </div>

                    {/* Stepper skeleton */}
                    <div className="mb-8 sm:mb-12">
                        <div className="flex items-center justify-between max-w-3xl mx-auto">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className="flex flex-col items-center gap-2 animate-pulse">
                                        <div className="size-10 sm:size-12 rounded-full bg-gray-200" />
                                        <div className="h-3 w-20 bg-gray-200 rounded hidden sm:block" />
                                    </div>
                                    {step < 4 && (
                                        <div className="h-0.5 w-12 sm:w-24 bg-gray-200 mx-2 animate-pulse" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content Area skeleton */}
                    <div className="min-h-[350px] sm:min-h-[400px]">
                        {/* Photo upload grid skeleton (Step 1) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                <div key={i} className="aspect-square bg-gray-200 rounded-lg" />
                            ))}
                        </div>

                        {/* Form fields skeleton (Steps 2 & 3) - Alternative layout */}
                        <div className="space-y-6 mt-6 animate-pulse">
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-200 rounded" />
                                <div className="h-12 bg-gray-200 rounded-lg w-full" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded" />
                                <div className="h-12 bg-gray-200 rounded-lg w-full" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-gray-200 rounded" />
                                    <div className="h-12 bg-gray-200 rounded-lg w-full" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-20 bg-gray-200 rounded" />
                                    <div className="h-12 bg-gray-200 rounded-lg w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons skeleton */}
                    <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-end gap-3 sm:gap-4 animate-pulse">
                        <div className="h-12 w-full sm:w-32 bg-gray-200 rounded-full" />
                        <div className="h-12 w-full sm:w-32 bg-gray-200 rounded-full" />
                    </div>
                </div>
            </main>

            {/* Footer skeleton */}
            <div className="h-64 bg-gray-900 animate-pulse" />
        </div>
    );
}
