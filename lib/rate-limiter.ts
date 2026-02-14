import { RateLimiterMemory } from 'rate-limiter-flexible'

// Using Memory Rate Limiter for development without Redis
// Redis client configuration removed for local dev without Docker

// Login rate limiter: 5 attempts per 15 minutes per IP
export const loginRateLimiter = new RateLimiterMemory({
  keyPrefix: 'login_attempts',
  points: 5, // Number of requests
  duration: 15 * 60, // Per 15 minutes
  blockDuration: 15 * 60, // Block for 15 minutes if limit exceeded
})

// Checkout rate limiter: 10 attempts per hour per user
export const checkoutRateLimiter = new RateLimiterMemory({
  keyPrefix: 'checkout_attempts',
  points: 10, // Number of requests
  duration: 60 * 60, // Per hour
  blockDuration: 60 * 60, // Block for 1 hour if limit exceeded
})

// General API rate limiter: 100 requests per 15 minutes per IP
export const apiRateLimiter = new RateLimiterMemory({
  keyPrefix: 'api_requests',
  points: 100, // Number of requests
  duration: 15 * 60, // Per 15 minutes
  blockDuration: 15 * 60, // Block for 15 minutes if limit exceeded
})

// Rate limiter middleware factory
export function createRateLimiter(limiter: RateLimiterMemory, keyGenerator?: (req: any) => string) {
  return async (req: any, res: any, next: any) => {
    try {
      // Generate key for rate limiting
      let key: string
      if (keyGenerator) {
        key = keyGenerator(req)
      } else {
        // Default to IP address
        const forwarded = req.headers['x-forwarded-for']
        const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress
        key = ip || 'unknown'
      }

      // Check rate limit
      await limiter.consume(key)
      next()
    } catch (rejRes: any) {
      // Rate limit exceeded
      const secs = Math.round(rejRes.msBeforeNext / 1000) || 1

      res.set('Retry-After', String(secs))
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: secs
      })
    }
  }
}

// Specific rate limiters
export const loginRateLimit = createRateLimiter(loginRateLimiter, (req) => {
  // Use IP address for login attempts
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress
  return ip || 'unknown'
})

export const checkoutRateLimit = createRateLimiter(checkoutRateLimiter, (req) => {
  // Use user ID for checkout attempts
  return req.user?.id || req.headers['x-user-id'] || 'anonymous'
})

export const apiRateLimit = createRateLimiter(apiRateLimiter, (req) => {
  // Use IP address for general API requests
  const forwarded = req.headers['x-forwarded-for']
  const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress
  return ip || 'unknown'
})

// Utility function to get rate limit info
export async function getRateLimitInfo(limiter: RateLimiterMemory, key: string) {
  try {
    const res = await limiter.get(key)
    return {
      remainingPoints: res?.remainingPoints || 0,
      totalHits: (res as any)?.totalHits || 0,
      msBeforeNext: res?.msBeforeNext || 0
    }
  } catch (error) {
    return null
  }
}

// Utility function to reset rate limit
export async function resetRateLimit(limiter: RateLimiterMemory, key: string) {
  try {
    await limiter.delete(key)
    return true
  } catch (error) {
    return false
  }
}
