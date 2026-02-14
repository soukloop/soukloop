import { NextRequest, NextResponse } from 'next/server'
import { handleApiError } from '@/lib/api-wrapper';
import { verifyAdminAuth } from '@/lib/admin/auth-utils'
import { prisma } from '@/lib/prisma'
import { notifyUserTicketResolved } from '@/lib/notifications/templates/support-templates';

// GET all support tickets
export async function GET(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(tickets)

    } catch (error) {
        return handleApiError(error);
    }
}

// PATCH ticket status/assignment
export async function PATCH(request: NextRequest) {
    try {
        const authResult = await verifyAdminAuth(request);
        if (!authResult.success) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json()
        const { id, status, assignedTo } = body

        if (!id) {
            return NextResponse.json({ error: 'Ticket ID required' }, { status: 400 })
        }

        const currentTicket = await prisma.supportTicket.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!currentTicket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        const updateData: any = {}
        if (status) updateData.status = status
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo
        updateData.updatedAt = new Date()

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Professional Notification: Trigger "Resolved" email if status changed to resolved
        if (status === 'resolved' && currentTicket.status !== 'resolved') {
            await notifyUserTicketResolved(
                ticket.user?.id || null,
                currentTicket.guestEmail || ticket.user?.email || "",
                ticket.id,
                ticket.subject,
                currentTicket.guestName || ticket.user?.name || "Customer"
                // resolutionSummary could be passed here if we had it in the body
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Ticket updated successfully',
            ticket
        })

    } catch (error) {
        return handleApiError(error);
    }
}

