import { Skeleton } from "@/components/ui/skeleton";

interface TableSkeletonProps {
    rowCount?: number;
    columnCount?: number;
}

export default function TableSkeleton({ rowCount = 5, columnCount = 5 }: TableSkeletonProps) {
    return (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {Array.from({ length: columnCount }).map((_, index) => (
                                <th key={index} className="px-6 py-4">
                                    <Skeleton className="h-4 w-24 bg-gray-200" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {Array.from({ length: rowCount }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="group">
                                {Array.from({ length: columnCount }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <Skeleton className="h-4 w-full bg-gray-100" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
