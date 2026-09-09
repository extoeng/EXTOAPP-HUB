// Cliente da API de Dados das Obras (core-api, app `obras`).
// Os dados (CNPJ, endereços, e-mails, equipe) só existem na API — nunca no
// bundle público (pentest E7, 2026-08). Leitura exige qualquer capability no
// app `obras`; criar/editar/excluir exige a capability `manage`
// ("Administrador") — o backend rejeita com 403 quem não tiver (ver
// obras/permissions.py na API). O front espelha isso só pra esconder os
// controles (canManage), nunca como barreira real.
import { apiFetch } from './api'

export interface EquipeMembro { cargo: string; nome: string; telefone: string }

export interface Obra {
  nome: string
  numero: string
  organizacao: string
  categoria: string
  aba: string
  documentos: Record<string, string>
  enderecos: Record<string, string>
  email: string
  telefones: string[]
  equipe: EquipeMembro[]
}

// A API acrescenta ao shape do `Obra` os campos de identidade/organização
// editáveis. `id` é obrigatório pra editar/excluir.
export interface ObraApi extends Obra {
  id: number
  grupo_override: string
  ordem: number
  ativo?: boolean
}

export type ObraPatch = Partial<Omit<ObraApi, 'id'>>

export interface ObrasResult {
  obras: ObraApi[]
  /** Revisão da tabela publicada por Suprimentos (header X-Obras-Revisao). */
  revisao: string
  /** Status HTTP quando a leitura falhou: 403 = sem capability, 0 = rede. */
  erro?: number
}

/** Lista todas as obras. Sem fallback local: falha vem como `erro` e a tela
 *  mostra o estado vazio correspondente. */
export async function fetchObras(): Promise<ObrasResult> {
  const res = await apiFetch('/obras/').catch(() => null)
  if (!res) return { obras: [], revisao: '', erro: 0 }
  if (!res.ok) return { obras: [], revisao: '', erro: res.status }
  return {
    obras: await res.json(),
    revisao: res.headers.get('X-Obras-Revisao') ?? '',
  }
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
