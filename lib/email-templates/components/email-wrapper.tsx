import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Link,
    Img,
    Hr,
    Preview,
    Tailwind
} from '@react-email/components';
import * as React from 'react';

interface EmailWrapperProps {
    children: React.ReactNode;
    preview?: string;
}

const baseUrl = process.env.NEXTAUTH_URL || 'https://soukloop.com';

export const EmailWrapper = ({ children, preview }: EmailWrapperProps) => {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 my-auto mx-auto font-sans text-gray-900">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
                        {/* Logo / Header */}
                        <Section className="mt-[20px] text-center">
                            <Img
                                src={`${baseUrl}/logo.png`}
                                alt="SoukLoop"
                                width="150"
                                height="auto"
                                className="my-0 mx-auto"
                            />
                        </Section>

                        {/* Main Content */}
                        <Section className="p-[20px]">
                            {children}
                        </Section>

                        {/* Footer */}
                        <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />
                        <Section className="text-center">
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                © {new Date().getFullYear()} SoukLoop. All Rights Reserved.
                            </Text>
                            <Text className="text-[#666666] text-[12px] leading-[24px]">
                                <Link
                                    href={`${baseUrl}/notifications`}
                                    className="text-blue-600 no-underline"
                                >
                                    Notification Preferences
                                </Link>
                                {' • '}
                                <Link
                                    href={`${baseUrl}/help`}
                                    className="text-blue-600 no-underline"
                                >
                                    Help Center
                                </Link>
                            </Text>
                            <Text className="text-[#999999] text-[10px] mt-2">
                                1234 Market Street, Suite 100, San Francisco, CA 94103
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default EmailWrapper;
