import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Search, X, Phone, Mail, Smartphone, Building2, Loader2 } from 'lucide-react'
import { fetchDiretorio, type ContatoPessoa } from '../services/diretorio'

interface Props {
  onBack: () => void
}

const NUM_COLS = 3
// Guarda a organização (coluna + ordem) dos cards de departamento que o
// usuário escolheu — preferência pessoal de navegação, não dado nenhum.
const LAYOUT_STORAGE_KEY = 'exto_ramais_layout'

function initialsOf(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Distribui departamentos (ordem alfabética) em NUM_COLS colunas, round-robin.
function distribuirEmColunas(departamentos: string[]): string[][] {
  const cols: string[][] = Array.from({ length: NUM_COLS }, () => [])
  const ordenado = [...departamentos].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  ordenado.forEach((d, i) => cols[i % NUM_COLS].push(d))
  return cols
}

// Reconcilia um layout salvo com os departamentos que existem hoje — se um
// colaborador novo trouxer departamento novo, ou um departamento ficar vazio,
// a organização se ajusta sem perder a posição dos que continuam.
function reconciliarLayout(base: string[][], departamentosAtuais: string[]): string[][] {
  const atuais = new Set(departamentosAtuais)
  const colocados = new Set<string>()
  const cols = base.map(col =>
    col.filter(d => {
      if (!atuais.has(d) || colocados.has(d)) return false
      colocados.add(d)
      return true
    })
  )
  for (const d of departamentosAtuais) {
    if (colocados.has(d)) continue
    let menor = 0
    for (let i = 1; i < cols.length; i++) if (cols[i].length < cols[menor].length) menor = i
    cols[menor].push(d)
    colocados.add(d)
  }
  return cols
}

function carregarLayout(departamentosAtuais: string[]): string[][] {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
    if (!raw) return distribuirEmColunas(departamentosAtuais)
    const salvo = JSON.parse(raw) as string[][]
    if (!Array.isArray(salvo) || salvo.length !== NUM_COLS) return distribuirEmColunas(departamentosAtuais)
    return reconciliarLayout(salvo, departamentosAtuais)
  } catch {
    return distribuirEmColunas(departamentosAtuais)
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

// Popup de contato — só-leitura (editar colaborador é só pelo Painel Admin).
function ContatoModal({ pessoa, onClose }: { pessoa: ContatoPessoa; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[50] flex items-center justify-center bg-[rgba(22,20,18,0.45)] px-[16px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[380px] bg-surface border border-border rounded-[16px] shadow-card-hover overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative flex flex-col items-center gap-[10px] px-[24px] pt-[28px] pb-[20px] border-b border-border">
          {pessoa.foto ? (
            <img src={pessoa.foto} alt={pessoa.nome} className="w-[76px] h-[76px] rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-[76px] h-[76px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[26px] flex-shrink-0">
              {initialsOf(pessoa.nome)}
            </div>
          )}
          <div className="text-center">
            <div className="font-archivo font-semibold text-[18px] leading-[1.2] text-ink">{pessoa.nome}</div>
            <div className="font-hanken text-[13px] text-text-faint mt-[3px]">{pessoa.departamento}</div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-[14px] right-[14px] w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>
        <div>
          <DetailRow icon={Mail} label="E-mail" value={pessoa.email} />
          <DetailRow icon={Phone} label="Ramal" value={pessoa.ramal} />
          <DetailRow icon={Smartphone} label="Celular" value={pessoa.celular} />
        </div>
      </div>
    </div>
  )
}

interface DeptoArrastado {
  departamento: string
}

function lerDeptoArrastado(e: React.DragEvent): DeptoArrastado | null {
  try {
    const raw = e.dataTransfer.getData('text/plain')
    if (!raw) return null
    return JSON.parse(raw) as DeptoArrastado
  } catch {
    return null
  }
}

function AvatarPessoa({ pessoa, size, textSize }: { pessoa: ContatoPessoa; size: number; textSize: number }) {
  if (pessoa.foto) {
    return (
      <img
        src={pessoa.foto}
        alt={pessoa.nome}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: textSize }}
      className="rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold flex-shrink-0"
    >
      {initialsOf(pessoa.nome)}
    </div>
  )
}

function DepartamentoCard({
  departamento, pessoasVisiveis, onSelect, onSoltarDepto, colIdx,
}: {
  departamento: string
  pessoasVisiveis: ContatoPessoa[]
  onSelect: (pessoa: ContatoPessoa) => void
  onSoltarDepto: (departamento: string, colDestino: number, antesDe: string | null) => void
  colIdx?: number
}) {
  return (
    <div
      className="group/depto bg-surface border border-border border-l-4 border-l-accent rounded-[14px] overflow-hidden"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()
        const item = lerDeptoArrastado(e)
        if (item && colIdx !== undefined && item.departamento !== departamento) {
          e.stopPropagation()
          onSoltarDepto(item.departamento, colIdx, departamento)
        }
      }}
    >
      <div
        draggable={colIdx !== undefined}
        onDragStart={e => {
          if (colIdx === undefined) return
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', JSON.stringify({ departamento }))
        }}
        className={`flex items-center gap-[8px] px-[16px] py-[11px] border-b border-border bg-tile-bg ${colIdx !== undefined ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <Building2 size={14} strokeWidth={1.9} className="text-accent flex-shrink-0" />
        <h4 className="m-0 flex-1 min-w-0 font-archivo font-semibold text-[12px] tracking-[0.04em] uppercase text-ink truncate">
          {departamento}
        </h4>
      </div>
      <div>
        {pessoasVisiveis.map(pessoa => (
          <button
            key={pessoa.id}
            onClick={() => onSelect(pessoa)}
            className="w-full flex items-center gap-[10px] px-[16px] py-[10px] border-b border-border last:border-b-0 hover:bg-tile-bg transition-colors duration-150 border-none bg-transparent cursor-pointer text-left"
          >
            <AvatarPessoa pessoa={pessoa} size={28} textSize={10.5} />
            <span className="flex-1 min-w-0 font-hanken font-medium text-[13px] text-ink truncate">{pessoa.nome}</span>
            <span className="flex-shrink-0 font-hanken font-semibold text-[12.5px] text-ink tabular-nums">{pessoa.ramal}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function RamaisPage({ onBack }: Props) {
  const [query, setQuery] = useState('')
  const [selectedPessoa, setSelectedPessoa] = useState<ContatoPessoa | null>(null)
  const [pessoas, setPessoas] = useState<ContatoPessoa[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [layout, setLayout] = useState<string[][] | null>(null)

  useEffect(() => {
    fetchDiretorio()
      .then(setPessoas)
      .catch(e => setErro(e instanceof Error ? e.message : 'Falha ao carregar diretório de contatos.'))
  }, [])

  const departamentosAtuais = useMemo(() => {
    if (!pessoas) return []
    return Array.from(new Set(pessoas.map(p => p.departamento))).sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [pessoas])

  // Carrega/reconcilia o layout salvo só depois que os departamentos reais
  // chegaram da API (senão reconciliaria contra uma lista vazia).
  useEffect(() => {
    if (pessoas) setLayout(carregarLayout(departamentosAtuais))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pessoas])

  useEffect(() => {
    if (layout) localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  const q = query.trim().toLowerCase()
  const buscando = q.length > 0

  const pessoasPorDepto = useMemo(() => {
    const map: Record<string, ContatoPessoa[]> = {}
    for (const p of pessoas ?? []) {
      if (q && !p.nome.toLowerCase().includes(q) && !p.ramal.includes(q) && !p.departamento.toLowerCase().includes(q)) continue
      if (!map[p.departamento]) map[p.departamento] = []
      map[p.departamento].push(p)
    }
    return map
  }, [pessoas, q])

  const temResultado = Object.values(pessoasPorDepto).some(lista => lista.length > 0)

  const moverDeptoParaPosicao = (departamento: string, colDestino: number, antesDe: string | null) => {
    setLayout(prev => {
      if (!prev) return prev
      const semOrigem = prev.map(col => col.filter(d => d !== departamento))
      const destino = [...semOrigem[colDestino]]
      const idx = antesDe ? destino.indexOf(antesDe) : -1
      if (idx === -1) destino.push(departamento)
      else destino.splice(idx, 0, departamento)
      const next = [...semOrigem]
      next[colDestino] = destino
      return next
    })
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
        <span className="font-archivo font-semibold text-[20px] text-ink">Contatos</span>
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
        </div>
      </div>

      {/* Departamentos — organização controlada pelo usuário (posição dos
          cards); durante uma busca, vira uma grade centralizada com só quem
          deu match. */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-[24px] py-[20px]" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[1000px] mx-auto">
          {erro ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Phone size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">{erro}</span>
            </div>
          ) : !pessoas || !layout ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Loader2 size={32} strokeWidth={1.8} className="animate-spin" />
              <span className="font-hanken text-[14px]">Carregando contatos…</span>
            </div>
          ) : !temResultado ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Phone size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">Nenhum contato encontrado</span>
            </div>
          ) : buscando ? (
            <div className="flex flex-wrap justify-center gap-[16px]">
              {layout.flat().map(departamento => {
                const pessoasVisiveis = pessoasPorDepto[departamento] ?? []
                if (pessoasVisiveis.length === 0) return null
                return (
                  <div key={departamento} className="w-[300px] flex-shrink-0">
                    <DepartamentoCard
                      departamento={departamento}
                      pessoasVisiveis={pessoasVisiveis}
                      onSelect={setSelectedPessoa}
                      onSoltarDepto={() => {}}
                    />
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex gap-[16px] items-start">
              {layout.map((col, colIdx) => (
                <div
                  key={colIdx}
                  className="flex-1 min-w-0 flex flex-col gap-[16px]"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault()
                    const item = lerDeptoArrastado(e)
                    if (item) moverDeptoParaPosicao(item.departamento, colIdx, null)
                  }}
                >
                  {col.map(departamento => {
                    const pessoasVisiveis = pessoasPorDepto[departamento] ?? []
                    if (pessoasVisiveis.length === 0) return null
                    return (
                      <DepartamentoCard
                        key={departamento}
                        departamento={departamento}
                        pessoasVisiveis={pessoasVisiveis}
                        onSelect={setSelectedPessoa}
                        onSoltarDepto={moverDeptoParaPosicao}
                        colIdx={colIdx}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedPessoa && (
        <ContatoModal pessoa={selectedPessoa} onClose={() => setSelectedPessoa(null)} />
      )}
    </div>
  )
}
