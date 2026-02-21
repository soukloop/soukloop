import {
    Section,
    Text,
    Button,
    Heading
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface LoginAlertEmailProps {
    userName?: string;
    loginTime?: string;
    deviceInfo?: string;
    location?: string;
    actionUrl?: string; // e.g. "Is this you?" or "Secure Account"
}

export const LoginAlertEmail = ({
    userName = 'Valued User',
    loginTime = new Date().toLocaleString(),
    deviceInfo = 'Unknown Device',
    location = 'Unknown Location',
    actionUrl = process.env.NEXTAUTH_URL + '/settings/security'
}: LoginAlertEmailProps) => {
    return (
        <EmailWrapper preview="New login to your SoukLoop account">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                New Login Detected
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
                Hello {userName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
                We noticed a new login to your SoukLoop account. If this was you, no further action is needed.
            </Text>

            <Section className="bg-gray-50 p-4 rounded-md my-4 border border-gray-200">
                <Text className="m-0 text-[12px] font-semibold text-gray-500 uppercase">Device</Text>
                <Text className="m-0 text-[14px] mb-2 text-gray-800">{deviceInfo}</Text>

                <Text className="m-0 text-[12px] font-semibold text-gray-500 uppercase">Time</Text>
                <Text className="m-0 text-[14px] mb-2 text-gray-800">{loginTime}</Text>

                <Text className="m-0 text-[12px] font-semibold text-gray-500 uppercase">Location</Text>
                <Text className="m-0 text-[14px] text-gray-800">{location}</Text>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
                If you did not authorize this login, please change your password immediately.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    Secure My Account
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default LoginAlertEmail;
