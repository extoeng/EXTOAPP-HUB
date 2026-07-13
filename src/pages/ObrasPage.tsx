import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Search, Building2, MapPin, FileText, Phone, Mail,
  Users, Copy, Check, Hash, Briefcase, X, ChevronRight,
  HardHat, Rocket, Hourglass, Wrench, CheckCircle2, Archive, Handshake,
  Pencil, Plus, Trash2, Save, Loader2, ArrowUpDown, GripVertical,
} from 'lucide-react'
import { OBRAS, OBRAS_REVISAO, type Obra, type EquipeMembro } from '../data/obras'
import {
  fetchObras, createObra, updateObra, deleteObra, type ObraApi, type ObraPatch,
} from '../services/obras'

interface Props {
  onBack: () => void
  // Só quem tem a capability `manage` ("Administrador") no app `obras` vê os
  // controles de edição. O backend é a barreira real (403); isto só esconde a UI.
  canManage?: boolean
}

// Linha de obra usada na tela: o shape do fallback estático + os campos de
// organização que só vêm da API (id/grupo_override/ordem). Obra de fallback
// não tem id — por isso edição só é liberada quando os dados vêm da API.
type ObraRow = Obra & { id?: number; grupo_override?: string; ordem?: number }

const ABAS = [
  'Geral / Sedes',
  'Próximos Lançamentos',
  'SPEs no Aguardo',
  'Obras / SPEs Finalizadas',
] as const

