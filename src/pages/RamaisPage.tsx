import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Search, X, Phone, Mail, Smartphone, Building2,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw,
} from 'lucide-react'
import { RAMAIS, RAMAIS_REVISAO, type RamalEntry } from '../data/ramais'

interface Props {
  onBack: () => void
}

const NUM_COLS = 3
// Guarda a organização (coluna + ordem) que o usuário escolheu pros cards de
// departamento — sem isso, toda visita voltaria pra ordem automática.
const LAYOUT_STORAGE_KEY = 'exto_ramais_layout'

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

function layoutPadrao(): string[][] {
  const deptos = todosDepartamentos()
  const cols: string[][] = Array.from({ length: NUM_COLS }, () => [])
  deptos.forEach((d, i) => cols[i % NUM_COLS].push(d))
  return cols
}

// Carrega a organização salva, reconciliando com os departamentos que existem
// hoje (se a lista de ramais mudar, departamentos novos entram na coluna mais
// curta e departamentos removidos somem, sem quebrar o layout salvo).
function carregarLayout(): string[][] {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return layoutPadrao()
    const salvo = JSON.parse(raw) as string[][]
    if (!Array.isArray(salvo) || salvo.length !== NUM_COLS) return layoutPadrao()

    const atuais = new Set(todosDepartamentos())
    const colocados = new Set<string>()
    const cols = salvo.map(col =>
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

  useEffect(() => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!q) return RAMAIS
    return RAMAIS.filter(e =>
      e.nome.toLowerCase().includes(q) ||
      e.departamento.toLowerCase().includes(q) ||
      e.ramal.includes(q)
    )
  }, [q])

  const itensPorDepto = useMemo(() => {
    const map = new Map<string, RamalEntry[]>()
    for (const e of results) {
      if (!map.has(e.departamento)) map.set(e.departamento, [])
      map.get(e.departamento)!.push(e)
    }
    return map
  }, [results])

  const temResultado = [...itensPorDepto.values()].some(itens => itens.length > 0)

  // Move o card na vertical (troca de posição com o vizinho de cima/baixo,
  // dentro da mesma coluna) ou na horizontal (muda de coluna, entra no fim).
  const moverVertical = (departamento: string, direcao: -1 | 1) => {
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

  const moverColuna = (departamento: string, direcao: -1 | 1) => {
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

  const resetarLayout = () => setLayout(layoutPadrao())

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
        <span className="font-archivo font-semibold text-[14px] text-ink">Ramais</span>
        <span className="font-hanken text-[11px] text-text-faint bg-tile-bg rounded-[6px] px-[7px] py-[2px]">{RAMAIS_REVISAO}</span>
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
            onClick={resetarLayout}
            title="Voltar pra organização padrão dos departamentos"
            className="flex-shrink-0 inline-flex items-center gap-[6px] font-hanken font-medium text-[12.5px] text-text-muted border border-border rounded-[10px] px-[12px] py-[9px] bg-surface cursor-pointer hover:border-border-hover hover:text-ink transition-colors duration-150"
          >
            <RotateCcw size={13} strokeWidth={2} />
            Redefinir
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
                    const itens = itensPorDepto.get(departamento)
                    if (!itens || itens.length === 0) return null

                    return (
                      <div key={departamento} className="group bg-surface border border-border rounded-[14px] overflow-hidden">
                        <div className="flex items-center gap-[8px] px-[16px] py-[11px] border-b border-border bg-tile-bg">
                          <Building2 size={14} strokeWidth={1.9} className="text-accent flex-shrink-0" />
                          <h4 className="m-0 flex-1 min-w-0 font-archivo font-semibold text-[12px] tracking-[0.04em] uppercase text-ink truncate">
                            {departamento}
                          </h4>
                          <span className="font-hanken text-[11px] text-text-faint flex-shrink-0">{itens.length}</span>

                          <div className="flex items-center gap-[1px] flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            <MoveButton Icon={ChevronLeft} title="Mover pra coluna anterior" disabled={colIdx === 0} onClick={() => moverColuna(departamento, -1)} />
                            <MoveButton Icon={ChevronUp} title="Mover pra cima" disabled={idxInCol === 0} onClick={() => moverVertical(departamento, -1)} />
                            <MoveButton Icon={ChevronDown} title="Mover pra baixo" disabled={idxInCol === col.length - 1} onClick={() => moverVertical(departamento, 1)} />
                            <MoveButton Icon={ChevronRight} title="Mover pra próxima coluna" disabled={colIdx === layout.length - 1} onClick={() => moverColuna(departamento, 1)} />
                          </div>
                        </div>
                        <div>
                          {itens.map((e, i) => (
                            <button
                              key={e.nome + e.ramal + i}
                              onClick={() => setSelected(e)}
                              className="w-full flex items-center gap-[10px] px-[16px] py-[10px] border-none bg-transparent cursor-pointer text-left transition-colors duration-150 hover:bg-tile-bg border-b border-border last:border-b-0"
                            >
                              <div className="w-[28px] h-[28px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[10.5px] flex-shrink-0">
                                {initialsOf(e.nome)}
                              </div>
                              <span className="flex-1 min-w-0 font-hanken font-medium text-[13px] text-ink truncate">{e.nome}</span>
                              <span className="flex-shrink-0 font-hanken text-[12.5px] text-text-muted tabular-nums">{e.ramal}</span>
                            </button>
                          ))}
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
    </div>
  )
}
