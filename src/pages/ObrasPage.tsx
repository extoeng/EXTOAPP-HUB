import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Search, Building2, MapPin, FileText, Phone, Mail,
  Users, Copy, Check, Hash, Briefcase, X, ChevronRight,
  HardHat, Rocket, Hourglass, Wrench, CheckCircle2, Archive, Handshake,
  Pencil, Plus, Trash2, Save, Loader2, UserPlus, UserMinus,
} from 'lucide-react'
import {
  fetchObras, updateObra, fetchEquipeObra, criarAlocacaoObra, encerrarAlocacaoObra,
  buscarColaboradoresElegiveis,
  type Obra, type EquipeMembro, type ObraApi, type ObraPatch, type AlocacaoObra, type ColaboradorElegivel,
} from '../services/obras'

// dd/mm/aaaa a partir de um `YYYY-MM-DD` — `T00:00:00` evita o fuso horário
// jogar a data um dia pra trás.
function formatDataBr(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR')
}

interface Props {
  onBack: () => void
  /** Só quem tem a capability `manage` ("Administrador") no app `obras` vê o
   *  botão de editar. O backend é a barreira real (403 no PATCH sem ela). */
  canManage?: boolean
  /** Abre direto o card desta obra (ver `rowKey`) — usado pela busca global do Header. */
  initialSelectKey?: string
}

// Linha de obra usada na tela: o shape do `Obra` + os campos de organização/
// edição. Todos vêm da API — os campos abaixo de `id` são opcionais só por
// segurança de tipo (o estado inicial da página começa com lista vazia).
type ObraRow = Obra & {
  id?: string
  grupo_override?: string
  ordem?: number
  ativo?: boolean
  cno?: string
  ie?: string
  endereco_fatura?: string
  endereco_entrega?: string
  endereco_cobranca?: string
}

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

// Opções oferecidas no editor pro campo manual `categoria` (ObraInfo).
const CATEGORIA_OPTIONS = Object.entries(CATEGORIA_META).map(([value, meta]) => ({ value, label: meta.label }))

