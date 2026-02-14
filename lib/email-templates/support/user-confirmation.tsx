import * as React from 'react';
import { Text, Heading, Section, Link } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface UserConfirmationEmailProps {
    ticketId: string;
    userName?: string;
    subject: string;
    message: string;
    helpCenterUrl: string;
    isGuest?: boolean;
}

/**
 * User confirmation for receiving their support ticket
 */
export const UserConfirmationEmail = ({
    ticketId,
    userName,
    subject,
    message,
    helpCenterUrl,
    isGuest = false
}: UserConfirmationEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>We&apos;ve received your request! 📥</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Thank you for reaching out to SoukLoop Support. We have received your ticket and our team is already looking into it.
            </Text>

            <Section style={detailsBox}>
                <Text style={label}>Ticket ID:</Text>
                <Text style={value}>#{ticketId}</Text>

                <Text style={label}>Subject:</Text>
                <Text style={value}>{subject}</Text>

                <Text style={label}>Your Message:</Text>
                <Text style={messageValue}>{message}</Text>
            </Section>

            <Text style={paragraph}>
                <strong>What happens next?</strong><br />
                Our support team usually responds within 24 business hours. You will receive an email notification as soon as we have an update for you.
            </Text>

            {!isGuest && (
                <>
                    <Text style={paragraph}>
                        In the meantime, you can browse our <Link href={helpCenterUrl} style={link}>Help Center</Link> for quick answers to common questions.
                    </Text>

                    <div style={buttonContainer}>
                        <EmailButton href={helpCenterUrl}>
                            Go to Help Center
                        </EmailButton>
                    </div>
                </>
            )}


            <Text style={footerText}>
                Please note: This is an automated confirmation. You don&apos;t need to reply to this email right now.
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
    fontSize: '15px',
    color: '#444444',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const detailsBox = {
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
    border: '1px solid #e5e7eb'
};

const label = {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 4px 0'
};

const value = {
    fontSize: '15px',
    color: '#111827',
    fontWeight: '500',
    margin: '0 0 16px 0'
};

const messageValue = {
    fontSize: '14px',
    color: '#374151',
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #f3f4f6',
    whiteSpace: 'pre-wrap' as const,
    margin: '0'
};

const link = {
    color: '#E87A3F',
    textDecoration: 'underline'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

const footerText = {
    fontSize: '13px',
    color: '#9ca3af',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: '32px'
};

export default UserConfirmationEmail;
