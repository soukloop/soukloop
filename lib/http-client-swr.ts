// Lightweight SWR fetcher for client components (optional)
// Usage (client): const { data } = useSWR(['/products', { q: 'shoes' }], swrGet)
export async function swrGet<T = unknown>(key: [string, Record<string, unknown>?]) {
  const [path, query] = key
  const base = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')
  const full = new URL((base || '') + (path.startsWith('/') ? path : `/${path}`), window.location.origin)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) full.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(full.toString())
  if (!res.ok) throw new Error(`SWR GET failed ${res.status}`)
  const ct = res.headers.get('content-type') || ''
  return ct.includes('application/json') ? ((await res.json()) as T) : ((await res.text()) as T)
}
