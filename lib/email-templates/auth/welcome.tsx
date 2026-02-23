import * as React from 'react';
import { Text, Heading, Link } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface WelcomeEmailProps {
    userName?: string;
}

const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

/**
 * Professional Welcome Email for all SoukLoop users
 */
export const WelcomeEmail = ({
    userName
}: WelcomeEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>Welcome to SoukLoop, {userName || 'there'}! 🚀</Heading>

            <Text style={paragraph}>
                We're absolutely thrilled to have you join our community. SoukLoop is more than just a marketplace; it's a place where quality meets convenience, and where every transaction tells a story.
            </Text>

            <Text style={paragraph}>
                Whether you're here to discover unique items or to share your own creations with the world, we've built SoukLoop to make your journey seamless and rewarding.
            </Text>

            <Heading style={subheading}>What's Next?</Heading>

            <Text style={paragraph}>
                Here are a few things you can do right now to get started:
            </Text>

            <ul style={list}>
                <li style={listItem}>
                    <Link href={`${baseUrl}/`} style={link}>Explore our latest collections</Link>
                </li>
                <li style={listItem}>
                    <Link href={`${baseUrl}/editprofile`} style={link}>Complete your profile</Link>
                </li>
                <li style={listItem}>
                    <Link href={`${baseUrl}/dashboard/seller`} style={link}>Start selling your products</Link>
                </li>
            </ul>

            <div style={buttonContainer}>
                <EmailButton href={`${baseUrl}/`}>
                    Take Me to SoukLoop
                </EmailButton>
            </div>

            <Text style={paragraph}>
                If you have any questions, our support team is always here to help. Just reply to this email or visit our <Link href={`${baseUrl}/contactus`} style={link}>Help Center</Link>.
            </Text>

            <Text style={signature}>
                Happy shopping (and selling)!<br />
                <strong>The SoukLoop Team</strong>
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 20px 0',
    lineHeight: '1.2',
};

const subheading = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '32px 0 16px 0',
};

const paragraph = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    margin: '0 0 16px 0',
};

const list = {
    margin: '0 0 24px 0',
    paddingLeft: '20px',
};

const listItem = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '8px',
};

const link = {
    color: '#E87A3F',
    textDecoration: 'underline',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const signature = {
    fontSize: '16px',
    color: '#1a1a1a',
    marginTop: '32px',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '24px',
};

export default WelcomeEmail;
