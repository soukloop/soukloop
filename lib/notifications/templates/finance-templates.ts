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
    const emailHtml = await render(
        WithdrawalRequestedEmail({
            vendorName,
            amount,
            bankName,
            accountLast4,
            adminDashboardUrl: `${baseUrl}/admin/withdrawals` // Adjust URL as needed
        })
    );

    // Notify all admins
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
}

/**
 * Notify vendor that withdrawal is processed
 */
export async function notifyWithdrawalProcessed(
    userId: string,
    amount: number,
    vendorName?: string
) {
    const emailHtml = await render(
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


/**
 * Notify vendor that a bank account has been added
 */
export async function notifyBankAdded(
    userId: string,
    bankName: string,
    accountLast4: string,
    userName: string
) {
    const { BankAddedEmail } = await import('@/lib/email-templates/finance/bank-added');

    const emailHtml = await render(
        BankAddedEmail({
            vendorName: userName,
            bankName,
            last4: accountLast4,
            actionUrl: `${baseUrl}/withdraw-earnings`
        })
    );

    return createNotification({
        userId,
        type: 'BANK_ACCOUNT_ADDED', // Ensure this type exists or map to ACCOUNT_UPDATED
        title: 'Bank Account Added 🏦',
        message: `Your ${bankName} account ending in ${accountLast4} has been added.`,
        actionUrl: '/withdraw-earnings',
        sendEmail: true,
        emailSubject: 'New Bank Account Added - SoukLoop',
        emailHtml
    });
}
