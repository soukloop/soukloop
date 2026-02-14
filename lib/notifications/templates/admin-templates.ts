import { notifyAllAdmins, createNotification } from '../create-notification'

/**
 * Notify admins about new support ticket
 */
export async function notifyNewSupportTicket(data: {
    ticketId: string
    subject: string
    userName: string
    userId: string
    priority?: string
}) {
    const priorityText = data.priority === 'high' ? ' [HIGH PRIORITY]' : ''

    return notifyAllAdmins(
        'NEW_SUPPORT_TICKET',
        `New Support Ticket${priorityText} 🎫`,
        `${data.userName} submitted: "${data.subject}"`,
        data,
        `/admin/support?ticket=${data.ticketId}`
    )
}

/**
 * Notify user about support ticket status update
 */
export async function notifyTicketStatusUpdate(
    userId: string,
    data: { ticketId: string; subject: string; status: string }
) {
    const statusMessages: Record<string, string> = {
        'in_progress': 'Your support ticket is being reviewed by our team.',
        'resolved': 'Your support ticket has been resolved.',
        'closed': 'Your support ticket has been closed.',
        'pending': 'Your support ticket is pending review.'
    }

    return createNotification({
        userId,
        type: 'SYSTEM_ANNOUNCEMENT',
        title: `Support Ticket Update`,
        message: statusMessages[data.status] || `Your ticket status: ${data.status}`,
        data,
        actionUrl: '/helpline',
        sendEmail: data.status === 'resolved'
    })
}

/**
 * Notify admins about new report (product or user)
 */
export async function notifyNewReport(data: {
    reportId: string
    reason: string
    type: 'product' | 'user'
    reporterName?: string
    reportedItemName?: string
}) {
    return notifyAllAdmins(
        'NEW_REPORT',
        `New ${data.type === 'product' ? 'Product' : 'User'} Report 🚩`,
        `${data.reporterName || 'Someone'} reported ${data.reportedItemName || `a ${data.type}`}: "${data.reason.substring(0, 50)}${data.reason.length > 50 ? '...' : ''}"`,
        data,
        `/admin/reports`
    )
}

/**
 * Send system-wide announcement to all users
 */
export async function broadcastSystemAnnouncement(
    userIds: string[],
    data: { title: string; message: string; actionUrl?: string }
) {
    return Promise.all(
        userIds.map(userId =>
            createNotification({
                userId,
                type: 'SYSTEM_ANNOUNCEMENT',
                title: `📢 ${data.title}`,
                message: data.message,
                data,
                actionUrl: data.actionUrl,
                sendEmail: false
            })
        )
    )
}

/**
 * Notify user about points earned
 */
export async function notifyPointsEarned(
    userId: string,
    data: { points: number; reason: string; newBalance?: number }
) {
    const balanceText = data.newBalance !== undefined
        ? ` Your new balance: ${data.newBalance.toLocaleString()} points.`
        : ''

    return createNotification({
        userId,
        type: 'POINTS_EARNED',
        title: `+${data.points} Points Earned! 🎁`,
        message: `You earned ${data.points} reward points for ${data.reason}.${balanceText}`,
        data,
        actionUrl: '/reward-points',
        sendEmail: false
    })
}

/**
 * Notify seller about payout processed
 */
export async function notifyPayoutProcessed(
    sellerId: string,
    data: { amount: number; currency?: string; payoutId: string; method?: string }
) {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: data.currency || 'USD'
    }).format(data.amount)

    return createNotification({
        userId: sellerId,
        type: 'PAYOUT_PROCESSED',
        title: 'Payout Processed! 💵',
        message: `Your payout of ${formatted} has been processed${data.method ? ` via ${data.method}` : ''}. It should arrive within 2-5 business days.`,
        data,
        actionUrl: '/seller/dashboard?tab=earnings',
        sendEmail: true,
        emailSubject: `Payout Processed - ${formatted}`
    })
}
