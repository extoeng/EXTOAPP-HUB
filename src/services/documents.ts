import type { LibraryDoc } from '../types'
import { apiFetch } from './api'

export type DocType = 'comunicado' | 'manual'

/** Lista aberta a qualquer usuário autenticado — shape já é LibraryDoc puro. */
export async function fetchDocuments(tipo: DocType): Promise<LibraryDoc[] | null> {
  const res = await apiFetch(`/documentos/?tipo=${tipo}`)
  if (!res.ok) return null
  return await res.json()
}

/** Exige capability 'manage' no app 'comunicados'/'manuais' — 403 se não tiver. */
export async function uploadDocument(
  tipo: DocType,
  file: File,
  titulo?: string,
  descricao?: string,
): Promise<LibraryDoc | null> {
  const form = new FormData()
  form.append('tipo', tipo)
  form.append('pdf', file)
  if (titulo) form.append('titulo', titulo)
  if (descricao) form.append('descricao', descricao)

  const res = await apiFetch('/documentos/', { method: 'POST', body: form })
  if (!res.ok) return null
  return await res.json()
}

/** Exige capability 'manage' no app do documento — 403 se não tiver. Sem
 *  edição (PATCH) ainda — ver pendência no MCP extodev. */
export async function deleteDocument(id: number): Promise<boolean> {
  const res = await apiFetch(`/documentos/${id}/`, { method: 'DELETE' })
  return res.ok
}

/** Marca/desmarca um documento pra aparecer no card da home. Exige 'manage'
 *  no app do documento — 403 se não tiver. */
export async function setDestaque(id: number, destaque: boolean): Promise<LibraryDoc | null> {
  const res = await apiFetch(`/documentos/${id}/destaque/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ destaque }),
  })
  if (!res.ok) return null
  return await res.json()
}
