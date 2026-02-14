import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function UserDashboardPage() {
    const session = await auth();
    if (!session) {
        redirect("/?auth=login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <h1 className="text-2xl font-bold">User Dashboard</h1>
            <p className="text-gray-500">Coming soon...</p>
        </div>
    )
}