// texto pesquisável de uma obra (nome, org, nº, docs, endereços, equipe, e-mail)
function haystack(o: ObraRow): string {
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
function enderecoPrincipal(o: ObraRow): string {
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
function responsavel(o: ObraRow): EquipeMembro | null {
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
    label: 'Exto Geral', color: '#6B7280', bg: 'rgba(107,114,128,0.10)', Icon: Building2,
  },
  'PARCEIROS': {
    label: 'Parceiros', color: '#7A5C99', bg: 'rgba(122,92,153,0.10)', Icon: Handshake,
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

// Grupos oferecidos no editor (reenquadrar uma obra) — derivados do CATEGORIA_META.
const GRUPO_OPTIONS = Object.entries(CATEGORIA_META).map(([value, meta]) => ({ value, label: meta.label }))

// Curadoria de exibição legada (só para o fallback estático, que não tem o
// campo `grupo_override` por obra). Quando os dados vêm da API, quem manda é
// o `grupo_override` gravado na própria obra (editável pelo Painel Admin).
const GRUPO_OVERRIDE: Record<string, string> = {
  'Casa Viva': 'PARCEIROS',
  'GR8': 'PARCEIROS',
  'Espaço Exto Morumbi': 'OBRAS FINALIZADAS',
}

// Ordem manual legada dentro de um grupo (fallback estático). Com dados da
// API, o campo numérico `ordem` de cada obra tem prioridade.
const ORDEM_MANUAL: Record<string, string[]> = {
  'EXTO - GERAL - STANDS FIXOS': ['Exto Engenharia', 'Exto Incorporações', 'Espaço Exto Perdizes'],
}

// Categoria efetiva de uma obra: o override gravado na obra (API) vence; senão
// o override legado por nome; senão a categoria da planilha.
function catEfetiva(o: ObraRow): string {
  return (o.grupo_override || '').trim() || GRUPO_OVERRIDE[o.nome] || o.categoria || 'Outras'
}

function ordenarGrupo(key: string, itens: ObraRow[]): ObraRow[] {
  const manual = ORDEM_MANUAL[key]
  const idxManual = (nome: string) => {
    const i = manual ? manual.indexOf(nome) : -1
    return i === -1 ? Number.MAX_SAFE_INTEGER : i
  }
  return [...itens].sort((a, b) => {
    // Prioridade 1: campo `ordem` da API (0 = padrão; só desempata se diferir).
    const oa = a.ordem ?? Number.MAX_SAFE_INTEGER
    const ob = b.ordem ?? Number.MAX_SAFE_INTEGER
    if (oa !== ob) return oa - ob
    // Prioridade 2: ordem manual legada (fallback estático).
    const d = idxManual(a.nome) - idxManual(b.nome)
    return d !== 0 ? d : a.nome.localeCompare(b.nome, 'pt-BR')
  })
}

// Agrupa obras pela categoria efetiva, respeitando a ordem definida em
// CATEGORIA_META (categorias desconhecidas vão para o fim, na ordem em que aparecerem).
function agruparPorCategoria(obras: ObraRow[]): { key: string; meta: CategoriaMeta; itens: ObraRow[] }[] {
  const porChave = new Map<string, ObraRow[]>()
  const ordemConhecida = Object.keys(CATEGORIA_META)
  const desconhecidas: string[] = []

  for (const o of obras) {
    const key = catEfetiva(o)
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
      itens: ordenarGrupo(key, porChave.get(key)!),
    }))
}

// Chave estável de uma obra na lista (id da API quando existe; senão nome+nº).
function rowKey(o: ObraRow): string {
  return o.id != null ? `id:${o.id}` : `n:${o.nome}|${o.numero}`
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

function ObraDetail({ obra }: { obra: ObraRow }) {
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

// ── Editor da obra (dados + organização/layout) ───────────────────────────────
// Inputs simples e reutilizáveis (a tela não usa um kit de UI compartilhado).
function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover transition-colors placeholder:text-text-faint"
    />
  )
}

function Rotulo({ children }: { children: React.ReactNode }) {
  return <span className="font-hanken font-medium text-[11.5px] text-label">{children}</span>
}

// Editor de mapa chave→valor (documentos, endereços): linhas com chave+valor.
function MapaEditor({ obj, onChange }: { obj: Record<string, string>; onChange: (o: Record<string, string>) => void }) {
  const rows = Object.entries(obj)
  const set = (i: number, k: string, v: string) => {
    const next = rows.slice()
    next[i] = [k, v]
    onChange(Object.fromEntries(next.filter(([kk]) => kk.trim())))
  }
  const add = () => onChange({ ...obj, '': '' })
  const del = (i: number) => onChange(Object.fromEntries(rows.filter((_, j) => j !== i)))
  return (
    <div className="flex flex-col gap-[6px]">
      {rows.map(([k, v], i) => (
        <div key={i} className="flex items-center gap-[6px]">
          <div className="w-[110px] flex-shrink-0"><Input value={k} onChange={nk => set(i, nk, v)} placeholder="Rótulo" /></div>
          <div className="flex-1"><Input value={v} onChange={nv => set(i, k, nv)} placeholder="Valor" /></div>
          <button onClick={() => del(i)} title="Remover" className="flex-shrink-0 w-[28px] h-[28px] inline-flex items-center justify-center rounded-[8px] text-text-faint hover:text-accent hover:bg-tile-bg">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={add} className="self-start inline-flex items-center gap-[5px] font-hanken text-[12px] text-accent hover:underline bg-transparent border-none cursor-pointer p-0">
        <Plus size={13} /> Adicionar
      </button>
    </div>
  )
}

// Editor de lista de telefones.
function TelefonesEditor({ tels, onChange }: { tels: string[]; onChange: (t: string[]) => void }) {
  const set = (i: number, v: string) => { const n = tels.slice(); n[i] = v; onChange(n) }
  return (
    <div className="flex flex-col gap-[6px]">
      {tels.map((t, i) => (
        <div key={i} className="flex items-center gap-[6px]">
          <div className="flex-1"><Input value={t} onChange={v => set(i, v)} placeholder="Telefone" /></div>
          <button onClick={() => onChange(tels.filter((_, j) => j !== i))} title="Remover" className="flex-shrink-0 w-[28px] h-[28px] inline-flex items-center justify-center rounded-[8px] text-text-faint hover:text-accent hover:bg-tile-bg">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...tels, ''])} className="self-start inline-flex items-center gap-[5px] font-hanken text-[12px] text-accent hover:underline bg-transparent border-none cursor-pointer p-0">
        <Plus size={13} /> Adicionar telefone
      </button>
    </div>
  )
}

// Editor da equipe (cargo/nome/telefone).
function EquipeEditor({ equipe, onChange }: { equipe: EquipeMembro[]; onChange: (e: EquipeMembro[]) => void }) {
  const set = (i: number, patch: Partial<EquipeMembro>) => {
    const n = equipe.slice(); n[i] = { ...n[i], ...patch }; onChange(n)
  }
  return (
    <div className="flex flex-col gap-[8px]">
      {equipe.map((m, i) => (
        <div key={i} className="flex items-center gap-[6px]">
          <div className="w-[120px] flex-shrink-0"><Input value={m.cargo} onChange={v => set(i, { cargo: v })} placeholder="Cargo" /></div>
          <div className="flex-1"><Input value={m.nome} onChange={v => set(i, { nome: v })} placeholder="Nome" /></div>
          <div className="w-[120px] flex-shrink-0"><Input value={m.telefone} onChange={v => set(i, { telefone: v })} placeholder="Telefone" /></div>
          <button onClick={() => onChange(equipe.filter((_, j) => j !== i))} title="Remover" className="flex-shrink-0 w-[28px] h-[28px] inline-flex items-center justify-center rounded-[8px] text-text-faint hover:text-accent hover:bg-tile-bg">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button onClick={() => onChange([...equipe, { cargo: '', nome: '', telefone: '' }])} className="self-start inline-flex items-center gap-[5px] font-hanken text-[12px] text-accent hover:underline bg-transparent border-none cursor-pointer p-0">
        <Plus size={13} /> Adicionar membro
      </button>
    </div>
  )
}

const OBRA_VAZIA: ObraRow = {
  nome: '', numero: '', organizacao: '', categoria: 'OBRAS EM ANDAMENTO', aba: 'Geral / Sedes',
  documentos: {}, enderecos: {}, email: '', telefones: [], equipe: [], grupo_override: '', ordem: 0,
}

function ObraEditForm({ obra, onCancel, onSaved, onDeleted }: {
  obra: ObraRow
  onCancel: () => void
  onSaved: (o: ObraApi) => void
  onDeleted?: (o: ObraRow) => void
}) {
  const criando = obra.id == null
  const [f, setF] = useState<ObraRow>(() => ({ ...OBRA_VAZIA, ...obra }))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (patch: Partial<ObraRow>) => setF(prev => ({ ...prev, ...patch }))

  async function salvar() {
    if (!f.nome.trim()) { setErro('O nome da obra é obrigatório.'); return }
    setErro(null); setSalvando(true)
    const patch: ObraPatch = {
      nome: f.nome, numero: f.numero, organizacao: f.organizacao, email: f.email,
      categoria: f.categoria, aba: f.aba, grupo_override: f.grupo_override ?? '', ordem: f.ordem ?? 0,
      documentos: f.documentos, enderecos: f.enderecos, telefones: f.telefones, equipe: f.equipe,
    }
    const saved = criando ? await createObra(patch) : await updateObra(obra.id!, patch)
    setSalvando(false)
    if (!saved) { setErro('Não foi possível salvar. Verifique sua permissão de Administrador e tente de novo.'); return }
    onSaved(saved)
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      <div className="px-[28px] py-[20px] flex flex-col gap-[16px]">
        {/* Identidade */}
        <div className="grid grid-cols-2 gap-[10px]">
          <label className="col-span-2 flex flex-col gap-[4px]"><Rotulo>Nome da obra *</Rotulo><Input value={f.nome} onChange={v => set({ nome: v })} placeholder="Nome" /></label>
          <label className="flex flex-col gap-[4px]"><Rotulo>Número</Rotulo><Input value={f.numero} onChange={v => set({ numero: v })} /></label>
          <label className="flex flex-col gap-[4px]"><Rotulo>E-mail</Rotulo><Input value={f.email} onChange={v => set({ email: v })} /></label>
          <label className="col-span-2 flex flex-col gap-[4px]"><Rotulo>Razão social</Rotulo><Input value={f.organizacao} onChange={v => set({ organizacao: v })} /></label>
        </div>

        {/* Organização / layout */}
        <div className="rounded-[12px] border border-border bg-tile-bg/40 p-[12px] flex flex-col gap-[10px]">
          <div className="flex items-center gap-[7px]"><Building2 size={13} className="text-accent" /><span className="font-archivo font-semibold text-[11.5px] uppercase tracking-[0.05em] text-label">Organização na tela</span></div>
          <div className="grid grid-cols-2 gap-[10px]">
            <label className="flex flex-col gap-[4px]">
              <Rotulo>Grupo exibido</Rotulo>
              <select value={f.grupo_override || ''} onChange={e => set({ grupo_override: e.target.value })}
                className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover">
                <option value="">(usar categoria da planilha)</option>
                {GRUPO_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-[4px]"><Rotulo>Ordem no grupo</Rotulo><Input value={String(f.ordem ?? 0)} onChange={v => set({ ordem: Number(v.replace(/\D/g, '')) || 0 })} /></label>
            <label className="col-span-2 flex flex-col gap-[4px]">
              <Rotulo>Aba</Rotulo>
              <select value={f.aba || ''} onChange={e => set({ aba: e.target.value })}
                className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover">
                {ABAS.map(a => <option key={a} value={a}>{a}</option>)}
                {f.aba && !ABAS.includes(f.aba as typeof ABAS[number]) && <option value={f.aba}>{f.aba}</option>}
              </select>
            </label>
          </div>
        </div>

        <div className="flex flex-col gap-[6px]"><Rotulo>Documentos</Rotulo><MapaEditor obj={f.documentos} onChange={d => set({ documentos: d })} /></div>
        <div className="flex flex-col gap-[6px]"><Rotulo>Endereços</Rotulo><MapaEditor obj={f.enderecos} onChange={d => set({ enderecos: d })} /></div>
        <div className="flex flex-col gap-[6px]"><Rotulo>Telefones</Rotulo><TelefonesEditor tels={f.telefones} onChange={t => set({ telefones: t })} /></div>
        <div className="flex flex-col gap-[6px]"><Rotulo>Equipe de obra</Rotulo><EquipeEditor equipe={f.equipe} onChange={e => set({ equipe: e })} /></div>

        {erro && <div className="font-hanken text-[12.5px] text-accent bg-[rgba(174,58,35,0.08)] rounded-[9px] px-[12px] py-[9px]">{erro}</div>}

        <div className="flex items-center gap-[10px] pt-[4px]">
          <button onClick={salvar} disabled={salvando}
            className="inline-flex items-center gap-[6px] font-hanken font-medium text-[13px] text-white bg-accent rounded-[10px] px-[14px] py-[8px] border-none cursor-pointer hover:opacity-90 disabled:opacity-60">
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}{criando ? 'Criar obra' : 'Salvar alterações'}
          </button>
          <button onClick={onCancel} disabled={salvando}
            className="font-hanken font-medium text-[13px] text-text-muted bg-surface border border-border rounded-[10px] px-[14px] py-[8px] cursor-pointer hover:border-border-hover">
            Cancelar
          </button>
          {!criando && onDeleted && (
            <button onClick={() => onDeleted(obra)} disabled={salvando} title="Excluir obra"
              className="ml-auto inline-flex items-center gap-[6px] font-hanken font-medium text-[13px] text-accent bg-transparent border-none cursor-pointer hover:underline">
              <Trash2 size={14} /> Excluir
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Cartão da grade ──────────────────────────────────────────────────────────
// Modo de reordenação: o card vira "alça de arraste" inteira (onOpen fica
// desligado) — soltar sobre outro card do MESMO grupo troca a posição entre
// eles; ver handleDrop em ObrasPage (persiste `ordem` sequencial via PATCH).
function ObraCard({ obra, meta, onOpen, reordering, isDragOver, onDragStart, onDragOverCard, onDropCard, onDragEndCard }: {
  obra: ObraRow
  meta: CategoriaMeta
  onOpen: () => void
  reordering?: boolean
  isDragOver?: boolean
  onDragStart?: () => void
  onDragOverCard?: (e: React.DragEvent) => void
  onDropCard?: () => void
  onDragEndCard?: () => void
}) {
  const cnpj = obra.documentos['CNPJ'] || ''
  const tel = obra.telefones.filter(Boolean)[0] || ''
  const endereco = enderecoPrincipal(obra)
  const resp = responsavel(obra)
  const CatIcon = meta.Icon

  return (
    <button
      onClick={reordering ? undefined : onOpen}
      draggable={reordering}
      onDragStart={onDragStart}
      onDragOver={e => { e.preventDefault(); onDragOverCard?.(e) }}
      onDrop={e => { e.preventDefault(); onDropCard?.() }}
      onDragEnd={onDragEndCard}
      className={`group relative text-left flex flex-col bg-surface border rounded-[14px] p-[16px] transition-all duration-150 ease-out overflow-hidden ${
        reordering
          ? `cursor-grab active:cursor-grabbing ${isDragOver ? 'border-accent border-2' : 'border-border'}`
          : 'cursor-pointer border-border hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]'
      }`}
    >
      {reordering && (
        <div className="absolute top-[12px] right-[12px] text-text-faint">
          <GripVertical size={16} />
        </div>
      )}
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

// ── Gaveta lateral (detalhe ou edição) ────────────────────────────────────────
function ObraDrawer({ obra, canManage, onClose, onSaved, onDelete }: {
  obra: ObraRow
  canManage: boolean
  onClose: () => void
  onSaved: (o: ObraApi) => void
  onDelete: (o: ObraRow) => void
}) {
  const criando = obra.id == null && obra.nome === ''
  const [editando, setEditando] = useState(criando)
  // Edição só é possível em obra vinda da API (tem id). Fallback estático não edita.
  const podeEditar = canManage && (obra.id != null || criando)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !editando) onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, editando])

  return (
    <div className="absolute inset-0 z-[40] flex justify-end">
      <div className="absolute inset-0 bg-[rgba(22,20,18,0.35)] animate-ex-float" onClick={editando ? undefined : onClose} />
      <div
        className="relative w-[520px] max-w-[94%] h-full bg-surface border-l border-border flex flex-col shadow-card-hover"
        style={{ animation: 'exSlideIn 0.22s ease' }}
      >
        <style>{`@keyframes exSlideIn { from { transform: translateX(24px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }`}</style>

        <div className="flex items-start gap-[12px] px-[28px] py-[20px] border-b border-border flex-shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-[10px] mb-[6px]">
              {obra.numero && !editando && (
                <span className="inline-flex items-center gap-[3px] font-hanken font-semibold text-[12px] text-accent bg-[rgba(174,58,35,0.08)] rounded-[7px] px-[8px] py-[3px]">
                  <Hash size={11} strokeWidth={2.4} />{obra.numero}
                </span>
              )}
              <span className="font-hanken text-[11.5px] text-text-faint uppercase tracking-[0.05em] truncate">
                {editando ? (criando ? 'Nova obra' : 'Editando') : obra.aba}
              </span>
            </div>
            <h2 className="m-0 font-archivo font-semibold text-[19px] leading-[1.2] text-ink break-words">{obra.nome || 'Nova obra'}</h2>
            {!editando && obra.categoria && (() => {
              const meta = categoriaMeta(catEfetiva(obra))
              const CatIcon = meta.Icon
              return (
                <span className="inline-flex items-center gap-[4px] font-hanken font-semibold text-[10.5px] uppercase tracking-[0.04em] rounded-[5px] px-[7px] py-[3px] mt-[8px]" style={{ color: meta.color, background: meta.bg }}>
                  <CatIcon size={11} strokeWidth={2.4} />{meta.label}
                </span>
              )
            })()}
          </div>

          {podeEditar && !editando && (
            <button onClick={() => setEditando(true)} title="Editar obra"
              className="flex-shrink-0 inline-flex items-center gap-[5px] font-hanken font-medium text-[12.5px] text-accent bg-[rgba(174,58,35,0.08)] rounded-[9px] px-[10px] py-[6px] border-none cursor-pointer hover:bg-[rgba(174,58,35,0.14)]">
              <Pencil size={13} /> Editar
            </button>
          )}
          <button onClick={onClose} title="Fechar (Esc)"
            className="flex-shrink-0 inline-flex items-center justify-center w-[30px] h-[30px] rounded-[9px] border-none bg-tile-bg cursor-pointer text-text-muted hover:text-ink hover:bg-border transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {editando
          ? <ObraEditForm obra={obra} onCancel={() => (criando ? onClose() : setEditando(false))}
              onSaved={(o) => { if (!criando) setEditando(false); onSaved(o) }} onDeleted={onDelete} />
          : <ObraDetail obra={obra} />}
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export function ObrasPage({ onBack, canManage = false }: Props) {
  const [query, setQuery] = useState('')
  const [aba, setAba] = useState<'all' | typeof ABAS[number]>('all')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Modo de reordenação (arrastar): força busca/filtro neutros pra garantir
  // que cada grupo mostra todos os seus itens (senão a ordem sequencial
  // calculada no drop ignoraria os que estão escondidos pelo filtro).
  const [reordering, setReordering] = useState(false)
  const [salvandoOrdem, setSalvandoOrdem] = useState(false)
  const dragFrom = useRef<{ groupKey: string; index: number } | null>(null)
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)

  function toggleReordering() {
    setReordering(r => {
      if (!r) { setQuery(''); setAba('all'); setSelectedKey(null); setCreating(false) }
      return !r
    })
  }

  // Solta o card arrastado na posição de `targetIndex` dentro do mesmo grupo;
  // grava `ordem` sequencial (0,1,2…) só nos itens cuja posição mudou.
  async function handleDrop(groupKey: string, targetIndex: number, itens: ObraRow[]) {
    const from = dragFrom.current
    dragFrom.current = null
    setDragOverKey(null)
    if (!from || from.groupKey !== groupKey || from.index === targetIndex) return
    const reordenados = itens.slice()
    const [movido] = reordenados.splice(from.index, 1)
    reordenados.splice(targetIndex, 0, movido)
    const alteracoes = reordenados
      .map((o, idx) => ({ o, novaOrdem: idx }))
      .filter(({ o, novaOrdem }) => o.id != null && (o.ordem ?? 0) !== novaOrdem)
    if (alteracoes.length === 0) return
    setSalvandoOrdem(true)
    await Promise.all(alteracoes.map(({ o, novaOrdem }) => updateObra(o.id!, { ordem: novaOrdem })))
    const rows = await fetchObras()
    if (rows) setObras(rows)
    setSalvandoOrdem(false)
  }

  // Dados: começa com o fallback estático; substitui pela API quando responde.
  const [obras, setObras] = useState<ObraRow[]>(OBRAS as ObraRow[])
  const [fromApi, setFromApi] = useState(false)

  useEffect(() => {
    let cancel = false
    fetchObras().then(rows => {
      if (cancel || !rows) return
      setObras(rows)
      setFromApi(true)
    })
    return () => { cancel = true }
  }, [])

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    return obras.filter(o => {
      if (aba !== 'all' && o.aba !== aba) return false
      if (q && !haystack(o).includes(q)) return false
      return true
    })
  }, [obras, q, aba])

  const selected = creating
    ? OBRA_VAZIA
    : selectedKey ? obras.find(o => rowKey(o) === selectedKey) ?? null : null

  const abaCount = (a: typeof ABAS[number]) => obras.filter(o => o.aba === a).length
  const grupos = useMemo(() => agruparPorCategoria(results), [results])

  // Após salvar (criar/editar): recarrega a lista da API pra refletir a mudança.
  async function recarregar(selecionar?: ObraApi) {
    const rows = await fetchObras()
    if (rows) { setObras(rows); setFromApi(true) }
    setCreating(false)
    if (selecionar) setSelectedKey(`id:${selecionar.id}`)
  }

  async function excluir(o: ObraRow) {
    if (o.id == null) return
    if (!window.confirm(`Excluir a obra "${o.nome}"? Esta ação não pode ser desfeita.`)) return
    const ok = await deleteObra(o.id)
    if (ok) {
      setSelectedKey(null)
      const rows = await fetchObras()
      if (rows) setObras(rows)
    } else {
      window.alert('Não foi possível excluir. Verifique sua permissão de Administrador.')
    }
  }

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
        <span className="font-archivo font-semibold text-[14px] text-ink">Dados das Obras</span>
        {!fromApi && <span className="font-hanken text-[11px] text-text-faint bg-tile-bg rounded-[6px] px-[7px] py-[2px]">{OBRAS_REVISAO}</span>}
        {canManage && (
          <div className="ml-auto flex items-center gap-[8px]">
            {fromApi && (
              <button
                onClick={toggleReordering}
                title="Arraste os cards pra definir a ordem de exibição dentro de cada grupo"
                className={`inline-flex items-center gap-[6px] font-hanken font-medium text-[12.5px] rounded-[10px] px-[12px] py-[7px] border cursor-pointer transition-colors ${
                  reordering
                    ? 'bg-accent text-white border-accent hover:opacity-90'
                    : 'bg-surface text-text-muted border-border hover:border-border-hover'
                }`}
              >
                <ArrowUpDown size={14} /> {reordering ? 'Concluir reordenação' : 'Reordenar'}
              </button>
            )}
            <button
              onClick={() => { setCreating(true); setSelectedKey(null) }}
              disabled={!fromApi || reordering}
              title={fromApi ? 'Cadastrar nova obra' : 'Indisponível offline (dados de fallback)'}
              className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12.5px] text-white bg-accent rounded-[10px] px-[12px] py-[7px] border-none cursor-pointer hover:opacity-90 disabled:opacity-50"
            >
              <Plus size={14} /> Nova obra
            </button>
          </div>
        )}
      </div>

      {/* Toolbar: busca + filtros (substituída por uma dica enquanto reordena,
          pra garantir que cada grupo mostre todos os itens durante o arraste) */}
      {reordering ? (
        <div className="px-[24px] pt-[14px] pb-[14px] border-b border-border flex-shrink-0 bg-bg-app">
          <div className="max-w-[1760px] mx-auto flex items-center gap-[9px] font-hanken text-[13px] text-text-muted">
            <ArrowUpDown size={15} className="flex-shrink-0 text-accent" />
            Arraste os cards para definir a ordem de exibição dentro de cada grupo.
            {salvandoOrdem && (
              <span className="inline-flex items-center gap-[5px] text-accent">
                <Loader2 size={13} className="animate-spin" /> Salvando…
              </span>
            )}
          </div>
        </div>
      ) : (
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
                {results.length} de {obras.length} obras{!fromApi && ` · fonte ${OBRAS_REVISAO}`}
              </span>
            </div>

            {/* Filtros por aba */}
            <div className="flex flex-wrap gap-[7px] mt-[12px]">
              <FilterChip active={aba === 'all'} onClick={() => setAba('all')} label="Todas" count={obras.length} />
              {ABAS.map(a => (
                <FilterChip key={a} active={aba === a} onClick={() => setAba(a)} label={a} count={abaCount(a)} />
              ))}
            </div>
          </div>
        </div>
      )}

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
                  {g.itens.map((o, idx) => (
                    <ObraCard
                      key={rowKey(o)}
                      obra={o}
                      meta={g.meta}
                      onOpen={() => setSelectedKey(rowKey(o))}
                      reordering={reordering}
                      isDragOver={dragOverKey === `${g.key}:${idx}`}
                      onDragStart={() => { dragFrom.current = { groupKey: g.key, index: idx } }}
                      onDragOverCard={() => { if (dragFrom.current?.groupKey === g.key) setDragOverKey(`${g.key}:${idx}`) }}
                      onDropCard={() => handleDrop(g.key, idx, g.itens)}
                      onDragEndCard={() => { dragFrom.current = null; setDragOverKey(null) }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Gaveta de detalhe / edição */}
      {selected && (
        <ObraDrawer
          key={creating ? 'novo' : selectedKey ?? ''}
          obra={selected}
          canManage={canManage && fromApi}
          onClose={() => { setSelectedKey(null); setCreating(false) }}
          onSaved={(o) => recarregar(o)}
          onDelete={excluir}
        />
      )}
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
