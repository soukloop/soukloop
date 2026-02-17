import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';

interface PasswordResetEmailProps {
    resetCode: string;
    userName?: string;
}

/**
 * Password reset email template
 * Uses noreply@ sender
 */
export const PasswordResetEmail = ({
    resetCode,
    userName
}: PasswordResetEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Reset Your Password</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                We received a request to reset your password. Here is your verification code:
            </Text>

            <div style={codeContainer}>
                <Text style={codeText}>{resetCode}</Text>
            </div>

            <Text style={paragraph}>
                Enter this code in the app to proceed with resetting your password.
            </Text>

            <Text style={footerNote}>
                This code will expire in 15 minutes for security reasons.
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

const codeContainer = {
    textAlign: 'center' as const,
    margin: '24px 0',
    padding: '12px',
    backgroundColor: '#f4f4f4',
    borderRadius: '8px'
};

const codeText = {
    fontSize: '32px',
    fontWeight: '700',
    color: '#333',
    letterSpacing: '4px',
    margin: '0'
};

const footerNote = {
    fontSize: '14px',
    color: '#999999',
    fontStyle: 'italic',
    marginTop: '16px'
};

export default PasswordResetEmail;
