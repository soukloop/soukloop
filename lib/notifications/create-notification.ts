import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/mail'
import { CreateNotificationInput, NotificationType, NOTIFICATION_CATEGORY_MAP, NotificationCategory } from './types'
import { outbox } from '@/lib/outbox'


/**
 * Generate default email HTML template
 */
function generateDefaultEmailHtml(title: string, message: string, actionUrl?: string): string {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fullActionUrl = actionUrl ? `${baseUrl}${actionUrl}` : null

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #E87A3F 0%, #C96835 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
          border-radius: 12px 12px 0 0;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .content {
          background: #ffffff;
          padding: 40px 30px;
          border-radius: 0 0 12px 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .content h2 {
          margin: 0 0 16px 0;
          font-size: 20px;
          color: #1a1a1a;
        }
        .content p {
          margin: 0 0 24px 0;
          color: #666666;
          font-size: 16px;
        }
        .button {
          display: inline-block;
          background: #E87A3F;
          color: white !important;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.2s;
        }
        .button:hover {
          background: #C96835;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          color: #999999;
          font-size: 13px;
        }
        .footer a {
          color: #E87A3F;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${baseUrl}/soukloop-logo.png" alt="SoukLoop" width="180" style="display:block;margin:0 auto;" />
        </div>
        <div class="content">
          <h2>${title}</h2>
          <p>${message}</p>
          ${fullActionUrl ? `<a href="${fullActionUrl}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
          <p>This email was sent by Soukloop.</p>
          <p>If you didn't expect this email, you can safely ignore it.</p>
          <p><a href="${baseUrl}/editprofile?section=notifications">Manage notification preferences</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Check if user has enabled notifications for a given category
 * Note: Returns true if no preferences exist (default behavior)
 */
async function checkUserPreference(
    userId: string,
    category: NotificationCategory,
    channel: 'inApp' | 'email'
): Promise<boolean> {
    try {
        // Try to get user preferences - if the table doesn't exist yet, return true
        const prefs = await (prisma as any).notificationPreference?.findUnique({
            where: { userId }
        }).catch(() => null)

        // Default to true if no preferences set or table doesn't exist
        if (!prefs) return true

        if (channel === 'inApp') {
            switch (category) {
                case 'orders': return prefs.inAppOrders ?? true
                case 'messages': return prefs.inAppMessages ?? true
                case 'reviews': return prefs.inAppReviews ?? true
                case 'system': return prefs.inAppSystem ?? true
            }
        } else {
            switch (category) {
                case 'orders': return prefs.emailOrders ?? true
                case 'messages': return prefs.emailMessages ?? false
                default: return true
            }
        }
    } catch {
        // If anything fails, default to allowing notifications
        return true
    }
    return true
}

/**
 * Create an in-app notification and optionally send email
 * 
 * @param input - Notification creation parameters
 * @returns Created notification or null if preferences disabled
 */
export async function createNotification(input: CreateNotificationInput) {
    const {
        userId,
        // adminUserId, // REMOVED
        type,
        title,
        message,
        data = {},
        actionUrl,
        sendEmail: shouldSendEmail = false,
        emailSubject,
        emailHtml,
        emailReact  // React Email component
    } = input

    console.log('[DEBUG] createNotification called', {
        type,
        userId,
        shouldSendEmail,
        provider: process.env.EMAIL_PROVIDER
    });

    try {
        // Validation: Must have at least one ID
        if (!userId) {
            throw new Error('Notification must have userId')
        }

        // Standard User Logic

        if (!userId) return null // Should be caught by validation, but TS check

        // 1. Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                name: true
            }
        })

        if (!user) {
            console.warn(`[Notification] User ${userId} not found`)
            return null
        }

        const category = NOTIFICATION_CATEGORY_MAP[type]

        // 2. Check if in-app notification is enabled
        const shouldCreateInApp = await checkUserPreference(userId, category, 'inApp')

        // 3. Create in-app notification if enabled
        let notification = null
        if (shouldCreateInApp) {
            notification = await prisma.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    data: data as any, // Cast for Prisma JSON compatibility
                    actionUrl
                }
            })
            console.log(`[Notification] Created: ${type} for user ${userId}`)

            // 📣 Real-time via Centrifugo Outbox
            await outbox.sendToUser(userId, {
                type: 'notification',
                data: notification
            });

            // Also broadcast to a general notifications channel if needed
            await outbox.publish('notifications', {
                type: 'notification',
                userId,
                data: notification
            });
        }

        // 4. Send email if requested and enabled
        if (shouldSendEmail && user.email) {
            const shouldEmail = await checkUserPreference(userId, category, 'email')
            console.log(`[Notification] Checking email for ${userId}: requested=${shouldSendEmail}, enabled=${shouldEmail}, email=${user.email}`);

            if (shouldEmail) {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: emailSubject || title,
                        html: emailHtml || (!emailReact ? generateDefaultEmailHtml(title, message, actionUrl) : undefined),
                        react: emailReact  // Pass React component if available
                    })
                    console.log(`[Notification] Email sent to ${user.email}`)
                } catch (emailError) {
                    console.error('[Notification] Email send failed:', emailError)
                }
            } else {
                console.log(`[Notification] Email skipped due to user preference for category ${category}`);
            }
        } else {
            console.log(`[Notification] Email skipped: requested=${shouldSendEmail}, hasEmail=${!!user.email}`);
        }

        return notification

    } catch (error) {
        console.error('[Notification] Creation failed:', error)
        throw error
    }
}

/**
 * Create notifications for multiple users
 */
export async function createBulkNotifications(
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
    actionUrl?: string
) {
    const results = await Promise.allSettled(
        userIds.map(userId =>
            createNotification({
                userId,
                type,
                title,
                message,
                data,
                actionUrl
            })
        )
    )

    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    console.log(`[Notification] Bulk created: ${successful} success, ${failed} failed`)

    return results
}

/**
 * Notify all admin users
 */
export async function notifyAllAdmins(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
    actionUrl?: string,
    options?: {
        sendEmail?: boolean;
        emailSubject?: string;
        emailHtml?: string;
    }
) {
    // Query User table for admins
    const admins = await prisma.user.findMany({
        where: {
            role: { in: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'] },
            isActive: true
        },
        select: { id: true }
    })

    if (admins.length === 0) {
        console.warn('[Notification] No admin users found')
        return []
    }

    // Create notifications for each admin using userId
    const results = await Promise.allSettled(
        admins.map(a =>
            createNotification({
                userId: a.id,
                type,
                title,
                message,
                data,
                actionUrl,
                sendEmail: options?.sendEmail,
                emailSubject: options?.emailSubject,
                emailHtml: options?.emailHtml
            })
        )
    )

    return results
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
        where: {
            id: notificationId,
            userId
        },
        data: { isRead: true }
    })
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
    return prisma.notification.updateMany({
        where: {
            userId,
            isRead: false
        },
        data: { isRead: true }
    })
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
    return prisma.notification.count({
        where: {
            userId,
            isRead: false
        }
    })
}

/**
 * Delete old notifications (older than 30 days)
 * Useful for cleanup jobs
 */
export async function cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const result = await prisma.notification.deleteMany({
        where: {
            createdAt: { lt: cutoffDate },
            isRead: true
        }
    })

    console.log(`[Notification] Cleaned up ${result.count} old notifications`)
    return result.count
}
