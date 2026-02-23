import * as React from 'react';
import { Text, Heading, Section, Img, Row, Column } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface OrderItem {
    id: string;
    product?: {
        name: string;
        images?: { url: string }[];
    } | null;
    quantity: number;
    price: number;
}

interface OrderStatusUpdateEmailProps {
    orderNumber: string;
    recipientName?: string;
    statusTitle: string;
    statusMessage: string;
    items: OrderItem[];
    actionUrl: string;
}

export const OrderStatusUpdateEmail = ({
    orderNumber,
    recipientName,
    statusTitle,
    statusMessage,
    items = [],
    actionUrl
}: OrderStatusUpdateEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>{statusTitle}</Heading>

            <Text style={paragraph}>
                {recipientName ? `Hi ${recipientName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                {statusMessage}
            </Text>

            <Section style={orderBox}>
                <Text style={orderLabel}>Order Number:</Text>
                <Text style={orderValue}>#{orderNumber}</Text>
            </Section>

            {items.length > 0 && (
                <Section style={itemsSection}>
                    <Text style={itemsHeading}>Order Items:</Text>
                    {items.map((item) => (
                        <div key={item.id} style={itemRow}>
                            <Row>
                                <Column width="64" style={{ verticalAlign: 'top', paddingRight: '12px' }}>
                                    {item.product?.images?.[0]?.url ? (
                                        <Img
                                            src={item.product.images[0].url}
                                            alt={item.product.name}
                                            width="64"
                                            height="64"
                                            style={productImage}
                                        />
                                    ) : (
                                        <div style={placeholderImage}>No Image</div>
                                    )}
                                </Column>
                                <Column style={{ verticalAlign: 'top' }}>
                                    <Text style={productName}>
                                        {item.product?.name || 'Product'}
                                    </Text>
                                    <Text style={productMeta}>
                                        Quantity: {item.quantity}
                                    </Text>
                                </Column>
                            </Row>
                        </div>
                    ))}
                </Section>
            )}

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Track Order
                </EmailButton>
            </div>

            <Text style={footerNote}>
                If you have any questions, please contact our support team.
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 16px 0',
    textAlign: 'center' as const
};

const paragraph = {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const orderBox = {
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
    border: '1px solid #eeeeee'
};

const orderLabel = {
    fontSize: '12px',
    color: '#888',
    margin: '0 0 4px 0',
    fontWeight: '600',
    textTransform: 'uppercase' as const
};

const orderValue = {
    fontSize: '20px',
    color: '#1a1a1a',
    fontWeight: '700',
    margin: '0'
};

const itemsSection = {
    margin: '24px 0',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #eeeeee',
    borderRadius: '12px'
};

const itemsHeading = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 16px 0'
};

const itemRow = {
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
};

const productImage = {
    borderRadius: '8px',
    objectFit: 'cover' as const
};

const placeholderImage = {
    width: '64px',
    height: '64px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    fontSize: '10px'
};

const productName = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
};

const productMeta = {
    fontSize: '13px',
    color: '#666',
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

const footerNote = {
    fontSize: '14px',
    color: '#999',
    textAlign: 'center' as const,
    margin: '24px 0'
};

export default OrderStatusUpdateEmail;
