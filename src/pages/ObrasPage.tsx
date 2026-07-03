import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Search, Building2, MapPin, FileText, Phone, Mail,
  Users, Copy, Check, Hash, Briefcase, X, ChevronRight,
  HardHat, Rocket, Hourglass, Wrench, CheckCircle2, Archive,
} from 'lucide-react'
import { OBRAS, OBRAS_REVISAO, type Obra, type EquipeMembro } from '../data/obras'

interface Props {
  onBack: () => void
}

const ABAS = [
  'Geral / Sedes',
  'Próximos Lançamentos',
  'SPEs no Aguardo',
  'Obras / SPEs Finalizadas',
] as const

// texto pesquisável de uma obra (nome, org, nº, docs, endereços, equipe, e-mail)
function haystack(o: Obra): string {
  return [
    o.nome, o.organizacao, o.numero, o.categoria, o.email,
    ...Object.values(o.documentos),
    ...Object.values(o.enderecos),
    ...o.telefones,
    ...o.equipe.flatMap(e => [e.cargo, e.nome, e.telefone]),
  ].join(' ').toLowerCase()
}

// Endereço do local físico da obra. "Fatura" é o endereço da sede
// corporativa (repetido em quase todas as obras) — "Entrega"/"Cobrança"
// é o que de fato diferencia cada obra/stand.
function enderecoPrincipal(o: Obra): string {
  return o.enderecos['Entrega'] || o.enderecos['Cobrança'] || o.enderecos['Fatura'] || Object.values(o.enderecos)[0] || ''
}

// Rua + número, sem bairro/cidade/CEP — é o trecho que realmente muda
// de obra pra obra (a cidade é quase sempre "São Paulo/SP").
function enderecoResumo(endereco: string): string {
  if (!endereco) return ''
  return endereco.split(' - ')[0].trim()
}

// Escolhe o responsável principal da equipe por prioridade de cargo.
const CARGO_PRIORIDADE = ['gerente', 'coordenador', 'residente', 'engenh']
function responsavel(o: Obra): EquipeMembro | null {
  const equipe = o.equipe.filter(e => e.nome)
  if (equipe.length === 0) return null
  for (const termo of CARGO_PRIORIDADE) {
    const achou = equipe.find(e => e.cargo.toLowerCase().includes(termo))
    if (achou) return achou
  }
  return equipe[0]
}

// Diferenciação visual por estágio da obra (campo "categoria" da planilha).
// A ordem das chaves define a ordem em que os grupos aparecem na tela.
type CategoriaMeta = { label: string; color: string; bg: string; Icon: React.ElementType }

const CATEGORIA_META: Record<string, CategoriaMeta> = {
  'EXTO - GERAL - STANDS FIXOS': {
    label: 'Stands Fixos', color: '#6B7280', bg: 'rgba(107,114,128,0.10)', Icon: Building2,
  },
  'OBRAS EM ANDAMENTO': {
    label: 'Em Andamento', color: '#2F8F5B', bg: 'rgba(47,143,91,0.10)', Icon: HardHat,
  },
  'PRÓXIMOS LANÇAMENTOS': {
    label: 'Próximo Lançamento', color: '#3D6FB4', bg: 'rgba(61,111,180,0.10)', Icon: Rocket,
  },
  'SPEs EM ABERTO': {
    label: 'SPE em Aberto', color: '#B8862B', bg: 'rgba(184,134,43,0.10)', Icon: Hourglass,
  },
  'OBRAS RECÉM FINALIZADAS - ASSITENCIA TECNICA': {
    label: 'Assistência Técnica', color: '#2596A1', bg: 'rgba(37,150,161,0.10)', Icon: Wrench,
  },
  'OBRAS FINALIZADAS': {
    label: 'Finalizada', color: '#57534E', bg: 'rgba(87,83,78,0.10)', Icon: CheckCircle2,
  },
  'SPEs FINALIZADAS / NÃO UTILIZADAS': {
    label: 'SPE Inativa', color: '#9A958D', bg: 'rgba(154,149,141,0.10)', Icon: Archive,
  },
}
const CATEGORIA_PADRAO: CategoriaMeta = {
  label: 'Outras', color: '#9A958D', bg: 'rgba(154,149,141,0.10)', Icon: Briefcase,
}
function categoriaMeta(categoria: string): CategoriaMeta {
  return CATEGORIA_META[categoria] || CATEGORIA_PADRAO
}

