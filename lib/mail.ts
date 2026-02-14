import { Resend } from 'resend';
import fs from 'fs';
import path from 'path';

export type EmailProviderType = 'local' | 'resend';
export type EmailSenderType = 'mailer' | 'noreply';

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html?: string;  // Made optional - use either html OR react
    react?: React.ReactElement;  // For React Email components
    text?: string;
    from?: EmailSenderType;  // Specify which sender to use
    replyTo?: string;
}

abstract class EmailProvider {
    abstract send(options: SendEmailOptions): Promise<void>;

    protected getFromAddress(senderType: EmailSenderType = 'mailer'): string {
        if (senderType === 'noreply') {
            return process.env.EMAIL_FROM_NOREPLY || 'noreply@soukloop.com';
        }
        return process.env.EMAIL_FROM_MAILER || 'mailer@soukloop.com';
    }
}

class LocalEmailProvider extends EmailProvider {
    async send(options: SendEmailOptions): Promise<void> {
        const fromAddress = this.getFromAddress(options.from);
        const recipients = Array.isArray(options.to) ? options.to.join(', ') : options.to;

        // If react prop is provided, render it to HTML for console preview
        let htmlContent = options.html;
        if (options.react && !htmlContent) {
            const { render } = await import('@react-email/render');
            htmlContent = await render(options.react);
        }

        console.log("==========================================");
        console.log(`📧 MOCK EMAIL SYSTEM`);
        console.log(`FROM: ${fromAddress}`);
        console.log(`TO: ${recipients}`);
        console.log(`SUBJECT: ${options.subject}`);
        const htmlPreview = typeof htmlContent === 'string' ? htmlContent.substring(0, 100) : '[No Content]';
        console.log(`HTML: ${htmlPreview}...`);
        if (options.replyTo) {
            console.log(`REPLY-TO: ${options.replyTo}`);
        }
        console.log("==========================================");

        try {
            // Log to file for debugging (optional)
            const logPath = path.join(process.cwd(), 'email-logs.txt');
            const timestamp = new Date().toISOString();
            const entry = `[${timestamp}] FROM: ${fromAddress} | TO: ${recipients} | SUBJ: ${options.subject}\n`;
            await fs.promises.appendFile(logPath, entry).catch(() => {
                // Ignore file write errors in development
            });

            // Extract verification codes for testing
            if (htmlContent && (options.subject.includes('Verify') || options.subject.includes('verification'))) {
                const otpMatch = htmlContent.match(/code is: <b>(\d+)<\/b>/) ||
                    htmlContent.match(/verification code is <b>(\d+)<\/b>/);
                const tokenMatch = htmlContent.match(/token=([^'"]+)/);

                if (otpMatch) {
                    console.log(`[DEV] OTP Code: ${otpMatch[1]}`);
                }
                if (tokenMatch) {
                    console.log(`[DEV] Verification Token: ${tokenMatch[1]}`);
                }
            }
        } catch (error) {
            console.error("Failed to log mock email:", error);
        }
    }
}

class ResendEmailProvider extends EmailProvider {
    private client: Resend;

    constructor() {
        super();
        const apiKey = process.env.RESEND_API_KEY;
        if (!apiKey || apiKey === 're_123456789') {
            console.warn('⚠️ RESEND_API_KEY is missing or using placeholder. Emails will fail.');
            console.warn('   Get your API key from https://resend.com/settings');
        }
        this.client = new Resend(apiKey || 're_placeholder');
    }

    async send(options: SendEmailOptions): Promise<void> {
        const fromAddress = this.getFromAddress(options.from);

        try {
            // Use Resend's native react prop if provided, otherwise use html
            const emailPayload: any = {
                from: fromAddress,
                to: options.to,
                subject: options.subject,
                text: options.text,
                reply_to: options.replyTo
            };

            if (options.react) {
                emailPayload.react = options.react;
            } else if (options.html) {
                emailPayload.html = options.html;
            }

            const result = await this.client.emails.send(emailPayload);

            console.log(`✅ Email sent successfully via Resend:`, {
                id: result.data?.id,
                from: fromAddress,
                to: options.to,
                subject: options.subject,
                method: options.react ? 'react' : 'html'
            });

            // TODO: Log to database for audit trail
            // await prisma.emailLog.create({ ... })

        } catch (error: any) {
            console.error('❌ Resend Email Error:', {
                message: error.message,
                from: fromAddress,
                to: options.to,
                subject: options.subject
            });

            // Don't throw in preview mode to allow development to continue
            if (process.env.EMAIL_PREVIEW_MODE === 'true') {
                console.warn('⚠️ Email failed but continuing due to preview mode');
                return;
            }

            throw error;
        }
    }
}

function getEmailProvider(): EmailProvider {
    // 1. Force Resend if API key is present (User request: "send via email now")
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith('re_')) {
        return new ResendEmailProvider();
    }

    // 2. Fallback to explicit config
    const type = (process.env.EMAIL_PROVIDER as EmailProviderType) || 'local';

    if (type === 'resend') {
        return new ResendEmailProvider();
    }

    return new LocalEmailProvider();
}

// ============================================
// PUBLIC API - Backward Compatibility
// ============================================

/**
 * Send a verification email (uses noreply@ sender)
 * @deprecated Use sendEmail with custom template instead
 */
export const sendVerificationEmail = async (email: string, token: string) => {
    const provider = getEmailProvider();
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; }
                .header { background: linear-gradient(135deg, #E87A3F 0%, #C96835 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; margin: -40px -40px 30px -40px; }
                .code { background: #f8f8f8; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; color: #E87A3F; letter-spacing: 4px; margin: 20px 0; }
                .button { display: inline-block; background: #E87A3F; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; }
                .footer { margin-top: 30px; text-align: center; color: #999; font-size: 13px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Verify Your Email</h1>
                </div>
                <p>Welcome to SoukLoop! Please verify your email address to get started.</p>
                <p>Your verification code is:</p>
                <div class="code">${token}</div>
                <p>Or click the button below:</p>
                <p style="text-align: center;">
                    <a href="${baseUrl}/verify?token=${token}" class="button">Verify Email</a>
                </p>
                <div class="footer">
                    <p>This code will expire in 24 hours.</p>
                    <p>If you didn't create an account, you can safely ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    await provider.send({
        to: email,
        subject: 'Verify your email address',
        html,
        text: `Your verification code is: ${token}\n\nOr visit: ${baseUrl}/verify?token=${token}`,
        from: 'noreply'  // Security/auth emails use noreply@
    });
};

/**
 * Generic send email function
 * This is the main function to use for all email sending
 */
export const sendEmail = async (options: SendEmailOptions) => {
    const provider = getEmailProvider();
    await provider.send(options);
};

/**
 * Send email using React Email template
 * @param to - Recipient email(s)
 * @param subject - Email subject
 * @param reactEmailComponent - Rendered React Email component (use render() from @react-email/render)
 * @param senderType - 'mailer' for transactional, 'noreply' for security/auth
 */
export const sendEmailFromTemplate = async (
    to: string | string[],
    subject: string,
    reactEmailComponent: string,
    senderType: EmailSenderType = 'mailer',
    replyTo?: string
) => {
    const provider = getEmailProvider();
    await provider.send({
        to,
        subject,
        html: reactEmailComponent,
        from: senderType,
        replyTo
    });
};
