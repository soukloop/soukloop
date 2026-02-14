import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface AccountReactivatedEmailProps {
    userName?: string;
    loginUrl: string;
}

/**
 * Notification for account reactivation
 * Uses noreply@ sender
 */
export const AccountReactivatedEmail = ({
    userName,
    loginUrl
}: AccountReactivatedEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Account Reactivated 🎉</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Good news! Your account has been reactivated.
            </Text>

            <Text style={paragraph}>
                You can now log in and access all features of SoukLoop again. We're glad to have you back!
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={loginUrl}>
                    Log In Now
                </EmailButton>
            </div>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: '600',
    color: '#16a34a', // Green for success
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '16px',
    color: '#333333',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '24px 0'
};

export default AccountReactivatedEmail;
