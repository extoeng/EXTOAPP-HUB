import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Search, X, Phone, Mail, Smartphone } from 'lucide-react'
import { Lottie } from 'lottie-react'
import loadingContatosAnim from '../assets/lottie/loading-contatos.json'
import { delay } from '../utils/delay'
import { fetchDiretorio, type ContatoPessoa } from '../services/diretorio'

interface Props {
  onBack: () => void
  /** Abre direto o modal deste contato — usado pela busca global do Header. */
  initialContatoId?: string
}

// Tempo mínimo de exibição da animação de carregamento — mesmo padrão de
// Comunicados (DocumentLibrary): resposta rápida da API não corta a animação.
const CARREGANDO_MIN_MS = 3000

function initialsOf(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0][0].toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

// Hierarquia de cargos pra ordenar colaboradores dentro do departamento.
// Match por substring no nome do cargo (sem acento, minúsculo) — "Diretora
// Financeira" casa com "diretor". Cargo fora da lista vai pro fim.
const CARGO_ORDEM = ['president', 'diretor', 'head', 'gerente', 'coordenador', 'analista', 'assistente', 'auxiliar', 'estagiario', 'jovem aprendiz']

function cargoRank(cargo: string): number {
  const c = cargo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const i = CARGO_ORDEM.findIndex(t => c.includes(t))
  return i === -1 ? CARGO_ORDEM.length : i
}

// Cores por departamento \u2014 extra\u00eddas da lista oficial de ramais
// (share geral: Informa\u00e7\u00f5es Gerais/Ramais/Ramais.pdf, junho 2026).
// Chave normalizada (sem acento/pontua\u00e7\u00e3o, min\u00fasculo); departamento fora
// da lista cai no vermelho padr\u00e3o da empresa.
const CORES_DEPTO: Record<string, string> = {
  administracao: '#D9E1F2',
  arquitetura: '#C6E0B4',
  casaviva: '#BDD7EE',
  comercial: '#92D04F',
  contabilidade: '#FFE699',
  controladoria: '#FFE699',
  diplayers: '#FFE699',
  engenharia: '#9BC2E6',
  espacobeauty: '#F4B084',
  financeiro: '#BFBFBF',
  fiscal: '#FFF2CC',
  gestaodepessoas: '#8EA9DB',
  gr8: '#FFCCFF',
  guarita: '#F4B084',
  incorporacao: '#92D04F',
  juridico: '#D6DCE4',
  marketing: '#FFC000',
  novosnegocios: '#C9C9C9',
  operacoes: '#F4B084',
  presidencia: '#FFFF00',
  recursoshumanos: '#AEAAAA',
  restaurante: '#A9D08E',
  saladereuniao: '#FFD966',
  suprimentos: '#00B04F',
  ti: '#D0CECE',
}

const COR_DEPTO_PADRAO = '#B31C1C' // accent (tailwind.config.js)

