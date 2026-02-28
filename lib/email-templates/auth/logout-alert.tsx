import {
    Text,
    Heading
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface LogoutAlertEmailProps {
    userName?: string;
    logoutTime?: string;
    actionUrl?: string;
}

export const LogoutAlertEmail = ({
    userName = 'User',
    logoutTime = new Date().toLocaleString(),
    actionUrl = process.env.NEXTAUTH_URL + '/auth/signin'
}: LogoutAlertEmailProps) => {
    return (
        <EmailLayout preview="You have been signed out">
            <Heading style={heading}>
                Signed Out
            </Heading>
            <Text style={paragraph}>
                Hello {userName},
            </Text>
            <Text style={paragraph}>
                This email is to confirm that you were signed out of your SoukLoop account on {logoutTime}.
            </Text>

            <Text style={paragraph}>
                If this was you, no further action is needed.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Sign In Again
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

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default LogoutAlertEmail;
