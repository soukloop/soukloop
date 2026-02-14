import * as React from 'react';
import { Text, Heading, Section } from '@react-email/components';
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

interface OrderPlacedEmailProps {
    orderNumber: string;
    buyerName?: string;
    total: number;
    currency?: string;
    itemCount: number;
    orderUrl: string;
    items?: OrderItem[];
    // New Fields
    shippingAddress?: {
        fullName: string;
        address1: string;
        address2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    paymentMethod?: string;
    estimatedDelivery?: string;
}

/**
 * Order receipt email sent to buyer after successful purchase
 * Uses mailer@ sender
 */
export const OrderPlacedEmail = ({
    orderNumber,
    buyerName,
    total,
    currency = 'USD',
    itemCount,
    orderUrl,
    items = []
}: OrderPlacedEmailProps) => {
    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(total);

    return (
        <EmailLayout>
            <Heading style={heading}>Order Confirmed! 🎉</Heading>

            <Text style={paragraph}>
                {buyerName ? `Hi ${buyerName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Thank you for your order! We've received your payment and your order is being processed.
            </Text>

            <Section style={orderBox}>
                <Text style={orderLabel}>Order Number:</Text>
                <Text style={orderValue}>#{orderNumber}</Text>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div>
                        <Text style={orderLabel}>Total Amount:</Text>
                        <Text style={orderValue}>{formattedTotal}</Text>
                    </div>
                </div>
            </Section>

            {/* NEW: Shipping & Payment Details */}
            {(shippingAddress || paymentMethod) && (
                <Section style={detailsSection}>
                    <Heading as="h3" style={subHeading}>Order Details</Heading>

                    {shippingAddress && (
                        <div style={detailColumn}>
                            <Text style={detailLabel}>Shipping Address:</Text>
                            <Text style={detailValue}>
                                {shippingAddress.fullName}<br />
                                {shippingAddress.address1}<br />
                                {shippingAddress.address2 && <>{shippingAddress.address2}<br /></>}
                                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                                {shippingAddress.country}
                            </Text>
                        </div>
                    )}

                    {paymentMethod && (
                        <div style={detailColumn}>
                            <Text style={detailLabel}>Payment Method:</Text>
                            <Text style={detailValue}>{paymentMethod}</Text>
                        </div>
                    )}

                    {estimatedDelivery && (
                        <div style={detailColumn}>
                            <Text style={detailLabel}>Estimated Delivery:</Text>
                            <Text style={detailValue}>{estimatedDelivery}</Text>
                        </div>
                    )}
                </Section>
            )}

            {items.length > 0 && (
                <Section style={itemsSection}>
                    <Text style={itemsHeading}>Items Purchased:</Text>
                    {items.map((item) => (
                        <div key={item.id} style={itemRow}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {item.product?.images?.[0]?.url && (
                                    <img
                                        src={item.product.images[0].url}
                                        alt={item.product.name}
                                        width="50"
                                        height="50"
                                        style={{ borderRadius: '4px', objectFit: 'cover', marginRight: '12px' }}
                                    />
                                )}
                                <Text style={itemText}>
                                    <strong>{item.quantity}x</strong> {item.product?.name || 'Product'}
                                </Text>
                            </div>
                            <Text style={itemPrice}>
                                ${Number(item.price).toFixed(2)}
                            </Text>
                        </div>
                    ))}
                </Section>
            )}

            <Text style={paragraph}>
                You'll receive shipping updates as your order is prepared and shipped.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={orderUrl}>
                    View Order Details
                </EmailButton>
            </div>
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

const subHeading = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px'
};

const itemsSection = {
    margin: '24px 0',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #eeeeee',
    borderRadius: '12px'
};

const detailsSection = {
    margin: '0 0 24px 0',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    border: '1px solid #eee'
};

const detailColumn = {
    marginBottom: '16px'
};

const detailLabel = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px 0'
};

const detailValue = {
    fontSize: '15px',
    color: '#333',
    lineHeight: '1.5',
    margin: '0'
};

const itemsHeading = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 12px 0'
};

const itemRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f0f0f0'
};

const itemText = {
    fontSize: '15px',
    color: '#333',
    margin: 0
};

const itemPrice = {
    fontSize: '15px',
    color: '#1a1a1a',
    margin: 0,
    fontWeight: '600'
};

const paragraph = {
    fontSize: '16px',
    color: '#555',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const orderBox = {
    backgroundColor: '#E87A3F15', // Light orange tint
    borderRadius: '12px',
    padding: '24px',
    margin: '24px 0',
    textAlign: 'center' as const,
    border: '1px solid #E87A3F30'
};

const orderLabel = {
    fontSize: '14px',
    color: '#E87A3F',
    margin: '0 0 4px 0',
    fontWeight: '600',
    textTransform: 'uppercase' as const
};

const orderValue = {
    fontSize: '24px',
    color: '#1a1a1a',
    fontWeight: '700',
    margin: '0 0 12px 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default OrderPlacedEmail;
