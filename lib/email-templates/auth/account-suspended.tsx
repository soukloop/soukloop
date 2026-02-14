import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface AccountSuspendedEmailProps {
    userName?: string;
    supportUrl: string;
    reason?: string;
}

/**
 * Security alert for account suspension
 * Uses noreply@ sender
 */
export const AccountSuspendedEmail = ({
    userName,
    supportUrl,
    reason
}: AccountSuspendedEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Account Suspended ⚠️</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Your account on SoukLoop has been suspended by an administrator.
            </Text>

            {reason && (
                <Section style={alertBox}>
                    <Text style={alertText}><strong>Reason:</strong> {reason}</Text>
                </Section>
            )}

            <Text style={paragraph}>
                While your account is suspended, you will not be able to log in, place orders, or access your dashboard.
            </Text>

            <Text style={paragraph}>
                If you believe this is a mistake or would like to appeal this decision, please contact our support team immediately.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={supportUrl}>
                    Contact Support
                </EmailButton>
            </div>

            <Text style={footerNote}>
                Please do not reply to this email directly.
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#dc2626', // Red for alert
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const alertBox = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '8px',
    padding: '16px',
    margin: '16px 0'
};

const alertText = {
    fontSize: '15px',
    color: '#b91c1c',
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '24px 0'
};

const footerNote = {
    fontSize: '14px',
    color: '#666666',
    fontStyle: 'italic',
    marginTop: '24px'
};

export default AccountSuspendedEmail;
