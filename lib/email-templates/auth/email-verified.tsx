import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface EmailVerifiedProps {
    userName?: string;
    dashboardUrl: string;
}

/**
 * Email confirmation after successful email verification
 * Uses noreply@ sender
 */
export const EmailVerifiedEmail = ({
    userName,
    dashboardUrl
}: EmailVerifiedProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Email Verified Successfully! 🎉</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Your email address has been verified successfully. You can now access all features of SoukLoop!
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={dashboardUrl}>
                    Go to Dashboard
                </EmailButton>
            </div>

            <Text style={paragraph}>
                Start exploring products, connecting with sellers, and building your marketplace experience.
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

export default EmailVerifiedEmail;
