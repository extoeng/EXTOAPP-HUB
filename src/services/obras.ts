// Cliente da API de Dados das Obras (core-api, app `obras`).
// Os dados (CNPJ, endereços, e-mails, equipe) só existem na API — nunca no
// bundle público (pentest E7, 2026-08). Leitura exige qualquer capability no
// app `obras` (403 sem ela). Edição (PATCH) exige a capability `manage` —
// só dos campos manuais de `ObraInfo` (ver `ObraPatch`) e da equipe (ver
// `AlocacaoObra`/`ColaboradorElegivel` abaixo — mesma tabela `spe.AlocacaoSpe`
// da aba Equipe do painel-admin, só que sob a capability `obras`). Identidade
// (nome/CNPJ) vem do Mega via `spe.Spe` — corrigir lá, nunca editável aqui.
// Não existe criar/excluir obra (toda obra tem que se ligar a uma SPE já
// existente).
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

// ── Equipe (spe.AlocacaoSpe, exposta sob a capability `obras`) ────────────────

export interface AlocacaoObra {
  id: string
  data_inicio: string
  data_fim: string | null
  colaborador_nome: string
  colaborador_email: string
  cargo: string
}

/** Candidato a alocar — só quem já tem vínculo ativo (exigência de
 *  `AlocacaoSpe.vinculo_id`). */
export interface ColaboradorElegivel {
  colaborador_id: string
  vinculo_id: string
  nome: string
  email: string
  cargo: string
}

/** Só a equipe ATIVA (`data_fim` nula) — histórico encerrado não aparece
 *  aqui, mesmo padrão da aba Equipe do painel-admin. */
export async function fetchEquipeObra(speId: string): Promise<AlocacaoObra[]> {
  const res = await apiFetch(`/obras/${speId}/equipe/`).catch(() => null)
  if (!res || !res.ok) return []
  return await res.json()
}

/** Exige capability `manage` — 403 sem ela. */
export async function criarAlocacaoObra(
  speId: string, payload: { vinculo_id: string; data_inicio: string },
): Promise<AlocacaoObra | null> {
  const res = await apiFetch(`/obras/${speId}/equipe/`, { method: 'POST', body: JSON.stringify(payload) })
  if (!res.ok) return null
  return await res.json()
}

/** Encerra a alocação (não apaga — histórico continua existindo). Exige
 *  capability `manage`. */
export async function encerrarAlocacaoObra(id: string, dataFim: string): Promise<boolean> {
  const res = await apiFetch(`/obras/equipe/${id}/`, { method: 'PATCH', body: JSON.stringify({ data_fim: dataFim }) })
  return res.ok
}

export async function buscarColaboradoresElegiveis(q: string): Promise<ColaboradorElegivel[]> {
  if (q.trim().length < 2) return []
  const res = await apiFetch(`/obras/colaboradores-elegiveis/?q=${encodeURIComponent(q)}`).catch(() => null)
  if (!res || !res.ok) return []
  return await res.json()
}
