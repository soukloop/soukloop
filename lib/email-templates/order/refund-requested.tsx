import {
    Section,
    Text,
    Heading,
    Row,
    Column,
    Img
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface RefundItem {
    id: string;
    product?: {
        name: string;
        images?: { url: string }[];
    } | null;
}

interface RefundRequestedEmailProps {
    msg?: string; // Optional custom message
    orderNumber: string;
    items: RefundItem[];
    refundAmount: number;
    reason?: string;
    actionUrl?: string; // Link to support or order detail
}

export const RefundRequestedEmail = ({
    orderNumber = '12345',
    items = [],
    refundAmount = 0.00,
    reason = 'Changed mind',
    actionUrl = process.env.NEXTAUTH_URL
}: RefundRequestedEmailProps) => {
    const firstItem = items[0]?.product;
    const productName = firstItem?.name || 'Product';
    const productImage = firstItem?.images?.[0]?.url;

    return (
        <EmailLayout preview={`Refund Requested for Order #${orderNumber}`}>
            <Heading style={heading}>
                Refund Requested
            </Heading>
            <Text style={paragraph}>
                We have received your refund request for the following item from Order **#{orderNumber}**.
            </Text>

            {/* Refund Item Card */}
            <Section style={cardSection}>
                <Row>
                    <Column width="80" style={imageColumn}>
                        {productImage ? (
                            <Img
                                src={productImage}
                                alt={productName}
                                width="80"
                                height="80"
                                style={productImageStyle}
                            />
                        ) : (
                            <div style={placeholderImage}></div>
                        )}
                    </Column>
                    <Column style={detailsColumn}>
                        <Text style={productNameStyle}>{productName}</Text>
                        <Text style={refundAmountStyle}>
                            Refund Amount: ${refundAmount.toFixed(2)}
                        </Text>
                        <Text style={reasonStyle}>
                            Reason: {reason}
                        </Text>
                    </Column>
                </Row>
            </Section>

            <Text style={paragraph}>
                Our team (or the seller) will review this request. You will be notified once the status changes.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl ?? ''}>
                    View Request Status
                </EmailButton>
            </div>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: 'normal',
    color: '#1a1a1a',
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
    padding: '8px',
    verticalAlign: 'middle' as const
};

const productImageStyle = {
    objectFit: 'cover' as const,
    borderRadius: '4px'
};

const placeholderImage = {
    width: '80px',
    height: '80px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px'
};

const detailsColumn = {
    padding: '16px',
    verticalAlign: 'middle' as const
};

const productNameStyle = {
    margin: '0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937'
};

const refundAmountStyle = {
    margin: '4px 0 0 0',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#111827'
};

const reasonStyle = {
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#6b7280'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default RefundRequestedEmail;
