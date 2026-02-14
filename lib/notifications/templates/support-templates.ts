import { notifyAllAdmins, createNotification } from '../create-notification';
import { sendEmail } from '@/lib/mail';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Notify admins about a new support ticket
 */
export async function notifyAdminsNewTicket(
    ticketId: string,
    userEmail: string,
    subject: string,
    message: string,
    userName?: string
) {
    const { render } = await import('@react-email/render');
    const { NewTicketEmail } = await import('@/lib/email-templates/support/new-ticket');

    const emailHtml = await render(
        NewTicketEmail({
            ticketId,
            userEmail,
            userName,
            subject,
            message,
            dashboardUrl: `${baseUrl}/admin/support`
        })
    );

    return notifyAllAdmins(
        'SUPPORT_TICKET',
        'New Support Ticket',
        `New ticket from ${userName || userEmail}: ${subject}`,
        {
            ticketId,
            userEmail,
            subject
        },
        '/admin/support',
        {
            sendEmail: true,
            emailSubject: `[Ticket #${ticketId}] ${subject}`,
            emailHtml
        }
    );
}

/**
 * Send a confirmation email to the user when they submit a ticket
 */
export async function notifyUserTicketConfirmation(
    userEmail: string,
    ticketId: string,
    subject: string,
    message: string,
    userName?: string,
    userId?: string
) {
    const { render } = await import('@react-email/render');
    const { UserConfirmationEmail } = await import('@/lib/email-templates/support/user-confirmation');

    const emailHtml = await render(
        UserConfirmationEmail({
            ticketId,
            userName,
            subject,
            message,
            helpCenterUrl: `${baseUrl}/help`,
            isGuest: !userId
        })
    );

    const emailSubject = `[Ticket #${ticketId}] ${subject}`;

    if (userId) {
        return createNotification({
            userId,
            type: 'SUPPORT_TICKET_RECEIVED',
            title: 'Support Ticket Received',
            message: `We've received your ticket: ${subject}. We'll get back to you shortly.`,
            actionUrl: `/help`,
            sendEmail: true,
            emailSubject,
            emailHtml
        });
    }

    // Guest fallback
    return sendEmail({
        to: userEmail,
        subject: emailSubject,
        html: emailHtml
    });
}

/**
 * Notify user about a reply to their ticket
 */
export async function notifyTicketReply(
    userId: string | null,
    userEmail: string,
    ticketId: string,
    subject: string,
    replyMessage: string,
    userName?: string
) {
    const { render } = await import('@react-email/render');
    const { TicketReplyEmail } = await import('@/lib/email-templates/support/ticket-reply');

    const emailHtml = await render(
        TicketReplyEmail({
            ticketId,
            userName,
            subject,
            replyMessage,
            viewUrl: `${baseUrl}/help`,
            isGuest: !userId
        })
    );

    const emailSubject = `Re: [Ticket #${ticketId}] ${subject}`;

    if (userId) {
        return createNotification({
            userId,
            type: 'SUPPORT_REPLY',
            title: 'New Reply to Support Ticket',
            message: `Support team has replied to your ticket: ${subject}`,
            actionUrl: `/help`,
            sendEmail: true,
            emailSubject,
            emailHtml
        });
    }

    // Guest fallback
    if (userEmail) {
        return sendEmail({
            to: userEmail,
            subject: emailSubject,
            html: emailHtml
        });
    }
}

/**
 * Notify user that their ticket has been resolved
 */
export async function notifyUserTicketResolved(
    userId: string | null,
    userEmail: string,
    ticketId: string,
    subject: string,
    userName?: string,
    resolutionSummary?: string
) {
    const { render } = await import('@react-email/render');
    const { TicketResolvedEmail } = await import('@/lib/email-templates/support/ticket-resolved');

    const emailHtml = await render(
        TicketResolvedEmail({
            ticketId,
            userName,
            subject,
            resolutionSummary,
            viewUrl: `${baseUrl}/help`
        })
    );

    const emailSubject = `[Ticket #${ticketId}] Resolved: ${subject}`;

    if (userId) {
        return createNotification({
            userId,
            type: 'SUPPORT_TICKET_RESOLVED',
            title: 'Support Ticket Resolved',
            message: `Your ticket "${subject}" has been marked as resolved.`,
            actionUrl: `/help`,
            sendEmail: true,
            emailSubject,
            emailHtml,
            data: { guestEmail: userId ? undefined : userEmail }
        });
    }

    // Guest fallback
    if (userEmail) {
        return sendEmail({
            to: userEmail,
            subject: emailSubject,
            html: emailHtml
        });
    }
}


