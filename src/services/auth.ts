import type { App } from '../types'
import { apiFetch, setToken } from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthUser {
  id: string
  name: string
  role: string
  initials: string
  email: string
  phoneExtension: string
  mobile: string
  photoUrl: string | null
  // { slug_do_app: ["view","manage", ...] }
  apps: Record<string, string[]>
}

interface RawUser {
  id: number | string
  email: string
  name: string
  initials?: string
  job_title?: string
  phone_extension?: string
  mobile?: string
  status?: string
  photo_url?: string | null
  apps?: Record<string, string[]>
}

function mapUser(u: RawUser): AuthUser {
  return {
    id: String(u.id),
    name: u.name,
    role: u.job_title ?? '',
    initials: u.initials ?? '',
    email: u.email,
    phoneExtension: u.phone_extension ?? '',
    mobile: u.mobile ?? '',
    photoUrl: u.photo_url ?? null,
    apps: u.apps ?? {},
  }
}

export async function login(credentials: LoginCredentials): Promise<AuthUser> {
  const res = await apiFetch(
    '/auth/login',
    { method: 'POST', body: JSON.stringify(credentials) },
    false,
  )
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data?.detail ?? 'E-mail ou senha incorretos.')
  }
  const data = await res.json()
  setToken(data.access)
  return mapUser(data.user)
}

/** Restaura a sessão a partir do token salvo (retorna null se inválido). */
export async function getMe(): Promise<AuthUser | null> {
  const res = await apiFetch('/me')
  if (!res.ok) {
    setToken(null)
    return null
  }
  return mapUser(await res.json())
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' })
  } catch {
    // ignora erro de rede no logout
  } finally {
    setToken(null)
  }
}

interface RawApp {
  slug: string
  name: string
  description: string
  url: string
  icon_path: string
  category: string
  permissions: string[]
  sso_enabled?: boolean
}

/** Apps que o usuário pode acessar, mapeados para o tipo App do hub. */
export async function fetchApps(): Promise<App[] | null> {
  const res = await apiFetch('/apps')
  if (!res.ok) return null
  const data: RawApp[] = await res.json()
  return data.map(a => ({
    id: a.slug,
    cat: a.category as App['cat'],
    name: a.name,
    desc: a.description,
    url: a.url || undefined,
    icon: a.icon_path || undefined,
    ssoEnabled: a.sso_enabled ?? false,
  }))
}

/**
 * Pede um code de curta duração para autenticar num app satélite (SSO
 * cross-domain). O app satélite troca esse code pelos próprios tokens
 * chamando /auth/exchange-code no backend. `appSlug` é opcional e só serve
 * pra popular o `app_slug` da trilha de auditoria (AuthEvent) — não afeta
 * a validação do code em si.
 */
export async function getSatelliteCode(appSlug?: string): Promise<string | null> {
  const res = await apiFetch('/auth/satellite-code', {
    method: 'POST',
    body: JSON.stringify({ app_slug: appSlug ?? '' }),
  })
  if (!res.ok) return null
  const data = await res.json()
  return data?.code ?? null
}

/** Atualiza ramal/celular. */
export async function updateProfile(patch: {
  phone_extension?: string
  mobile?: string
}): Promise<AuthUser | null> {
  const res = await apiFetch('/profile', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  if (!res.ok) return null
  return mapUser(await res.json())
}

/** Troca de senha (invalida a sessão atual no backend). */
export async function changePassword(
  current_password: string,
  new_password: string,
): Promise<{ ok: boolean; detail?: string }> {
  const res = await apiFetch('/profile/password', {
    method: 'POST',
    body: JSON.stringify({ current_password, new_password }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const detail =
      data?.current_password?.[0] ?? data?.new_password?.[0] ?? data?.detail
    return { ok: false, detail }
  }
  return { ok: true, detail: data?.detail }
}
