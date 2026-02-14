import * as React from 'react';
import { Link } from '@react-email/components';

interface EmailButtonProps {
    href: string;
    children: React.ReactNode;
}

/**
 * Reusable button component for emails
 * Ensures consistent styling across all email templates
 */
export const EmailButton = ({ href, children }: EmailButtonProps) => {
    return (
        <Link href={href} style={button}>
            {children}
        </Link>
    );
};

const button = {
    display: 'inline-block',
    backgroundColor: '#E87A3F',
    color: '#ffffff',
    padding: '14px 28px',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '16px',
    textAlign: 'center' as const,
    transition: 'background-color 0.2s'
};

export default EmailButton;
