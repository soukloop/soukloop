import * as React from 'react';
import { Text, Heading, Section, Hr } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface WithdrawalRejectedEmailProps {
    userName?: string;
    amount: string;
    reason: string;
    date: string;
    dashboardUrl: string;
}

export const WithdrawalRejectedEmail = ({
    userName,
    amount,
    reason,
    date,
    dashboardUrl
}: WithdrawalRejectedEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Withdrawal Request Update</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Your withdrawal request for <strong>{amount}</strong> submitted on {date} has been <span style={{ color: '#dc2626', fontWeight: 'bold' }}>rejected</span>.
            </Text>

            <Section style={reasonBox}>
                <Text style={reasonLabel}>Reason for Rejection:</Text>
                <Text style={reasonText}>{reason}</Text>
            </Section>

            <Text style={paragraph}>
                The requested amount has been returned to your wallet balance. Please review the reason provided and submit a new request if applicable.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={dashboardUrl}>
                    View Wallet & Transactions
                </EmailButton>
            </div>

            <Hr style={hr} />

            <Text style={footerText}>
                If you believe this is an error, please contact support.
            </Text>
        </EmailLayout>
    );
};

const heading = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '24px',
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#374151',
    marginBottom: '16px',
};

const reasonBox = {
    backgroundColor: '#fee2e2',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
};

const reasonLabel = {
    fontSize: '14px',
    fontWeight: '700',
    color: '#991b1b',
    textTransform: 'uppercase' as const,
    marginBottom: '8px',
    letterSpacing: '0.05em',
};

const reasonText = {
    fontSize: '16px',
    color: '#7f1d1d',
    margin: '0',
    fontWeight: '500',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const hr = {
    borderColor: '#e5e7eb',
    margin: '32px 0',
};

const footerText = {
    fontSize: '14px',
    color: '#6b7280',
    fontStyle: 'italic',
};


export default WithdrawalRejectedEmail;
