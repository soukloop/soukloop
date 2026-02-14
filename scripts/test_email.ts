
import { sendEmail, sendVerificationEmail } from '../lib/mail';
import fs from 'fs';
import path from 'path';

async function testEmail() {
    process.env.EMAIL_PROVIDER = 'local';
    console.log('Testing Email Service (Local)...');

    try {
        // 1. Test Generic Email
        await sendEmail({
            to: 'test@example.com',
            subject: 'Test Subject',
            html: '<p>Hello World</p>'
        });

        // 2. Test Verification Email
        await sendVerificationEmail('user@example.com', '123456');

        // 3. Verify Log
        const logPath = path.join(process.cwd(), 'email-logs.txt');
        const content = fs.readFileSync(logPath, 'utf8');

        if (content.includes('user@example.com') && content.includes('Verify your email')) {
            console.log('✅ Email successfully logged to file.');
        } else {
            throw new Error('Email log missing expected content');
        }

        // 4. Verify OTP File (Specific to verification email mock)
        const otpPath = path.join(process.cwd(), 'last_otp.txt');
        const otp = fs.readFileSync(otpPath, 'utf8');
        if (otp === '123456') {
            console.log('✅ OTP file updated correctly.');
        } else {
            throw new Error(`OTP logic failed. Expected 123456, got ${otp}`);
        }

    } catch (error) {
        console.error('❌ Email Test Failed:', error);
        process.exit(1);
    }
}

testEmail();
