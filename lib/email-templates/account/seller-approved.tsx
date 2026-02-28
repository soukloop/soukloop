import {
    Section,
    Text,
    Button,
    Heading,
    Hr
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface SellerApprovedEmailProps {
    userName?: string;
    actionUrl?: string;
}

export const SellerApprovedEmail = ({
    userName = 'Valued User',
    actionUrl = process.env.NEXTAUTH_URL + '/seller/dashboard'
}: SellerApprovedEmailProps) => {
    return (
        <EmailWrapper preview="Your Seller Application Has Been Approved! 🎉">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Welcome to SoukLoop Sellers! 🎉
            </Heading>
            <Text className="text-black text-[16px] leading-[24px]">
                Congratulations {userName},
            </Text>
            <Text className="text-black text-[16px] leading-[24px]">
                We are thrilled to let you know that your seller application has been **approved**! Welcome to the SoukLoop seller community.
            </Text>

            <Section className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-[8px] p-[20px] my-[24px] text-center">
                <Text className="text-[#15803d] text-[16px] font-bold m-0">
                    Your account is now fully verified and active.
                </Text>
            </Section>

            <Text className="text-black text-[16px] leading-[24px]">
                You can now start setting up your storefront, listing your products or services, and connecting with buyers on our platform.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Heading as="h3" className="text-black text-[18px] font-semibold mt-0 mb-[16px]">
                Next Steps to Success:
            </Heading>

            <Text className="text-black text-[16px] leading-[24px] m-0 mb-[8px]">
                • <strong className="text-[#E87A3F]">Set up your profile:</strong> Add a banner, store description, and logo to stand out.
            </Text>
            <Text className="text-black text-[16px] leading-[24px] m-0 mb-[8px]">
                • <strong className="text-[#E87A3F]">List your products:</strong> Create high-quality listings with clear images and detailed descriptions.
            </Text>
            <Text className="text-black text-[16px] leading-[24px] m-0 mb-[8px]">
                • <strong className="text-[#E87A3F]">Check your settings:</strong> Ensure your payment and notification settings are configured correctly.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#E87A3F] rounded text-white text-[16px] font-semibold no-underline text-center px-6 py-4"
                    href={actionUrl}
                >
                    Go to Seller Dashboard
                </Button>
            </Section>

            <Text className="text-[#666666] text-[14px] leading-[24px] mt-[32px]">
                We are excited to see your business grow with us! If you need any assistance along the way, our seller support team is always here to help.
            </Text>
        </EmailWrapper>
    );
};

export default SellerApprovedEmail;
