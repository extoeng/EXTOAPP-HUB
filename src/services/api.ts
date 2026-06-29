// Cliente da API de SSO (extoapp-api / core-api no Cloud Run).
// Estratégia: token Bearer guardado em localStorage; em 401 tenta /auth/refresh
// (via cookie) uma vez e repete a chamada. Cookies não são obrigatórios.

const API_BASE =
  import.meta.env.VITE_API_BASE ??
  'https://extoapp-api-582146265415.southamerica-east1.run.app/api'

const TOKEN_KEY = 'exto_access'

let accessToken: string | null = localStorage.getItem(TOKEN_KEY)

export function setToken(token: string | null) {
  accessToken = token
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return accessToken
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return false
    const data = await res.json()
    if (data?.access) {
      setToken(data.access)
      return true
    }
    return false
  } catch {
    return false
  }
}

export async function apiFetch(
  path: string,
  opts: RequestInit = {},
  retryOn401 = true,
): Promise<Response> {
  const headers = new Headers(opts.headers)
  if (opts.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && retryOn401) {
    const refreshed = await tryRefresh()
    if (refreshed) return apiFetch(path, opts, false)
  }
  return res
}
