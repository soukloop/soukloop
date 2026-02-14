export async function getAuthToken(): Promise<string | undefined> {
  try {
    if (typeof window === 'undefined') {
      // Server: look for NextAuth or custom JWT in cookies or incoming headers
      // Lazy import to avoid client bundling
      const nh = await import('next/headers')
      const cookies = await nh.cookies()
      const hdrs = await nh.headers()

      const cookieCandidates = [
        '__Secure-next-auth.session-token',
        'next-auth.session-token',
        'token',
        'jwt',
        'access_token',
      ]
      for (const name of cookieCandidates) {
        const v = cookies.get(name)?.value
        if (v) return v
      }

      const auth = hdrs.get('authorization') || undefined
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        return auth.slice(7)
      }
      return undefined
    }

    // Client: check localStorage for common keys
    const lsKeys = ['token', 'access_token', 'jwt', 'next-auth.session-token'] as const
    for (const k of lsKeys) {
      const v = safeLocalStorageGet(k)
      if (v) return v
    }
    return undefined
  } catch {
    return undefined
  }
}

function safeLocalStorageGet(key: string): string | undefined {
  try {
    if (typeof window === 'undefined') return undefined
    return window.localStorage.getItem(key) ?? undefined
  } catch {
    return undefined
  }
}


