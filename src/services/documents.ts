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
