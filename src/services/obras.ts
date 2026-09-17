// Cliente da API de Dados das Obras (core-api, app `obras`).
// Os dados (CNPJ, endereços, e-mails, equipe) só existem na API — nunca no
// bundle público (pentest E7, 2026-08). Leitura exige qualquer capability no
// app `obras` (403 sem ela). Só leitura, de propósito (2026-09-17): o
// backend (`obras/views.py` no NEXUS) só expõe GET desde a reescrita sobre
// spe.Spe/AlocacaoSpe — identidade (nome/CNPJ) vem do Mega (corrigir lá) e
// equipe vem de AlocacaoSpe (gerenciada no Painel Administrativo, aba SPE →
// Equipe). Não existe POST/PATCH/DELETE pra ObraInfo fora do Django admin.
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
// (grupo_override/ordem, ajustáveis só via Django admin).
export interface ObraApi extends Obra {
  id: number
  grupo_override: string
  ordem: number
  ativo?: boolean
}

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
