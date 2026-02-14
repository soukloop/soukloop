import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';

interface AccountDeletedEmailProps {
    userName?: string;
    supportUrl: string;
}

/**
 * Notification for permanent account deletion
 * Uses noreply@ sender
 */
export const AccountDeletedEmail = ({
    userName,
    supportUrl
}: AccountDeletedEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Account Deleted</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Your account on SoukLoop has been permanently deleted by an administrator.
            </Text>

            <Text style={paragraph}>
                All your personal data and account information have been removed from our system, in accordance with our data retention policy.
            </Text>

            <Text style={paragraph}>
                If you believe this was done in error or have any questions, please contact our support team.
            </Text>

            <Text style={footerNote}>
                You can no longer log in to your account.
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333333',
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const footerNote = {
    fontSize: '14px',
    color: '#666666',
    fontStyle: 'italic',
    marginTop: '24px'
};

export default AccountDeletedEmail;
