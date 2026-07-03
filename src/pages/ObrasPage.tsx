import { useMemo, useState } from 'react'
import {
  ArrowLeft, Search, Building2, MapPin, FileText, Phone, Mail,
  Users, Copy, Check, Hash, Briefcase, X,
} from 'lucide-react'
import { OBRAS, OBRAS_REVISAO, type Obra } from '../data/obras'

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

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
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
      {/* Cabeçalho da obra */}
      <div className="px-[28px] py-[22px] border-b border-border bg-surface">
        <div className="flex items-center gap-[10px] mb-[8px]">
          {obra.numero && (
            <span className="inline-flex items-center gap-[3px] font-hanken font-semibold text-[12px] text-accent bg-[rgba(174,58,35,0.08)] rounded-[7px] px-[8px] py-[3px]">
              <Hash size={11} strokeWidth={2.4} />{obra.numero}
            </span>
          )}
          <span className="font-hanken text-[11.5px] text-text-faint uppercase tracking-[0.05em]">{obra.aba}</span>
        </div>
        <h2 className="m-0 font-archivo font-semibold text-[20px] leading-[1.2] text-ink">{obra.nome}</h2>
        {obra.categoria && (
          <p className="m-0 mt-[5px] font-hanken text-[12.5px] text-text-muted">{obra.categoria}</p>
        )}
      </div>

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

  const selected = results.find(o => o.nome === selectedNome) ?? results[0] ?? null

  const abaCount = (a: typeof ABAS[number]) => OBRAS.filter(o => o.aba === a).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
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

      <div className="flex flex-1 overflow-hidden">
        {/* Lista */}
        <aside className="flex-shrink-0 flex flex-col border-r border-border" style={{ width: '340px' }}>
          {/* Busca */}
          <div className="px-[16px] pt-[14px] pb-[10px] flex-shrink-0">
            <div className="relative">
              <Search size={15} strokeWidth={1.8} className="absolute left-[11px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Buscar obra, CNPJ, endereço, equipe…"
                className="w-full font-hanken text-[13px] text-ink bg-tile-bg border border-transparent rounded-[10px] pl-[34px] pr-[30px] py-[9px] outline-none focus:border-border-hover focus:bg-surface transition-colors placeholder:text-text-faint"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-[8px] top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[20px] h-[20px] rounded-full border-none bg-transparent cursor-pointer text-text-faint hover:text-ink"
                >
                  <X size={13} strokeWidth={2} />
                </button>
              )}
            </div>

            {/* Filtros por aba */}
            <div className="flex flex-wrap gap-[6px] mt-[10px]">
              <FilterChip active={aba === 'all'} onClick={() => setAba('all')} label="Todas" count={OBRAS.length} />
              {ABAS.map(a => (
                <FilterChip key={a} active={aba === a} onClick={() => setAba(a)} label={a} count={abaCount(a)} />
              ))}
            </div>
          </div>

          {/* Resultados */}
          <div className="flex-1 overflow-y-auto scrollbar-none border-t border-border" style={{ scrollbarWidth: 'none' }}>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-[10px] py-[48px] px-[20px] text-center text-text-faint">
                <Search size={32} strokeWidth={1.2} />
                <span className="font-hanken text-[13px]">Nenhuma obra encontrada</span>
              </div>
            ) : (
              results.map(o => {
                const isSel = selected?.nome === o.nome
                return (
                  <button
                    key={o.nome + o.numero}
                    onClick={() => setSelectedNome(o.nome)}
                    className={`w-full text-left px-[16px] py-[12px] border-none cursor-pointer transition-colors duration-150 flex items-center gap-[11px] border-b border-border last:border-b-0 ${isSel ? 'bg-[rgba(174,58,35,0.06)]' : 'bg-transparent hover:bg-tile-bg'}`}
                  >
                    <div
                      className="flex-shrink-0 w-[36px] h-[36px] rounded-[10px] flex items-center justify-center"
                      style={{ background: isSel ? 'rgba(174,58,35,0.12)' : '#F0EDE8' }}
                    >
                      <Building2 size={16} strokeWidth={1.7} style={{ color: isSel ? '#AE3A23' : '#9A958F' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-hanken font-medium text-[13px] leading-[1.3] truncate" style={{ color: isSel ? '#AE3A23' : 'var(--color-ink)' }}>
                        {o.nome}
                      </div>
                      <div className="font-hanken text-[11.5px] text-text-faint truncate">
                        {o.organizacao}{o.numero ? ` · Nº ${o.numero}` : ''}
                      </div>
                    </div>
                    {isSel && <div className="flex-shrink-0 w-[3px] self-stretch rounded-full bg-accent -mr-[16px]" />}
                  </button>
                )
              })
            )}
          </div>

          <div className="flex-shrink-0 px-[16px] py-[9px] border-t border-border font-hanken text-[11px] text-text-faint">
            {results.length} de {OBRAS.length} obras · fonte {OBRAS_REVISAO}
          </div>
        </aside>

        {/* Detalhe */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F5F3F0]">
          {selected ? (
            <ObraDetail obra={selected} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center gap-[12px] text-text-faint">
              <Briefcase size={48} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">Selecione uma obra</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-[5px] font-hanken font-medium text-[11.5px] rounded-[8px] px-[9px] py-[4px] cursor-pointer border transition-colors duration-150 ${
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
