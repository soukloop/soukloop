import { NextRequest, NextResponse } from 'next/server'
import {
  loginRateLimit,
  registerRateLimit,
  apiRateLimit,
  passwordResetRateLimit,
  emailVerificationRateLimit
} from '@/lib/rate-limit'

// Rate limit middleware for Next.js API routes
export async function withRateLimit(
  request: NextRequest,
  limiter: any,
  keyGenerator: (request: NextRequest) => string
) {
  try {
    const key = keyGenerator(request)
    // Upstash Ratelimit API: success, limit, remaining, reset
    // This helper assumes standard Upstash Ratelimit object
    const { success, reset } = await limiter.limit(key)

    if (!success) {
      const now = Date.now()
      const msBeforeNext = reset - now
      const secs = Math.ceil(msBeforeNext / 1000) || 1

      return NextResponse.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: secs
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(secs),
            'X-RateLimit-Reset': String(reset)
          }
        }
      )
    }
    return null // No rate limit exceeded
  } catch (err) {
    console.error('Rate limit error:', err)
    // Fail open if rate limit fails
    return null
  }
}

// Helper: Get Client IP
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] :
    request.headers.get('x-real-ip') || 'unknown'
  return ip
}

// 1. Login Rate Limit
export async function checkLoginRateLimit(request: NextRequest) {
  if (!loginRateLimit) return null
  return withRateLimit(request, loginRateLimit, () => getClientIP(request))
}

// 2. Register Rate Limit
export async function checkRegisterRateLimit(request: NextRequest) {
  if (!registerRateLimit) return null
  return withRateLimit(request, registerRateLimit, () => getClientIP(request))
}

// 3. Password Reset Rate Limit
export async function checkPasswordResetRateLimit(request: NextRequest) {
  if (!passwordResetRateLimit) return null
  return withRateLimit(request, passwordResetRateLimit, () => getClientIP(request))
}

// 4. API Rate Limit (General)
export async function checkApiRateLimit(request: NextRequest) {
  if (!apiRateLimit) return null
  return withRateLimit(request, apiRateLimit, () => getClientIP(request))
}

