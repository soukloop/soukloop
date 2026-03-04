import NextAuth from 'next-auth'
import { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: Role
      triggerUpdate?: boolean
      tokenVersion?: number
      isActive?: boolean
      planTier?: string
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    image?: string | null
    role: Role
    tokenVersion?: number
    isActive?: boolean
    emailVerified?: Date | null
    planTier?: string
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: Role
    tokenVersion?: number
    isActive?: boolean
    emailVerified?: Date | null
    planTier?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: Role
    accessTokenExpires?: number
    error?: string
    triggerUpdate?: boolean
    isActive?: boolean
    planTier?: string
  }
}