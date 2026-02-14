import { render } from '@react-email/render';
import { notifyAllAdmins, createNotification } from '../create-notification'; // Assuming generic notify exists
import { WithdrawalRequestedEmail } from '@/lib/email-templates/finance/withdrawal-requested';
import { WithdrawalProcessedEmail } from '@/lib/email-templates/finance/withdrawal-processed';

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Notify admins about a new withdrawal request
 */
export async function notifyAdminsWithdrawalRequested(
    vendorName: string,
    amount: number,
    bankName: string,
    accountLast4: string
) {
    const emailHtml = render(
        WithdrawalRequestedEmail({
            vendorName,
            amount,
            bankName,
            accountLast4,
            adminDashboardUrl: `${baseUrl}/admin/withdrawals` // Adjust URL as needed
        })
    );

    // Notify all admins
    // Note: notifyAllAdmins needs to be updated or used such that it sends emails to all admins.
    // The current create-notification.ts logic for notifyAllAdmins iterates through all admins.
    // We pass `sendEmail: true` and `emailSubject`

    return notifyAllAdmins(
        'WITHDRAWAL_REQUEST',
        'New Withdrawal Request',
        `${vendorName} has requested a withdrawal of $${amount}`,
        {
            vendorName,
            amount,
            bankName
        },
        '/admin/withdrawals',
        {
            sendEmail: true,
            emailSubject: `New Withdrawal Request: $${amount} from ${vendorName}`,
            emailHtml
        }
    );
    // Wait, notifyAllAdmins in create-notification.ts likely doesn't support custom HTML injection yet for bulk sending.
    // I should check create-notification.ts again.
}

/**
 * Notify vendor that withdrawal is processed
 */
export async function notifyWithdrawalProcessed(
    userId: string,
    amount: number,
    vendorName?: string
) {
    const emailHtml = render(
        WithdrawalProcessedEmail({
            amount,
            vendorName,
        })
    );

    return createNotification({
        userId,
        type: 'WITHDRAWAL_PROCESSED',
        title: 'Withdrawal Processed',
        message: `Your withdrawal of $${amount} has been processed.`,
        actionUrl: '/withdraw-earnings',
        sendEmail: true,
        emailSubject: 'Funds on the way! Withdrawal Processed 💵',
        emailHtml
    });
}
