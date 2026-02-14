
export default function Loading() {
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-6 animate-pulse">
            <div className="flex justify-between items-center">
                <div className="h-8 w-48 bg-gray-200 rounded"></div>
                <div className="h-10 w-32 bg-gray-200 rounded"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                            </div>
                            <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
