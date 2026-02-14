
import { prisma } from "@/lib/prisma";
import ReportsDataTable from "./reports-data-table";

interface ReportsTabProps {
    productId: string;
}

export default async function ReportsTab({ productId }: ReportsTabProps) {
    const product = await prisma.product.findUnique({
        where: { id: productId },
        select: {
            reports: {
                include: {
                    reporter: { select: { name: true, email: true } }
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    if (!product) return null;

    // Serialize Dates safely
    const reports = product.reports.map((report: any) => ({
        ...report,
        createdAt: report.createdAt instanceof Date ? report.createdAt.toISOString() : report.createdAt,
        updatedAt: report.updatedAt instanceof Date ? report.updatedAt.toISOString() : (report.updatedAt || null),
        resolvedAt: report.resolvedAt instanceof Date ? report.resolvedAt.toISOString() : (report.resolvedAt || null)
    }));

    return (
        <div className="animate-in fade-in duration-300">
            <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-100">
                <h4 className="text-sm font-semibold text-red-900 mb-1">Product Reports</h4>
                <p className="text-xs text-red-700">These reports were filed by users regarding this product. Please review them against guidelines.</p>
            </div>
            <ReportsDataTable data={reports} />
        </div>
    );
}
