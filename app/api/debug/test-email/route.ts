import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mail';
import { AccountSuspendedEmail } from '@/lib/email-templates/auth/account-suspended';

export async function GET() {
    try {
        console.log('[Debug] Attempting to send test email with React Email component...');

        const testEmail = 'dailydriver125@gmail.com';

        await sendEmail({
            to: testEmail,
            subject: 'Test Email: Account Suspended Template (React Prop)',
            react: AccountSuspendedEmail({
                userName: 'Test User',
                supportUrl: 'http://localhost:3000/contactus',
                reason: 'Violation of Terms (Test)'
            }),
            from: 'noreply',
        });

        return NextResponse.json({
            success: true,
            message: `Email sent to ${testEmail} using Resend's native react prop. Check your inbox!`
        });
    } catch (error: any) {
        console.error('[Debug] Email sending failed:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
