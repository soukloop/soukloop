import {
    Section,
    Text,
    Button,
    Heading,
    Img,
    Column,
    Row
} from '@react-email/components';
import { EmailWrapper } from '../components/email-wrapper';
import * as React from 'react';

interface ProductStatusEmailProps {
    vendorName?: string;
    productName: string;
    productImage?: string;
    productPrice?: number;
    status: 'Listed' | 'Approved' | 'Rejected' | 'Live';
    reason?: string;
    actionUrl?: string;
}

export const ProductStatusEmail = ({
    vendorName = 'Seller',
    productName = 'Product Name',
    productImage,
    productPrice,
    status = 'Listed',
    reason,
    actionUrl = process.env.NEXTAUTH_URL + '/seller/manage-listings'
}: ProductStatusEmailProps) => {
    const isNegative = status === 'Rejected';
    const headingColor = isNegative ? 'text-red-600' : 'text-green-600';
    const statusText = status === 'Live' ? 'is now Live!' : status === 'Rejected' ? 'was Rejected' : 'has been Listed';

    return (
        <EmailWrapper preview={`Your product ${statusText}`}>
            <Heading className={`text-[24px] font-normal text-center p-0 my-[30px] mx-0 ${headingColor}`}>
                Product {status}
            </Heading>
            <Text className="text-black text-[14px] leading-[24px]">
                Hello {vendorName},
            </Text>
            <Text className="text-black text-[14px] leading-[24px]">
                Your product **{productName}** {status === 'Live' ? 'is now live on the marketplace!' : isNegative ? 'could not be approved.' : 'has been successfully listed.'}
            </Text>

            {/* Product Card */}
            <Section className="bg-white border border-gray-200 rounded-lg overflow-hidden my-6 shadow-sm">
                <Row>
                    <Column width="100" className="p-0 align-middle">
                        {productImage ? (
                            <Img
                                src={productImage}
                                alt={productName}
                                width="100"
                                height="100"
                                className="object-cover w-full h-full block rounded-l-lg"
                            />
                        ) : (
                            <div className="w-[100px] h-[100px] bg-gray-200 flex items-center justify-center text-gray-400 text-xs">
                                No Image
                            </div>
                        )}
                    </Column>
                    <Column className="p-4 align-middle">
                        <Text className="m-0 text-[16px] font-semibold text-gray-800 line-clamp-1">{productName}</Text>
                        {productPrice !== undefined && (
                            <Text className="m-0 text-[14px] font-bold text-gray-900 mt-1">
                                ${productPrice.toFixed(2)}
                            </Text>
                        )}
                        <Text className="m-0 text-[12px] text-gray-500 mt-2">
                            Status: <span className={isNegative ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{status.toUpperCase()}</span>
                        </Text>
                    </Column>
                </Row>
            </Section>

            {reason && (
                <Section className="bg-red-50 p-4 rounded border border-red-100 mb-6">
                    <Text className="text-red-800 text-[14px] font-bold m-0 mb-1">Reason for Rejection:</Text>
                    <Text className="text-red-700 text-[14px] m-0">{reason}</Text>
                </Section>
            )}

            <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                    className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                    href={actionUrl}
                >
                    {isNegative ? 'Edit Listing' : 'View Product'}
                </Button>
            </Section>
        </EmailWrapper>
    );
};

export default ProductStatusEmail;
