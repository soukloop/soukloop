import TableSkeleton from '@/components/admin/TableSkeleton';

export default function Loading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Returns & Refund Requests</h1>
            </div>
            <TableSkeleton rowCount={10} columnCount={6} />
        </div>
    );
}