// Curadoria de exibição legada (usada só se `grupo_override` vier vazio).
// `grupo_override`/`ordem` só são ajustáveis via Django admin (`obras.ObraInfo`).
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
// Exportada pra App.tsx conseguir montar o mesmo link de "abrir direto" que a
// busca global usa (ver `initialSelectKey` abaixo).
export function rowKey(o: ObraRow): string {
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

        {obra.equipe.length > 0 && (
          <>
            <SectionTitle Icon={Users}>Equipe</SectionTitle>
            {obra.equipe.map((m, i) => (
              <div key={i} className="flex items-center gap-[9px] py-[7px] border-b border-border last:border-b-0">
                <div className="flex-shrink-0 w-[26px] h-[26px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[10.5px]">
                  {(m.nome[0] || '?').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-hanken font-medium text-[13px] text-ink truncate">{m.nome}</div>
                  <div className="font-hanken text-[11.5px] text-text-faint truncate">
                    {m.cargo || 'Sem cargo'}{m.telefone ? ` · ${m.telefone}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ── Editor dos campos manuais (sem fonte no Mega/API) ─────────────────────────
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

// Só os campos manuais de `ObraInfo` (ver `ObraPatch`/`ObraInfoUpdateSerializer`
// no NEXUS) — identidade (nome/fantasia/CNPJ, de `spe.Spe`) e equipe (de
// `spe.AlocacaoSpe`) ficam de fora de propósito, mesmo que apareçam na
// exibição/detalhe: corrigir no Mega ou no Painel Administrativo.
function ObraEditForm({ obra, onCancel, onSaved }: {
  obra: ObraRow
  onCancel: () => void
  onSaved: (o: ObraApi) => void
}) {
  const [f, setF] = useState(() => ({
    numero: obra.numero, categoria: obra.categoria, aba: obra.aba,
    cno: obra.cno ?? '', ie: obra.ie ?? '',
    endereco_fatura: obra.endereco_fatura ?? '', endereco_entrega: obra.endereco_entrega ?? '',
    endereco_cobranca: obra.endereco_cobranca ?? '', email: obra.email,
    telefones: obra.telefones, ativo: obra.ativo ?? true, ordem: obra.ordem ?? 0,
  }))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const set = (patch: Partial<typeof f>) => setF(prev => ({ ...prev, ...patch }))

  async function salvar() {
    if (obra.id == null) return
    setErro(null); setSalvando(true)
    const patch: ObraPatch = { ...f }
    const saved = await updateObra(obra.id, patch)
    setSalvando(false)
    if (!saved) { setErro('Não foi possível salvar. Verifique sua permissão de Administrador e tente de novo.'); return }
    onSaved(saved)
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
      <div className="px-[28px] py-[20px] flex flex-col gap-[16px]">
        <div className="rounded-[10px] bg-tile-bg/60 px-[12px] py-[9px] font-hanken text-[12px] text-text-muted leading-[1.5]">
          Nome, razão social, CNPJ e equipe vêm do Mega/Painel Administrativo e não são
          editáveis aqui — corrija na origem.
        </div>

        <div className="grid grid-cols-2 gap-[10px]">
          <label className="flex flex-col gap-[4px]"><Rotulo>Número</Rotulo><Input value={f.numero} onChange={v => set({ numero: v })} /></label>
          <label className="flex flex-col gap-[4px]">
            <Rotulo>Ativo em "Dados das Obras"</Rotulo>
            <select value={f.ativo ? '1' : '0'} onChange={e => set({ ativo: e.target.value === '1' })}
              className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover">
              <option value="1">Sim</option>
              <option value="0">Não</option>
            </select>
          </label>
          <label className="flex flex-col gap-[4px]">
            <Rotulo>Categoria</Rotulo>
            <select value={f.categoria} onChange={e => set({ categoria: e.target.value })}
              className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover">
              {CATEGORIA_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              {f.categoria && !CATEGORIA_OPTIONS.some(c => c.value === f.categoria) && <option value={f.categoria}>{f.categoria}</option>}
            </select>
          </label>
          <label className="flex flex-col gap-[4px]">
            <Rotulo>Aba</Rotulo>
            <select value={f.aba} onChange={e => set({ aba: e.target.value })}
              className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover">
              {ABAS.map(a => <option key={a} value={a}>{a}</option>)}
              {f.aba && !ABAS.includes(f.aba as typeof ABAS[number]) && <option value={f.aba}>{f.aba}</option>}
            </select>
          </label>
          <label className="flex flex-col gap-[4px]">
            <Rotulo>Ordem de exibição</Rotulo>
            <input
              type="number" value={f.ordem} onChange={e => set({ ordem: Number(e.target.value) || 0 })}
              className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover"
            />
          </label>
        </div>
        <div className="font-hanken text-[11px] text-text-faint -mt-[4px]">
          Define a posição do cartão dentro da aba/categoria — menor número aparece primeiro.
        </div>

        <div className="rounded-[12px] border border-border p-[12px] flex flex-col gap-[10px]">
          <div className="flex items-center gap-[7px]"><FileText size={13} className="text-accent" /><span className="font-archivo font-semibold text-[11.5px] uppercase tracking-[0.05em] text-label">Documentos (CNPJ vem do Mega, não editável aqui)</span></div>
          <div className="grid grid-cols-2 gap-[10px]">
            <label className="flex flex-col gap-[4px]"><Rotulo>CNO</Rotulo><Input value={f.cno} onChange={v => set({ cno: v })} /></label>
            <label className="flex flex-col gap-[4px]"><Rotulo>IE</Rotulo><Input value={f.ie} onChange={v => set({ ie: v })} /></label>
          </div>
        </div>

        <div className="flex flex-col gap-[6px]">
          <Rotulo>Endereços</Rotulo>
          <label className="flex flex-col gap-[4px] text-[11px] text-text-faint">Fatura<Input value={f.endereco_fatura} onChange={v => set({ endereco_fatura: v })} /></label>
          <label className="flex flex-col gap-[4px] text-[11px] text-text-faint">Entrega<Input value={f.endereco_entrega} onChange={v => set({ endereco_entrega: v })} /></label>
          <label className="flex flex-col gap-[4px] text-[11px] text-text-faint">Cobrança<Input value={f.endereco_cobranca} onChange={v => set({ endereco_cobranca: v })} /></label>
        </div>

        <label className="flex flex-col gap-[4px]"><Rotulo>E-mail</Rotulo><Input value={f.email} onChange={v => set({ email: v })} /></label>
        <div className="flex flex-col gap-[6px]"><Rotulo>Telefones</Rotulo><TelefonesEditor tels={f.telefones} onChange={t => set({ telefones: t })} /></div>

        {erro && <div className="font-hanken text-[12.5px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[9px] px-[12px] py-[9px]">{erro}</div>}

        <div className="flex items-center gap-[10px] pt-[4px]">
          <button onClick={salvar} disabled={salvando}
            className="inline-flex items-center gap-[6px] font-hanken font-medium text-[13px] text-white bg-accent rounded-[10px] px-[14px] py-[8px] border-none cursor-pointer hover:opacity-90 disabled:opacity-60">
            {salvando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Salvar alterações
          </button>
          <button onClick={onCancel} disabled={salvando}
            className="font-hanken font-medium text-[13px] text-text-muted bg-surface border border-border rounded-[10px] px-[14px] py-[8px] cursor-pointer hover:border-border-hover">
            Cancelar
          </button>
        </div>

        {obra.id != null && (
          <div className="pt-[8px] border-t border-border flex flex-col gap-[10px]">
            <SectionTitle Icon={Users}>Equipe da obra</SectionTitle>
            <EquipeObraTab speId={obra.id} podeGerenciar />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Equipe (mesma tabela `spe.AlocacaoSpe` da aba Equipe do painel-admin,
// exposta aqui sob a capability `obras` — ver services/obras.ts). Embutida
// dentro do próprio formulário de edição, sem aba separada — gerenciar
// equipe e editar os campos manuais são a mesma ação de "Editar" pro
// usuário. Alterações de equipe (adicionar/encerrar) aplicam na hora, sem
// depender do botão "Salvar alterações" (que só grava os campos manuais).
function EquipeObraTab({ speId, podeGerenciar }: { speId: string; podeGerenciar: boolean }) {
  const [equipe, setEquipe] = useState<AlocacaoObra[]>([])
  const [carregando, setCarregando] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancel = false
    setCarregando(true)
    fetchEquipeObra(speId).then(lista => {
      if (cancel) return
      setEquipe(lista)
      setCarregando(false)
    })
    return () => { cancel = true }
  }, [speId, tick])

  async function encerrar(a: AlocacaoObra) {
    const ok = await encerrarAlocacaoObra(a.id, new Date().toISOString().slice(0, 10))
    if (ok) setTick(t => t + 1)
  }

  return (
    <div className="flex flex-col gap-[10px]">
      {carregando ? (
        <div className="font-hanken text-[13px] text-text-faint">Carregando…</div>
      ) : equipe.length === 0 ? (
        <div className="rounded-[12px] border border-dashed border-border px-[14px] py-[16px] font-hanken text-[12.5px] text-text-faint text-center">
          Nenhum colaborador alocado nesta obra.
        </div>
      ) : (
        <ul className="flex flex-col gap-[8px]">
          {equipe.map(a => (
            <li key={a.id} className="flex items-center justify-between gap-[10px] bg-tile-bg rounded-[10px] px-[12px] py-[9px]">
              <div className="min-w-0">
                <div className="font-hanken font-medium text-[13.5px] text-ink truncate">{a.colaborador_nome}</div>
                <div className="font-hanken text-[11.5px] text-text-faint truncate">
                  {a.cargo || 'Sem cargo'} · desde {formatDataBr(a.data_inicio)}
                </div>
              </div>
              {podeGerenciar && (
                <button onClick={() => encerrar(a)} title="Remover da equipe"
                  className="flex-shrink-0 inline-flex items-center justify-center w-[28px] h-[28px] rounded-[8px] border-none bg-transparent cursor-pointer text-text-faint hover:text-accent hover:bg-border/60">
                  <UserMinus size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {podeGerenciar && <AdicionarNaEquipeObra speId={speId} onAdicionado={() => setTick(t => t + 1)} />}
    </div>
  )
}

function AdicionarNaEquipeObra({ speId, onAdicionado }: { speId: string; onAdicionado: () => void }) {
  const [busca, setBusca] = useState('')
  const [resultados, setResultados] = useState<ColaboradorElegivel[]>([])
  const [buscando, setBuscando] = useState(false)
  const [selecionado, setSelecionado] = useState<ColaboradorElegivel | null>(null)
  const [dataInicio, setDataInicio] = useState(() => new Date().toISOString().slice(0, 10))
  const [adicionando, setAdicionando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    if (selecionado || busca.trim().length < 2) { setResultados([]); return }
    let cancel = false
    setBuscando(true)
    const timer = setTimeout(() => {
      buscarColaboradoresElegiveis(busca)
        .then(r => { if (!cancel) setResultados(r) })
        .finally(() => { if (!cancel) setBuscando(false) })
    }, 300)
    return () => { cancel = true; clearTimeout(timer) }
  }, [busca, selecionado])

  async function adicionar() {
    if (!selecionado) return
    setErro(null); setAdicionando(true)
    const criado = await criarAlocacaoObra(speId, { vinculo_id: selecionado.vinculo_id, data_inicio: dataInicio })
    setAdicionando(false)
    if (!criado) { setErro('Não foi possível adicionar. Verifique sua permissão de Administrador.'); return }
    setSelecionado(null); setBusca('')
    onAdicionado()
  }

  return (
    <div className="border-t border-border pt-[14px] flex flex-col gap-[10px]">
      <label className="flex flex-col gap-[4px]">
        <Rotulo>Adicionar colaborador</Rotulo>
        <Input
          value={selecionado ? selecionado.nome : busca}
          onChange={v => { setSelecionado(null); setBusca(v) }}
          placeholder="Buscar por nome ou e-mail…"
        />
      </label>

      {!selecionado && busca.trim().length >= 2 && (
        <div className="flex flex-col gap-[4px] max-h-[140px] overflow-y-auto">
          {buscando ? (
            <div className="font-hanken text-[12.5px] text-text-faint px-[4px]">Buscando…</div>
          ) : resultados.length === 0 ? (
            <div className="font-hanken text-[12.5px] text-text-faint px-[4px]">Nenhum colaborador com vínculo ativo encontrado.</div>
          ) : resultados.map(c => (
            <button
              key={c.vinculo_id} type="button" onClick={() => setSelecionado(c)}
              className="text-left px-[10px] py-[6px] rounded-[8px] hover:bg-tile-bg bg-transparent border-none cursor-pointer font-hanken text-[13px] text-ink"
            >
              {c.nome} <span className="text-text-faint">— {c.email}{c.cargo ? ` · ${c.cargo}` : ''}</span>
            </button>
          ))}
        </div>
      )}

      {selecionado && (
        <div className="flex items-end gap-[10px]">
          <label className="flex flex-col gap-[4px] flex-1">
            <Rotulo>Alocado(a) desde</Rotulo>
            <input
              type="date" value={dataInicio} onChange={e => setDataInicio(e.target.value)}
              className="w-full font-hanken text-[13px] text-ink bg-surface border border-border rounded-[9px] px-[10px] py-[7px] outline-none focus:border-border-hover"
            />
          </label>
          <button onClick={adicionar} disabled={adicionando}
            className="inline-flex items-center gap-[6px] font-hanken font-medium text-[13px] text-white bg-accent rounded-[10px] px-[14px] py-[8px] border-none cursor-pointer hover:opacity-90 disabled:opacity-60">
            {adicionando ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Adicionar
          </button>
        </div>
      )}

      {erro && <div className="font-hanken text-[12.5px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[9px] px-[12px] py-[9px]">{erro}</div>}
    </div>
  )
}

// ── Cartão da grade ──────────────────────────────────────────────────────────
function ObraCard({ obra, meta, onOpen }: { obra: ObraRow; meta: CategoriaMeta; onOpen: () => void }) {
  const cnpj = obra.documentos['CNPJ'] || ''
  const tel = obra.telefones.filter(Boolean)[0] || ''
  const endereco = enderecoPrincipal(obra)
  const resp = responsavel(obra)
  const CatIcon = meta.Icon

  return (
    <button
      onClick={onOpen}
      className="group relative text-left flex flex-col bg-surface border rounded-[14px] p-[16px] transition-all duration-150 ease-out overflow-hidden cursor-pointer border-border hover:border-border-hover hover:shadow-chip-hover hover:-translate-y-[2px]"
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

// ── Gaveta lateral: detalhe (leitura) e edição (campos manuais + equipe,
// tudo junto por trás do botão "Editar") — mesmo princípio de trava da tela
// SPE do painel-admin, sem abas separadas. Nome/fantasia/CNPJ vêm do Mega,
// nunca editáveis aqui, mesmo com `manage` (o backend rejeita com 403 quem
// não tem `manage`, e o serializer de escrita nem aceita esses campos — ver
// `ObraInfoUpdateSerializer` no NEXUS). Sem criar/excluir obra: toda obra
// tem que se ligar a uma `spe.Spe` já existente (curadoria via Django
// admin/`import_obras_xls`).
function ObraDrawer({ obra, canManage, onClose, onSaved }: {
  obra: ObraRow
  canManage: boolean
  onClose: () => void
  onSaved: (o: ObraApi) => void
}) {
  const [editando, setEditando] = useState(false)
  const podeEditar = canManage && obra.id != null

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
              {obra.numero && (
                <span className="inline-flex items-center gap-[3px] font-hanken font-semibold text-[12px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[7px] px-[8px] py-[3px]">
                  <Hash size={11} strokeWidth={2.4} />{obra.numero}
                </span>
              )}
              <span className="font-hanken text-[11.5px] text-text-faint uppercase tracking-[0.05em] truncate">
                {editando ? 'Editando' : obra.aba}
              </span>
            </div>
            <h2 className="m-0 font-archivo font-semibold text-[19px] leading-[1.2] text-ink break-words">{obra.nome}</h2>
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
            <button onClick={() => setEditando(true)} title="Editar dados e equipe da obra"
              className="flex-shrink-0 inline-flex items-center gap-[5px] font-hanken font-medium text-[12.5px] text-accent bg-[rgba(179,28,28,0.08)] rounded-[9px] px-[10px] py-[6px] border-none cursor-pointer hover:bg-[rgba(179,28,28,0.14)]">
              <Pencil size={13} /> Editar
            </button>
          )}
          <button onClick={onClose} title="Fechar (Esc)"
            className="flex-shrink-0 inline-flex items-center justify-center w-[30px] h-[30px] rounded-[9px] border-none bg-tile-bg cursor-pointer text-text-muted hover:text-ink hover:bg-border transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {editando ? (
          <ObraEditForm obra={obra} onCancel={() => setEditando(false)}
            onSaved={(o) => { setEditando(false); onSaved(o) }} />
        ) : (
          <ObraDetail obra={obra} />
        )}
      </div>
    </div>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export function ObrasPage({ onBack, canManage = false, initialSelectKey }: Props) {
  const [query, setQuery] = useState('')
  const [aba, setAba] = useState<'all' | typeof ABAS[number]>('all')
  const [selectedKey, setSelectedKey] = useState<string | null>(initialSelectKey ?? null)

  // Dados: só da API (o espelho estático saiu do bundle — pentest E7).
  const [obras, setObras] = useState<ObraRow[]>([])
  const [revisao, setRevisao] = useState('')
  const [erro, setErro] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    let cancel = false
    fetchObras().then(r => {
      if (cancel) return
      setObras(r.obras)
      setRevisao(r.revisao)
      setErro(r.erro ?? null)
      setCarregando(false)
    })
    return () => { cancel = true }
  }, [])

  // Estado vazio: erro da API tem mensagem própria (nunca lista vazia calada).
  const vazioMsg =
    erro === 403 ? 'Você não tem acesso aos dados das obras.'
    : erro != null ? 'Dados das obras indisponíveis no momento.'
    : carregando ? 'Carregando…'
    : 'Nenhuma obra encontrada'

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    return obras.filter(o => {
      if (aba !== 'all' && o.aba !== aba) return false
      if (q && !haystack(o).includes(q)) return false
      return true
    })
  }, [obras, q, aba])

  const selected = selectedKey ? obras.find(o => rowKey(o) === selectedKey) ?? null : null

  const abaCount = (a: typeof ABAS[number]) => obras.filter(o => o.aba === a).length
  const grupos = useMemo(() => agruparPorCategoria(results), [results])

  // Depois de salvar: atualiza só a obra editada na lista local (sem
  // recarregar tudo — a resposta do PATCH já vem com o obra atualizada).
  function aplicarSalvo(atualizada: ObraApi) {
    setObras(prev => prev.map(o => o.id === atualizada.id ? atualizada : o))
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
        <span className="font-archivo font-semibold text-[20px] text-ink">Dados das Obras</span>
        {revisao && <span className="font-hanken text-[11px] text-text-faint bg-tile-bg rounded-[6px] px-[7px] py-[2px]">{revisao}</span>}
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
              {results.length} de {obras.length} obras{revisao && ` · fonte ${revisao}`}
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

      {/* Grade de cartões */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-[24px] py-[20px]" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[1760px] mx-auto">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Briefcase size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">{vazioMsg}</span>
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
                    <ObraCard
                      key={rowKey(o)}
                      obra={o}
                      meta={g.meta}
                      onOpen={() => setSelectedKey(rowKey(o))}
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
          key={selectedKey ?? ''}
          obra={selected}
          canManage={canManage}
          onClose={() => setSelectedKey(null)}
          onSaved={aplicarSalvo}
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
