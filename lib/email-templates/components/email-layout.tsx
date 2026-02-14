import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Text,
    Link,
    Img,
    Hr
} from '@react-email/components';

interface EmailLayoutProps {
    children: React.ReactNode;
    preview?: string;
}

/**
 * Base email layout with SoukLoop branding
 * Used as a wrapper for all email templates
 */
export const EmailLayout = ({ children, preview }: EmailLayoutProps) => {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    return (
        <Html>
            <Head />
            <Body style={main}>
                <Container style={container}>
                    {/* Header with SoukLoop logo */}
                    <Section style={header}>
                        <Img
                            src={`${baseUrl}/soukloop-logo.png`}
                            alt="SoukLoop"
                            width="180"
                            height="auto"
                            style={logoStyle}
                        />
                    </Section>

                    {/* Main content */}
                    <Section style={content}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footer}>
                        <Hr style={divider} />
                        <Text style={footerText}>
                            This email was sent by SoukLoop.
                        </Text>
                        <Text style={footerText}>
                            If you didn't expect this email, you can safely ignore it.
                        </Text>
                        <Text style={footerText}>
                            <Link href={`${baseUrl}/editprofile?section=notifications`} style={footerLink}>
                                Manage notification preferences
                            </Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

// Styles
const main = {
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    padding: '20px 0'
};

const container = {
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
};

const header = {
    background: 'linear-gradient(135deg, #E87A3F 0%, #C96835 100%)',
    padding: '30px 20px',
    textAlign: 'center' as const
};

const logoStyle = {
    display: 'block' as const,
    margin: '0 auto'
};

const content = {
    padding: '40px 30px',
    backgroundColor: '#ffffff'
};

const footer = {
    padding: '20px 30px',
    backgroundColor: '#ffffff'
};

const divider = {
    borderColor: '#e5e5e5',
    margin: '20px 0'
};

const footerText = {
    margin: '8px 0',
    fontSize: '13px',
    color: '#999999',
    textAlign: 'center' as const,
    lineHeight: '1.5'
};

const footerLink = {
    color: '#E87A3F',
    textDecoration: 'none'
};

export default EmailLayout;
