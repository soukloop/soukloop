
import { encode, decode } from 'next-auth/jwt';
import { assertRequiredEnv } from './lib/env';

// Mock process.env loading
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifySecret() {
    console.log('--- Verifying NEXTAUTH_SECRET ---');
    console.log('Loading .env.local...');

    if (!process.env.NEXTAUTH_SECRET) {
        console.error('❌ NEXTAUTH_SECRET is MISSING in process.env!');
        return;
    }

    console.log('Secret found (length):', process.env.NEXTAUTH_SECRET.length);

    const secret = process.env.NEXTAUTH_SECRET;
    const token = {
        name: 'Test User',
        email: 'test@example.com',
        sub: '123'
    };

    try {
        console.log('Testing Encode...');
        const encoded = await encode({
            token,
            secret,
        });
        console.log('✅ Encode successful.');
        console.log('Token sample:', encoded.substring(0, 20) + '...');

        console.log('Testing Decode...');
        const decoded = await decode({
            token: encoded,
            secret,
        });

        if (decoded && decoded.email === token.email) {
            console.log('✅ Decode successful. Token content matches.');
        } else {
            console.error('❌ Decode failed or content mismatch:', decoded);
        }

    } catch (error) {
        console.error('❌ Crypto operation failed:', error);
    }
}

verifySecret().catch(console.error);
