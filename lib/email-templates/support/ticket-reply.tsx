import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface TicketReplyEmailProps {
    ticketId: string;
    userName?: string;
    subject: string;
    replyMessage: string;
    viewUrl: string;
    isGuest?: boolean;
}

/**
 * User notification for support ticket reply
 */
export const TicketReplyEmail = ({
    ticketId,
    userName,
    subject,
    replyMessage,
    viewUrl,
    isGuest = false
}: TicketReplyEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>New Update: Ticket #{ticketId} 💬</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                We have sent an update regarding your support ticket: <strong>&quot;{subject}&quot;</strong>.
            </Text>

            <Section style={replyBox}>
                <Text style={label}>Support Team Message:</Text>
                <Text style={messageValue}>{replyMessage}</Text>
            </Section>

            <Text style={paragraph}>
                {isGuest
                    ? "You can reply directly to this email if you have further questions."
                    : "You can view the full history and reply to this ticket by clicking the button below:"
                }
            </Text>

            {!isGuest && (
                <div style={buttonContainer}>
                    <EmailButton href={viewUrl}>
                        View Ticket & Reply
                    </EmailButton>
                </div>
            )}


            <Text style={paragraph}>
                If you have already found a solution, feel free to ignore this message.
            </Text>

            <Text style={footerText}>
                Best regards,<br />
                The SoukLoop Support Team
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

const replyBox = {
    backgroundColor: '#fff7ed', // Light orange tint
    borderLeft: '4px solid #E87A3F',
    padding: '24px',
    margin: '24px 0',
    borderRadius: '4px'
};

const label = {
    fontSize: '13px',
    color: '#E87A3F',
    fontWeight: '600',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    margin: '0 0 12px 0'
};

const messageValue = {
    fontSize: '15px',
    color: '#1f2937',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap' as const,
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

const footerText = {
    fontSize: '15px',
    color: '#6b7280',
    marginTop: '32px'
};

export default TicketReplyEmail;

