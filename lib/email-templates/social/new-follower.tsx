import * as React from 'react';
import { Text, Heading, Section, Img } from '@react-email/components';
import { EmailLayout } from '../components/email-layout';
import { EmailButton } from '../components/email-button';

interface NewFollowerEmailProps {
    followerName: string;
    followerImage?: string;
    profileUrl: string;
}

export const NewFollowerEmail = ({
    followerName,
    followerImage,
    profileUrl
}: NewFollowerEmailProps) => {
    return (
        <EmailLayout>
            <Heading style={heading}>You have a new follower! 🎉</Heading>

            <Section style={profileSection}>
                {followerImage ? (
                    <Img
                        src={followerImage}
                        alt={followerName}
                        width="80"
                        height="80"
                        style={profileImage}
                    />
                ) : (
                    <div style={placeholderImage}>{followerName.charAt(0)}</div>
                )}
                <Text style={followerNameStyle}>{followerName}</Text>
                <Text style={contextText}>has started following you on SoukLoop.</Text>
            </Section>

            <div style={buttonContainer}>
                <EmailButton href={profileUrl}>
                    View Profile
                </EmailButton>
            </div>

            <Text style={paragraph}>
                Keep posting great products to grow your audience even more!
            </Text>
        </EmailLayout>
    );
};

// Styles
const heading = {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 24px 0',
    textAlign: 'center' as const
};

const profileSection = {
    textAlign: 'center' as const,
    padding: '24px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    border: '1px solid #eee',
    marginBottom: '24px'
};

const profileImage = {
    borderRadius: '50%',
    objectFit: 'cover' as const,
    margin: '0 auto 16px auto',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const placeholderImage = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#E87A3F',
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px auto',
    lineHeight: '80px' // vertically center text in div for email clients
};

const followerNameStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 8px 0'
};

const contextText = {
    fontSize: '16px',
    color: '#666',
    margin: '0'
};

const paragraph = {
    fontSize: '16px',
    color: '#555',
    textAlign: 'center' as const,
    margin: '0'
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0'
};

export default NewFollowerEmail;
