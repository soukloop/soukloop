import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface NewTicketEmailProps {
    ticketId: string;
    userEmail: string;
    userName?: string;
    subject: string;
    message: string;
    dashboardUrl: string;
}

/**
 * Admin notification for new support ticket
 * Uses mailer@ sender
 */
export const NewTicketEmail = ({
    ticketId,
    userEmail,
    userName,
    subject,
    message,
    dashboardUrl
}: NewTicketEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>New Support Ticket 🎫</Heading>

            <Text style={paragraph}>
                Hello Admin,
            </Text>

            <Text style={paragraph}>
                A new support ticket has been created by <strong>{userName || userEmail}</strong>.
            </Text>

            <Section style={detailsBox}>
                <Text style={label}>Ticket ID:</Text>
                <Text style={value}>#{ticketId}</Text>

                <Text style={label}>Subject:</Text>
                <Text style={value}>{subject}</Text>

                <Text style={label}>Message:</Text>
                <Text style={messageValue}>{message}</Text>
            </Section>

            <div style={buttonContainer}>
                <EmailButton href={dashboardUrl}>
                    View Ticket
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
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const detailsBox = {
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0'
};

const label = {
    fontSize: '14px',
    color: '#999999',
    margin: '8px 0 4px 0'
};

const value = {
    fontSize: '16px',
    color: '#1a1a1a',
    fontWeight: '500',
    margin: '0 0 12px 0'
};

const messageValue = {
    fontSize: '15px',
    color: '#333333',
    backgroundColor: '#ffffff',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #eeeeee',
    whiteSpace: 'pre-wrap' as const,
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '24px 0'
};

export default NewTicketEmail;
