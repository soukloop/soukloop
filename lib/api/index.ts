// Centralized API exports
export * from './products'
export * from './users'
export * from './orders'
export * from './examples'

// Re-export the main API utilities
export { apiGet, apiPost, apiPatch, apiDelete, type ApiResponse } from '@/lib/api'

