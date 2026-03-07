
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Package, ShieldAlert, Calendar, Mail, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "@/components/admin/StatusBadge";
import ReportActions from "./report-actions";
import { UserAvatar } from "@/components/shared/user-avatar";
import { requirePermission } from "@/lib/admin/permissions";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';

export default async function ReportDetailPage(props: { params: Promise<{ id: string }> }) {
    const request = new NextRequest('http://localhost', { headers: await headers() });
    const authResult = await verifyAdminAuth(request);
    if (authResult.success && authResult.admin) {
        await requirePermission(authResult.admin.id, 'reports', 'view');
    }
    const params = await props.params;
    const report = await prisma.report.findUnique({
        where: { id: params.id },
        include: {
            reporter: {
                include: { profile: true }
            },
            reportedUser: {
                include: { profile: true, vendor: true }
            },
            product: {
                include: {
                    vendor: {
                        include: {
                            user: { include: { profile: true } }
                        }
                    },
                    images: { where: { isPrimary: true }, take: 1 }
                }
            }
        }
    });

    if (!report) notFound();

    const [reasonTitle, ...reasonRest] = report.reason.includes(':')
        ? report.reason.split(':')
        : [null, report.reason];
    const reasonDetail = reasonRest.join(':').trim();

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/reports">
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-gray-900">Report Details</h1>
                                <StatusBadge status={report.status} type="report" />
                            </div>
                            <p className="text-xs text-gray-500 font-mono mt-0.5">ID: {report.id}</p>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Report Reason Card */}
                        <section className="bg-white rounded-2xl border p-6 shadow-sm">
                            <div className="flex items-center gap-2 text-red-600 mb-4">
                                <ShieldAlert className="h-5 w-5" />
                                <h2 className="font-semibold">Reason for Report</h2>
                            </div>
                            <div className="bg-red-50/50 rounded-xl p-4 border border-red-100 text-gray-800 leading-relaxed shadow-inner">
                                {reasonTitle && (
                                    <div className="font-bold text-red-900 mb-1 text-sm uppercase tracking-tight">
                                        {reasonTitle.trim()}
                                    </div>
                                )}
                                <div className="text-gray-700">
                                    {reasonDetail}
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </section>

                        {/* Reported Item Details */}
                        {report.product ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-900 px-1">
                                    <Package className="h-5 w-5 text-gray-400" />
                                    <h2 className="font-semibold">Reported Product</h2>
                                </div>

                                <Link
                                    href={`/admin/products/${report.product.id}`}
                                    className="block group"
                                >
                                    <section className="bg-white rounded-2xl border overflow-hidden shadow-sm group-hover:border-orange-200 group-hover:shadow-md transition-all duration-200">
                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {report.product.images[0]?.url && (
                                                    <div className="h-40 w-40 rounded-xl border overflow-hidden flex-shrink-0 bg-gray-50">
                                                        <img
                                                            src={report.product.images[0].url}
                                                            alt={report.product.name}
                                                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0 flex flex-col">
                                                    <div className="flex justify-between items-start gap-4">
                                                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                                                            {report.product.name}
                                                        </h3>
                                                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                                                            <ArrowLeft className="h-4 w-4 text-gray-400 group-hover:text-orange-500 rotate-180" />
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">
                                                        {report.product.description}
                                                    </p>

                                                    <div className="mt-auto pt-6 flex flex-wrap gap-6 items-center">
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Price</span>
                                                            <span className="text-lg font-bold text-gray-900">${report.product.price}</span>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Status</span>
                                                            <StatusBadge status={report.product.isActive ? 'Active' : 'Blocked'} type="product" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">SKU</span>
                                                            <span className="text-sm font-medium text-gray-600">{report.product.id.slice(-8).toUpperCase()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Seller Info Bar */}
                                        <div className="bg-gray-50 border-t p-4 flex items-center justify-between group-hover:bg-gray-100/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Store className="h-4 w-4 text-gray-400" />
                                                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</span>
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {report.product.vendor.user.profile?.firstName} {report.product.vendor.user.profile?.lastName || report.product.vendor.user.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-orange-600 font-bold uppercase tracking-widest flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Product Details
                                            </div>
                                        </div>
                                    </section>
                                </Link>

                                {/* Separate Seller Info Card */}
                                <section className="bg-white rounded-2xl border p-6 shadow-sm">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        Full Seller Information
                                    </h3>
                                    <div className="flex items-center justify-between p-4 rounded-xl border bg-gray-50/50">
                                        <div className="flex items-center gap-4">
                                            <UserAvatar
                                                src={report.product.vendor.user.profile?.avatar || report.product.vendor.user.image}
                                                name={report.product.vendor.user.profile?.firstName || report.product.vendor.user.name || "Seller"}
                                                fallbackType="initials"
                                                className="size-10 shrink-0"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {report.product.vendor.user.profile?.firstName} {report.product.vendor.user.profile?.lastName || report.product.vendor.user.name}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="h-3 w-3 text-gray-400" />
                                                    <p className="text-xs text-gray-500">{report.product.vendor.user.email}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/admin/users/${report.product.vendor.userId}`}>
                                            <Button variant="outline" size="sm">View Profile</Button>
                                        </Link>
                                    </div>
                                </section>
                            </div>
                        ) : report.reportedUser ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-gray-900 px-1">
                                    <User className="h-5 w-5 text-gray-400" />
                                    <h2 className="font-semibold">Reported User</h2>
                                </div>
                                <Link
                                    href={`/admin/users/${report.reportedUser.id}`}
                                    className="block group"
                                >
                                    <section className="bg-white rounded-2xl border overflow-hidden shadow-sm group-hover:border-blue-200 group-hover:shadow-md transition-all duration-200 p-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <UserAvatar
                                                    src={report.reportedUser.profile?.avatar || report.reportedUser.image}
                                                    name={report.reportedUser.profile?.firstName || report.reportedUser.name || "User"}
                                                    fallbackType="initials"
                                                    className="size-20 border-2 border-white shadow-sm group-hover:scale-105 transition-transform shrink-0"
                                                />
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {report.reportedUser.profile?.firstName} {report.reportedUser.profile?.lastName || report.reportedUser.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                                                        <span className="text-sm text-gray-600">{report.reportedUser.email}</span>
                                                    </div>
                                                    <div className="mt-4 flex items-center gap-3">
                                                        <StatusBadge status={report.reportedUser.isActive ? 'Active' : 'Suspended'} type="seller" />
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                                                            {report.reportedUser.role}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                                <ArrowLeft className="h-5 w-5 text-gray-400 group-hover:text-blue-500 rotate-180" />
                                            </div>
                                        </div>
                                    </section>
                                </Link>
                            </div>
                        ) : null}
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        {/* Reporter Card */}
                        <section className="bg-white rounded-2xl border p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-400" />
                                Reported By
                            </h3>
                            <div className="flex items-center gap-3">
                                <UserAvatar
                                    src={report.reporter.profile?.avatar || report.reporter.image}
                                    name={report.reporter.profile?.firstName || report.reporter.name || "Reporter"}
                                    fallbackType="initials"
                                    className="size-10 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 line-clamp-1">
                                        {report.reporter.profile?.firstName} {report.reporter.profile?.lastName || report.reporter.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{report.reporter.email}</p>
                                </div>
                            </div>
                            <Link href={`/admin/users/${report.reporterId}`} className="mt-4 block">
                                <Button variant="ghost" size="sm" className="w-full text-slate-500 text-xs hover:bg-slate-50">View Profile</Button>
                            </Link>
                        </section>

                        {/* Actions Card */}
                        <section className="bg-white rounded-2xl border p-6 shadow-sm sticky top-24">
                            <ReportActions
                                reportId={report.id}
                                productId={report.productId}
                                reportedUserId={report.reportedUserId}
                                status={report.status}
                            />
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
