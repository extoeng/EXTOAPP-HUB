// Cliente da API de SSO (nexus, Cloud Run — banco core).
// Estratégia: token Bearer guardado em localStorage; em 401 tenta /auth/refresh
// (via cookie) uma vez e repete a chamada. Cookies não são obrigatórios.

// Mesmo domínio: em produção o Firebase Hosting faz rewrite de /api → Cloud Run;
// em dev o Vite faz proxy de /api (ver vite.config.ts). Sem CORS, cookies OK.
const API_BASE = import.meta.env.VITE_API_BASE ?? '/api'

const LOGIN_URL =
  import.meta.env.VITE_LOGIN_URL ?? 'https://extoapp-login.web.app'

const TOKEN_KEY = 'exto_access'

let accessToken: string | null = localStorage.getItem(TOKEN_KEY)

/** Manda pro app de login, com `return_to` opcional pra voltar sozinho depois. */
export function goToLogin(returnTo?: string) {
  window.location.href = returnTo
    ? `${LOGIN_URL}?return_to=${encodeURIComponent(returnTo)}`
    : LOGIN_URL
}

export function setToken(token: string | null) {
  accessToken = token
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getToken() {
  return accessToken
}

// Single-flight: o backend rotaciona o refresh e põe o antigo na blacklist, então
// dois 401 em paralelo (comum no boot, várias chamadas juntas) mandariam o MESMO
// refresh — a segunda chegaria com o token já invalidado e derrubaria a sessão.
// Todos esperam a mesma promise.
let renovando: Promise<boolean> | null = null

function tryRefresh(): Promise<boolean> {
  if (!renovando) {
    renovando = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data?.access) return false
        setToken(data.access)
        return true
      })
      .catch(() => false)
      .finally(() => { renovando = null })
  }
  return renovando
}

// Refresh PROATIVO. O reativo (401 acima) só roda quando há chamada — aba sem
// tráfego deixa o próprio refresh vencer por inatividade e o próximo clique cai
// na tela de login, mesmo com o usuário "ativo" na tela. Renova a cada 10min
// (2/3 do access de 15) só se houve interação desde então: mantém o logout por
// ociosidade real, tira o bounce de quem está de fato usando o HUB. Lock em
// localStorage porque o single-flight acima é só por aba — várias abas do HUB
// renovando juntas mandariam o mesmo refresh e a rotação/blacklist do backend
// derrubaria a sessão.
const REFRESH_INTERVAL_MS = 10 * 60_000
const REFRESH_LOCK_KEY = 'exto_last_refresh'

let ultimaAtividade = Date.now()
for (const evento of ['pointerdown', 'keydown'] as const) {
  addEventListener(evento, () => { ultimaAtividade = Date.now() }, { passive: true })
}

setInterval(() => {
  if (Date.now() - ultimaAtividade > REFRESH_INTERVAL_MS) return
  if (Date.now() - Number(localStorage.getItem(REFRESH_LOCK_KEY) ?? 0) < REFRESH_INTERVAL_MS - 60_000) return
  localStorage.setItem(REFRESH_LOCK_KEY, String(Date.now()))
  void tryRefresh()
}, REFRESH_INTERVAL_MS)

export async function apiFetch(
  path: string,
  opts: RequestInit = {},
  retryOn401 = true,
): Promise<Response> {
  const headers = new Headers(opts.headers)
  // FormData: o browser define o Content-Type (com boundary) sozinho — não sobrescrever.
  if (opts.body && !(opts.body instanceof FormData) && !headers.has('Content-Type')) {
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
