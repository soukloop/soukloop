import {
    Section,
    Text,
    Heading,
    Img,
    Column,
    Row
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
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
    const headingColor = isNegative ? '#dc2626' : '#16a34a';
    const statusText = status === 'Live' ? 'is now Live!' : status === 'Rejected' ? 'was Rejected' : 'has been Listed';

    return (
        <EmailLayout preview={`Your product ${statusText}`}>
            <Heading style={{ ...heading, color: headingColor }}>
                Product {status}
            </Heading>
            <Text style={paragraph}>
                Hello {vendorName},
            </Text>
            <Text style={paragraph}>
                Your product **{productName}** {status === 'Live' ? 'is now live on the marketplace!' : isNegative ? 'could not be approved.' : 'has been successfully listed.'}
            </Text>

            {/* Product Card */}
            <Section style={cardSection}>
                <Row>
                    <Column width="100" style={imageColumn}>
                        {productImage ? (
                            <Img
                                src={productImage}
                                alt={productName}
                                width="100"
                                height="100"
                                style={productImageStyle}
                            />
                        ) : (
                            <div style={placeholderImage}>
                                No Image
                            </div>
                        )}
                    </Column>
                    <Column style={detailsColumn}>
                        <Text style={productNameStyle}>{productName}</Text>
                        {productPrice !== undefined && (
                            <Text style={productPriceStyle}>
                                ${productPrice.toFixed(2)}
                            </Text>
                        )}
                        <Text style={statusStyleContainer}>
                            Status: <span style={isNegative ? statusNegativeStyle : statusPositiveStyle}>{status.toUpperCase()}</span>
                        </Text>
                    </Column>
                </Row>
            </Section>

            {reason && (
                <Section style={reasonSection}>
                    <Text style={reasonTitle}>Reason for Rejection:</Text>
                    <Text style={reasonText}>{reason}</Text>
                </Section>
            )}

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    {isNegative ? 'Edit Listing' : 'View Product'}
                </EmailButton>
            </div>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: 'normal',
    margin: '30px 0',
    textAlign: 'center' as const
};

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const cardSection = {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    overflow: 'hidden',
    margin: '24px 0'
};

const imageColumn = {
    padding: '0',
    verticalAlign: 'middle' as const
};

const productImageStyle = {
    objectFit: 'cover' as const,
    width: '100%',
    height: '100%',
    display: 'block' as const
};

const placeholderImage = {
    width: '100px',
    height: '100px',
    backgroundColor: '#e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '12px'
};

const detailsColumn = {
    padding: '16px',
    verticalAlign: 'middle' as const
};

const productNameStyle = {
    margin: '0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937'
};

const productPriceStyle = {
    margin: '4px 0 0 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#111827'
};

const statusStyleContainer = {
    margin: '8px 0 0 0',
    fontSize: '12px',
    color: '#6b7280'
};

const statusNegativeStyle = {
    color: '#dc2626',
    fontWeight: 'bold'
};

const statusPositiveStyle = {
    color: '#16a34a',
    fontWeight: 'bold'
};

const reasonSection = {
    backgroundColor: '#fef2f2',
    border: '1px solid #fee2e2',
    borderRadius: '4px',
    padding: '16px',
    margin: '0 0 24px 0'
};

const reasonTitle = {
    color: '#991b1b',
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 4px 0'
};

const reasonText = {
    color: '#b91c1c',
    fontSize: '14px',
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default ProductStatusEmail;
