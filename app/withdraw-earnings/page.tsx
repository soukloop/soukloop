import { auth } from "@/auth";
import { getWithdrawalData } from "@/src/features/withdrawals/actions";
import WithdrawalClient from "./WithdrawalClient";
import { redirect } from "next/navigation";

export default async function WithdrawEarningsPage() {
    const session = await auth();

    // Server-side Auth Check
    if (!session || !session.user) {
        redirect("/?auth=login");
    }

    if (!['SELLER', 'ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
        redirect("/seller/onboarding");
    }

    try {
        const data = await getWithdrawalData();
        return <WithdrawalClient initialData={data} />;
    } catch (error) {
        console.error("Failed to load withdrawal data:", error);
        // Fallback or Error UI could be better here, but for now redirect or basic error
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-600">Error Loading Data</h1>
                <p className="text-gray-600">Please try again later.</p>
            </div>
        )
    }
}
