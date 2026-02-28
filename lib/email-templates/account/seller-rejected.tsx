import {
    Section,
    Text,
    Button,
    Heading
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface SellerRejectedEmailProps {
    userName?: string;
    rejectionReason?: string;
    actionUrl?: string;
}

export const SellerRejectedEmail = ({
    userName = 'Valued User',
    rejectionReason = 'Please contact support for more details regarding your application.',
    actionUrl = process.env.NEXTAUTH_URL + '/seller/status'
}: SellerRejectedEmailProps) => {
    return (
        <EmailWrapper preview="Update on Your Seller Application">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Application Review Update
            </Heading>
            <Text className="text-black text-[16px] leading-[24px]">
                Dear {userName},
            </Text>
            <Text className="text-black text-[16px] leading-[24px]">
                Thank you for your interest in becoming a seller on SoukLoop. We appreciate the time you took to submit your application.
            </Text>
            <Text className="text-black text-[16px] leading-[24px]">
                After careful review, we regret to inform you that we cannot approve your seller application at this time.
            </Text>

            <Section className="bg-[#f9f9f9] border border-[#e5e5e5] rounded-[8px] p-[20px] my-[24px]">
                <Text className="text-[#E87A3F] text-[14px] font-bold uppercase tracking-wider m-0 mb-[8px]">
                    Reason for Rejection:
                </Text>
                <Text className="text-black text-[16px] leading-[24px] m-0">
                    {rejectionReason}
                </Text>
            </Section>

            <Text className="text-black text-[16px] leading-[24px]">
                If you believe this decision was made in error or if you have corrected the issues mentioned above, you are welcome to submit a new application with the necessary updates.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#E87A3F] rounded text-white text-[16px] font-semibold no-underline text-center px-6 py-4"
                    href={actionUrl}
                >
                    Review Your Application Status
                </Button>
            </Section>

            <Text className="text-[#666666] text-[14px] leading-[24px] mt-[32px]">
                If you have any questions or require further clarification, please don't hesitate to contact our support team.
            </Text>
        </EmailWrapper>
    );
};

export default SellerRejectedEmail;
