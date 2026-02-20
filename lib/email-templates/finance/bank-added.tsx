import {
    Section,
    Text,
    Button,
    Heading
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface BankAddedEmailProps {
    vendorName?: string;
    bankName: string;
    last4: string;
    actionUrl?: string;
}

export const BankAddedEmail = ({
    vendorName = 'Seller',
    bankName = 'Bank',
    last4 = '****',
    actionUrl = process.env.NEXTAUTH_URL + '/withdraw-earnings'
}: BankAddedEmailProps) => {
    return (
        <EmailWrapper preview="New Payout Method Added">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Payout Method Added
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
                Hello {vendorName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
                You have successfully added a new bank account to your seller profile for payouts.
            </Text>

            <Section className="bg-gray-50 p-4 rounded-md my-4 border border-gray-200 text-center">
                <Text className="m-0 text-[16px] font-bold text-gray-800">{bankName}</Text>
                <Text className="m-0 text-[14px] text-gray-500">Ending in •••• {last4}</Text>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
                This account can now be used for withdrawing your earnings.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    Manage Payouts
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default BankAddedEmail;
