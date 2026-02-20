import {
    Section,
    Text,
    Button,
    Heading,
    Row,
    Column,
    Img
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface RefundRequestedEmailProps {
    msg?: string; // Optional custom message
    orderNumber: string;
    productName: string;
    productImage?: string;
    refundAmount: number;
    reason?: string;
    actionUrl?: string; // Link to support or order detail
}

export const RefundRequestedEmail = ({
    orderNumber = '12345',
    productName = 'Product',
    productImage,
    refundAmount = 0.00,
    reason = 'Changed mind',
    actionUrl = process.env.NEXTAUTH_URL
}: RefundRequestedEmailProps) => {
    return (
        <EmailWrapper preview={`Refund Requested for Order #${orderNumber}`}>
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                Refund Requested
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
                We have received your refund request for the following item from Order **#{orderNumber}**.
            </Text>

            {/* Refund Item Card */}
            <Section className="bg-white border border-gray-200 rounded-lg overflow-hidden my-6 shadow-sm">
                <Row>
                    <Column width="80" className="p-2 align-middle">
                        {productImage ? (
                            <Img
                                src={productImage}
                                alt={productName}
                                width="80"
                                height="80"
                                className="object-cover rounded"
                            />
                        ) : (
                            <div className="w-[80px] h-[80px] bg-gray-200 rounded"></div>
                        )}
                    </Column>
                    <Column className="p-4 align-middle">
                        <Text className="m-0 text-[14px] font-semibold text-gray-800">{productName}</Text>
                        <Text className="m-0 text-[14px] font-bold text-gray-900 mt-1">
                            Refund Amount: ${refundAmount.toFixed(2)}
                        </Text>
                        <Text className="m-0 text-[12px] text-gray-500 mt-1">
                            Reason: {reason}
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
                Our team (or the seller) will review this request. You will be notified once the status changes.
            </Text>

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    View Request Status
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default RefundRequestedEmail;
