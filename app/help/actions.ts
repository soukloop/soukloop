"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { sendEmail } from "@/lib/mail" // Assuming this utility exists based on previous checks
import { notifyAdminsNewTicket } from "@/lib/notifications/templates/support-templates"

interface SupportFormData {
    name: string
    email: string
    subject: string
    description: string
}

export async function submitSupportRequest(data: SupportFormData) {
    const session = await auth()
    const user = session?.user

    try {
        let ticket;

        // 1. Create Ticket in Database
        if (user?.id) {
            // Authenticated User
            ticket = await prisma.supportTicket.create({
                data: {
                    userId: user.id,
                    subject: data.subject,
                    description: data.description,
                    priority: "medium",
                    status: "open",
                },
            })
        } else {
            // Guest User
            ticket = await prisma.supportTicket.create({
                data: {
                    guestName: data.name,
                    guestEmail: data.email,
                    subject: data.subject,
                    description: data.description,
                    priority: "medium",
                    status: "open",
                },
            })
        }

        // 2. Send Confirmation Email (Dual Action)
        // We wrap this in a try-catch so email failure doesn't block the UI success
        try {
            await sendEmail({
                to: data.email,
                subject: `Ticket Received: ${data.subject} [${ticket.id}]`,
                text: `Hi ${data.name},\n\nWe have received your support request regarding "${data.subject}".\n\nTicket ID: ${ticket.id}\n\nOur team will review it and get back to you shortly.\n\nBest,\nSoukloop Support Team`,
                // html: ... (can add HTML template later)
            })

            // Log admin alert (simulated for now, or send another email to admin)
            // console.log(`[Admin Alert] New Ticket ${ticket.id} from ${data.email}`)

            await notifyAdminsNewTicket(
                ticket.id,
                data.email,
                data.subject,
                data.description,
                data.name
            );
        } catch (emailError) {
            console.error("Failed to send confirmation email:", emailError)
            // We still return success because the Ticket WAS created in DB
        }

        revalidatePath("/help")
        return { success: true, ticketId: ticket.id }

    } catch (error) {
        console.error("Failed to create support ticket:", error)
        return { success: false, error: "Failed to create support ticket" }
    }
}
