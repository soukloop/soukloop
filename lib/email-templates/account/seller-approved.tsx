import {
    Section,
    Text,
    Heading,
    Hr
} from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';
import * as React from 'react';

interface SellerApprovedEmailProps {
    userName?: string;
    actionUrl?: string;
}

export const SellerApprovedEmail = ({
    userName = 'Valued User',
    actionUrl = process.env.NEXTAUTH_URL + '/seller/dashboard'
}: SellerApprovedEmailProps) => {
    return (
        <EmailLayout preview="Your Seller Application Has Been Approved! 🎉">
            <Heading style={heading}>
                Welcome to SoukLoop Sellers! 🎉
            </Heading>
            <Text style={paragraph}>
                Congratulations {userName},
            </Text>
            <Text style={paragraph}>
                We are thrilled to let you know that your seller application has been **approved**! Welcome to the SoukLoop seller community.
            </Text>

            <Section style={successBox}>
                <Text style={successText}>
                    Your account is now fully verified and active.
                </Text>
            </Section>

            <Text style={paragraph}>
                You can now start setting up your storefront, listing your products or services, and connecting with buyers on our platform.
            </Text>

            <Hr style={divider} />

            <Heading as="h3" style={subHeading}>
                Next Steps to Success:
            </Heading>

            <Text style={listItem}>
                • <strong style={highlightText}>Set up your profile:</strong> Add a banner, store description, and logo to stand out.
            </Text>
            <Text style={listItem}>
                • <strong style={highlightText}>List your products:</strong> Create high-quality listings with clear images and detailed descriptions.
            </Text>
            <Text style={listItem}>
                • <strong style={highlightText}>Check your settings:</strong> Ensure your payment and notification settings are configured correctly.
            </Text>

            <div style={buttonContainer}>
                <EmailButton href={actionUrl}>
                    Go to Seller Dashboard
                </EmailButton>
            </div>

            <Text style={footerText}>
                We are excited to see your business grow with us! If you need any assistance along the way, our seller support team is always here to help.
            </Text>
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

const subHeading = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0 0 16px 0'
};

const paragraph = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 16px 0'
};

const listItem = {
    fontSize: '16px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '0 0 8px 0'
};

const successBox = {
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '8px',
    padding: '20px',
    margin: '24px 0',
    textAlign: 'center' as const
};

const successText = {
    color: '#15803d',
    fontSize: '16px',
    fontWeight: 'bold',
    margin: '0'
};

const highlightText = {
    color: '#E87A3F'
};

const divider = {
    borderColor: '#e5e5e5',
    margin: '26px 0'
};

const footerText = {
    fontSize: '14px',
    color: '#666666',
    lineHeight: '1.6',
    margin: '32px 0 0 0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default SellerApprovedEmail;
