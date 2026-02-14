import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';

interface PasswordChangedEmailProps {
    userName?: string;
    changeTime: string;
    supportUrl: string;
}

/**
 * Security alert for password change
 * Uses noreply@ sender
 */
export const PasswordChangedEmail = ({
    userName,
    changeTime,
    supportUrl
}: PasswordChangedEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Password Changed Successfully</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Your password was just changed on {changeTime}.
            </Text>

            <div style={alertBox}>
                <Text style={alertText}>
                    🔒 <strong>Security Alert:</strong> If you didn't make this change, your account may be compromised.
                </Text>
            </div>

            <Text style={paragraph}>
                If this was you, you can safely ignore this email.
            </Text>

            <Text style={paragraph}>
                If you didn't change your password, please{' '}
                <a href={supportUrl} style={link}>contact our support team</a> immediately.
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

const alertBox = {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '16px',
    margin: '20px 0'
};

const alertText = {
    fontSize: '15px',
    color: '#856404',
    margin: '0'
};

const link = {
    color: '#E87A3F',
    textDecoration: 'underline'
};

export default PasswordChangedEmail;
