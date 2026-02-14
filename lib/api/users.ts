'use server'

import { httpGet, httpPost, httpPatch, httpDelete, type ApiResponse } from '../http'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends User {
  bio?: string
  preferences?: Record<string, unknown>
}

export interface CreateUserRequest {
  email: string
  name: string
  password: string
}

export interface UpdateUserRequest {
  name?: string
  bio?: string
  preferences?: Record<string, unknown>
}

export async function fetchUser(userId: string): Promise<ApiResponse<UserProfile>> {
  return httpGet<UserProfile>(`/users/${userId}`, undefined, { cache: 300 })
}

export async function fetchCurrentUser(): Promise<ApiResponse<UserProfile>> {
  return httpGet<UserProfile>('/users/me', undefined, { cache: 60 })
}

export async function createUser(userData: CreateUserRequest): Promise<ApiResponse<User>> {
  return httpPost<User>('/users', userData)
}

export async function updateUser(userId: string, updates: UpdateUserRequest): Promise<ApiResponse<UserProfile>> {
  return httpPatch<UserProfile>(`/users/${userId}`, updates)
}

export async function deleteUser(userId: string): Promise<ApiResponse<void>> {
  return httpDelete<void>(`/users/${userId}`)
}
