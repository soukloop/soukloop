import { getApiBaseUrl } from './env'
import { getAuthToken } from './auth/token'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type HttpOptions = {
  method?: HttpMethod
  headers?: Record<string, string>
  // Automatically JSON.stringify body if object
  body?: unknown
  // Next.js fetch options
  next?: RequestInit['next']
  // Cache strategy: 'no-store' for dynamic, or revalidate seconds number
  cache?: 'no-store' | number
  // Number of retries on network/5xx errors
  retries?: number
  // Abort after ms
  timeoutMs?: number
}

export class HttpError extends Error {
  status: number
  url: string
  payload?: unknown
  constructor(message: string, status: number, url: string, payload?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.url = url
    this.payload = payload
  }
}

export type ApiResponse<T = unknown> = {
  data: T | null
  error: { code: string; message: string } | null
}

function buildUrl(pathname: string, searchParams?: Record<string, string | number | boolean | undefined>): string {
  // Determine base:
  // - Prefer NEXT_PUBLIC_API_URL when set
  // - Otherwise fall back to relative /api path (works both server/client)
  const configured = getApiBaseUrl()
  const base = (configured && configured.trim().length > 0) ? configured.replace(/\/$/, '') : ''
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const fullPath = base ? base + path : path // if no base, use relative URL
  const url = new URL(fullPath, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }
  // When no base is configured, we want a relative URL like /api/...
  // new URL above resolves with an origin; return pathname+search for relative use in fetch
  if (!base) {
    const search = url.search.toString()
    return `${url.pathname}${search}`
  }
  return url.toString()
}

async function withTimeout<T>(promise: Promise<T>, ms?: number): Promise<T> {
  if (!ms || ms <= 0) return promise
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    promise.then(
      (val) => {
        clearTimeout(id)
        resolve(val)
      },
      (err) => {
        clearTimeout(id)
        reject(err)
      },
    )
  })
}

export async function http<T = unknown>(
  pathname: string,
  options: HttpOptions = {},
  query?: Record<string, string | number | boolean | undefined>,
): Promise<ApiResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    next,
    cache,
    retries = 1,
    timeoutMs,
  } = options

  const url = buildUrl(pathname, query)

  const finalHeaders: Record<string, string> = {
    ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
    ...headers,
  }

  // Attach Authorization header if token available
  const token = await getAuthToken().catch(() => undefined)
  if (token && !finalHeaders.authorization && !finalHeaders.Authorization) {
    finalHeaders.Authorization = `Bearer ${token}`
  }

  const fetchInit: RequestInit = {
    method,
    headers: finalHeaders,
    body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    next,
  }

  // Map cache strategy to Next.js fetch options
  if (cache === 'no-store') {
    fetchInit.cache = 'no-store'
  } else if (typeof cache === 'number') {
    fetchInit.next = { ...(fetchInit.next ?? {}), revalidate: cache }
  }

  let attempt = 0
  // Simple retry on network/5xx
  while (true) {
    try {
      const res = await withTimeout(fetch(url, fetchInit), timeoutMs)

      // Always try to parse as JSON first
      const text = await res.text()
      let parsedData: unknown
      try {
        parsedData = text ? JSON.parse(text) : null
      } catch (parseErr) {
        // If JSON parsing fails, return error response and log the content for debugging
        console.error(`❌ [HTTP DEBUG] Failed to parse JSON from ${url}. Status: ${res.status}`);
        console.error(`❌ [HTTP DEBUG] Response preview (first 200 chars): ${text.substring(0, 200)}`);

        return {
          data: null,
          error: {
            code: 'PARSE_ERROR',
            message: `Failed to parse JSON response: ${parseErr instanceof Error ? parseErr.message : 'Unknown error'}`
          }
        }
      }

      if (!res.ok) {
        return {
          data: null,
          error: {
            code: `HTTP_${res.status}`,
            message: `Request failed with status ${res.status}`
          }
        }
      }

      return {
        data: parsedData as T,
        error: null
      }
    } catch (err) {
      attempt += 1
      const isRetryable =
        (err instanceof HttpError && err.status >= 500) ||
        !(err instanceof HttpError)

      if (!isRetryable || attempt > retries) {
        // Return error response instead of throwing
        return {
          data: null,
          error: {
            code: err instanceof HttpError ? `HTTP_${err.status}` : 'NETWORK_ERROR',
            message: err instanceof Error ? err.message : 'Unknown network error'
          }
        }
      }

      // exponential backoff with jitter
      const delayMs = Math.min(1000 * 2 ** (attempt - 1) + Math.random() * 250, 4000)
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}

export const httpGet = <T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>, opts?: Omit<HttpOptions, 'method' | 'body'>) =>
  http<T>(path, { ...opts, method: 'GET' }, query)

export const httpPost = <T = unknown>(path: string, body?: unknown, opts?: Omit<HttpOptions, 'method'>) =>
  http<T>(path, { ...opts, method: 'POST', body })

export const httpPatch = <T = unknown>(path: string, body?: unknown, opts?: Omit<HttpOptions, 'method'>) =>
  http<T>(path, { ...opts, method: 'PATCH', body })

export const httpDelete = <T = unknown>(path: string, query?: Record<string, string | number | boolean | undefined>, opts?: Omit<HttpOptions, 'method' | 'body'>) =>
  http<T>(path, { ...opts, method: 'DELETE' }, query)


