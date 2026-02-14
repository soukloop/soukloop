import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import SupportTicketsClient from "./SupportTicketsClient";

export const metadata = {
    title: "Support Tickets | Admin Dashboard",
    description: "Manage support tickets and user inquiries.",
};

export default async function SupportTicketsPage() {
    const session = await auth();

    // Authorization Check
    // Authorization Check
    const userRole = session?.user?.role;
    if (
        userRole !== "ADMIN" &&
        userRole !== "SUPER_ADMIN" &&
        userRole !== "MODERATOR" &&
        userRole !== "SUPPORT"
    ) {
        redirect("/");
    }


    const tickets = await prisma.supportTicket.findMany({
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    // Serialize dates for Client Component
    const serializedTickets = tickets.map(ticket => ({
        ...ticket,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
        // Ensure nulls are handled for serialization if needed, though mostly automatic
    }));

    return <SupportTicketsClient initialTickets={serializedTickets} />;
}
