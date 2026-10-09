// Cliente da API de Dados das Obras (NEXUS, app `obras`).
// Desde 2026-10 a obra é cadastro manual próprio (sem vínculo com SPE/Mega):
// - qualquer capability do app `obras` lê: `view` ("Padrão") vê as obras
//   marcadas `visivel_padrao`; `avancado` ("Avançado") vê as marcadas
//   `visivel_avancado` (cada obra pode ter as duas marcações);
//   `manage` ("Administrador") vê tudo, inclusive inativas;
// - reativar uma obra inativa exige informar quem pode vê-la;
// - `manage` cria/edita, faz ações em massa, reordena obras, renomeia grupos,
//   ordena abas e importa/exporta a planilha no modelo da Suprimentos.
//   Obra NÃO se exclui (a API não tem DELETE): ocultar = desativar.
// Os dados (CNPJ, endereços, e-mails, equipe) só existem na API — nunca no
// bundle público (pentest E7, 2026-08).
import { apiFetch } from './api'

/** Quem enxerga a obra (as duas marcações podem estar ligadas; ao menos uma). */
export interface Visibilidade { visivel_padrao: boolean; visivel_avancado: boolean }

/** Pessoa da equipe da obra. Com `colaborador_id`, nome/telefone/e-mail vêm do
 *  cadastro do colaborador (RH) e acompanham mudanças dele; só `cargo` (função
 *  na obra) é editável. Sem `colaborador_id` = texto antigo da planilha. */
export interface EquipeMembro { colaborador_id: string | null; cargo: string; nome: string; telefone: string; email: string }

/** Resultado da busca de colaboradores (autocomplete da equipe). */
export interface ColaboradorBusca { colaborador_id: string; nome: string; email: string; telefone: string; cargo: string }

export interface Obra extends Visibilidade {
  id: string
  nome: string
  numero: string
  organizacao: string
  aba: string
  categoria: string
  ativo: boolean
  ordem: number
  cnpj: string
  cno: string
  ie: string
  im: string
  endereco_fatura: string
  endereco_entrega: string
  endereco_cobranca: string
  email: string
  telefones: string[]
  equipe: EquipeMembro[]
  observacoes: string
  /** Só exibição: CNPJ/CNO/IE/IM preenchidos. */
  documentos: Record<string, string>
  /** Só exibição: Fatura/Entrega/Cobrança preenchidos. */
  enderecos: Record<string, string>
  criado_em: string
  atualizado_em: string
}

export type ObraDados = Omit<Obra, 'id' | 'documentos' | 'enderecos' | 'criado_em' | 'atualizado_em'>

export interface ObrasResult {
  obras: Obra[]
  /** ISO da última alteração em qualquer obra (header X-Obras-Atualizacao). */
  atualizadoEm: string
  /** Status HTTP quando a leitura falhou: 403 = sem capability, 0 = rede. */
  erro?: number
}

/** Erros de validação do DRF: `{campo: [mensagens]}` ou `{detail: "..."}`. */
export type ErrosApi = Record<string, string[] | string>

export type Resultado<T> = { ok: true; data: T } | { ok: false; erros: ErrosApi; status: number }

async function resultado<T>(res: Response | null): Promise<Resultado<T>> {
  if (!res) return { ok: false, status: 0, erros: { detail: 'Sem conexão com o servidor. Tente de novo.' } }
  if (res.ok) return { ok: true, data: res.status === 204 ? (undefined as T) : await res.json() }
  let erros: ErrosApi = { detail: `Erro ${res.status}.` }
  try { erros = await res.json() } catch { /* corpo não-JSON */ }
  if (res.status === 403 && !erros.detail) erros = { detail: 'Você não tem permissão de Administrador de Dados das Obras.' }
  return { ok: false, status: res.status, erros }
}

/** Primeira mensagem legível de um erro da API (pra avisos curtos). */
export function mensagemErro(erros: ErrosApi): string {
  const detail = erros.detail ?? erros.non_field_errors
  const primeiro = detail ?? Object.values(erros)[0]
  if (!primeiro) return 'Não foi possível concluir.'
  return Array.isArray(primeiro) ? String(primeiro[0]) : String(primeiro)
}

export async function fetchObras(): Promise<ObrasResult> {
  const res = await apiFetch('/obras/').catch(() => null)
  if (!res) return { obras: [], atualizadoEm: '', erro: 0 }
  if (!res.ok) return { obras: [], atualizadoEm: '', erro: res.status }
  return { obras: await res.json(), atualizadoEm: res.headers.get('X-Obras-Atualizacao') ?? '' }
}

