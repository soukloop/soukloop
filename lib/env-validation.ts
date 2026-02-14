import { z } from 'zod';

const envSchema = z.object({
    // Required secrets - no fallbacks allowed in production
    NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
    ADMIN_SESSION_SECRET: z.string().min(32, 'ADMIN_SESSION_SECRET must be at least 32 characters'),
    DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

    // Optional with defaults
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    EMAIL_PROVIDER: z.enum(['local', 'resend']).default('local'),
    RESEND_API_KEY: z.string().optional(),

    // Public vars
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

export type Env = z.infer<typeof envSchema>;

let validatedEnv: Env | null = null;

export function validateEnv(): Env {
    if (validatedEnv) return validatedEnv;

    // In Next.js, process.env potentially contains non-string values or is loaded differently
    // We explicitly cast to unknown then verify
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        console.error('❌ [ENV] Environment validation failed:');
        result.error.issues.forEach(issue => {
            console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
        });

        // In production, we want to fail hard
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Missing required environment variables');
        } else {
            console.warn('⚠️ [ENV] Running in development with missing/invalid vars. Some features may break.');
        }
    }

    // If validation fails in dev, we return process.env casted as Env to allow partial running
    // but validatedEnv remains null so we re-check next time (or we could just return the partial data)
    if (!result.success) {
        return process.env as unknown as Env;
    }

    validatedEnv = result.data;
    return validatedEnv;
}

export function getEnv(): Env {
    return validateEnv();
}

// Helpers for specific secrets
export const getAdminSecret = () => {
    const env = getEnv();
    if (!env.ADMIN_SESSION_SECRET && process.env.NODE_ENV !== 'production') {
        return 'dev-fallback-secret-do-not-use-in-prod';
    }
    return env.ADMIN_SESSION_SECRET;
};

export const getNextAuthSecret = () => {
    const env = getEnv();
    return env.NEXTAUTH_SECRET;
};
