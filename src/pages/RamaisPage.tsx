import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Search, X, Phone, Mail, Smartphone, Building2, Plus,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { RAMAIS, type RamalEntry } from '../data/ramais'

interface Props {
  onBack: () => void
}

interface Pessoa {
  id: string
  nome: string
  ramal: string
}

// departamento -> ids das pessoas, na ordem em que aparecem no card.
type PessoasPorDepto = Record<string, string[]>

interface EstadoPessoas {
  pessoas: Record<string, Pessoa>
  porDepto: PessoasPorDepto
}

const NUM_COLS = 3
// Guarda a organização (coluna + ordem) que o usuário escolheu pros cards de
// departamento — sem isso, toda visita voltaria pra ordem automática.
const LAYOUT_STORAGE_KEY = 'exto_ramais_layout'
// Guarda as pessoas (incluindo as adicionadas pelo usuário) e em qual
// departamento/posição cada uma está — sem isso, mover alguém de lugar ou
// cadastrar gente nova não sobreviveria a um reload.
const PESSOAS_STORAGE_KEY = 'exto_ramais_pessoas'

function initialsOf(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Departamentos únicos, na ordem de primeira aparição no PDF.
function todosDepartamentos(): string[] {
  const vistos = new Set<string>()
  const ordem: string[] = []
  for (const e of RAMAIS) {
    if (!vistos.has(e.departamento)) {
      vistos.add(e.departamento)
      ordem.push(e.departamento)
    }
  }
  return ordem
}

function estadoPadraoPessoas(): EstadoPessoas {
  const pessoas: Record<string, Pessoa> = {}
  const porDepto: PessoasPorDepto = {}
  RAMAIS.forEach((e, i) => {
    const id = `p${i}`
    pessoas[id] = { id, nome: e.nome, ramal: e.ramal }
    if (!porDepto[e.departamento]) porDepto[e.departamento] = []
    porDepto[e.departamento].push(id)
  })
  return { pessoas, porDepto }
}

function carregarPessoas(): EstadoPessoas {
  try {
    const raw = localStorage.getItem(PESSOAS_STORAGE_KEY)
    if (!raw) return estadoPadraoPessoas()
    const salvo = JSON.parse(raw)
    if (!salvo || typeof salvo !== 'object' || !salvo.pessoas || !salvo.porDepto) return estadoPadraoPessoas()
    return salvo as EstadoPessoas
  } catch {
    return estadoPadraoPessoas()
  }
}

// Organização padrão definida pelo usuário (substituiu o round-robin automático).
const DEFAULT_LAYOUT: string[][] = [
  ['Guarita', 'Administração', 'Arquitetura', 'Engenharia', 'GR8', 'Restaurante', 'Espaço Beauty'],
  ['Presidência', 'Diplayers', 'Financeiro', 'Controladoria', 'Contabilidade', 'Fiscal', 'Marketing', 'Novos Negócios', 'Operações', 'Jurídico', 'Incorporação'],
  ['Gestão de Pessoas', 'Recursos Humanos', 'Sala de Reunião', 'Suprimentos', 'T.I', 'Casa Viva', 'Comercial'],
]

// Reconcilia um layout (padrão ou salvo) com os departamentos que existem hoje —
// se a lista de ramais mudar, departamentos novos entram na coluna mais curta e
// departamentos removidos somem, sem quebrar a organização.
function reconciliarLayout(base: string[][]): string[][] {
  const atuais = new Set(todosDepartamentos())
  const colocados = new Set<string>()
  const cols = base.map(col =>
    col.filter(d => {
      if (!atuais.has(d) || colocados.has(d)) return false
      colocados.add(d)
      return true
    })
  )
  for (const d of todosDepartamentos()) {
    if (colocados.has(d)) continue
    let menor = 0
    for (let i = 1; i < cols.length; i++) if (cols[i].length < cols[menor].length) menor = i
    cols[menor].push(d)
    colocados.add(d)
  }
  return cols
}

function layoutPadrao(): string[][] {
  return reconciliarLayout(DEFAULT_LAYOUT)
}

function carregarLayout(): string[][] {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return layoutPadrao()
    const salvo = JSON.parse(raw) as string[][]
    if (!Array.isArray(salvo) || salvo.length !== NUM_COLS) return layoutPadrao()
    return reconciliarLayout(salvo)
  } catch {
    return layoutPadrao()
  }
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-[14px] px-[20px] py-[14px] border-b border-border last:border-b-0">
      <div className="w-[36px] h-[36px] rounded-[10px] bg-tile-bg flex items-center justify-center flex-shrink-0">
        <Icon size={16} strokeWidth={1.7} className="text-icon-default" />
      </div>
      <div className="min-w-0">
        <div className="font-archivo font-semibold text-[10.5px] tracking-[0.08em] uppercase text-label mb-[2px]">{label}</div>
        <div className="font-hanken text-[14px] text-ink truncate">{value || '—'}</div>
      </div>
    </div>
  )
}

