import {
    Section,
    Text,
    Heading,
    Hr
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface ReportSubmittedEmailProps {
    recipientType: 'ADMIN' | 'REPORTER';
    reportId: string;
    reporterName?: string;
    targetName?: string; // Product or User being reported
    reason: string;
    actionUrl?: string; // Admin dashboard for admin, help center for user
}

export const ReportSubmittedEmail = ({
    recipientType = 'REPORTER',
    reportId = 'REF-1234',
    reporterName = 'User',
    targetName = 'Product/User',
    reason = 'Inappropriate content',
    actionUrl = process.env.NEXTAUTH_URL
}: ReportSubmittedEmailProps) => {

    const isAdmin = recipientType === 'ADMIN';
    const title = isAdmin ? 'New Report Submitted' : 'Report Received';
    const ctaText = isAdmin ? 'Review Report' : 'Visit Help Center';

    return (
        <EmailLayout preview={`${title} [${reportId}]`}>
            <Heading style={heading}>
                {title}
            </Heading>

            {isAdmin ? (
                <>
                    <Text style={paragraph}>
                        **Admin Alert:** A new report has been submitted by {reporterName}.
                    </Text>
                    <Section style={infoBox}>
                        <Text style={infoLabel}>Target</Text>
                        <Text style={infoValue}>{targetName}</Text>

                        <Text style={infoLabel}>Reason</Text>
                        <Text style={infoValue}>{reason}</Text>

                        <Text style={infoLabel}>Report ID</Text>
                        <Text style={codeValue}>{reportId}</Text>
                    </Section>
                </>
            ) : (
                <>
                    <Text style={paragraph}>
                        Hello {reporterName},
                    </Text>
                    <Text style={paragraph}>
                        We have received your report regarding **{targetName}**.
                    </Text>
                    <Text style={paragraph}>
                        Our trust and safety team will review the content against our community guidelines.
                        We do not share your identity with the person you reported.
                    </Text>
                    <Hr style={divider} />
                    <Text style={reasonNoteText}>
                        Reason provided: "{reason}"
                    </Text>
                </>
            )}

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    {ctaText}
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
    borderRadius: '4px',
    padding: '16px',
    margin: '16px 0'
};

const infoLabel = {
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    margin: '0'
};

const infoValue = {
    color: '#1f2937',
    fontSize: '14px',
    margin: '0 0 8px 0'
};

const codeValue = {
    color: '#1f2937',
    fontSize: '14px',
    fontFamily: 'monospace',
    margin: '0'
};

const divider = {
    borderColor: '#e5e7eb',
    margin: '16px 0'
};

const reasonNoteText = {
    color: '#6b7280',
    fontSize: '14px',
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default ReportSubmittedEmail;
