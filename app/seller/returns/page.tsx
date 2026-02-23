'use client';

import { useState, useEffect } from "react";
import EcommerceHeader from "@/components/ecommerce-header";
import FooterSection from "@/components/footer-section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Search,
    Filter,
    MoreVertical,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    RotateCcw
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSellerAuth } from "@/hooks/useSellerAuth";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Refund {
    id: string;
    amount: number;
    reason: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROCESSED' | 'FAILED';
    createdAt: string;
    orderItemId?: string;
    order: {
        id: string;
        orderNumber: string;
        user: {
            name: string;
            email: string;
        }
    }
}

export default function SellerReturnsPage() {
    const { isSeller, isLoading: isAuthLoading } = useSellerAuth();
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");

    useEffect(() => {
        if (!isAuthLoading && isSeller) {
            fetchRefunds();
        }
    }, [isAuthLoading, isSeller]);

    const fetchRefunds = async () => {
        try {
            setIsLoading(true);
            const res = await fetch('/api/refunds');
            if (res.ok) {
                const data = await res.json();
                setRefunds(data);
            } else {
                toast.error("Failed to fetch returns");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error loading returns");
        } finally {
            setIsLoading(false);
        }
    };

    const filteredRefunds = refunds.filter(refund => {
        const matchesSearch =
            refund.order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            refund.order.user.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'ALL' || refund.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (isAuthLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <EcommerceHeader />

            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Return Requests</h1>
                        <p className="text-gray-500 mt-1">Manage and track return requests from your customers</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search order # or customer..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <select
                                className="h-10 rounded-md border border-gray-300 text-sm px-3 focus:outline-none focus:ring-2 focus:ring-[#E87A3F]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved/Processed</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50/50">
                                    <TableHead>Order</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            <div className="flex justify-center items-center gap-2 text-gray-500">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Loading returns...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredRefunds.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-32 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <RotateCcw className="h-8 w-8 opacity-20" />
                                                <p>No return requests found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredRefunds.map((refund) => (
                                        <TableRow key={refund.id} className="hover:bg-gray-50/50">
                                            <TableCell className="font-medium">
                                                {refund.order.orderNumber}
                                                <div className="text-xs text-gray-500">ID: {refund.id.slice(0, 8)}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{refund.order.user.name}</div>
                                                <div className="text-xs text-gray-500">{refund.order.user.email}</div>
                                            </TableCell>
                                            <TableCell>${refund.amount.toFixed(2)}</TableCell>
                                            <TableCell>
                                                <span className="truncate max-w-[150px] block" title={refund.reason}>
                                                    {refund.reason}
                                                </span>
                                            </TableCell>
                                            <TableCell>{new Date(refund.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell><StatusBadge status={refund.status} type="transaction" /></TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Eye className="mr-2 h-4 w-4" /> View Details
                                                        </DropdownMenuItem>
                                                        {/* Actions could be added here later */}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}
