'use client'

import { SWRConfig } from 'swr'
import { ReactNode, useMemo, useEffect } from 'react'
import { signOut } from 'next-auth/react'

// ============================================================
// PROFESSIONAL SWR ERROR HANDLING
// ============================================================
// This follows Vercel's recommended patterns for SWR error handling:
// 1. Custom error class that includes HTTP status codes
// 2. Smart retry logic that stops on specific error codes
// 3. Global event dispatch for session invalidation
// ============================================================

/**
 * Custom error class that includes HTTP status code
 * Required for SWR's onErrorRetry to make smart decisions
 */
class FetchError extends Error {
  status: number
  info: any

  constructor(message: string, status: number, info?: any) {
    super(message)
    this.name = 'FetchError'
    this.status = status
    this.info = info
  }
}

/**
 * Professional fetcher that exposes HTTP status codes
 * This enables SWR to make intelligent retry decisions
 */
async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for auth
  })

  if (!res.ok) {
    // Try to parse error response
    let info: any = {}
    try {
      info = await res.json()
    } catch {
      info = { message: res.statusText }
    }

    throw new FetchError(
      info.error || info.message || `Request failed with status ${res.status}`,
      res.status,
      info
    )
  }

  return res.json()
}

interface SWRProviderProps {
  children: ReactNode
}

export function SWRProvider({ children }: SWRProviderProps) {
  // Listen for force-logout events (triggered when 401 detected)
  useEffect(() => {
    const handleForceLogout = () => {
      console.warn('[SWR] Force logout triggered due to invalid session')
      signOut({ callbackUrl: '/' })
    }

    window.addEventListener('force-logout', handleForceLogout)
    return () => window.removeEventListener('force-logout', handleForceLogout)
  }, [])

  const swrConfig = useMemo(() => ({
    fetcher,

    // ============================================================
    // SMART RETRY LOGIC
    // ============================================================
    // Stop retrying immediately on these error codes:
    // - 401 Unauthorized: Session invalid, need re-login
    // - 403 Forbidden: No permission, retry won't help
    // - 404 Not Found: Resource doesn't exist
    // - 500 Server Error: Don't spam broken servers
    // ============================================================
    onErrorRetry: (
      error: any,
      key: string,
      config: any,
      revalidate: any,
      { retryCount }: { retryCount: number }
    ) => {
      // Check if error has status property (FetchError)
      const status = error?.status || error?.response?.status

      // Never retry on client errors (except rate limiting)
      if (status === 401) {
        // Unauthorized - trigger global logout
        console.warn(`[SWR] 401 on ${key} - triggering force logout`)
        window.dispatchEvent(new CustomEvent('force-logout'))
        return // Stop retrying
      }

      if (status === 403) {
        console.warn(`[SWR] 403 Forbidden on ${key} - no retry`)
        return // Stop retrying
      }

      if (status === 404) {
        console.warn(`[SWR] 404 Not Found on ${key} - no retry`)
        return // Stop retrying
      }

      if (status >= 500) {
        console.warn(`[SWR] ${status} Server Error on ${key} - no retry`)
        return // Stop retrying - don't spam broken servers
      }

      // Max 3 retries for network errors
      if (retryCount >= 3) {
        console.warn(`[SWR] Max retries reached for ${key}`)
        return
      }

      // Exponential backoff for network errors: 5s, 10s, 20s
      const delay = 5000 * Math.pow(2, retryCount)
      console.log(`[SWR] Retrying ${key} in ${delay}ms (attempt ${retryCount + 1}/3)`)
      setTimeout(() => revalidate({ retryCount }), delay)
    },

    // ============================================================
    // PERFORMANCE OPTIMIZATIONS
    // ============================================================
    revalidateOnFocus: false,       // Don't refetch on window focus (reduces load)
    revalidateOnReconnect: true,    // Refetch on network reconnect (important)
    dedupingInterval: 5000,         // Dedupe requests within 5s window
    focusThrottleInterval: 10000,   // Throttle focus revalidation to 10s
    errorRetryCount: 3,             // Default max retries
    shouldRetryOnError: true,       // Allow retries (controlled by onErrorRetry)
  }), [])

  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  )
}

// ============================================================
// UTILITY EXPORTS
// ============================================================

/**
 * Custom fetchers for specific use cases
 */
export const swrFetchers = {
  // Default fetcher with error handling
  default: fetcher,

  // POST fetcher for mutations
  post: async function <T>(url: string, data: any): Promise<T> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const info = await res.json().catch(() => ({}))
      throw new FetchError(
        info.error || `POST failed with status ${res.status}`,
        res.status,
        info
      )
    }

    return res.json()
  },
}

export { FetchError }
