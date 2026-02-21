import {
    Section,
    Text,
    Button,
    Heading
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface LogoutAlertEmailProps {
    userName?: string;
    logoutTime?: string;
    actionUrl?: string;
}

export const LogoutAlertEmail = ({
    userName = 'User',
    logoutTime = new Date().toLocaleString(),
    actionUrl = process.env.NEXTAUTH_URL + '/auth/signin'
}: LogoutAlertEmailProps) => {
    return (
        <EmailWrapper preview="You have been signed out">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Signed Out
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
                Hello {userName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
                This email is to confirm that you were signed out of your SoukLoop account on {logoutTime}.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
                If this was you, no further action is needed.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    Sign In Again
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default LogoutAlertEmail;