export async function criarObra(dados: Partial<ObraDados>): Promise<Resultado<Obra>> {
  return resultado(await apiFetch('/obras/', { method: 'POST', body: JSON.stringify(dados) }).catch(() => null))
}

export async function atualizarObra(id: string, dados: Partial<ObraDados>): Promise<Resultado<Obra>> {
  return resultado(await apiFetch(`/obras/${id}/`, { method: 'PATCH', body: JSON.stringify(dados) }).catch(() => null))
}

/** Colaboradores com vínculo ativo cujo nome/e-mail bate com `q` (mín. 2 letras). Só Administrador. */
export async function buscarColaboradores(q: string): Promise<ColaboradorBusca[]> {
  const res = await apiFetch(`/obras/colaboradores/?q=${encodeURIComponent(q)}`).catch(() => null)
  if (!res || !res.ok) return []
  return res.json()
}

export type AcaoEmMassa =
  | { acao: 'desativar' }
  | ({ acao: 'ativar' | 'visibilidade' } & Visibilidade)
  | { acao: 'mover'; aba?: string; categoria?: string }

export async function acaoEmMassa(ids: string[], acao: AcaoEmMassa): Promise<Resultado<{ afetadas: number }>> {
  return resultado(await apiFetch('/obras/em-massa/', { method: 'POST', body: JSON.stringify({ ids, ...acao }) }).catch(() => null))
}

/** `ids` na nova ordem — o backend redistribui entre eles as posições que já ocupavam. */
export async function reordenarObras(ids: string[]): Promise<Resultado<Obra[]>> {
  return resultado(await apiFetch('/obras/reordenar/', { method: 'POST', body: JSON.stringify({ ids }) }).catch(() => null))
}

/** Renomeia a aba/categoria em todas as obras que a usam (nome já existente = junta os grupos). */
export async function renomearGrupo(tipo: 'aba' | 'categoria', de: string, para: string): Promise<Resultado<{ afetadas: number }>> {
  return resultado(await apiFetch('/obras/renomear-grupo/', { method: 'POST', body: JSON.stringify({ tipo, de, para }) }).catch(() => null))
}

/** Nomes das abas na ordem escolhida pelo Administrador (vazio = ordem padrão). */
export async function fetchOrdemAbas(): Promise<string[]> {
  const res = await apiFetch('/obras/ordem-abas/').catch(() => null)
  if (!res || !res.ok) return []
  return res.json()
}

export async function salvarOrdemAbas(abas: string[]): Promise<Resultado<string[]>> {
  return resultado(await apiFetch('/obras/ordem-abas/', { method: 'POST', body: JSON.stringify({ abas }) }).catch(() => null))
}

export type AusentesAcao = 'manter' | 'desativar'

export interface ResumoImportacao {
  total: number
  abas: { nome: string; obras: number }[]
  novas: { nome: string; numero: string; aba: string; categoria: string }[]
  atualizadas: { id: string; nome: string; campos: string[] }[]
  sem_mudanca: number
  ausentes: { id: string; nome: string; aba: string; ativo: boolean }[]
  avisos: string[]
  aplicado: boolean
}

/** Sem `aplicar`, o backend só compara o arquivo com o que já existe (prévia). */
export async function importarPlanilha(
  arquivo: File, opts: { aplicar: boolean; ausentes: AusentesAcao },
): Promise<Resultado<ResumoImportacao>> {
  const form = new FormData()
  form.append('arquivo', arquivo)
  form.append('aplicar', opts.aplicar ? '1' : '0')
  form.append('ausentes', opts.ausentes)
  return resultado(await apiFetch('/obras/importar/', { method: 'POST', body: form }).catch(() => null))
}

/** Baixa o .xlsx no modelo da planilha da Suprimentos. */
export async function exportarPlanilha(incluirInativas: boolean): Promise<Resultado<void>> {
  const res = await apiFetch(`/obras/exportar/${incluirInativas ? '?inativas=1' : ''}`).catch(() => null)
  if (!res || !res.ok) return resultado(res)
  const blob = await res.blob()
  const nome = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') ?? '')?.[1]
    ?? `Exto - Tabela de Obras - ${new Date().toISOString().slice(0, 10)}.xlsx`
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nome
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
  return { ok: true, data: undefined }
}
