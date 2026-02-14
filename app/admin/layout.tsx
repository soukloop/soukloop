import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    return (
        <SessionProvider session={session}>
            <AdminLayoutClient>{children}</AdminLayoutClient>
        </SessionProvider>
    );
}
