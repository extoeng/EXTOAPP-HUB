import type { ElementType } from 'react'
import {
  Building2, Handshake, HardHat, Rocket, Hourglass, Wrench, CheckCircle2, Archive, Briefcase,
} from 'lucide-react'
import type { EquipeMembro, Obra, ObraDados, Visibilidade } from '../../services/obras'

// ── Abas (= abas da planilha da Suprimentos) ────────────────────────────────
// `aba` guarda o nome da aba da planilha (é o que a importação/exportação
// usa); aqui só damos um rótulo mais amigável pras conhecidas.
export const ABAS_CONHECIDAS: { valor: string; rotulo: string }[] = [
  { valor: 'CADASTRO GERAL - OBRAS', rotulo: 'Geral / Em andamento' },
  { valor: 'PRÓXIMOS LANÇAMENTOS', rotulo: 'Próximos lançamentos' },
  { valor: 'SPEs NO AGUARDO', rotulo: 'SPEs no aguardo' },
  { valor: 'OBRAS - SPEs FINALIZADAS', rotulo: 'Finalizadas' },
]

export function rotuloAba(aba: string): string {
  return ABAS_CONHECIDAS.find(a => a.valor === aba)?.rotulo || aba || 'Sem aba'
}

/** Abas presentes nos dados: primeiro as da ordem escolhida pelo Administrador
 *  (`ordem`, vinda da API), depois as conhecidas (ordem da planilha) e por fim
 *  as outras em ordem alfabética. */
export function abasDe(obras: Obra[], ordem: string[] = []): string[] {
  const presentes = new Set(obras.map(o => o.aba))
  const escolhidas = ordem.filter(a => presentes.has(a))
  const conhecidas = ABAS_CONHECIDAS.map(a => a.valor).filter(a => presentes.has(a) && !escolhidas.includes(a))
  const outras = [...presentes].filter(a => !escolhidas.includes(a) && !conhecidas.includes(a)).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  return [...escolhidas, ...conhecidas, ...outras]
}

// ── Categorias (= seções dentro da aba) ─────────────────────────────────────
export type CategoriaMeta = { label: string; color: string; bg: string; Icon: ElementType }

const CATEGORIA_META: Record<string, CategoriaMeta> = {
  'EXTO - GERAL - STANDS FIXOS': { label: 'Exto Geral', color: '#6B7280', bg: 'rgba(107,114,128,0.10)', Icon: Building2 },
  'PARCEIROS': { label: 'Parceiros', color: '#7A5C99', bg: 'rgba(122,92,153,0.10)', Icon: Handshake },
  'OBRAS EM ANDAMENTO': { label: 'Em andamento', color: '#2F8F5B', bg: 'rgba(47,143,91,0.10)', Icon: HardHat },
  'PRÓXIMOS LANÇAMENTOS': { label: 'Próximo lançamento', color: '#3D6FB4', bg: 'rgba(61,111,180,0.10)', Icon: Rocket },
  'SPEs EM ABERTO': { label: 'SPE em aberto', color: '#B8862B', bg: 'rgba(184,134,43,0.10)', Icon: Hourglass },
  'OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA': { label: 'Assistência técnica', color: '#2596A1', bg: 'rgba(37,150,161,0.10)', Icon: Wrench },
  'OBRAS FINALIZADAS': { label: 'Finalizada', color: '#57534E', bg: 'rgba(87,83,78,0.10)', Icon: CheckCircle2 },
  'SPEs FINALIZADAS / NÃO UTILIZADAS': { label: 'SPE inativa', color: '#9A958D', bg: 'rgba(154,149,141,0.10)', Icon: Archive },
}

// Categoria nova (criada pelo admin) ganha uma cor estável derivada do nome.
const PALETA = ['#8B5E34', '#A23E6E', '#2E7D7A', '#5B6BB5', '#9C6B1F', '#4F7A2E', '#7D4FA0', '#B0543A']

function capitalizar(texto: string): string {
  const t = texto.toLowerCase()
  return t.charAt(0).toUpperCase() + t.slice(1)
}

export function categoriaMeta(categoria: string): CategoriaMeta {
  const conhecida = CATEGORIA_META[categoria]
  if (conhecida) return conhecida
  if (!categoria) return { label: 'Sem categoria', color: '#9A958D', bg: 'rgba(154,149,141,0.10)', Icon: Briefcase }
  let h = 0
  for (const ch of categoria) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  const color = PALETA[h % PALETA.length]
  return { label: capitalizar(categoria), color, bg: `${color}1A`, Icon: Briefcase }
}

// ── Busca ────────────────────────────────────────────────────────────────────
export function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const soDigitos = (t: string) => t.replace(/\D/g, '')

/** Texto pesquisável (sem acento/caixa) + versão só com dígitos, pra achar
 *  CNPJ/telefone digitado com ou sem pontuação. */
export function indiceBusca(o: Obra): { texto: string; digitos: string } {
  const partes = [
    o.nome, o.numero, o.organizacao, o.categoria, o.aba, o.email, o.cnpj, o.cno, o.ie, o.im,
    o.endereco_fatura, o.endereco_entrega, o.endereco_cobranca, o.observacoes,
    ...o.telefones, ...o.equipe.flatMap(m => [m.cargo, m.nome, m.telefone, m.email]),
  ]
  return { texto: normalizar(partes.join(' ')), digitos: soDigitos(partes.join(' ')) }
}

