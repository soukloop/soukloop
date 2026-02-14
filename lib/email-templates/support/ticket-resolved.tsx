import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface TicketResolvedEmailProps {
    ticketId: string;
    userName?: string;
    subject: string;
    resolutionSummary?: string;
    viewUrl: string;
}

/**
 * User notification for support ticket resolution
 */
export const TicketResolvedEmail = ({
    ticketId,
    userName,
    subject,
    resolutionSummary,
    viewUrl
}: TicketResolvedEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Case Resolved: Ticket #{ticketId} ✅</Heading>

            <Text style={paragraph}>
                {userName ? `Hi ${userName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                We are writing to let you know that your support ticket <strong>&quot;{subject}&quot;</strong> has been marked as <strong>Resolved</strong> by our team.
            </Text>

            {resolutionSummary && (
                <Section style={resolutionBox}>
                    <Text style={label}>Resolution Summary:</Text>
                    <Text style={messageValue}>{resolutionSummary}</Text>
                </Section>
            )}

            <Text style={paragraph}>
                We hope the resolution provided was helpful. If you feel that your issue has not been fully addressed, or if you have any further questions, you can reopen this ticket by simply replying to this email or clicking the button below.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={viewUrl}>
                    View Ticket Details
                </EmailButton>
            </div>

            <Text style={paragraph}>
                Thank you for being a valued member of the SoukLoop community.
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
    color: '#059669', // Green for success
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '15px',
    color: '#444444',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const resolutionBox = {
    backgroundColor: '#ecfdf5',
    borderLeft: '4px solid #10b981',
    padding: '20px',
    margin: '24px 0'
};

const label = {
    fontSize: '13px',
    color: '#047857',
    fontWeight: '600',
    margin: '0 0 8px 0'
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

export default TicketResolvedEmail;
