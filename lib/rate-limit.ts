import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate Limiting Utilities using Upstash Redis
 * 
 * These rate limiters protect critical endpoints from abuse:
 * - Login: Prevent brute force attacks
 * - Registration: Prevent spam accounts
 * - Password Reset: Prevent email bombing
 * - API endpoints: Prevent DoS attacks
 */

// Initialize Redis connection (only if env vars are set)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

if (!redis) {
    console.warn('[RateLimit] Upstash Redis not configured - rate limiting disabled');
}

/**
 * Login rate limiter
 * 5 attempts per 15 minutes per IP
 * Prevents brute force attacks
 */
export const loginRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix: "ratelimit:login",
}) : null;

/**
 * Registration rate limiter
 * 3 registrations per 10 minutes per IP
 * Prevents spam account creation
 */
export const registerRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "10 m"),
    analytics: true,
    prefix: "ratelimit:register",
}) : null;

/**
 * Password reset rate limiter
 * 3 reset requests per hour per IP
 * Prevents email bombing
 */
export const passwordResetRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    analytics: true,
    prefix: "ratelimit:password-reset",
}) : null;

/**
 * Email verification rate limiter
 * 5 verification emails per 10 minutes per user
 * Prevents email spam
 */
export const emailVerificationRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "10 m"),
    analytics: true,
    prefix: "ratelimit:email-verification",
}) : null;

/**
 * General API rate limiter
 * 100 requests per minute per IP
 * Prevents API abuse
 */
export const apiRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "1 m"),
    analytics: true,
    prefix: "ratelimit:api",
}) : null;

/**
 * Admin API rate limiter (more permissive for admin operations)
 * 200 requests per minute per user
 */
export const adminApiRateLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, "1 m"),
    analytics: true,
    prefix: "ratelimit:admin-api",
}) : null;

/**
 * Helper function to check rate limit and return appropriate response
 * 
 * @param limiterId - Identifier for tracking (usually IP address or user ID)
 * @param rateLimiter - The rate limiter to use
 * @returns Object with success status and optional retry-after header value
 * 
 * @example
 * ```typescript
 * const { success, retryAfter } = await checkRateLimit(ip, loginRateLimit);
 * if (!success) {
 *   return NextResponse.json(
 *     { error: 'Too many requests' },
 *     { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
 *   );
 * }
 * ```
 */
export async function checkRateLimit(
    limiterId: string,
    rateLimiter: Ratelimit | null
): Promise<{ success: boolean; retryAfter: number }> {
    // If rate limiter not configured (no Redis), allow all requests
    if (!rateLimiter) {
        return { success: true, retryAfter: 0 };
    }

    const { success, limit, remaining, reset } = await rateLimiter.limit(limiterId);

    if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        console.log(
            `[RateLimit] Blocked ${limiterId} - ${remaining}/${limit} remaining, retry in ${retryAfter}s`
        );
        return { success: false, retryAfter };
    }

    return { success: true, retryAfter: 0 };
}
