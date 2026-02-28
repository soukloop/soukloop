import {
    Section,
    Text,
    Heading
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface LoginAlertEmailProps {
    userName?: string;
    loginTime?: string;
    deviceInfo?: string;
    location?: string;
    actionUrl?: string; // e.g. "Is this you?" or "Secure Account"
}

export const LoginAlertEmail = ({
    userName = 'Valued User',
    loginTime = new Date().toLocaleString(),
    deviceInfo = 'Unknown Device',
    location = 'Unknown Location',
    actionUrl = process.env.NEXTAUTH_URL + '/settings/security'
}: LoginAlertEmailProps) => {
    return (
        <EmailLayout preview="New login to your SoukLoop account">
            <Heading style={heading}>
                New Login Detected
            </Heading>
            <Text style={paragraph}>
                Hello {userName},
            </Text>
            <Text style={paragraph}>
                We noticed a new login to your SoukLoop account. If this was you, no further action is needed.
            </Text>

            <Section style={infoBox}>
                <Text style={infoLabel}>Device</Text>
                <Text style={infoValue}>{deviceInfo}</Text>

                <Text style={infoLabel}>Time</Text>
                <Text style={infoValue}>{loginTime}</Text>

                <Text style={infoLabel}>Location</Text>
                <Text style={infoValueLast}>{location}</Text>
            </Section>

            <Text style={paragraph}>
                If you did not authorize this login, please change your password immediately.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Secure My Account
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
    margin: '16px 0'
};

const infoLabel = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    margin: '0'
};

const infoValue = {
    color: '#1f2937',
    fontSize: '14px',
    margin: '0 0 8px 0'
};

const infoValueLast = {
    color: '#1f2937',
    fontSize: '14px',
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default LoginAlertEmail;
