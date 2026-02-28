import {
    Section,
    Text,
    Heading
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface SellerRejectedEmailProps {
    userName?: string;
    rejectionReason?: string;
    actionUrl?: string;
}

export const SellerRejectedEmail = ({
    userName = 'Valued User',
    rejectionReason = 'Please contact support for more details regarding your application.',
    actionUrl = process.env.NEXTAUTH_URL + '/seller/status'
}: SellerRejectedEmailProps) => {
    return (
        <EmailLayout preview="Update on Your Seller Application">
            <Heading style={heading}>
                Application Review Update
            </Heading>
            <Text style={paragraph}>
                Dear {userName},
            </Text>
            <Text style={paragraph}>
                Thank you for your interest in becoming a seller on SoukLoop. We appreciate the time you took to submit your application.
            </Text>
            <Text style={paragraph}>
                After careful review, we regret to inform you that we cannot approve your seller application at this time.
            </Text>

            <Section style={infoBox}>
                <Text style={infoBoxTitle}>
                    Reason for Rejection:
                </Text>
                <Text style={infoBoxText}>
                    {rejectionReason}
                </Text>
            </Section>

            <Text style={paragraph}>
                If you believe this decision was made in error or if you have corrected the issues mentioned above, you are welcome to submit a new application with the necessary updates.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Review Your Application Status
                </EmailButton>
            </div>

            <Text style={footerText}>
                If you have any questions or require further clarification, please don't hesitate to contact our support team.
            </Text>
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
    backgroundColor: '#f9f9f9',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0'
};

const infoBoxTitle = {
    color: '#E87A3F',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    letterSpacing: 'wider',
    margin: '0 0 8px 0'
};

const infoBoxText = {
    color: '#1a1a1a',
    fontSize: '16px',
    lineHeight: '1.6',
    margin: '0'
};

const footerText = {
    fontSize: '14px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '32px 0 0 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default SellerRejectedEmail;
