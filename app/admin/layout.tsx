import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import AdminLayoutClient from "./AdminLayoutClient";
import { getAdminPermissions } from "@/lib/admin/permissions";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    let adminPermissions: Record<string, string[]> = {};
    if (session?.user?.id) {
        adminPermissions = await getAdminPermissions(session.user.id);
    }

    return (
        <SessionProvider session={session}>
            <AdminLayoutClient initialPermissions={adminPermissions}>{children}</AdminLayoutClient>
        </SessionProvider>
    );
}
