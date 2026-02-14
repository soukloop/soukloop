import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import { CodeBox } from '../components/code-box';

interface SignupVerificationEmailProps {
    verificationCode: string;
    verificationUrl: string;
}

/**
 * Email template for sign-up verification
 * Uses noreply@ sender
 */
export const SignupVerificationEmail = ({
    verificationCode,
    verificationUrl
}: SignupVerificationEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Verify Your Email</Heading>

            <Text style={paragraph}>
                Welcome to SoukLoop! Please verify your email address to get started.
            </Text>

            <Text style={paragraph}>
                Your verification code is:
            </Text>

            <CodeBox code={verificationCode} />

            <Text style={paragraph}>
                Or click the button below:
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={verificationUrl}>
                    Verify Email
                </EmailButton>
            </div>

            <Text style={footerNote}>
                This code will expire in 24 hours.
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

const footerNote = {
    fontSize: '14px',
    color: '#999999',
    fontStyle: 'italic',
    marginTop: '30px'
};

export default SignupVerificationEmail;
