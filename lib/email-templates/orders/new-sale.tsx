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

interface NewSaleEmailProps {
    orderNumber: string;
    sellerName?: string;
    buyerName: string;
    total: number;
    currency?: string;
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
    customerNotes?: string;
}

/**
 * New sale alert email sent to seller
 * Uses mailer@ sender
 */
export const NewSaleEmail = ({
    orderNumber,
    sellerName,
    buyerName,
    total,
    currency = 'USD',
    orderUrl,
    items = [],
    shippingAddress,
    customerNotes
}: NewSaleEmailProps) => {
    const formattedTotal = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(total);

    return (
        <EmailLayout>
            <Heading style={heading}>New Sale! 🎊</Heading>

            <Text style={paragraph}>
                {sellerName ? `Hi ${sellerName},` : 'Hello,'}
            </Text>

            <Text style={paragraph}>
                Great news! You have a new order from {buyerName}.
            </Text>

            <Section style={saleBox}>
                <Text style={saleLabel}>Order Number:</Text>
                <Text style={saleValue}>#{orderNumber}</Text>

                <Text style={saleLabel}>Buyer:</Text>
                <Text style={saleValue}>{buyerName}</Text>

                <Text style={saleLabel}>Amount:</Text>
                <Text style={saleValue}>{formattedTotal}</Text>
            </Section>

            {/* NEW: Shipping & Notes for Seller */}
            <Section style={detailsSection}>
                <Heading as="h3" style={subHeading}>Shipping Details</Heading>

                {shippingAddress && (
                    <div style={detailColumn}>
                        <Text style={detailLabel}>Ship To:</Text>
                        <Text style={detailValue}>
                            {shippingAddress.fullName}<br />
                            {shippingAddress.address1}<br />
                            {shippingAddress.address2 && <>{shippingAddress.address2}<br /></>}
                            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                            {shippingAddress.country}
                        </Text>
                    </div>
                )}

                {customerNotes && (
                    <div style={detailColumn}>
                        <Text style={detailLabel}>Customer Notes:</Text>
                        <Text style={noteValue}>"{customerNotes}"</Text>
                    </div>
                )}
            </Section>

            {items.length > 0 && (
                <Section style={itemsSection}>
                    <Text style={itemsHeading}>Products to Ship:</Text>
                    {items.map((item) => (
                        <div key={item.id} style={itemRow}>
                            <Text style={itemText}>
                                <strong>{item.quantity}x</strong> {item.product?.name || 'Product'}
                            </Text>
                        </div>
                    ))}
                </Section>
            )}

            <Text style={paragraph}>
                Please log in to your seller dashboard to process this order and prepare it for shipping.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={orderUrl}>
                    View Order & Ship
                </EmailButton>
            </div>

            <Text style={footerNote}>
                💡 Tip: Orders should be shipped within 2-3 business days to maintain your seller rating.
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 16px 0'
};

const itemsSection = {
    margin: '24px 0',
    padding: '20px',
    backgroundColor: '#ffffff',
    border: '1px solid #eeeeee',
    borderRadius: '8px'
};

const itemsHeading = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#999999',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    margin: '0 0 12px 0'
};

const itemRow = {
    padding: '8px 0',
    borderBottom: '1px solid #f9f9f9'
};

const itemText = {
    fontSize: '14px',
    color: '#333333',
    margin: 0
};

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const saleBox = {
    backgroundColor: '#f0fdf4',
    border: '2px solid #10b981',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0'
};

const saleLabel = {
    fontSize: '14px',
    color: '#059669',
    margin: '8px 0 4px 0'
};

const saleValue = {
    fontSize: '18px',
    color: '#064e3b',
    fontWeight: '600',
    margin: '0 0 12px 0'
};

const subHeading = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 12px 0',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px'
};

const detailsSection = {
    margin: '0 0 24px 0',
    padding: '20px',
    backgroundColor: '#fffbeb', // Light yellow for "Action Item" feel
    borderRadius: '12px',
    border: '1px solid #fcd34d'
};

const detailColumn = {
    marginBottom: '16px'
};

const detailLabel = {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#92400e', // Dark orange/brown
    textTransform: 'uppercase' as const,
    margin: '0 0 4px 0'
};

const detailValue = {
    fontSize: '15px',
    color: '#1a1a1a',
    lineHeight: '1.5',
    margin: '0'
};

const noteValue = {
    fontSize: '15px',
    color: '#1a1a1a',
    fontStyle: 'italic',
    backgroundColor: '#ffffff',
    padding: '8px',
    borderRadius: '4px',
    border: '1px dashed #d1d5db'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '24px 0'
};

const footerNote = {
    fontSize: '14px',
    color: '#999999',
    fontStyle: 'italic',
    marginTop: '20px'
};

export default NewSaleEmail;
