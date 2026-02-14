import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface WithdrawalProcessedEmailProps {
    amount: number;
    currency?: string;
    vendorName?: string;
    transactionId?: string;
}

/**
 * Vendor notification for processed withdrawal
 * Uses mailer@ sender
 */
export const WithdrawalProcessedEmail = ({
    amount,
    currency = 'USD',
    vendorName,
    transactionId
}: WithdrawalProcessedEmailProps) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);

    return (
        <EmailLayout>
            <Heading style={heading}>Withdrawal Processed! 💵</Heading>

            <Text style={paragraph}>
                {vendorName ? `Hi ${vendorName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Good news! Your withdrawal request for <strong>{formattedAmount}</strong> has been processed.
            </Text>

            <Section style={detailsBox}>
                <Text style={label}>Amount:</Text>
                <Text style={value}>{formattedAmount}</Text>

                {transactionId && (
                    <>
                        <Text style={label}>Transaction ID:</Text>
                        <Text style={value}>{transactionId}</Text>
                    </>
                )}

                <Text style={label}>Status:</Text>
                <Text style={statusValue}>Processed</Text>
            </Section>

            <Text style={paragraph}>
                The funds should appear in your bank account within 1-3 business days.
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

const detailsBox = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #10b981',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0'
};

const label = {
    fontSize: '14px',
    color: '#059669',
    margin: '8px 0 4px 0'
};

const value = {
    fontSize: '16px',
    color: '#064e3b',
    fontWeight: '500',
    margin: '0 0 12px 0'
};

const statusValue = {
    fontSize: '16px',
    color: '#059669',
    fontWeight: 'bold',
    margin: '0'
};

export default WithdrawalProcessedEmail;
