import { apiFetch } from './api'

/** Slugs dos apps favoritados pelo usuário logado, ou null se a chamada falhar. */
export async function fetchFavoritos(): Promise<string[] | null> {
  const res = await apiFetch('/apps/favoritos')
  if (!res.ok) return null
  const data: { slug: string }[] = await res.json()
  return data.map(a => a.slug)
}

export async function addFavorito(slug: string): Promise<boolean> {
  const res = await apiFetch('/apps/favoritos', {
    method: 'POST',
    body: JSON.stringify({ app: slug }),
  })
  return res.ok
}

export async function removeFavorito(slug: string): Promise<boolean> {
  const res = await apiFetch(`/apps/favoritos/${slug}`, { method: 'DELETE' })
  return res.ok
}
