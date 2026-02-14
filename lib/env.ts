// Centralized, typed access to environment variables.
// - Put server-only vars under server.
// - Put public (client-exposed) vars under client and prefix them with NEXT_PUBLIC_.

type NonEmptyString = string & { __brand: 'NonEmptyString' }

function requireEnv(name: string): NonEmptyString {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value as NonEmptyString
}

export const env = {
  server: {
    // Example: backend API base URL
    API_BASE_URL: process.env.API_BASE_URL ?? '',
    // Add more server-only secrets here
  },
  client: {
    // Client-visible values must be prefixed with NEXT_PUBLIC_
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? '',
  },
}

export function getApiBaseUrl(): string {
  // Prefer server-side secret if available; fall back to NEXT_PUBLIC_ for browsers
  if (typeof window === 'undefined') {
    return env.server.API_BASE_URL || env.client.NEXT_PUBLIC_API_URL
  }
  return env.client.NEXT_PUBLIC_API_URL
}

export function assertRequiredEnv(): void {
  // Validate minimally required variables at startup on the server
  if (typeof window === 'undefined') {
    // Ensure NextAuth variables are present
    if (!process.env.NEXTAUTH_URL) {
      console.warn('⚠️ NEXTAUTH_URL is missing. This may cause CLIENT_FETCH_ERROR.');
    } else {
      console.log(`✅ NEXTAUTH_URL is set to: ${process.env.NEXTAUTH_URL}`);
    }

    if (!process.env.NEXTAUTH_SECRET) {
      console.warn('⚠️ NEXTAUTH_SECRET is missing. Authentication will fail.');
    }
  }
}


