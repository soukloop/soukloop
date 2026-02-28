import {
    Text,
    Heading
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface ProfileUpdateEmailProps {
    userName?: string;
    updateType: 'Profile Info' | 'Password' | 'Address' | 'Settings';
    updateTime?: string;
    actionUrl?: string;
}

export const ProfileUpdateEmail = ({
    userName = 'User',
    updateType = 'Profile Info',
    updateTime = new Date().toLocaleString(),
    actionUrl = process.env.NEXTAUTH_URL + '/settings'
}: ProfileUpdateEmailProps) => {
    return (
        <EmailLayout preview={`Your SoukLoop ${updateType} was updated`}>
            <Heading style={heading}>
                Account Update
            </Heading>
            <Text style={paragraph}>
                Hello {userName},
            </Text>
            <Text style={paragraph}>
                This email is to confirm that your **{updateType}** was updated on {updateTime}.
            </Text>

            <Text style={paragraph}>
                If you made this change, you can safely ignore this email.
            </Text>

            <Text style={paragraph}>
                If you did **not** make this change, please contact support immediately or secure your account below.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Review My Account
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
    margin: '0 0 16px 0',
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

export default ProfileUpdateEmail;
