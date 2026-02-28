import {
    Section,
    Text,
    Heading
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface BankAddedEmailProps {
    vendorName?: string;
    bankName: string;
    last4: string;
    actionUrl?: string;
}

export const BankAddedEmail = ({
    vendorName = 'Seller',
    bankName = 'Bank',
    last4 = '****',
    actionUrl = process.env.NEXTAUTH_URL + '/withdraw-earnings'
}: BankAddedEmailProps) => {
    return (
        <EmailLayout preview="New Payout Method Added">
            <Heading style={heading}>
                Payout Method Added
            </Heading>
            <Text style={paragraph}>
                Hello {vendorName},
            </Text>
            <Text style={paragraph}>
                You have successfully added a new bank account to your seller profile for payouts.
            </Text>

            <Section style={infoBox}>
                <Text style={bankNameStyle}>{bankName}</Text>
                <Text style={last4Style}>Ending in •••• {last4}</Text>
            </Section>

            <Text style={paragraph}>
                This account can now be used for withdrawing your earnings.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Manage Payouts
                </EmailButton>
            </div>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: 'normal',
    color: '#1a1a1a',
    margin: '30px 0',
    textAlign: 'center' as const
};

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const infoBox = {
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    margin: '16px 0',
    textAlign: 'center' as const
};

const bankNameStyle = {
    color: '#1f2937',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
};

const last4Style = {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default BankAddedEmail;
