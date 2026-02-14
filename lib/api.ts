// Simple API wrapper that re-exports the HTTP functions
// This avoids import path issues

// Re-export types
export type { HttpError, HttpOptions, ApiResponse } from './http'

// Re-export the main HTTP function
export { http as request } from './http'

// Create simple aliases for the HTTP methods
import { httpGet, httpPost, httpPatch, httpDelete } from './http'

export const apiGet = httpGet
export const apiPost = httpPost
export const apiPatch = httpPatch
export const apiDelete = httpDelete