function ContatoModal({ entry, onClose }: { entry: RamalEntry; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center bg-[rgba(22,20,18,0.45)] px-[16px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] bg-surface border border-border rounded-[16px] shadow-card-hover overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-[10px] px-[24px] pt-[28px] pb-[20px] border-b border-border">
          <div className="w-[76px] h-[76px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[26px] flex-shrink-0">
            {initialsOf(entry.nome)}
          </div>
          <div className="text-center">
            <div className="font-archivo font-semibold text-[18px] leading-[1.2] text-ink">{entry.nome}</div>
            <div className="font-hanken text-[13px] text-text-faint mt-[3px]">{entry.departamento}</div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-[14px] right-[14px] w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div>
          <DetailRow icon={Mail} label="E-mail" value="" />
          <DetailRow icon={Phone} label="Ramal" value={entry.ramal} />
          <DetailRow icon={Smartphone} label="Celular" value="" />
        </div>
      </div>
    </div>
  )
}

function AdicionarPessoaModal({ departamentos, onClose, onAdd }: {
  departamentos: string[]
  onClose: () => void
  onAdd: (nome: string, ramal: string, departamento: string) => void
}) {
  const [nome, setNome] = useState('')
  const [ramal, setRamal] = useState('')
  const [departamento, setDepartamento] = useState(departamentos[0] ?? '')

  const podeSalvar = nome.trim().length > 0 && ramal.trim().length > 0 && departamento.length > 0

  const salvar = () => {
    if (!podeSalvar) return
    onAdd(nome.trim(), ramal.trim(), departamento)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center bg-[rgba(22,20,18,0.45)] px-[16px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] bg-surface border border-border rounded-[16px] shadow-card-hover overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-[12px] px-[20px] py-[16px] border-b border-border">
          <div className="w-[38px] h-[38px] rounded-[10px] bg-tile-bg flex items-center justify-center flex-shrink-0">
            <Plus size={18} strokeWidth={1.8} className="text-icon-default" />
          </div>
          <span className="flex-1 font-archivo font-semibold text-[15px] text-ink">Adicionar pessoa</span>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-[20px] pb-[20px] pt-[16px] flex flex-col gap-[12px]">
          <div>
            <label className="block font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[6px]">Nome</label>
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              autoFocus
              className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[11px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="block font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[6px]">Ramal</label>
            <input
              value={ramal}
              onChange={e => setRamal(e.target.value)}
              className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[11px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              placeholder="ex: 9500"
            />
          </div>
          <div>
            <label className="block font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[6px]">Departamento</label>
            <select
              value={departamento}
              onChange={e => setDepartamento(e.target.value)}
              className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[11px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
            >
              {departamentos.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <button
            onClick={salvar}
            disabled={!podeSalvar}
            className="mt-[4px] inline-flex items-center justify-center gap-[8px] bg-accent text-white border-none rounded-[10px] px-[20px] py-[11px] font-hanken font-semibold text-[14px] cursor-pointer transition-all duration-150 hover:brightness-[0.93] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}

function MoveButton({ Icon, disabled, onClick, title }: {
  Icon: React.ElementType; disabled: boolean; onClick: () => void; title: string
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      disabled={disabled}
      title={title}
      className="w-[20px] h-[20px] flex items-center justify-center rounded-[6px] border-none bg-transparent cursor-pointer text-text-faint hover:text-ink hover:bg-border transition-colors duration-150 disabled:opacity-25 disabled:cursor-default disabled:hover:bg-transparent"
    >
      <Icon size={13} strokeWidth={2.2} />
    </button>
  )
}

export function RamaisPage({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<RamalEntry | null>(null)
  const [layout, setLayout] = useState<string[][]>(carregarLayout)
  const [dados, setDados] = useState<EstadoPessoas>(carregarPessoas)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  useEffect(() => {
    localStorage.setItem(PESSOAS_STORAGE_KEY, JSON.stringify(dados))
  }, [dados])

  const q = query.trim().toLowerCase()

  // Departamentos existentes de verdade hoje (podem ter mudado desde o
  // carregamento salvo — ex.: um departamento ficou sem ninguém).
  const departamentosAtuais = useMemo(() => Object.keys(dados.porDepto), [dados])

  const pessoasFiltradasPorDepto = useMemo(() => {
    const map: Record<string, Pessoa[]> = {}
    for (const [depto, ids] of Object.entries(dados.porDepto)) {
      map[depto] = ids
        .map(id => dados.pessoas[id])
        .filter((p): p is Pessoa => !!p)
        .filter(p =>
          !q ||
          p.nome.toLowerCase().includes(q) ||
          p.ramal.includes(q) ||
          depto.toLowerCase().includes(q)
        )
    }
    return map
  }, [dados, q])

  const temResultado = Object.values(pessoasFiltradasPorDepto).some(lista => lista.length > 0)

  // Move o card de departamento na vertical (troca de posição com o vizinho de
  // cima/baixo, dentro da mesma coluna) ou na horizontal (muda de coluna).
  const moverDeptoVertical = (departamento: string, direcao: -1 | 1) => {
    setLayout(prev => {
      const next = prev.map(col => [...col])
      const colIdx = next.findIndex(col => col.includes(departamento))
      if (colIdx === -1) return prev
      const col = next[colIdx]
      const i = col.indexOf(departamento)
      const j = i + direcao
      if (j < 0 || j >= col.length) return prev
      ;[col[i], col[j]] = [col[j], col[i]]
      return next
    })
  }

  const moverDeptoColuna = (departamento: string, direcao: -1 | 1) => {
    setLayout(prev => {
      const next = prev.map(col => [...col])
      const colIdx = next.findIndex(col => col.includes(departamento))
      const destIdx = colIdx + direcao
      if (colIdx === -1 || destIdx < 0 || destIdx >= next.length) return prev
      next[colIdx] = next[colIdx].filter(d => d !== departamento)
      next[destIdx] = [...next[destIdx], departamento]
      return next
    })
  }

  // Troca a posição de uma pessoa com o vizinho de cima/baixo, dentro do
  // mesmo departamento.
  const moverPessoaVertical = (departamento: string, id: string, direcao: -1 | 1) => {
    setDados(prev => {
      const lista = [...(prev.porDepto[departamento] ?? [])]
      const i = lista.indexOf(id)
      const j = i + direcao
      if (i === -1 || j < 0 || j >= lista.length) return prev
      ;[lista[i], lista[j]] = [lista[j], lista[i]]
      return { ...prev, porDepto: { ...prev.porDepto, [departamento]: lista } }
    })
  }

  // Joga uma pessoa pra outro departamento (entra no fim da lista de lá).
  const moverPessoaDeDepartamento = (id: string, origem: string, destino: string) => {
    if (origem === destino) return
    setDados(prev => ({
      ...prev,
      porDepto: {
        ...prev.porDepto,
        [origem]: (prev.porDepto[origem] ?? []).filter(x => x !== id),
        [destino]: [...(prev.porDepto[destino] ?? []), id],
      },
    }))
  }

  const adicionarPessoa = (nome: string, ramal: string, departamento: string) => {
    const id = `novo-${Date.now()}-${Math.round(Math.random() * 1e6)}`
    setDados(prev => ({
      pessoas: { ...prev.pessoas, [id]: { id, nome, ramal } },
      porDepto: { ...prev.porDepto, [departamento]: [...(prev.porDepto[departamento] ?? []), id] },
    }))
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
        <span className="font-archivo font-semibold text-[20px] text-ink">Ramais</span>
      </div>

      {/* Busca */}
      <div className="px-[24px] pt-[16px] pb-[14px] border-b border-border flex-shrink-0 bg-bg-app">
        <div className="max-w-[1000px] mx-auto flex items-center gap-[12px]">
          <div className="relative flex-1">
            <Search size={16} strokeWidth={1.8} className="absolute left-[12px] top-1/2 -translate-y-1/2 text-text-faint pointer-events-none" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar nome, ramal ou departamento…"
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
          <button
            onClick={() => setShowAdd(true)}
            className="flex-shrink-0 inline-flex items-center gap-[6px] font-hanken font-semibold text-[13px] text-white bg-accent border-none rounded-[10px] px-[14px] py-[10px] cursor-pointer hover:brightness-95 transition-[filter] duration-150"
          >
            <Plus size={15} strokeWidth={2.2} />
            Adicionar pessoa
          </button>
        </div>
      </div>

      {/* Colunas de departamento — posição e ordem controladas pelo usuário */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-[24px] py-[20px]" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[1000px] mx-auto">
          {!temResultado ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Phone size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">Nenhum ramal encontrado</span>
            </div>
          ) : (
            <div className="flex gap-[16px] items-start">
              {layout.map((col, colIdx) => (
                <div key={colIdx} className="flex-1 min-w-0 flex flex-col gap-[16px]">
                  {col.map((departamento, idxInCol) => {
                    const pessoasVisiveis = pessoasFiltradasPorDepto[departamento] ?? []
                    if (pessoasVisiveis.length === 0) return null
                    const listaCompleta = dados.porDepto[departamento] ?? []

                    return (
                      <div key={departamento} className="group/depto bg-surface border border-border border-l-4 border-l-accent rounded-[14px] overflow-hidden">
                        <div className="flex items-center gap-[8px] px-[16px] py-[11px] border-b border-border bg-tile-bg">
                          <Building2 size={14} strokeWidth={1.9} className="text-accent flex-shrink-0" />
                          <h4 className="m-0 flex-1 min-w-0 font-archivo font-semibold text-[12px] tracking-[0.04em] uppercase text-ink truncate">
                            {departamento}
                          </h4>
                          <span className="font-hanken text-[11px] text-text-faint flex-shrink-0">{pessoasVisiveis.length}</span>

                          <div className="flex items-center gap-[1px] flex-shrink-0 opacity-0 group-hover/depto:opacity-100 transition-opacity duration-150">
                            <MoveButton Icon={ChevronLeft} title="Mover pra coluna anterior" disabled={colIdx === 0} onClick={() => moverDeptoColuna(departamento, -1)} />
                            <MoveButton Icon={ChevronUp} title="Mover pra cima" disabled={idxInCol === 0} onClick={() => moverDeptoVertical(departamento, -1)} />
                            <MoveButton Icon={ChevronDown} title="Mover pra baixo" disabled={idxInCol === col.length - 1} onClick={() => moverDeptoVertical(departamento, 1)} />
                            <MoveButton Icon={ChevronRight} title="Mover pra próxima coluna" disabled={colIdx === layout.length - 1} onClick={() => moverDeptoColuna(departamento, 1)} />
                          </div>
                        </div>
                        <div>
                          {pessoasVisiveis.map(pessoa => {
                            const idx = listaCompleta.indexOf(pessoa.id)
                            return (
                              <div
                                key={pessoa.id}
                                className="group/pessoa flex items-center gap-[6px] px-[16px] py-[10px] border-b border-border last:border-b-0 hover:bg-tile-bg transition-colors duration-150"
                              >
                                <button
                                  onClick={() => setSelected({ nome: pessoa.nome, ramal: pessoa.ramal, departamento })}
                                  className="flex-1 min-w-0 flex items-center gap-[10px] border-none bg-transparent cursor-pointer text-left p-0"
                                >
                                  <div className="w-[28px] h-[28px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[10.5px] flex-shrink-0">
                                    {initialsOf(pessoa.nome)}
                                  </div>
                                  <span className="flex-1 min-w-0 font-hanken font-medium text-[13px] text-ink truncate">{pessoa.nome}</span>
                                </button>
                                <span className="flex-shrink-0 font-hanken text-[12.5px] text-text-muted tabular-nums">{pessoa.ramal}</span>

                                <div className="flex items-center gap-[1px] flex-shrink-0 opacity-0 group-hover/pessoa:opacity-100 transition-opacity duration-150">
                                  <MoveButton Icon={ChevronUp} title="Mover pra cima" disabled={idx <= 0} onClick={() => moverPessoaVertical(departamento, pessoa.id, -1)} />
                                  <MoveButton Icon={ChevronDown} title="Mover pra baixo" disabled={idx === -1 || idx >= listaCompleta.length - 1} onClick={() => moverPessoaVertical(departamento, pessoa.id, 1)} />
                                  <select
                                    value={departamento}
                                    onClick={e => e.stopPropagation()}
                                    onChange={e => moverPessoaDeDepartamento(pessoa.id, departamento, e.target.value)}
                                    title="Mover pra outro departamento"
                                    className="max-w-[64px] font-hanken text-[10px] text-text-muted border border-border rounded-[6px] bg-surface px-[2px] py-[2px] cursor-pointer outline-none"
                                  >
                                    {departamentosAtuais.map(d => <option key={d} value={d}>{d}</option>)}
                                  </select>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selected && <ContatoModal entry={selected} onClose={() => setSelected(null)} />}
      {showAdd && (
        <AdicionarPessoaModal
          departamentos={departamentosAtuais}
          onClose={() => setShowAdd(false)}
          onAdd={adicionarPessoa}
        />
      )}
    </div>
  )
}
