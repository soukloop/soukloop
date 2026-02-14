import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

// Get key from environment or use a default for dev (WARNING: Use env in prod)
// In a real app, you MUST ensure this is set in .env
const SECRET = process.env.ENCRYPTION_KEY || 'default-dev-secret-key-change-in-prod-123';

function getKey(salt: Buffer) {
    return crypto.pbkdf2Sync(SECRET, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = getKey(salt);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // @ts-ignore - TS sometimes complains about update with utf8, but it's valid for strings
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

export function decrypt(ciphertext: string): string {
    const buffer = Buffer.from(ciphertext, 'base64');

    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const text = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = getKey(salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(tag);

    // @ts-ignore
    return decipher.update(text) + decipher.final('utf8');
}

export async function decryptAsync(ciphertext: string): Promise<string> {
    const buffer = Buffer.from(ciphertext, 'base64');
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const text = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(SECRET, salt, ITERATIONS, KEY_LENGTH, 'sha512', (err, derivedKey) => {
            if (err) reject(err);
            else resolve(derivedKey);
        });
    });

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    // @ts-ignore
    return decipher.update(text) + decipher.final('utf8');
}
