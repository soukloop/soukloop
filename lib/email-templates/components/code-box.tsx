import * as React from 'react';
import { Section, Text } from '@react-email/components';

interface CodeBoxProps {
    code: string;
}

/**
 * Code/OTP display component for verification emails
 */
export const CodeBox = ({ code }: CodeBoxProps) => {
    return (
        <Section style={container}>
            <Text style={codeText}>{code}</Text>
        </Section>
    );
};

const container = {
    backgroundColor: '#f8f8f8',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    margin: '20px 0'
};

const codeText = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#E87A3F',
    letterSpacing: '4px',
    margin: '0',
    fontFamily: 'monospace'
};

export default CodeBox;