export function casaBusca(indice: { texto: string; digitos: string }, termos: string[]): boolean {
  return termos.every(t => indice.texto.includes(t) || (/^\d{3,}$/.test(soDigitos(t)) && indice.digitos.includes(soDigitos(t))))
}

// ── Exibição ────────────────────────────────────────────────────────────────
/** Endereço do local da obra: Entrega > Cobrança > Fatura (Fatura costuma ser a sede). */
export function enderecoPrincipal(o: Obra): string {
  return o.endereco_entrega || o.endereco_cobranca || o.endereco_fatura || ''
}

/** Rua + número (sem bairro/cidade/CEP). */
export function enderecoResumo(endereco: string): string {
  return endereco ? endereco.split(' - ')[0].trim() : ''
}

const CARGO_PRIORIDADE = ['gerente', 'coord', 'resid', 'engen']

export function responsavel(o: Obra): EquipeMembro | null {
  const equipe = o.equipe.filter(m => m.nome)
  for (const termo of CARGO_PRIORIDADE) {
    const achou = equipe.find(m => normalizar(m.cargo).includes(termo))
    if (achou) return achou
  }
  return equipe[0] ?? null
}

/** Telefone pra "ligar": o geral da obra, senão o do responsável. */
export function telefonePrincipal(o: Obra): string {
  return o.telefones[0] || responsavel(o)?.telefone || ''
}

export function telHref(tel: string): string {
  const d = soDigitos(tel)
  return `tel:${d.length >= 10 && !d.startsWith('0') ? `+55${d}` : d}`
}

/** Link do WhatsApp só pra celular (DDD + 9 + 8 dígitos). */
export function whatsappHref(tel: string): string | null {
  let d = soDigitos(tel)
  if (d.startsWith('55') && d.length === 13) d = d.slice(2)
  return d.length === 11 && d[2] === '9' ? `https://wa.me/55${d}` : null
}

export function mapaHref(endereco: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(endereco)}`
}

/** Resumo em texto da obra — "Copiar dados"/"Compartilhar". */
export function textoDaObra(o: Obra): string {
  const linhas: string[] = [`${o.numero ? `#${o.numero} ` : ''}${o.nome}`]
  if (o.organizacao) linhas.push(o.organizacao)
  for (const [rotulo, valor] of [['CNPJ', o.cnpj], ['CNO', o.cno], ['IE', o.ie], ['IM', o.im]]) {
    if (valor) linhas.push(`${rotulo}: ${valor}`)
  }
  for (const [rotulo, valor] of [['Entrega', o.endereco_entrega], ['Fatura', o.endereco_fatura], ['Cobrança', o.endereco_cobranca]]) {
    if (valor) linhas.push(`${rotulo}: ${valor}`)
  }
  if (o.email) linhas.push(`E-mail: ${o.email}`)
  if (o.telefones.length) linhas.push(`Telefone: ${o.telefones.join(' / ')}`)
  const equipe = o.equipe.filter(m => m.nome)
  if (equipe.length) {
    linhas.push('Equipe:')
    for (const m of equipe) linhas.push(`- ${m.cargo ? `${m.cargo}: ` : ''}${m.nome}${m.telefone ? ` · ${m.telefone}` : ''}${m.email ? ` · ${m.email}` : ''}`)
  }
  return linhas.join('\n')
}

export function formatarDataHora(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function obraVazia(parcial: Partial<ObraDados> = {}): ObraDados {
  return {
    nome: '', numero: '', organizacao: '', aba: '', categoria: '', ativo: true, visivel_padrao: true, visivel_avancado: true, ordem: 0,
    cnpj: '', cno: '', ie: '', im: '', endereco_fatura: '', endereco_entrega: '', endereco_cobranca: '',
    email: '', telefones: [], equipe: [], observacoes: '', ...parcial,
  }
}

/** Texto curto quando a obra NÃO é visível pros dois perfis (null = pros dois). */
export function restricaoDeVisibilidade(o: Visibilidade): string | null {
  if (o.visivel_padrao && o.visivel_avancado) return null
  return o.visivel_avancado ? 'Só Avançado' : 'Só Padrão'
}

export function dadosDaObra(o: Obra): ObraDados {
  const { id: _id, documentos: _d, enderecos: _e, criado_em: _c, atualizado_em: _a, ...dados } = o
  return { ...dados, telefones: [...o.telefones], equipe: o.equipe.map(m => ({ ...m })) }
}

export function copiar(valor: string): Promise<boolean> {
  if (!navigator.clipboard) return Promise.resolve(false)
  return navigator.clipboard.writeText(valor).then(() => true, () => false)
}

export const inputCls =
  'w-full font-hanken text-[14px] sm:text-[13.5px] text-ink bg-surface border border-border rounded-[9px] px-[11px] py-[9px] outline-none focus:border-[#B9B2A8] focus:ring-2 focus:ring-[rgba(179,28,28,0.10)] transition-colors placeholder:text-text-faint'

/** Chave estável de uma obra (App.tsx usa pra busca global abrir o detalhe). */
export function rowKey(o: Pick<Obra, 'id'>): string {
  return `id:${o.id}`
}

export function guardar(chave: string, valor: string) {
  try { localStorage.setItem(chave, valor) } catch { /* storage bloqueado */ }
}

export function ler(chave: string): string | null {
  try { return localStorage.getItem(chave) } catch { return null }
}
