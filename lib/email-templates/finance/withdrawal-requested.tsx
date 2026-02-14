import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface WithdrawalRequestedEmailProps {
    amount: number;
    currency?: string;
    vendorName: string;
    bankName: string;
    accountLast4: string;
    adminDashboardUrl: string;
}

/**
 * Admin notification for new withdrawal request
 * Uses mailer@ sender
 */
export const WithdrawalRequestedEmail = ({
    amount,
    currency = 'USD',
    vendorName,
    bankName,
    accountLast4,
    adminDashboardUrl
}: WithdrawalRequestedEmailProps) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);

    return (
        <EmailLayout>
            <Heading style={heading}>New Withdrawal Request 💰</Heading>

            <Text style={paragraph}>
                Hello Admin,
            </Text>

            <Text style={paragraph}>
                {vendorName} has requested a withdrawal of <strong>{formattedAmount}</strong>.
            </Text>

            <Section style={detailsBox}>
                <Text style={label}>Vendor:</Text>
                <Text style={value}>{vendorName}</Text>

                <Text style={label}>Amount:</Text>
                <Text style={value}>{formattedAmount}</Text>

                <Text style={label}>Bank Account:</Text>
                <Text style={value}>{bankName} (Ending in {accountLast4})</Text>
            </Section>

            <div style={buttonContainer}>
                <EmailButton href={adminDashboardUrl}>
                    Review Request
                </EmailButton>
            </div>
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

const detailsBox = {
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0'
};

const label = {
    fontSize: '14px',
    color: '#999999',
    margin: '8px 0 4px 0'
};

const value = {
    fontSize: '16px',
    color: '#1a1a1a',
    fontWeight: '500',
    margin: '0 0 12px 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '24px 0'
};

export default WithdrawalRequestedEmail;
