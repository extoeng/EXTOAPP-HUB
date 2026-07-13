// Cliente da API de Dados das Obras (core-api, app `obras`).
// Leitura é livre pra qualquer autenticado; criar/editar/excluir exige a
// capability `manage` ("Administrador") no app `obras` — o backend rejeita
// com 403 quem não tiver (ver obras/permissions.py na API). O front espelha
// isso só pra esconder os controles (canManage), nunca como barreira real.
import type { Obra } from '../data/obras'
import { apiFetch } from './api'

// A API acrescenta ao shape do `Obra` do fallback estático os campos de
// identidade/organização editáveis. `id` só existe em obra vinda da API —
// editar/excluir dependem dele (obra de fallback offline não tem).
export interface ObraApi extends Obra {
  id: number
  grupo_override: string
  ordem: number
  ativo?: boolean
}

export type ObraPatch = Partial<Omit<ObraApi, 'id'>>

/** Lista todas as obras (aberta a qualquer autenticado). null = falha de rede
 *  (o chamador cai no fallback estático de data/obras.ts). */
export async function fetchObras(): Promise<ObraApi[] | null> {
  const res = await apiFetch('/obras/')
  if (!res.ok) return null
  return await res.json()
}

export async function createObra(patch: ObraPatch): Promise<ObraApi | null> {
  const res = await apiFetch('/obras/', { method: 'POST', body: JSON.stringify(patch) })
  if (!res.ok) return null
  return await res.json()
}

export async function updateObra(id: number, patch: ObraPatch): Promise<ObraApi | null> {
  const res = await apiFetch(`/obras/${id}/`, { method: 'PATCH', body: JSON.stringify(patch) })
  if (!res.ok) return null
  return await res.json()
}

export async function deleteObra(id: number): Promise<boolean> {
  const res = await apiFetch(`/obras/${id}/`, { method: 'DELETE' })
  return res.ok
}