function corDoDepto(nome: string): string {
  const chave = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')
  return CORES_DEPTO[chave] ?? COR_DEPTO_PADRAO
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
            {pessoa.cargo && (
              <div className="font-hanken text-[13px] text-text-faint mt-[3px]">{pessoa.cargo}</div>
            )}
            <div className="font-hanken text-[12.5px] text-text-faint mt-[2px]">{pessoa.departamento}</div>
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

// Card de pessoa — grid estilo "team page": avatar com anel na cor do
// departamento, nome, cargo e ramal em pill.
function PessoaCard({ pessoa, onSelect }: { pessoa: ContatoPessoa; onSelect: (pessoa: ContatoPessoa) => void }) {
  const cor = corDoDepto(pessoa.departamento)
  return (
    <button
      onClick={() => onSelect(pessoa)}
      className="group flex-grow-0 basis-[calc((100%-56px)/5)] min-w-[170px] flex flex-col items-center text-center gap-[10px] px-[14px] pt-[20px] pb-[16px] bg-surface border border-border rounded-[16px] cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-[2px] hover:border-border-hover"
    >
      <span className="rounded-full p-[3px]" style={{ boxShadow: `0 0 0 2px ${cor}` }}>
        <AvatarPessoa pessoa={pessoa} size={52} textSize={18} />
      </span>
      <span className="flex flex-col gap-[2px] min-w-0 w-full">
        <span className="font-archivo font-semibold text-[13.5px] leading-[1.25] text-ink truncate">{pessoa.nome}</span>
        <span className="font-hanken text-[11.5px] text-text-faint truncate">{pessoa.cargo || '—'}</span>
      </span>
      <span className="inline-flex items-center gap-[6px] px-[11px] py-[4px] rounded-full bg-tile-bg font-hanken font-semibold text-[12px] text-ink tabular-nums group-hover:bg-bg-app transition-colors duration-200">
        <Phone size={11} strokeWidth={2} />
        {pessoa.ramal || '—'}
      </span>
    </button>
  )
}

// Seção de um departamento: título com a cor oficial + grid de cards em
// ordem hierárquica de cargo.
function DepartamentoSection({
  departamento, pessoas, onSelect,
}: {
  departamento: string
  pessoas: ContatoPessoa[]
  onSelect: (pessoa: ContatoPessoa) => void
}) {
  const cor = corDoDepto(departamento)
  return (
    <section className="mb-[34px]">
      <div className="flex items-center gap-[10px] mb-[14px]">
        <span className="w-[10px] h-[10px] rounded-full flex-shrink-0" style={{ background: cor }} />
        <h3 className="m-0 font-archivo font-semibold text-[14px] tracking-[0.05em] uppercase text-ink whitespace-nowrap">
          {departamento}
        </h3>
        <span className="font-hanken text-[12px] text-text-faint tabular-nums">{pessoas.length}</span>
        <span className="flex-1 h-[1px] bg-border" />
      </div>
      {/* Fileiras de 5; fileira incompleta termina centralizada. */}
      <div className="flex flex-wrap justify-center gap-[14px]">
        {pessoas.map(pessoa => (
          <PessoaCard key={pessoa.id} pessoa={pessoa} onSelect={onSelect} />
        ))}
      </div>
    </section>
  )
}

export function RamaisPage({ onBack, initialContatoId }: Props) {
  const [query, setQuery] = useState('')
  const [selectedPessoa, setSelectedPessoa] = useState<ContatoPessoa | null>(null)
  const [pessoas, setPessoas] = useState<ContatoPessoa[] | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [filtroDepto, setFiltroDepto] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchDiretorio(), delay(CARREGANDO_MIN_MS)])
      .then(([list]) => setPessoas(list))
      .catch(e => setErro(e instanceof Error ? e.message : 'Falha ao carregar diretório de contatos.'))
  }, [])

  useEffect(() => {
    if (!pessoas || !initialContatoId) return
    const p = pessoas.find(x => x.id === initialContatoId)
    if (p) setSelectedPessoa(p)
  }, [pessoas, initialContatoId])

  // Alfabético, com Presidência sempre em primeiro.
  const departamentosAtuais = useMemo(() => {
    if (!pessoas) return []
    const ehPresidencia = (d: string) => d.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().includes('presidencia')
    return Array.from(new Set(pessoas.map(p => p.departamento))).sort(
      (a, b) => Number(ehPresidencia(b)) - Number(ehPresidencia(a)) || a.localeCompare(b, 'pt-BR'),
    )
  }, [pessoas])

  const contagemPorDepto = useMemo(() => {
    const contagem: Record<string, number> = {}
    for (const p of pessoas ?? []) contagem[p.departamento] = (contagem[p.departamento] ?? 0) + 1
    return contagem
  }, [pessoas])

  const q = query.trim().toLowerCase()
  const buscando = q.length > 0

  const pessoasPorDepto = useMemo(() => {
    const map: Record<string, ContatoPessoa[]> = {}
    for (const p of pessoas ?? []) {
      if (q && !p.nome.toLowerCase().includes(q) && !p.ramal.includes(q) && !p.departamento.toLowerCase().includes(q)) continue
      if (!map[p.departamento]) map[p.departamento] = []
      map[p.departamento].push(p)
    }
    for (const lista of Object.values(map)) {
      lista.sort(
        (a, b) =>
          cargoRank(a.cargo) - cargoRank(b.cargo) ||
          a.cargo.localeCompare(b.cargo, 'pt-BR') ||
          a.nome.localeCompare(b.nome, 'pt-BR'),
      )
    }
    return map
  }, [pessoas, q])

  const temResultado = Object.values(pessoasPorDepto).some(lista => lista.length > 0)

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
          <select
            value={filtroDepto ?? ''}
            onChange={e => setFiltroDepto(e.target.value || null)}
            className="flex-shrink-0 w-[220px] font-hanken text-[13.5px] text-ink bg-surface border border-border rounded-[11px] px-[12px] py-[10px] outline-none focus:border-border-hover transition-colors cursor-pointer"
          >
            <option value="">Todos os departamentos</option>
            {departamentosAtuais.map(departamento => (
              <option key={departamento} value={departamento}>
                {departamento} ({contagemPorDepto[departamento] ?? 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diretório: nav lateral de departamentos + seções em ordem
          alfabética, pessoas agrupadas por cargo. Busca filtra as seções. */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-[24px] py-[20px]" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[1060px] mx-auto">
          {erro ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Phone size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">{erro}</span>
            </div>
          ) : !pessoas ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[40px] text-center text-text-faint">
              <Lottie src={loadingContatosAnim} autoplay loop style={{ width: 320, height: 320 }} />
              <span className="font-hanken text-[14px]">Carregando contatos…</span>
            </div>
          ) : !temResultado ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Phone size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">Nenhum contato encontrado</span>
            </div>
          ) : (
            <>
              {departamentosAtuais.map(departamento => {
                if (filtroDepto && departamento !== filtroDepto) return null
                const pessoasVisiveis = pessoasPorDepto[departamento] ?? []
                if (pessoasVisiveis.length === 0) return null
                return (
                  <DepartamentoSection
                    key={departamento}
                    departamento={departamento}
                    pessoas={pessoasVisiveis}
                    onSelect={setSelectedPessoa}
                  />
                )
              })}
            </>
          )}
        </div>
      </div>

      {selectedPessoa && (
        <ContatoModal pessoa={selectedPessoa} onClose={() => setSelectedPessoa(null)} />
      )}
    </div>
  )
}