// Agrupa obras por categoria, respeitando a ordem definida em CATEGORIA_META
// (categorias desconhecidas vão para o fim, na ordem em que aparecerem).
function agruparPorCategoria(obras: Obra[]): { key: string; meta: CategoriaMeta; itens: Obra[] }[] {
  const porChave = new Map<string, Obra[]>()
  const ordemConhecida = Object.keys(CATEGORIA_META)
  const desconhecidas: string[] = []

  for (const o of obras) {
    const key = o.categoria || 'Outras'
    if (!porChave.has(key)) {
      porChave.set(key, [])
      if (!ordemConhecida.includes(key)) desconhecidas.push(key)
    }
    porChave.get(key)!.push(o)
  }

  return [...ordemConhecida, ...desconhecidas]
    .filter(key => porChave.has(key))
    .map(key => ({
      key,
      meta: categoriaMeta(key),
      itens: [...porChave.get(key)!].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')),
    }))
}

function CopyButton({ value, onClick }: { value: string; onClick?: (e: React.MouseEvent) => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1400)
        })
      }}
      title="Copiar"
      className="flex-shrink-0 inline-flex items-center justify-center w-[24px] h-[24px] rounded-[7px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-tile-bg transition-colors duration-150"
    >
      {copied ? <Check size={13} strokeWidth={2.2} className="text-accent" /> : <Copy size={13} strokeWidth={1.8} />}
    </button>
  )
}

