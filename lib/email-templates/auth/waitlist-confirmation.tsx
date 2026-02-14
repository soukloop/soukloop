import * as React from 'react';
import { Text, Heading } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';

/**
 * Email template for waitlist confirmation
 */
export const WaitlistConfirmationEmail = () => {
    return (
        <EmailLayout>
            <Heading style={heading}>You're on the Waitlist! 🚀</Heading>

            <Text style={paragraph}>
                Thanks for your interest in SoukLoop!
            </Text>

            <Text style={paragraph}>
                We are currently limiting new registrations to ensure the best experience for our community.
            </Text>

            <Text style={paragraph}>
                We've added your email to our priority waitlist. You'll be the first to know as soon as we open up registration for new users!
            </Text>

            <Text style={paragraph}>
                Thank you for your patience and interest.
            </Text>

            <Text style={footerNote}>
                The SoukLoop Team
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

const footerNote = {
    fontSize: '14px',
    color: '#999999',
    fontStyle: 'italic',
    marginTop: '30px'
};

export default WaitlistConfirmationEmail;
