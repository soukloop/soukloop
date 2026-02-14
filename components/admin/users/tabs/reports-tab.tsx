"use client";

import { useState, useEffect } from "react";
import DataTable from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert, UserCheck } from "lucide-react";

interface ReportsTabProps {
    userId: string;
}

export default function ReportsTab({ userId }: ReportsTabProps) {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showMadeByUser, setShowMadeByUser] = useState(false); // Default to reports AGAINST user

    useEffect(() => {
        fetchReports();
    }, [userId, showMadeByUser]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            // We'll use the existing /api/admin?type=reports but we might need to filter it
            // Or better, we can assume we'll add a filtering capability to the API or fetch all and filter client side
            // Given the current API implementation, it returns all. For now, client-side filtering is easier
            // but for a "professional" feel, a dedicated fetch or filtered fetch is better.
            // Let's see if we can filter by reporterId or reportedUserId.

            const res = await fetch(`/api/admin?type=reports`);
            const allReports = await res.json();

            if (Array.isArray(allReports)) {
                const filtered = allReports.filter((r: any) =>
                    showMadeByUser
                        ? (r.reporterId === userId && !r.productId)
                        : (r.reportedUserId === userId)
                );
                setReports(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch reports:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const columns = [
        {
            key: 'reason',
            header: 'Reason',
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-900 line-clamp-1 truncate max-w-[300px]">{row.reason}</span>
                    <span className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {row.id.slice(0, 8)}</span>
                </div>
            )
        },
        {
            key: 'target',
            header: showMadeByUser ? 'Report Context' : 'Reported By',
            render: (row: any) => {
                const target = showMadeByUser
                    ? (row.product?.name || row.reportedUser?.name || row.reportedUser?.email || 'Unknown')
                    : (row.reporter?.name || row.reporter?.email || 'Unknown');

                const type = row.productId
                    ? `Product Report`
                    : 'User Profile';

                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{target}</span>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider transition-colors">{type}</span>
                    </div>
                );
            }
        },
        {
            key: 'status',
            header: 'Status',
            render: (row: any) => <StatusBadge status={row.status} type="report" />
        },
        {
            key: 'createdAt',
            header: 'Date',
            render: (row: any) => <span className="text-sm text-gray-500">{new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${showMadeByUser ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'} border ${showMadeByUser ? 'border-blue-100' : 'border-red-100'}`}>
                        {showMadeByUser ? <UserCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            {showMadeByUser ? "Reports Made by User" : "Reports Against User"}
                            <span className="text-xs font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border">
                                {reports.length}
                            </span>
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {showMadeByUser
                                ? "Showing all reports filed by this user."
                                : "Showing all reports filed against this user or their products."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3 bg-slate-50/50 p-1.5 rounded-xl border border-slate-100">
                    <Label htmlFor="report-toggle" className={`text-xs font-bold transition-all cursor-pointer px-2 ${!showMadeByUser ? 'text-red-600' : 'text-gray-400 hover:text-gray-600'}`}>AGAINST</Label>
                    <Switch
                        id="report-toggle"
                        checked={showMadeByUser}
                        onCheckedChange={setShowMadeByUser}
                        className="data-[state=checked]:bg-blue-600"
                    />
                    <Label htmlFor="report-toggle" className={`text-xs font-bold transition-all cursor-pointer px-2 ${showMadeByUser ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>MADE BY</Label>
                </div>
            </div>

            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
                        <p className="text-sm font-medium text-gray-500">Fetching report history...</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={reports}
                        pageSize={10}
                        searchable={true}
                        searchKeys={["reason"]}
                        searchPlaceholder="Search in report reasons..."
                        emptyMessage={showMadeByUser ? "User hasn't made any reports." : "No reports found against this user."}
                        onRowClick={(row) => router.push(`/admin/reports/${row.id}`)}
                    />
                )}
            </div>
        </div>
    );
}
