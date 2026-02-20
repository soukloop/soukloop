import {
    Section,
    Text,
    Button,
    Heading
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface ProfileUpdateEmailProps {
    userName?: string;
    updateType: 'Profile Info' | 'Password' | 'Address' | 'Settings';
    updateTime?: string;
    actionUrl?: string;
}

export const ProfileUpdateEmail = ({
    userName = 'User',
    updateType = 'Profile Info',
    updateTime = new Date().toLocaleString(),
    actionUrl = process.env.NEXTAUTH_URL + '/settings'
}: ProfileUpdateEmailProps) => {
    return (
        <EmailWrapper preview={`Your SoukLoop ${updateType} was updated`}>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Account Update
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
                Hello {userName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
                This email is to confirm that your **{updateType}** was updated on {updateTime}.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
                If you made this change, you can safely ignore this email.
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
                If you did **not** make this change, please contact support immediately or secure your account below.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    Review My Account
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default ProfileUpdateEmail;
