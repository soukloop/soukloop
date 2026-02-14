import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface PasswordResetEmailProps {
    resetUrl: string;
    userName?: string;
}

/**
 * Password reset email template
 * Uses noreply@ sender
 */
export const PasswordResetEmail = ({
    resetUrl,
    userName
}: PasswordResetEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Reset Your Password</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                We received a request to reset your password. Click the button below to create a new password:
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={resetUrl}>
                    Reset Password
                </EmailButton>
            </div>

            <Text style={footerNote}>
                This link will expire in 1 hour for security reasons.
            </Text>

            <Text style={footerNote}>
                If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '24px 0'
};

const footerNote = {
    fontSize: '14px',
    color: '#999999',
    fontStyle: 'italic',
    marginTop: '16px'
};

export default PasswordResetEmail;
