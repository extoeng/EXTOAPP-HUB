// Cliente da API de Dados das Obras (core-api, app `obras`).
// Os dados (CNPJ, endereços, e-mails, equipe) só existem na API — nunca no
// bundle público (pentest E7, 2026-08). Leitura exige qualquer capability no
// app `obras` (403 sem ela). Edição (PATCH) exige a capability `manage` —
// só dos campos manuais de `ObraInfo` (ver `ObraPatch`). Identidade (nome/
// CNPJ) vem do Mega via `spe.Spe` (corrigir lá) e equipe vem de
// `spe.AlocacaoSpe` (gerenciada no Painel Administrativo, aba SPE → Equipe)
// — nunca editáveis por aqui, nem existe criar/excluir obra (toda obra tem
// que se ligar a uma SPE já existente).
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

// A API acrescenta ao shape do `Obra` os campos de identidade/organização e
// os campos manuais "crus" (sem a mistura de `documentos`/`enderecos`, que
// tem CNPJ do Mega misturado com CNO/IE manuais) — usados pela edição.
// `id` é o pk real de `spe.Spe` (estável), não uma posição na lista.
export interface ObraApi extends Obra {
  id: string
  grupo_override: string
  ordem: number
  ativo?: boolean
  cno: string
  ie: string
  endereco_fatura: string
  endereco_entrega: string
  endereco_cobranca: string
}

// Só os campos manuais de `ObraInfo` — o backend (`ObraInfoUpdateSerializer`)
// ignora silenciosamente qualquer outra chave (nome/organização/documentos/
// equipe não fazem parte do serializer de escrita).
export type ObraPatch = Partial<{
  numero: string
  categoria: string
  aba: string
  cno: string
  ie: string
  endereco_fatura: string
  endereco_entrega: string
  endereco_cobranca: string
  email: string
  telefones: string[]
  ordem: number
  ativo: boolean
}>

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

/** Exige capability `manage` no app `obras` — 403 sem ela (ver
 *  `HasObrasAccess.write_capability` no NEXUS). */
export async function updateObra(id: string, patch: ObraPatch): Promise<ObraApi | null> {
  const res = await apiFetch(`/obras/${id}/`, { method: 'PATCH', body: JSON.stringify(patch) })
  if (!res.ok) return null
  return await res.json()
}
