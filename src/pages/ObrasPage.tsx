// Dados das Obras — cadastro manual (sem vínculo com SPE/Mega desde 2026-10).
// Quem tem `view` ("Padrão") ou `avancado` consulta (busca, filtros, copiar/
// ligar/WhatsApp/mapa, compartilhar) — a API já devolve só as obras do nível
// de cada um. Quem tem `manage` ("Administrador") também cria/edita tudo,
// duplica, ativa/desativa (nunca exclui), define o nível de cada obra,
// reordena obras, renomeia grupos e ordena abas, age em massa e importa/exporta
// a planilha no modelo da Suprimentos. O backend é a barreira real (403).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, Search, Briefcase, X, Hash, FileText, Phone, MapPin, Users, ChevronRight, ChevronDown,
  Plus, Upload, Download, EllipsisVertical, ListChecks, LayoutGrid, List, Eye, EyeOff, ArrowUpDown,
  Square, SquareCheck, FolderInput, Power, Loader2, Lock, Layers,
} from 'lucide-react'
import {
  acaoEmMassa, atualizarObra, exportarPlanilha, fetchObras, fetchOrdemAbas, mensagemErro, renomearGrupo, salvarOrdemAbas,
  type Obra, type ObraDados, type ResumoImportacao, type Visibilidade,
} from '../services/obras'
import {
  abasDe, casaBusca, categoriaMeta, dadosDaObra, enderecoPrincipal, enderecoResumo, formatarDataHora, guardar,
  indiceBusca, inputCls, ler, normalizar, obraVazia, responsavel, restricaoDeVisibilidade, rotuloAba, telHref, telefonePrincipal, type CategoriaMeta,
} from './obras/util'
import { Aviso, Botao, ConfirmDialog, CopyButton, Modal, Painel, QuemPodeVer, Selo, type Confirmacao } from './obras/ui'
import { ObraDetalhe } from './obras/ObraDetalhe'
import { ObraForm, type Sugestoes } from './obras/ObraForm'
import { ImportarModal } from './obras/ImportarModal'
import { OrganizarOrdem } from './obras/OrganizarOrdem'
import { GruposModal } from './obras/GruposModal'

interface Props {
  onBack: () => void
  /** Capability `manage` no app `obras`. */
  canManage?: boolean
  /** Abre direto o detalhe desta obra (ver `rowKey`) — busca global do Header. */
  initialSelectKey?: string
}

type PainelEstado =
  | { tipo: 'detalhe'; id: string }
  | { tipo: 'editar'; id: string }
  | { tipo: 'nova'; inicial: ObraDados }

type Grupo = { key: string; meta: CategoriaMeta; itens: Obra[] }

const PREF_MODO = 'obras:modo'

function ordenar(a: Obra, b: Obra) {
  return a.ordem - b.ordem || a.nome.localeCompare(b.nome, 'pt-BR')
}

/** Agrupa por categoria; grupos na ordem da 1ª obra de cada um (= ordem da planilha). */
function agrupar(obras: Obra[]): Grupo[] {
  const mapa = new Map<string, Obra[]>()
  for (const o of [...obras].sort(ordenar)) {
    if (!mapa.has(o.categoria)) mapa.set(o.categoria, [])
    mapa.get(o.categoria)!.push(o)
  }
  return [...mapa.entries()].map(([key, itens]) => ({ key, meta: categoriaMeta(key), itens }))
}

