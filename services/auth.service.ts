import { apiPost, apiGet, type ApiResponse } from '../lib/api'

// Type definitions for auth responses
export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface JWT {
  token: string
  expiresIn: number
  refreshToken?: string
}

export interface Session {
  user: User
  token: string
  expiresAt: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

// Auth service functions
export async function register(data: RegisterRequest): Promise<ApiResponse<User>> {
  return apiPost<User>('/api/auth/register', data)
}

export async function login(data: LoginRequest): Promise<ApiResponse<JWT>> {
  return apiPost<JWT>('/api/auth/login', data)
}

export async function getSession(): Promise<ApiResponse<Session>> {
  return apiGet<Session>('/api/auth/session')
}

export async function logout(): Promise<ApiResponse<void>> {
  return apiPost<void>('/api/auth/logout')
}

// Example usage:
/*
// Register a new user
const { data: user, error: registerError } = await register({
  email: 'user@example.com',
  username: 'johndoe',
  password: 'securepassword'
})

if (registerError) {
  console.error('Registration failed:', registerError.message)
} else {
  console.log('User registered:', user?.username)
}

// Login
const { data: jwt, error: loginError } = await login({
  email: 'user@example.com',
  password: 'securepassword'
})

if (loginError) {
  console.error('Login failed:', loginError.message)
} else {
  // Store token in localStorage or cookie
  localStorage.setItem('token', jwt?.token || '')
  console.log('Logged in successfully')
}

// Get current session
const { data: session, error: sessionError } = await getSession()

if (sessionError) {
  console.error('Session error:', sessionError.message)
} else {
  console.log('Current user:', session?.user.username)
}

// Logout
const { error: logoutError } = await logout()

if (logoutError) {
  console.error('Logout failed:', logoutError.message)
} else {
  // Clear stored token
  localStorage.removeItem('token')
  console.log('Logged out successfully')
}
*/
