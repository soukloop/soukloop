import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { notifyTicketReply } from "@/lib/notifications/templates/support-templates"

export async function POST(req: Request) {
    try {
        const session = await auth()

        // Authorization Check
        const userRole = session?.user?.role;
        if (
            userRole !== "ADMIN" &&
            userRole !== "SUPER_ADMIN"
        ) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { ticketId, message } = body

        if (!ticketId || !message) {
            return NextResponse.json({ message: "Missing fields" }, { status: 400 })
        }


        // 1. Fetch Ticket to get Recipient Info
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: ticketId },
            include: { user: true }
        })

        if (!ticket) {
            return NextResponse.json({ message: "Ticket not found" }, { status: 404 })
        }

        // 2. Save Reply to SupportMessage history
        await prisma.supportMessage.create({
            data: {
                ticketId: ticket.id,
                content: message,
                type: "admin"
            }
        });

        // 3. Update Ticket Status
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: {
                status: "in progress", // Professional workflow: Reply doesn't mean resolved
                adminReply: message, // Keep for backward compatibility/quick view
                updatedAt: new Date()
            }
        })

        // 4. Send Professional Email & Notification
        // Since it's email-only for the user, notifyTicketReply handles the logic
        // We use the ticket's userId if available, else we handle it as a guest (handled in notifyTicketReply)
        await notifyTicketReply(
            ticket.userId || null,
            ticket.guestEmail || ticket.user?.email || "",
            ticket.id,
            ticket.subject,
            message,
            ticket.guestName || ticket.user?.name || "Customer"
        );

        return NextResponse.json({ success: true, message: "Reply sent and recorded" })

    } catch (error) {
        console.error("[ADMIN_REPLY_ERROR]", error)
        return NextResponse.json({ message: "Internal Error" }, { status: 500 })
    }

}

