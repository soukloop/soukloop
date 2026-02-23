import { NextRequest, NextResponse } from "next/server";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { getMetricCards } from "@/lib/admin/dashboard-service";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const searchParams = request.nextUrl.searchParams;
        const period = (searchParams.get("period") as "daily" | "weekly") || "daily";

        const metrics = await getMetricCards(period);

        return NextResponse.json(metrics);
    } catch (error: any) {
        console.error("Admin Stats API Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