// ── Cartão ────────────────────────────────────────────────────────────────────
function ObraCard({ obra, meta, onOpen, selecionando, selecionada, onToggle }: {
  obra: Obra; meta: CategoriaMeta; onOpen: () => void
  selecionando: boolean; selecionada: boolean; onToggle: () => void
}) {
  const tel = telefonePrincipal(obra)
  const endereco = enderecoPrincipal(obra)
  const resp = responsavel(obra)
  const clique = selecionando ? onToggle : onOpen

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={clique}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); clique() } }}
      className={`group relative text-left flex flex-col bg-surface border rounded-[14px] p-[14px] sm:p-[16px] transition-all duration-150 ease-out overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[rgba(179,28,28,0.35)] ${
        selecionada ? 'border-accent ring-2 ring-[rgba(179,28,28,0.18)]' : 'border-border hover:border-border-hover hover:shadow-chip-hover sm:hover:-translate-y-[2px]'
      } ${obra.ativo ? '' : 'opacity-60'}`}
    >
      <div className="h-[4px] -mt-[14px] sm:-mt-[16px] -mx-[14px] sm:-mx-[16px] mb-[12px]" style={{ background: meta.color }} />

      <div className="flex items-start gap-[10px] mb-[9px]">
        {selecionando && (
          <span className="flex-shrink-0 mt-[1px] text-accent">
            {selecionada ? <SquareCheck size={20} /> : <Square size={20} className="text-text-faint" />}
          </span>
        )}
        {obra.numero && (
          <span className="flex-shrink-0 inline-flex items-center gap-[3px] font-hanken font-semibold text-[11.5px] rounded-[7px] px-[7px] py-[3px] mt-[1px]"
            style={{ color: meta.color, background: meta.bg }}>
            <Hash size={10} strokeWidth={2.6} />{obra.numero}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-archivo font-semibold text-[15px] leading-[1.25] text-ink line-clamp-2 break-words">{obra.nome}</div>
          <div className="font-hanken text-[12px] text-text-muted leading-[1.35] truncate">{obra.organizacao || '—'}</div>
        </div>
        {!selecionando && <ChevronRight size={16} strokeWidth={1.8} className="flex-shrink-0 text-text-faint sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mt-[2px]" />}
      </div>

      <div className="flex flex-wrap items-center gap-[5px] mb-[10px]">
        <Selo cor={meta.color} bg={meta.bg} Icon={meta.Icon}>{meta.label}</Selo>
        {!obra.ativo && <Selo cor="#6E6B67" bg="rgba(110,107,103,0.12)" Icon={EyeOff}>Inativa</Selo>}
        {restricaoDeVisibilidade(obra) && <Selo cor="#7A5C99" bg="rgba(122,92,153,0.12)" Icon={Lock}>{restricaoDeVisibilidade(obra)}</Selo>}
      </div>

      <div className="flex flex-col gap-[2px] pt-[8px] border-t border-border">
        <div className="flex items-center gap-[8px] min-h-[34px]">
          <FileText size={14} strokeWidth={1.8} className="flex-shrink-0 text-text-faint" />
          <span className="flex-1 font-hanken text-[13px] text-ink-soft tabular-nums truncate">
            {obra.cnpj || <span className="text-text-faint">sem CNPJ</span>}
          </span>
          {obra.cnpj && !selecionando && <CopyButton value={obra.cnpj} label="Copiar CNPJ" />}
        </div>
        <div className="flex items-center gap-[8px] min-h-[34px]">
          <Phone size={14} strokeWidth={1.8} className="flex-shrink-0 text-text-faint" />
          {tel && !selecionando ? (
            <a href={telHref(tel)} onClick={e => e.stopPropagation()} className="flex-1 font-hanken text-[13px] text-ink-soft no-underline hover:text-accent truncate">{tel}</a>
          ) : (
            <span className="flex-1 font-hanken text-[13px] text-ink-soft truncate">{tel || <span className="text-text-faint">—</span>}</span>
          )}
          {tel && !selecionando && <CopyButton value={tel} label="Copiar telefone" />}
        </div>
        <div className="flex items-center gap-[8px] min-h-[34px]" title={endereco}>
          <MapPin size={14} strokeWidth={1.8} className="flex-shrink-0 text-text-faint" />
          <span className="flex-1 font-hanken text-[13px] text-ink-soft truncate">
            {enderecoResumo(endereco) || <span className="text-text-faint">—</span>}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-[9px] mt-[8px] pt-[10px] border-t border-border">
        {resp ? (
          <>
            <div className="flex-shrink-0 w-[28px] h-[28px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[11px]">
              {(resp.nome[0] || '?').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-hanken font-medium text-[12.5px] text-ink truncate">{resp.nome}</div>
              <div className="font-hanken text-[11px] text-text-faint truncate">
                {resp.cargo || 'Responsável'}{obra.equipe.length > 1 ? ` · +${obra.equipe.length - 1} na equipe` : ''}
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-[9px] text-text-faint">
            <Users size={15} strokeWidth={1.7} />
            <span className="font-hanken text-[12px]">Sem equipe cadastrada</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Linha (modo lista, computador) ───────────────────────────────────────────
const COLS_LISTA = 'grid-cols-[28px_64px_minmax(180px,1.4fr)_minmax(150px,1fr)_150px_140px_minmax(160px,1fr)_minmax(130px,0.8fr)]'

function ObraLinha({ obra, onOpen, selecionando, selecionada, onToggle }: {
  obra: Obra; onOpen: () => void; selecionando: boolean; selecionada: boolean; onToggle: () => void
}) {
  const tel = telefonePrincipal(obra)
  const resp = responsavel(obra)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={selecionando ? onToggle : onOpen}
      onKeyDown={e => { if (e.key === 'Enter') (selecionando ? onToggle : onOpen)() }}
      className={`grid ${COLS_LISTA} items-center gap-[10px] px-[12px] min-h-[46px] border-b border-border last:border-b-0 cursor-pointer outline-none hover:bg-tile-bg/50 focus-visible:bg-tile-bg ${selecionada ? 'bg-[rgba(179,28,28,0.05)]' : ''} ${obra.ativo ? '' : 'opacity-60'}`}
    >
      <span className="text-accent">
        {selecionando ? (selecionada ? <SquareCheck size={17} /> : <Square size={17} className="text-text-faint" />) : null}
      </span>
      <span className="font-hanken font-semibold text-[12.5px] text-text-muted tabular-nums">{obra.numero || '—'}</span>
      <span className="min-w-0 font-hanken font-medium text-[13.5px] text-ink truncate" title={obra.nome}>
        {obra.nome}{!obra.ativo && <span className="ml-[6px] text-[11px] text-text-faint">(inativa)</span>}
        {restricaoDeVisibilidade(obra) && <Lock size={11} className="ml-[6px] inline text-[#7A5C99]" aria-label={restricaoDeVisibilidade(obra)!} />}
      </span>
      <span className="min-w-0 font-hanken text-[12.5px] text-text-muted truncate" title={obra.organizacao}>{obra.organizacao}</span>
      <span className="flex items-center min-w-0 font-hanken text-[12.5px] text-ink-soft tabular-nums">
        <span className="truncate">{obra.cnpj}</span>{obra.cnpj && !selecionando && <CopyButton value={obra.cnpj} size="sm" label="Copiar CNPJ" />}
      </span>
      <span className="flex items-center min-w-0 font-hanken text-[12.5px] text-ink-soft">
        <span className="truncate">{tel}</span>{tel && !selecionando && <CopyButton value={tel} size="sm" label="Copiar telefone" />}
      </span>
      <span className="min-w-0 font-hanken text-[12.5px] text-ink-soft truncate" title={enderecoPrincipal(obra)}>{enderecoResumo(enderecoPrincipal(obra))}</span>
      <span className="min-w-0 font-hanken text-[12.5px] text-ink-soft truncate">{resp ? `${resp.nome}${resp.cargo ? ` · ${resp.cargo}` : ''}` : ''}</span>
    </div>
  )
}

function CabecalhoGrupo({ g, recolhido, onToggle }: { g: Grupo; recolhido: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} aria-expanded={!recolhido}
      className="w-full flex items-center gap-[9px] mb-[12px] bg-transparent border-none p-0 cursor-pointer text-left">
      <span className="inline-flex items-center justify-center w-[26px] h-[26px] rounded-[7px] flex-shrink-0" style={{ background: g.meta.bg }}>
        <g.meta.Icon size={14} strokeWidth={2.2} style={{ color: g.meta.color }} />
      </span>
      <h4 className="m-0 font-archivo font-semibold text-[12.5px] tracking-[0.05em] uppercase truncate" style={{ color: g.meta.color }}>{g.meta.label}</h4>
      <span className="font-hanken text-[11.5px] text-text-faint flex-shrink-0">{g.itens.length}</span>
      <div className="flex-1 h-px" style={{ background: g.meta.bg }} />
      <ChevronDown size={16} className={`flex-shrink-0 text-text-faint transition-transform ${recolhido ? '-rotate-90' : ''}`} />
    </button>
  )
}

// ── Menu "⋯" ─────────────────────────────────────────────────────────────────
function Menu({ itens }: { itens: { label: string; Icon: React.ElementType; onClick: () => void; ativo?: boolean }[] }) {
  const [aberto, setAberto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!aberto) return
    const fora = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setAberto(false) }
    document.addEventListener('pointerdown', fora)
    return () => document.removeEventListener('pointerdown', fora)
  }, [aberto])
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setAberto(a => !a)} aria-label="Mais ações" aria-expanded={aberto}
        className="inline-flex items-center justify-center w-[40px] h-[40px] rounded-[10px] border border-border bg-surface cursor-pointer text-text-muted hover:text-ink">
        <EllipsisVertical size={18} />
      </button>
      {aberto && (
        <div className="absolute right-0 top-[46px] z-[50] min-w-[230px] bg-surface border border-border rounded-[12px] shadow-card-hover py-[6px] animate-ex-float">
          {itens.map(it => (
            <button key={it.label} type="button" onClick={() => { setAberto(false); it.onClick() }}
              className={`w-full flex items-center gap-[10px] px-[14px] py-[11px] bg-transparent border-none cursor-pointer text-left font-hanken text-[14px] hover:bg-tile-bg ${it.ativo ? 'text-accent' : 'text-ink-soft'}`}>
              <it.Icon size={16} />{it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Mover em massa ───────────────────────────────────────────────────────────
function MoverModal({ qtd, sugestoes, onClose, onConfirmar }: {
  qtd: number; sugestoes: Sugestoes; onClose: () => void; onConfirmar: (aba: string, categoria: string) => Promise<void>
}) {
  const [aba, setAba] = useState('')
  const [categoria, setCategoria] = useState('')
  const [rodando, setRodando] = useState(false)
  return (
    <Modal titulo={`Mover ${qtd} obra${qtd > 1 ? 's' : ''}`} onClose={rodando ? () => {} : onClose} largura={440}
      rodape={<>
        <Botao onClick={onClose} disabled={rodando}>Cancelar</Botao>
        <Botao variante="primario" Icon={FolderInput} carregando={rodando} disabled={!aba.trim() && !categoria.trim()}
          onClick={async () => { setRodando(true); await onConfirmar(aba.trim(), categoria.trim()); setRodando(false) }}>
          Mover
        </Botao>
      </>}>
      <div className="flex flex-col gap-[12px]">
        <p className="m-0 font-hanken text-[13px] text-text-muted">Preencha só o que quer mudar — campo vazio fica como está em cada obra.</p>
        <label className="flex flex-col gap-[5px]">
          <span className="font-hanken font-medium text-[12px] text-label">Aba</span>
          <input className={inputCls} list="mover-abas" value={aba} onChange={e => setAba(e.target.value)} placeholder="Escolha ou digite" />
          <datalist id="mover-abas">{sugestoes.abas.map(a => <option key={a} value={a}>{rotuloAba(a)}</option>)}</datalist>
        </label>
        <label className="flex flex-col gap-[5px]">
          <span className="font-hanken font-medium text-[12px] text-label">Categoria (seção)</span>
          <input className={inputCls} list="mover-categorias" value={categoria} onChange={e => setCategoria(e.target.value)} placeholder="Escolha ou digite" />
          <datalist id="mover-categorias">{sugestoes.categorias.map(c => <option key={c} value={c} />)}</datalist>
        </label>
      </div>
    </Modal>
  )
}

// ── Quem pode ver (reativar / em massa) ──────────────────────────────────────
function VisibilidadeModal({ titulo, aplicar, inicial, onClose, onConfirmar }: {
  titulo: string; aplicar: string; inicial: Visibilidade; onClose: () => void
  onConfirmar: (v: Visibilidade) => Promise<void>
}) {
  const [valor, setValor] = useState<Visibilidade>(inicial)
  const [rodando, setRodando] = useState(false)
  return (
    <Modal titulo={titulo} onClose={rodando ? () => {} : onClose} largura={440}
      rodape={<>
        <Botao onClick={onClose} disabled={rodando}>Cancelar</Botao>
        <Botao variante="primario" Icon={Lock} carregando={rodando}
          onClick={async () => { setRodando(true); await onConfirmar(valor); setRodando(false) }}>
          {aplicar}
        </Botao>
      </>}>
      <QuemPodeVer valor={valor} onChange={setValor} nome="modal" />
    </Modal>
  )
}

// ── Página ────────────────────────────────────────────────────────────────────
export function ObrasPage({ onBack, canManage = false, initialSelectKey }: Props) {
  const [obras, setObras] = useState<Obra[]>([])
  const [atualizadoEm, setAtualizadoEm] = useState('')
  const [erro, setErro] = useState<number | null>(null)
  const [carregando, setCarregando] = useState(true)

  const [query, setQuery] = useState('')
  const [aba, setAba] = useState<string>('todas')
  const [verInativas, setVerInativas] = useState(false)
  const [modo, setModo] = useState<'cartoes' | 'lista'>(() => (ler(PREF_MODO) === 'lista' ? 'lista' : 'cartoes'))
  const [recolhidos, setRecolhidos] = useState<Set<string>>(new Set())

  const [selecionando, setSelecionando] = useState(false)
  const [organizando, setOrganizando] = useState(false)
  const conteudoRef = useRef<HTMLDivElement>(null)
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())

  const [painel, setPainel] = useState<PainelEstado | null>(
    initialSelectKey?.startsWith('id:') ? { tipo: 'detalhe', id: initialSelectKey.slice(3) } : null,
  )
  const [importando, setImportando] = useState(false)
  const [movendo, setMovendo] = useState(false)
  const [visibilidade, setVisibilidade] = useState<
    | { modo: 'reativar'; obra: Obra }
    | { modo: 'ativar-massa' }
    | { modo: 'definir-massa' }
    | null
  >(null)
  const [gerindoGrupos, setGerindoGrupos] = useState(false)
  const [ordemAbas, setOrdemAbas] = useState<string[]>([])
  const [exportando, setExportando] = useState(false)
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const [aviso, setAviso] = useState<{ texto: string; erro?: boolean } | null>(null)

  const avisar = useCallback((texto: string, erro?: boolean) => setAviso({ texto, erro }), [])
  const fecharAviso = useCallback(() => setAviso(null), [])

  const carregar = useCallback(async () => {
    const [r, ordem] = await Promise.all([fetchObras(), fetchOrdemAbas()])
    setOrdemAbas(ordem)
    setObras(r.obras)
    setAtualizadoEm(r.atualizadoEm)
    setErro(r.erro ?? null)
    setCarregando(false)
  }, [])

  useEffect(() => { void carregar() }, [carregar])

  // Busca global abriu uma obra que não existe (ou está oculta): fecha.
  useEffect(() => {
    if (!carregando && painel && painel.tipo !== 'nova' && !obras.some(o => o.id === painel.id)) setPainel(null)
  }, [carregando, obras, painel])

  const mudarModo = (m: 'cartoes' | 'lista') => { setModo(m); guardar(PREF_MODO, m) }

  const visiveis = useMemo(() => obras.filter(o => o.ativo || verInativas), [obras, verInativas])
  const indices = useMemo(() => new Map(obras.map(o => [o.id, indiceBusca(o)])), [obras])
  const termos = useMemo(() => normalizar(query).split(/\s+/).filter(Boolean), [query])

  const resultados = useMemo(() => visiveis.filter(o =>
    (aba === 'todas' || o.aba === aba) && (termos.length === 0 || casaBusca(indices.get(o.id)!, termos)),
  ), [visiveis, aba, termos, indices])

  const grupos = useMemo(() => agrupar(resultados), [resultados])
  const abas = useMemo(() => abasDe(visiveis, ordemAbas), [visiveis, ordemAbas])
  const contagemAba = useMemo(() => {
    const m = new Map<string, number>()
    for (const o of visiveis) m.set(o.aba, (m.get(o.aba) ?? 0) + 1)
    return m
  }, [visiveis])
  const inativasQtd = useMemo(() => obras.filter(o => !o.ativo).length, [obras])

  const sugestoes: Sugestoes = useMemo(() => ({
    abas: abasDe(obras, ordemAbas),
    categorias: agrupar(obras).map(g => g.key).filter(Boolean),
    cargos: [...new Set(obras.flatMap(o => o.equipe.map(m => m.cargo)).filter(Boolean))].sort(),
  }), [obras, ordemAbas])

  // Se a aba filtrada sumiu (ex. depois de mover/importar), volta pra "Todas".
  useEffect(() => { if (aba !== 'todas' && !abas.includes(aba)) setAba('todas') }, [aba, abas])

  const obraDoPainel = painel && painel.tipo !== 'nova' ? obras.find(o => o.id === painel.id) ?? null : null

  // ── Ações ──────────────────────────────────────────────────────────────────
  function aplicarObra(obra: Obra) {
    setObras(prev => prev.some(o => o.id === obra.id) ? prev.map(o => (o.id === obra.id ? obra : o)) : [...prev, obra])
  }

  function alternarAtivo(obra: Obra) {
    // Reativar pede quem pode ver a obra (modal); desativar só confirma.
    if (!obra.ativo) { setVisibilidade({ modo: 'reativar', obra }); return }
    setConfirmacao({
      titulo: 'Desativar obra?',
      mensagem: <>“{obra.nome}” deixa de aparecer pra quem não é Administrador. Dá pra reativar quando quiser.</>,
      confirmar: 'Desativar',
      onConfirmar: async () => {
        const r = await atualizarObra(obra.id, { ativo: false })
        if (!r.ok) { avisar(mensagemErro(r.erros), true); return }
        aplicarObra(r.data)
        if (!verInativas) setVerInativas(true)
        avisar('Obra desativada')
      },
    })
  }

  async function reativar(obra: Obra, v: Visibilidade) {
    const r = await atualizarObra(obra.id, { ativo: true, ...v })
    if (!r.ok) { avisar(mensagemErro(r.erros), true); return }
    aplicarObra(r.data)
    setVisibilidade(null)
    avisar('Obra reativada')
  }

  function toggleSel(id: string) {
    setSelecionados(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  function sairSelecao() { setSelecionando(false); setSelecionados(new Set()) }

  function organizar() {
    sairSelecao()
    setQuery('')
    setOrganizando(true)
    conteudoRef.current?.scrollTo({ top: 0 })
  }

  async function emMassa(acao: Parameters<typeof acaoEmMassa>[1], sucesso: string) {
    const ids = [...selecionados]
    const r = await acaoEmMassa(ids, acao)
    if (!r.ok) { avisar(mensagemErro(r.erros), true); return }
    await carregar()
    if (acao.acao === 'desativar' && !verInativas) setVerInativas(true)
    sairSelecao()
    avisar(sucesso.replace('{n}', String(r.data.afetadas)))
  }

  /** Devolve a mensagem de erro (ou null se deu certo) pro modal de grupos. */
  async function renomear(tipo: 'aba' | 'categoria', de: string, para: string): Promise<string | null> {
    const r = await renomearGrupo(tipo, de, para)
    if (!r.ok) return mensagemErro(r.erros)
    if (tipo === 'aba' && aba === de) setAba(para)
    await carregar()
    avisar(`${tipo === 'aba' ? 'Aba' : 'Categoria'} renomeada em ${r.data.afetadas} obra${r.data.afetadas === 1 ? '' : 's'}`)
    return null
  }

  async function ordenarAbas(nomes: string[]): Promise<string | null> {
    const r = await salvarOrdemAbas(nomes)
    if (!r.ok) return mensagemErro(r.erros)
    setOrdemAbas(r.data)
    avisar('Ordem das abas salva')
    return null
  }

  async function exportar() {
    setExportando(true)
    const r = await exportarPlanilha(verInativas)
    setExportando(false)
    if (!r.ok) avisar(mensagemErro(r.erros), true)
    else avisar(verInativas ? 'Planilha exportada (com inativas)' : 'Planilha exportada')
  }

  function importado(resumo: ResumoImportacao) {
    setImportando(false)
    void carregar()
    avisar(`Importação concluída: ${resumo.novas.length} novas, ${resumo.atualizadas.length} atualizadas`)
  }

  const novaObra = (parcial?: Partial<ObraDados>) => setPainel({
    tipo: 'nova',
    inicial: obraVazia({ aba: aba !== 'todas' ? aba : '', ...parcial }),
  })

  // ── Render ─────────────────────────────────────────────────────────────────
  const vazioMsg =
    erro === 403 ? 'Você não tem acesso aos dados das obras.'
    : erro != null ? 'Dados das obras indisponíveis no momento.'
    : carregando ? 'Carregando…'
    : obras.length === 0 ? (canManage ? 'Nenhuma obra cadastrada ainda. Crie uma ou importe a planilha.' : 'Nenhuma obra cadastrada.')
    : 'Nenhuma obra encontrada'

  const todosVisiveisSelecionados = resultados.length > 0 && resultados.every(o => selecionados.has(o.id))

  const itensMenu = [
    ...(canManage ? [
      { label: 'Importar planilha', Icon: Upload, onClick: () => setImportando(true) },
      { label: exportando ? 'Exportando…' : 'Exportar planilha', Icon: Download, onClick: () => { if (!exportando) void exportar() } },
      { label: 'Organizar ordem', Icon: ArrowUpDown, onClick: organizar },
      { label: 'Abas e categorias', Icon: Layers, onClick: () => setGerindoGrupos(true) },
      { label: 'Selecionar várias', Icon: ListChecks, onClick: () => { setOrganizando(false); setSelecionando(true) } },
      { label: verInativas ? 'Ocultar inativas' : `Mostrar inativas${inativasQtd ? ` (${inativasQtd})` : ''}`, Icon: verInativas ? EyeOff : Eye, onClick: () => setVerInativas(v => !v), ativo: verInativas },
    ] : []),
  ]

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      {/* Topo */}
      <div className="flex items-center gap-[10px] sm:gap-[14px] px-[14px] sm:px-[24px] py-[12px] sm:py-[14px] border-b border-border flex-shrink-0">
        <button onClick={onBack} aria-label="Voltar"
          className="inline-flex items-center gap-[6px] border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-text-muted hover:text-ink transition-colors p-[6px] -ml-[6px] rounded-[8px]">
          <ArrowLeft size={17} strokeWidth={2} />
          <span className="hidden sm:inline">Voltar</span>
        </button>
        <span className="hidden sm:inline text-border">|</span>
        <div className="flex-1 min-w-0">
          <div className="font-archivo font-semibold text-[18px] sm:text-[20px] text-ink truncate">Dados das Obras</div>
          {atualizadoEm && <div className="font-hanken text-[11px] text-text-faint sm:hidden">Atualizado em {formatarDataHora(atualizadoEm)}</div>}
        </div>
        {atualizadoEm && <span className="hidden sm:inline font-hanken text-[11.5px] text-text-faint whitespace-nowrap">Atualizado em {formatarDataHora(atualizadoEm)}</span>}
        {canManage && (
          <>
            <div className="hidden lg:flex items-center gap-[8px]">
              <Botao Icon={Upload} onClick={() => setImportando(true)}>Importar</Botao>
              <Botao Icon={Download} onClick={exportar} carregando={exportando}>Exportar</Botao>
              <Botao variante="primario" Icon={Plus} onClick={() => novaObra()}>Nova obra</Botao>
            </div>
            <div className="lg:hidden"><Menu itens={itensMenu} /></div>
          </>
        )}
      </div>

      {/* Busca + filtros */}
      <div className="px-[14px] sm:px-[24px] pt-[12px] pb-[10px] border-b border-border flex-shrink-0 bg-bg-app">
        <div className="max-w-[1760px] mx-auto flex flex-col gap-[10px]">
          <div className="flex items-center gap-[8px]">
            <div className="relative flex-1 min-w-0">
              <Search size={16} strokeWidth={1.8} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                disabled={organizando}
                type="search"
                enterKeyHint="search"
                placeholder={organizando ? 'Busca desligada enquanto organiza a ordem' : 'Buscar obra, nº, CNPJ, endereço, pessoa…'}
                className="w-full font-hanken text-[15px] sm:text-[13.5px] text-ink bg-surface border border-border rounded-[11px] pl-[38px] pr-[38px] py-[10px] outline-none focus:border-border-hover transition-colors placeholder:text-text-faint [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button onClick={() => setQuery('')} aria-label="Limpar busca"
                  className="absolute right-[6px] top-1/2 -translate-y-1/2 inline-flex items-center justify-center w-[30px] h-[30px] rounded-full border-none bg-transparent cursor-pointer text-text-faint hover:text-ink">
                  <X size={15} strokeWidth={2} />
                </button>
              )}
            </div>
            <div className="hidden md:flex items-center rounded-[10px] border border-border bg-surface p-[3px]">
              {([['cartoes', LayoutGrid, 'Cartões'], ['lista', List, 'Lista']] as const).map(([m, Icon, rot]) => (
                <button key={m} type="button" onClick={() => mudarModo(m)} title={rot} aria-pressed={modo === m}
                  className={`inline-flex items-center gap-[5px] px-[9px] py-[5px] rounded-[7px] border-none cursor-pointer font-hanken text-[12.5px] ${modo === m ? 'bg-tile-bg text-ink' : 'bg-transparent text-text-faint hover:text-ink'}`}>
                  <Icon size={14} />{rot}
                </button>
              ))}
            </div>
            {canManage && (
              <div className="hidden lg:flex items-center gap-[8px]">
                <Botao variante={verInativas ? 'perigo' : 'secundario'} Icon={verInativas ? Eye : EyeOff} onClick={() => setVerInativas(v => !v)}
                  title={verInativas ? 'Ocultar obras inativas' : 'Mostrar obras inativas'}>
                  Inativas{inativasQtd ? ` (${inativasQtd})` : ''}
                </Botao>
                <Botao Icon={ArrowUpDown} onClick={organizar} disabled={organizando}>Organizar ordem</Botao>
                <Botao Icon={Layers} onClick={() => setGerindoGrupos(true)} disabled={organizando}>Abas e categorias</Botao>
                <Botao variante={selecionando ? 'perigo' : 'secundario'} Icon={ListChecks} disabled={organizando} onClick={() => (selecionando ? sairSelecao() : setSelecionando(true))}>
                  {selecionando ? 'Cancelar seleção' : 'Selecionar'}
                </Botao>
              </div>
            )}
          </div>

          <div className="flex items-center gap-[7px] overflow-x-auto sm:flex-wrap -mx-[14px] px-[14px] sm:mx-0 sm:px-0 pb-[2px] [scrollbar-width:none]">
            <FilterChip active={aba === 'todas'} onClick={() => setAba('todas')} label="Todas" count={visiveis.length} />
            {abas.map(a => (
              <FilterChip key={a} active={aba === a} onClick={() => setAba(a)} label={rotuloAba(a)} count={contagemAba.get(a) ?? 0} />
            ))}
            <span className="ml-auto pl-[8px] font-hanken text-[12px] text-text-muted whitespace-nowrap flex-shrink-0">
              {resultados.length} de {visiveis.length}
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div ref={conteudoRef} className="flex-1 overflow-y-auto overscroll-contain px-[14px] sm:px-[24px] py-[16px] sm:py-[20px] pb-[110px]">
        <div className="max-w-[1760px] mx-auto">
          {organizando && canManage ? (
            <OrganizarOrdem
              key={`${aba}|${verInativas}`}
              obras={visiveis.filter(o => aba === 'todas' || o.aba === aba)}
              aba={aba}
              scrollRef={conteudoRef}
              onSair={() => setOrganizando(false)}
              onSalvo={atualizadas => {
                setObras(prev => prev.map(o => atualizadas.find(n => n.id === o.id) ?? o))
                setOrganizando(false)
              }}
              avisar={avisar}
            />
          ) : carregando ? (
            <div className="flex items-center justify-center gap-[10px] py-[80px] text-text-faint font-hanken text-[14px]">
              <Loader2 size={18} className="animate-spin" /> Carregando…
            </div>
          ) : resultados.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[70px] text-center text-text-faint px-[20px]">
              <Briefcase size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">{vazioMsg}</span>
              {query && (
                <button onClick={() => setQuery('')} className="font-hanken text-[13px] text-accent border-none bg-transparent cursor-pointer hover:underline">Limpar busca</button>
              )}
              {canManage && obras.length === 0 && erro == null && (
                <div className="flex flex-wrap justify-center gap-[8px] mt-[6px]">
                  <Botao Icon={Upload} onClick={() => setImportando(true)}>Importar planilha</Botao>
                  <Botao variante="primario" Icon={Plus} onClick={() => novaObra()}>Nova obra</Botao>
                </div>
              )}
            </div>
          ) : (
            <>
              {selecionando && (
                <div className="flex items-center gap-[10px] mb-[14px] font-hanken text-[13px] text-text-muted">
                  <button type="button" onClick={() => setSelecionados(todosVisiveisSelecionados ? new Set() : new Set(resultados.map(o => o.id)))}
                    className="inline-flex items-center gap-[6px] bg-transparent border-none p-0 cursor-pointer font-hanken text-[13px] text-accent">
                    {todosVisiveisSelecionados ? <SquareCheck size={17} /> : <Square size={17} />}
                    {todosVisiveisSelecionados ? 'Desmarcar todas' : `Marcar as ${resultados.length} visíveis`}
                  </button>
                  <span>· toque nas obras para marcar</span>
                </div>
              )}
              {grupos.map(g => {
                const recolhido = recolhidos.has(g.key) && termos.length === 0
                return (
                  <div key={g.key} className="mb-[26px] last:mb-0">
                    {(grupos.length > 1 || recolhidos.has(g.key)) && (
                      <CabecalhoGrupo g={g} recolhido={recolhido} onToggle={() => setRecolhidos(prev => {
                        const n = new Set(prev); if (n.has(g.key)) n.delete(g.key); else n.add(g.key); return n
                      })} />
                    )}
                    {!recolhido && (modo === 'lista' ? (
                      <div className="hidden md:block bg-surface border border-border rounded-[14px] overflow-x-auto">
                        <div className="min-w-[1080px]">
                          <div className={`grid ${COLS_LISTA} gap-[10px] px-[12px] py-[8px] border-b border-border bg-tile-bg/50 font-hanken font-semibold text-[11px] uppercase tracking-[0.04em] text-label`}>
                            <span /><span>Nº</span><span>Obra</span><span>Organização</span><span>CNPJ</span><span>Telefone</span><span>Endereço</span><span>Responsável</span>
                          </div>
                          {g.itens.map(o => (
                            <ObraLinha key={o.id} obra={o} onOpen={() => setPainel({ tipo: 'detalhe', id: o.id })}
                              selecionando={selecionando} selecionada={selecionados.has(o.id)} onToggle={() => toggleSel(o.id)} />
                          ))}
                        </div>
                      </div>
                    ) : null)}
                    {!recolhido && (
                      <div className={`grid gap-[12px] sm:gap-[16px] ${modo === 'lista' ? 'md:hidden' : ''}`}
                        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))' }}>
                        {g.itens.map(o => (
                          <ObraCard key={o.id} obra={o} meta={g.meta} onOpen={() => setPainel({ tipo: 'detalhe', id: o.id })}
                            selecionando={selecionando} selecionada={selecionados.has(o.id)} onToggle={() => toggleSel(o.id)} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      </div>

      {/* Botão flutuante "Nova obra" (celular/tablet) */}
      {canManage && !selecionando && !organizando && (
        <button type="button" onClick={() => novaObra()} aria-label="Nova obra"
          className="lg:hidden fixed right-[18px] bottom-[calc(20px+env(safe-area-inset-bottom))] z-[40] inline-flex items-center gap-[8px] h-[52px] pl-[18px] pr-[20px] rounded-full bg-accent text-white border-none shadow-toast cursor-pointer font-hanken font-semibold text-[14px] active:scale-95 transition-transform">
          <Plus size={20} /> Nova obra
        </button>
      )}

      {/* Barra de ações em massa */}
      {selecionando && (
        <div className="fixed left-0 right-0 bottom-0 z-[45] flex justify-center px-[10px] pb-[max(10px,env(safe-area-inset-bottom))] pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[760px] bg-ink text-white rounded-[16px] shadow-toast px-[12px] py-[10px] flex flex-wrap items-center gap-[8px]">
            <span className="font-hanken font-semibold text-[13.5px] px-[4px] mr-auto">
              {selecionados.size} selecionada{selecionados.size === 1 ? '' : 's'}
            </span>
            {([
              ['Mover', FolderInput, () => setMovendo(true)],
              ['Ativar', Power, () => setVisibilidade({ modo: 'ativar-massa' })],
              ['Desativar', EyeOff, () => void emMassa({ acao: 'desativar' }, '{n} obra(s) desativada(s)')],
              ['Quem vê', Lock, () => setVisibilidade({ modo: 'definir-massa' })],
            ] as const).map(([rot, Icon, fn]) => (
              <button key={rot} type="button" disabled={selecionados.size === 0} onClick={fn}
                className="inline-flex items-center gap-[6px] min-h-[38px] px-[11px] rounded-[10px] border border-white/20 bg-white/10 hover:bg-white/20 text-white cursor-pointer font-hanken font-medium text-[13px] disabled:opacity-40 disabled:cursor-default">
                <Icon size={15} />{rot}
              </button>
            ))}
            <button type="button" onClick={sairSelecao} aria-label="Cancelar seleção"
              className="inline-flex items-center justify-center w-[38px] h-[38px] rounded-[10px] border-none bg-transparent text-white/80 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Painel: detalhe / edição / nova */}
      {painel && (painel.tipo === 'nova' || obraDoPainel) && (
        <Painel
          onClose={() => setPainel(null)}
          bloquearFechar={painel.tipo !== 'detalhe'}
          largura={painel.tipo === 'detalhe' ? 540 : 680}
        >
          {painel.tipo === 'detalhe' && obraDoPainel ? (
            <ObraDetalhe
              obra={obraDoPainel}
              canManage={canManage}
              onClose={() => setPainel(null)}
              onEditar={() => setPainel({ tipo: 'editar', id: obraDoPainel.id })}
              onDuplicar={() => novaObra({ ...dadosDaObra(obraDoPainel), nome: `${obraDoPainel.nome} (cópia)`, ordem: obraDoPainel.ordem + 1 })}
              onAlternarAtivo={() => alternarAtivo(obraDoPainel)}
              avisar={avisar}
            />
          ) : (
            <ObraForm
              key={painel.tipo === 'nova' ? 'nova' : painel.id}
              obraId={painel.tipo === 'editar' ? painel.id : undefined}
              inicial={painel.tipo === 'nova' ? painel.inicial : dadosDaObra(obraDoPainel!)}
              sugestoes={sugestoes}
              onCancel={() => setPainel(painel.tipo === 'editar' ? { tipo: 'detalhe', id: painel.id } : null)}
              onSalvo={(obra, criada) => {
                aplicarObra(obra)
                setPainel({ tipo: 'detalhe', id: obra.id })
                if (!obra.ativo && !verInativas) setVerInativas(true)
                avisar(criada ? 'Obra criada' : 'Alterações salvas')
              }}
            />
          )}
        </Painel>
      )}

      {importando && <ImportarModal totalAtual={obras.length} onClose={() => setImportando(false)} onImportado={importado} />}
      {movendo && (
        <MoverModal qtd={selecionados.size} sugestoes={sugestoes} onClose={() => setMovendo(false)}
          onConfirmar={async (novaAba, categoria) => {
            await emMassa({ acao: 'mover', ...(novaAba ? { aba: novaAba } : {}), ...(categoria ? { categoria } : {}) }, '{n} obra(s) movida(s)')
            setMovendo(false)
          }} />
      )}
      {visibilidade?.modo === 'reativar' && (
        <VisibilidadeModal titulo="Reativar obra" aplicar="Reativar" onClose={() => setVisibilidade(null)}
          inicial={{ visivel_padrao: visibilidade.obra.visivel_padrao, visivel_avancado: visibilidade.obra.visivel_avancado }}
          onConfirmar={v => reativar(visibilidade.obra, v)} />
      )}
      {visibilidade && visibilidade.modo !== 'reativar' && (
        <VisibilidadeModal
          titulo={visibilidade.modo === 'ativar-massa' ? `Ativar ${selecionados.size} obra${selecionados.size === 1 ? '' : 's'}` : `Quem vê ${selecionados.size} obra${selecionados.size === 1 ? '' : 's'}`}
          aplicar={visibilidade.modo === 'ativar-massa' ? 'Ativar' : 'Aplicar'}
          inicial={{ visivel_padrao: true, visivel_avancado: true }}
          onClose={() => setVisibilidade(null)}
          onConfirmar={async v => {
            const ativar = visibilidade.modo === 'ativar-massa'
            await emMassa({ acao: ativar ? 'ativar' : 'visibilidade', ...v }, ativar ? '{n} obra(s) ativada(s)' : 'Visibilidade de {n} obra(s) atualizada')
            setVisibilidade(null)
          }} />
      )}
      {gerindoGrupos && (
        <GruposModal
          abas={abasDe(obras, ordemAbas)}
          contagemAbas={obras.reduce((m, o) => m.set(o.aba, (m.get(o.aba) ?? 0) + 1), new Map<string, number>())}
          categorias={agrupar(obras).map(g => ({ nome: g.key, qtd: g.itens.length }))}
          onClose={() => setGerindoGrupos(false)}
          onRenomear={renomear}
          onSalvarOrdem={ordenarAbas}
        />
      )}
      {confirmacao && <ConfirmDialog conf={confirmacao} onClose={() => setConfirmacao(null)} />}
      {aviso && <Aviso texto={aviso.texto} erro={aviso.erro} onFim={fecharAviso} />}
    </div>
  )
}

function FilterChip({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 inline-flex items-center gap-[6px] font-hanken font-medium text-[12.5px] rounded-[9px] px-[12px] min-h-[34px] cursor-pointer border transition-colors duration-150 whitespace-nowrap ${
        active ? 'bg-accent text-white border-accent' : 'bg-surface text-text-muted border-border hover:border-border-hover'
      }`}
    >
      {label}
      <span className={active ? 'text-white/70' : 'text-text-faint'}>{count}</span>
    </button>
  )
}
