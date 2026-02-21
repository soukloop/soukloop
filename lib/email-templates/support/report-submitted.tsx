import {
    Section,
    Text,
    Button,
    Heading,
    Hr
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
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
        <EmailWrapper preview={`${title} [${reportId}]`}>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                {title}
            </Heading>

            {isAdmin ? (
                <>
                    <Text className="text-black text-[14px] leading-[24px]">
                        **Admin Alert:** A new report has been submitted by {reporterName}.
                    </Text>
                    <Section className="bg-gray-50 p-4 rounded border border-gray-200 my-4">
                        <Text className="m-0 text-[12px] font-bold text-gray-500 uppercase">Target</Text>
                        <Text className="m-0 text-[14px] mb-2">{targetName}</Text>

                        <Text className="m-0 text-[12px] font-bold text-gray-500 uppercase">Reason</Text>
                        <Text className="m-0 text-[14px] mb-2">{reason}</Text>

                        <Text className="m-0 text-[12px] font-bold text-gray-500 uppercase">Report ID</Text>
                        <Text className="m-0 text-[14px] font-mono">{reportId}</Text>
                    </Section>
                </>
            ) : (
                <>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Hello {reporterName},
                    </Text>
                    <Text className="text-black text-[14px] leading-[24px]">
                        We have received your report regarding **{targetName}**.
                    </Text>
                    <Text className="text-black text-[14px] leading-[24px]">
                        Our trust and safety team will review the content against our community guidelines.
                        We do not share your identity with the person you reported.
                    </Text>
                    <Hr className="border-gray-200 my-4" />
                    <Text className="text-gray-500 text-[12px]">
                        Reason provided: "{reason}"
                    </Text>
                </>
            )}

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    {ctaText}
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default ReportSubmittedEmail;
