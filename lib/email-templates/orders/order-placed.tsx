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
    pointsUsed?: number;
    pointsGained?: number;
    couponCode?: string;
    couponDiscount?: number;
    subtotal: number;
    shipping: number;
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
    items = [],
    shippingAddress,
    paymentMethod,
    estimatedDelivery,
    pointsUsed = 0,
    pointsGained = 0,
    couponCode,
    couponDiscount = 0,
    subtotal,
    shipping
}: OrderPlacedEmailProps) => {
    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(total);

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

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
                    <div style={itemsGrid}>
                        {items.map((item) => (
                            <div key={item.id} style={itemCard}>
                                {item.product?.images?.[0]?.url ? (
                                    <img
                                        src={item.product.images[0].url}
                                        alt={item.product.name}
                                        width="80"
                                        height="80"
                                        style={itemImage}
                                    />
                                ) : (
                                    <div style={placeholderImage}>No Image</div>
                                )}
                                <div style={itemContent}>
                                    <Text style={itemName}>{item.product?.name || 'Product'}</Text>
                                    <Text style={itemMeta}>
                                        Qty: {item.quantity} • {formatCurrency(item.price)}
                                    </Text>
                                </div>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Financial Summary */}
            <Section style={summarySection}>
                <div style={summaryRow}>
                    <Text style={summaryLabel}>Subtotal</Text>
                    <Text style={summaryValue}>{formatCurrency(subtotal)}</Text>
                </div>
                <div style={summaryRow}>
                    <Text style={summaryLabel}>Shipping</Text>
                    <Text style={summaryValue}>{shipping === 0 ? 'FREE' : formatCurrency(shipping)}</Text>
                </div>

                {couponCode && (
                    <div style={summaryRow}>
                        <Text style={promoLabel}>Promo Code ({couponCode})</Text>
                        <Text style={promoValue}>-{formatCurrency(couponDiscount)}</Text>
                    </div>
                )}

                {pointsUsed > 0 && (
                    <div style={summaryRow}>
                        <Text style={promoLabel}>Points Discount ({pointsUsed} pts)</Text>
                        <Text style={promoValue}>-{formatCurrency(pointsUsed * 0.01)}</Text>
                    </div>
                )}

                <div style={divider} />

                <div style={summaryRow}>
                    <Text style={totalLabel}>Total Paid</Text>
                    <Text style={totalValue}>{formattedTotal}</Text>
                </div>

                {pointsGained > 0 && (
                    <Text style={pointsGainedText}>
                        ✨ You earned <strong>{pointsGained}</strong> reward points from this purchase!
                    </Text>
                )}
            </Section>

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

const divider = {
    height: '1px',
    backgroundColor: '#eee',
    margin: '12px 0'
};

const subHeading = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
    borderBottom: '1px solid #eee',
    paddingBottom: '8px'
};

const detailsSection = {
    margin: '24px 0',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
};

const detailColumn = {
    marginBottom: '16px'
};

const detailLabel = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#64748b',
    textTransform: 'uppercase' as const,
    margin: '0 0 4px 0'
};

const detailValue = {
    fontSize: '14px',
    color: '#1e293b',
    lineHeight: '1.5',
    margin: '0'
};

const itemsSection = {
    margin: '32px 0',
    padding: '24px',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px'
};

const itemsHeading = {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 16px 0',
    borderBottom: '2px solid #f3f4f6',
    paddingBottom: '12px'
};

const itemCard = {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '10px'
};

const itemImage = {
    borderRadius: '8px',
    objectFit: 'cover' as const,
    marginRight: '16px'
};

const placeholderImage = {
    width: '80px',
    height: '80px',
    backgroundColor: '#eee',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#aaa',
    fontSize: '10px',
    marginRight: '16px'
};

const itemContent = {
    flex: 1
};

const itemName = {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 4px 0'
};

const itemMeta = {
    fontSize: '13px',
    color: '#666',
    margin: 0
};

const itemsGrid = {
    marginTop: '12px'
};

const summarySection = {
    margin: '24px 0',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #eeeeee',
    borderRadius: '12px'
};

const summaryRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
};

const summaryLabel = {
    fontSize: '14px',
    color: '#666',
    margin: 0
};

const summaryValue = {
    fontSize: '14px',
    color: '#1a1a1a',
    fontWeight: '500',
    margin: 0
};

const promoLabel = {
    fontSize: '14px',
    color: '#E87A3F',
    margin: 0
};

const promoValue = {
    fontSize: '14px',
    color: '#E87A3F',
    fontWeight: '600',
    margin: 0
};

const totalLabel = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    margin: 0
};

const totalValue = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#E87A3F',
    margin: 0
};

const pointsGainedText = {
    fontSize: '13px',
    color: '#059669',
    textAlign: 'center' as const,
    marginTop: '16px',
    backgroundColor: '#f0fdf4',
    padding: '8px',
    borderRadius: '8px'
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
