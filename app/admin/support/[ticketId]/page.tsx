import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import TicketDetailClient from "./TicketDetailClient";
import { requirePermission } from "@/lib/admin/permissions";
import { verifyAdminAuth } from "@/lib/admin/auth-utils";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export default async function TicketDetailPage({ params }: { params: Promise<{ ticketId: string }> }) {
    const { ticketId } = await params;

    const request = new NextRequest('http://localhost', { headers: await headers() });
    const authResult = await verifyAdminAuth(request);
    if (!authResult.success) {
        return <div>Unauthorized</div>;
    }
    if (authResult.admin) {
        await requirePermission(authResult.admin.id, 'support', 'view');
    }


    const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
            user: {
                select: {
                    name: true,
                    email: true,
                    image: true
                }
            },
            messages: {
                orderBy: {
                    createdAt: 'asc'
                }
            }
        }
    });

    if (!ticket) {
        notFound();
    }

    // Normalize data for the client component
    const ticketData = {
        id: ticket.id,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdAt: ticket.createdAt.toISOString(),
        assignedTo: ticket.assignedTo || "Unassigned",
        description: ticket.description,
        adminReply: ticket.adminReply, // Keep for legacy/compat if needed
        user: {
            name: ticket.guestName || ticket.user?.name || "Guest User",
            email: ticket.guestEmail || ticket.user?.email || "No Email",
            isGuest: !ticket.userId
        },
        // Combine initial description + support messages
        messages: [
            {
                id: "initial-msg",
                content: ticket.description,
                isFromAdmin: false,
                createdAt: ticket.createdAt.toISOString()
            },
            ...ticket.messages.map(msg => ({
                id: msg.id,
                content: msg.content,
                isFromAdmin: msg.type === 'admin',
                createdAt: msg.createdAt.toISOString()
            }))
        ]
    };

    return <TicketDetailClient ticket={ticketData} />;
}