function Field({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  return (
    <div className="flex items-start gap-[8px] py-[7px] border-b border-border last:border-b-0">
      <span className="flex-shrink-0 w-[92px] font-hanken font-medium text-[12px] text-label pt-[1px]">{label}</span>
      <span className="flex-1 font-hanken text-[13px] text-ink-soft leading-[1.45] break-words">{value}</span>
      {copyable && value && <CopyButton value={value} />}
    </div>
  )
}

function SectionTitle({ Icon, children }: { Icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-[8px] mb-[8px] mt-[22px] first:mt-0">
      <Icon size={15} strokeWidth={1.9} className="text-accent" />
      <h3 className="m-0 font-archivo font-semibold text-[12px] tracking-[0.06em] uppercase text-label">{children}</h3>
    </div>
  )
}

function ObraDetail({ obra }: { obra: Obra }) {
  const docs = Object.entries(obra.documentos)
  const ends = Object.entries(obra.enderecos)
  const equipe = obra.equipe.filter(e => e.nome)
  const tels = obra.telefones.filter(Boolean)

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      <div className="px-[28px] py-[20px]">
        <SectionTitle Icon={Building2}>Organização</SectionTitle>
        <Field label="Razão social" value={obra.organizacao || '—'} />

        {docs.length > 0 && (
          <>
            <SectionTitle Icon={FileText}>Documentos</SectionTitle>
            {docs.map(([k, v]) => (
              <Field key={k} label={k} value={v} copyable />
            ))}
          </>
        )}

        {ends.length > 0 && (
          <>
            <SectionTitle Icon={MapPin}>Endereços</SectionTitle>
            {ends.map(([k, v]) => (
              <Field key={k} label={k} value={v} copyable />
            ))}
          </>
        )}

        {(obra.email || tels.length > 0) && (
          <>
            <SectionTitle Icon={Phone}>Contato</SectionTitle>
            {obra.email && (
              <div className="flex items-center gap-[8px] py-[7px] border-b border-border">
                <span className="flex-shrink-0 w-[92px] font-hanken font-medium text-[12px] text-label">E-mail</span>
                <a href={`mailto:${obra.email}`} className="flex-1 inline-flex items-center gap-[6px] font-hanken text-[13px] text-accent no-underline hover:underline break-all">
                  <Mail size={13} strokeWidth={1.8} />{obra.email}
                </a>
                <CopyButton value={obra.email} />
              </div>
            )}
            {tels.map((t, i) => (
              <Field key={i} label={i === 0 ? 'Telefone' : ''} value={t} copyable />
            ))}
          </>
        )}

        {equipe.length > 0 && (
          <>
            <SectionTitle Icon={Users}>Equipe de obra</SectionTitle>
            <div className="rounded-[12px] border border-border overflow-hidden">
              {equipe.map((e, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-[12px] px-[14px] py-[10px] ${i > 0 ? 'border-t border-border' : ''}`}
                >
                  <div className="flex-shrink-0 w-[32px] h-[32px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[12px]">
                    {(e.nome[0] || '?').toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-hanken font-medium text-[13px] text-ink truncate">{e.nome}</div>
                    {e.cargo && <div className="font-hanken text-[11.5px] text-text-faint">{e.cargo}</div>}
                  </div>
                  {e.telefone && (
                    <a href={`tel:${e.telefone}`} className="flex-shrink-0 inline-flex items-center gap-[5px] font-hanken text-[12.5px] text-text-muted no-underline hover:text-accent transition-colors">
                      <Phone size={12} strokeWidth={1.8} />{e.telefone}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Cartão da grade ──────────────────────────────────────────────────────────
function ObraCard({ obra, meta, onOpen }: { obra: Obra; meta: CategoriaMeta; onOpen: () => void }) {
  const cnpj = obra.documentos['CNPJ'] || ''
  const tel = obra.telefones.filter(Boolean)[0] || ''
  const endereco = enderecoPrincipal(obra)
  const resp = responsavel(obra)
  const CatIcon = meta.Icon

  return (
    <button
      onClick={onOpen}
      className="group text-left flex flex-col bg-surface border border-border rounded-[14px] p-[16px] cursor-pointer transition-all duration-150 ease-out hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px] overflow-hidden"
    >
      {/* Barra de categoria — reforça a diferenciação mesmo sem ler o selo */}
      <div className="h-[4px] w-full -mt-[16px] -mx-[16px] mb-[13px]" style={{ background: meta.color }} />

      {/* Cabeçalho */}
      <div className="flex items-start gap-[10px] mb-[10px]">
        {obra.numero && (
          <span
            className="flex-shrink-0 inline-flex items-center gap-[3px] font-hanken font-semibold text-[11.5px] rounded-[7px] px-[7px] py-[3px] mt-[1px]"
            style={{ color: meta.color, background: meta.bg }}
          >
            <Hash size={10} strokeWidth={2.6} />{obra.numero}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-archivo font-semibold text-[15px] leading-[1.25] text-ink truncate" title={obra.nome}>
            {obra.nome}
          </div>
          <div className="font-hanken text-[12px] text-text-muted leading-[1.35] truncate" title={obra.organizacao}>
            {obra.organizacao || '—'}
          </div>
        </div>
        <ChevronRight size={16} strokeWidth={1.8} className="flex-shrink-0 text-text-faint opacity-0 group-hover:opacity-100 transition-opacity mt-[2px]" />
      </div>

      {/* Selo de categoria */}
      <span
        className="self-start inline-flex items-center gap-[4px] font-hanken font-semibold text-[10px] uppercase tracking-[0.04em] rounded-[5px] px-[6px] py-[2.5px] mb-[12px]"
        style={{ color: meta.color, background: meta.bg }}
      >
        <CatIcon size={10} strokeWidth={2.4} />{meta.label}
      </span>

      {/* Dados principais */}
      <div className="flex flex-col gap-[7px] pt-[12px] border-t border-border">
        {/* CNPJ */}
        <div className="flex items-center gap-[8px]">
          <FileText size={14} strokeWidth={1.8} className="flex-shrink-0 text-text-faint" />
          <span className="flex-1 font-hanken text-[13px] text-ink-soft tabular-nums tracking-[0.01em] truncate">
            {cnpj || <span className="text-text-faint">sem CNPJ</span>}
          </span>
          {cnpj && <CopyButton value={cnpj} />}
        </div>

        {/* Telefone */}
        <div className="flex items-center gap-[8px]">
          <Phone size={14} strokeWidth={1.8} className="flex-shrink-0 text-text-faint" />
          <span className="flex-1 font-hanken text-[13px] text-ink-soft truncate">
            {tel || <span className="text-text-faint">—</span>}
          </span>
          {tel && <CopyButton value={tel} />}
        </div>

        {/* Endereço da obra (rua + número — a cidade é quase sempre SP) */}
        <div className="flex items-center gap-[8px]" title={endereco}>
          <MapPin size={14} strokeWidth={1.8} className="flex-shrink-0 text-text-faint" />
          <span className="flex-1 font-hanken text-[13px] text-ink-soft truncate">
            {enderecoResumo(endereco) || <span className="text-text-faint">—</span>}
          </span>
        </div>
      </div>

      {/* Responsável */}
      <div className="flex items-center gap-[9px] mt-[12px] pt-[12px] border-t border-border">
        {resp ? (
          <>
            <div className="flex-shrink-0 w-[28px] h-[28px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[11px]">
              {(resp.nome[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-hanken font-medium text-[12.5px] text-ink truncate">{resp.nome}</div>
              <div className="font-hanken text-[11px] text-text-faint truncate">{resp.cargo || 'Responsável'}</div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[9px] text-text-faint">
            <Users size={15} strokeWidth={1.7} />
            <span className="font-hanken text-[12px]">Sem equipe cadastrada</span>
          </div>
        )}
      </div>
    </button>
  )
}

// ── Gaveta lateral com o detalhe completo ─────────────────────────────────────
function ObraDrawer({ obra, onClose }: { obra: Obra; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="absolute inset-0 z-[40] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(22,20,18,0.35)] animate-ex-float"
        onClick={onClose}
      />
      {/* Painel */}
      <div
        className="relative w-[440px] max-w-[92%] h-full bg-surface border-l border-border flex flex-col shadow-card-hover"
        style={{ animation: 'exSlideIn 0.22s ease' }}
      >
        <style>{`@keyframes exSlideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>

        {/* Cabeçalho da gaveta */}
        <div className="flex items-start gap-[12px] px-[28px] py-[20px] border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[10px] mb-[6px]">
              {obra.numero && (
                <span className="inline-flex items-center gap-[3px] font-hanken font-semibold text-[12px] text-accent bg-[rgba(174,58,35,0.08)] rounded-[7px] px-[8px] py-[3px]">
                  <Hash size={11} strokeWidth={2.4} />{obra.numero}
                </span>
              )}
              <span className="font-hanken text-[11.5px] text-text-faint uppercase tracking-[0.05em] truncate">{obra.aba}</span>
            </div>
            <h2 className="m-0 font-archivo font-semibold text-[19px] leading-[1.2] text-ink break-words">{obra.nome}</h2>
            {obra.categoria && (() => {
              const meta = categoriaMeta(obra.categoria)
              const CatIcon = meta.Icon
              return (
                <span
                  className="inline-flex items-center gap-[4px] font-hanken font-semibold text-[10.5px] uppercase tracking-[0.04em] rounded-[5px] px-[7px] py-[3px] mt-[8px]"
                  style={{ color: meta.color, background: meta.bg }}
                >
                  <CatIcon size={11} strokeWidth={2.4} />{meta.label}
                </span>
              )
            })()}
          </div>
          <button
            onClick={onClose}
            title="Fechar (Esc)"
            className="flex-shrink-0 inline-flex items-center justify-center w-[30px] h-[30px] rounded-[9px] border-none bg-tile-bg cursor-pointer text-text-muted hover:text-ink hover:bg-border transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <ObraDetail obra={obra} />
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export function ObrasPage({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [aba, setAba] = useState<'all' | typeof ABAS[number]>('all')
  const [selectedNome, setSelectedNome] = useState<string | null>(null)

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    return OBRAS.filter(o => {
      if (aba !== 'all' && o.aba !== aba) return false
      if (q && !haystack(o).includes(q)) return false
      return true
    })
  }, [q, aba])

  const selected = selectedNome ? OBRAS.find(o => o.nome === selectedNome) ?? null : null

  const abaCount = (a: typeof ABAS[number]) => OBRAS.filter(o => o.aba === a).length

  const grupos = useMemo(() => agruparPorCategoria(results), [results])

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-[14px] px-[24px] py-[16px] border-b border-border flex-shrink-0">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-[6px] border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-text-muted hover:text-ink transition-colors duration-150 p-0"
        >
          <ArrowLeft size={15} strokeWidth={2} />
          Voltar
        </button>
        <span className="text-border">|</span>
        <span className="font-archivo font-semibold text-[14px] text-ink">Consultor de Obras</span>
        <span className="font-hanken text-[11px] text-text-faint bg-tile-bg rounded-[6px] px-[7px] py-[2px]">{OBRAS_REVISAO}</span>
      </div>

      {/* Toolbar: busca + filtros */}
      <div className="px-[24px] pt-[16px] pb-[14px] border-b border-border flex-shrink-0 bg-bg-app">
        <div className="max-w-[1760px] mx-auto">
          <div className="flex flex-wrap items-center gap-[12px]">
            <div className="relative flex-1 min-w-[240px]">
              <Search size={16} strokeWidth={1.8} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar obra, CNPJ, endereço, responsável…"
                className="w-full font-hanken text-[13.5px] text-ink bg-surface border border-border rounded-[11px] pl-[38px] pr-[34px] py-[10px] outline-none focus:border-border-hover transition-colors placeholder:text-text-faint"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-[9px] top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[22px] h-[22px] rounded-full border-none bg-transparent cursor-pointer text-text-faint hover:text-ink"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              )}
            </div>
            <span className="font-hanken text-[12.5px] text-text-muted whitespace-nowrap">
              {results.length} de {OBRAS.length} obras · fonte {OBRAS_REVISAO}
            </span>
          </div>

          {/* Filtros por aba */}
          <div className="flex flex-wrap gap-[7px] mt-[12px]">
            <FilterChip active={aba === 'all'} onClick={() => setAba('all')} label="Todas" count={OBRAS.length} />
            {ABAS.map(a => (
              <FilterChip key={a} active={aba === a} onClick={() => setAba(a)} label={a} count={abaCount(a)} />
            ))}
          </div>
        </div>
      </div>

      {/* Grade de cartões */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-[24px] py-[20px]" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[1760px] mx-auto">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Briefcase size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">Nenhuma obra encontrada</span>
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="font-hanken text-[13px] text-accent border-none bg-transparent cursor-pointer hover:underline"
                >
                  Limpar busca
                </button>
              )}
            </div>
          ) : (
            grupos.map(g => (
              <div key={g.key} className="mb-[30px] last:mb-0">
                {grupos.length > 1 && (
                  <div className="flex items-center gap-[9px] mb-[13px]">
                    <span
                      className="inline-flex items-center justify-center w-[24px] h-[24px] rounded-[7px]"
                      style={{ background: g.meta.bg }}
                    >
                      <g.meta.Icon size={13} strokeWidth={2.2} style={{ color: g.meta.color }} />
                    </span>
                    <h4
                      className="m-0 font-archivo font-semibold text-[12.5px] tracking-[0.05em] uppercase"
                      style={{ color: g.meta.color }}
                    >
                      {g.meta.label}
                    </h4>
                    <span className="font-hanken text-[11.5px] text-text-faint">{g.itens.length}</span>
                    <div className="flex-1 h-px" style={{ background: g.meta.bg }} />
                  </div>
                )}
                <div
                  className="grid gap-[16px]"
                  style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
                >
                  {g.itens.map(o => (
                    <ObraCard key={o.nome + o.numero} obra={o} meta={g.meta} onOpen={() => setSelectedNome(o.nome)} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Gaveta de detalhe */}
      {selected && <ObraDrawer obra={selected} onClose={() => setSelectedNome(null)} />}
    </div>
  )
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-[6px] font-hanken font-medium text-[12px] rounded-[8px] px-[11px] py-[6px] cursor-pointer border transition-colors duration-150 ${
        active
          ? 'bg-accent text-white border-accent'
          : 'bg-surface text-text-muted border-border hover:border-border-hover'
      }`}
    >
      {label}
      <span className={active ? 'text-white/70' : 'text-text-faint'}>{count}</span>
    </button>
  )
}
