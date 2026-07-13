import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft, Search, X, Phone, Mail, Smartphone, Building2, Plus, Pencil, GripVertical,
} from 'lucide-react'
import { RAMAIS } from '../data/ramais'

interface Props {
  onBack: () => void
  isMaster: boolean
}

interface Pessoa {
  id: string
  nome: string
  ramal: string
  email?: string
  celular?: string
  foto?: string
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

interface SalvarPessoaPatch {
  nome: string
  ramal: string
  email: string
  celular: string
  departamento: string
  foto: string
}

// Lê um arquivo de imagem escolhido no <input type="file"> como data URL
// (base64) — é como a foto acaba guardada no localStorage, já que não existe
// upload/storage real pra fotos ainda (ver pendência no fluxo 10).
function lerFotoComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function ContatoModal({ pessoa, departamento, departamentosAtuais, podeEditar, onClose, onSave }: {
  pessoa: Pessoa
  departamento: string
  departamentosAtuais: string[]
  podeEditar: boolean
  onClose: () => void
  onSave: (patch: SalvarPessoaPatch) => void
}) {
  const [editando, setEditando] = useState(false)
  const [nome, setNome] = useState(pessoa.nome)
  const [ramal, setRamal] = useState(pessoa.ramal)
  const [email, setEmail] = useState(pessoa.email ?? '')
  const [celular, setCelular] = useState(pessoa.celular ?? '')
  const [depto, setDepto] = useState(departamento)
  const [foto, setFoto] = useState(pessoa.foto ?? '')

  const iniciarEdicao = () => {
    setNome(pessoa.nome)
    setRamal(pessoa.ramal)
    setEmail(pessoa.email ?? '')
    setCelular(pessoa.celular ?? '')
    setDepto(departamento)
    setFoto(pessoa.foto ?? '')
    setEditando(true)
  }

  const escolherFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFoto(await lerFotoComoDataUrl(file))
  }

  const salvar = () => {
    onSave({
      nome: nome.trim() || pessoa.nome,
      ramal: ramal.trim(),
      email: email.trim(),
      celular: celular.trim(),
      departamento: depto,
      foto,
    })
    setEditando(false)
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
        <div className="relative flex flex-col items-center gap-[10px] px-[24px] pt-[28px] pb-[20px] border-b border-border">
          {editando ? (
            <label
              title="Trocar foto"
              className="relative w-[76px] h-[76px] rounded-full flex-shrink-0 cursor-pointer group/foto"
            >
              {foto ? (
                <img src={foto} alt={nome} className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[26px]">
                  {initialsOf(nome)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-[rgba(22,20,18,0.45)] opacity-0 group-hover/foto:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                <Pencil size={16} strokeWidth={2} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
            </label>
          ) : pessoa.foto ? (
            <img src={pessoa.foto} alt={pessoa.nome} className="w-[76px] h-[76px] rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-[76px] h-[76px] rounded-full bg-avatar-bg text-white flex items-center justify-center font-archivo font-semibold text-[26px] flex-shrink-0">
              {initialsOf(pessoa.nome)}
            </div>
          )}

          {editando ? (
            <input
              value={nome}
              onChange={e => setNome(e.target.value)}
              autoFocus
              className="w-full text-center font-archivo font-semibold text-[17px] text-ink bg-bg-app border border-border rounded-[9px] px-[10px] py-[6px] outline-none focus:border-border-hover transition-colors"
            />
          ) : (
            <div className="text-center">
              <div className="font-archivo font-semibold text-[18px] leading-[1.2] text-ink">{pessoa.nome}</div>
              <div className="font-hanken text-[13px] text-text-faint mt-[3px]">{departamento}</div>
            </div>
          )}

          {podeEditar && !editando && (
            <button
              onClick={iniciarEdicao}
              title="Editar (perfil MASTER)"
              className="absolute top-[14px] left-[14px] w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
            >
              <Pencil size={15} strokeWidth={1.8} />
            </button>
          )}
          <button
            onClick={onClose}
            className="absolute top-[14px] right-[14px] w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {editando ? (
          <div className="px-[20px] pt-[16px] pb-[20px] flex flex-col gap-[12px]">
            <div>
              <label className="block font-archivo font-semibold text-[10.5px] tracking-[0.08em] uppercase text-label mb-[6px]">Ramal</label>
              <input
                value={ramal}
                onChange={e => setRamal(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[10px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              />
            </div>
            <div>
              <label className="block font-archivo font-semibold text-[10.5px] tracking-[0.08em] uppercase text-label mb-[6px]">E-mail</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nome@exto.com.br"
                className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[10px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              />
            </div>
            <div>
              <label className="block font-archivo font-semibold text-[10.5px] tracking-[0.08em] uppercase text-label mb-[6px]">Celular</label>
              <input
                value={celular}
                onChange={e => setCelular(e.target.value)}
                placeholder="(11) 90000-0000"
                className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[10px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              />
            </div>
            <div>
              <label className="block font-archivo font-semibold text-[10.5px] tracking-[0.08em] uppercase text-label mb-[6px]">Departamento</label>
              <select
                value={depto}
                onChange={e => setDepto(e.target.value)}
                className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[10px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              >
                {departamentosAtuais.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="flex gap-[8px] mt-[4px]">
              <button
                onClick={() => setEditando(false)}
                className="flex-1 font-hanken font-medium text-[13px] text-text-muted border border-border rounded-[10px] px-[14px] py-[10px] bg-surface cursor-pointer hover:border-border-hover transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="flex-1 inline-flex items-center justify-center gap-[6px] bg-accent text-white border-none rounded-[10px] px-[14px] py-[10px] font-hanken font-semibold text-[13px] cursor-pointer hover:brightness-95 transition-[filter] duration-150"
              >
                Salvar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <DetailRow icon={Mail} label="E-mail" value={pessoa.email ?? ''} />
            <DetailRow icon={Phone} label="Ramal" value={pessoa.ramal} />
            <DetailRow icon={Smartphone} label="Celular" value={pessoa.celular ?? ''} />
          </div>
        )}
      </div>
    </div>
  )
}

function AdicionarColaboradorModal({ departamentos, onClose, onAdd }: {
  departamentos: string[]
  onClose: () => void
  onAdd: (nome: string, ramal: string, departamento: string, email: string, foto: string) => void
}) {
  const [nome, setNome] = useState('')
  const [ramal, setRamal] = useState('')
  const [email, setEmail] = useState('')
  const [foto, setFoto] = useState('')
  const [departamento, setDepartamento] = useState(departamentos[0] ?? '')

  const podeSalvar = nome.trim().length > 0 && ramal.trim().length > 0 && departamento.length > 0

  const escolherFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setFoto(await lerFotoComoDataUrl(file))
  }

  const salvar = () => {
    if (!podeSalvar) return
    onAdd(nome.trim(), ramal.trim(), departamento, email.trim(), foto)
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
          <span className="flex-1 font-archivo font-semibold text-[15px] text-ink">Adicionar Colaborador</span>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center cursor-pointer text-text-faint hover:bg-tile-bg hover:text-ink border-none bg-transparent transition-colors duration-150"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        <div className="px-[20px] pb-[20px] pt-[16px] flex flex-col gap-[12px]">
          <div className="flex justify-center mb-[4px]">
            <label title="Adicionar foto" className="relative w-[64px] h-[64px] rounded-full flex-shrink-0 cursor-pointer group/foto">
              {foto ? (
                <img src={foto} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full rounded-full bg-tile-bg border border-dashed border-border flex items-center justify-center">
                  <Plus size={20} strokeWidth={1.8} className="text-icon-default" />
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-[rgba(22,20,18,0.45)] opacity-0 group-hover/foto:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                <Pencil size={15} strokeWidth={2} className="text-white" />
              </div>
              <input type="file" accept="image/*" onChange={escolherFoto} className="hidden" />
            </label>
          </div>
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
            <label className="block font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label mb-[6px]">E-mail</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-bg-app border border-border rounded-[10px] px-[14px] py-[11px] font-hanken text-[14px] text-ink outline-none focus:border-border-hover transition-colors"
              placeholder="nome@exto.com.br"
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

interface DeptoControles {
  colIdx: number
}

interface PessoaArrastada {
  tipo: 'pessoa'
  id: string
  origem: string
}

interface DeptoArrastado {
  tipo: 'depto'
  departamento: string
}

function lerItemArrastado(e: React.DragEvent): PessoaArrastada | DeptoArrastado | null {
  try {
    const raw = e.dataTransfer.getData('text/plain')
    if (!raw) return null
    return JSON.parse(raw) as PessoaArrastada | DeptoArrastado
  } catch {
    return null
  }
}

function AvatarPessoa({ pessoa, size, textSize }: { pessoa: Pessoa; size: number; textSize: number }) {
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
  departamento, pessoasVisiveis, onSelect, onSoltarPessoa, onSoltarDepto, deptoControles, isMaster,
}: {
  departamento: string
  pessoasVisiveis: Pessoa[]
  onSelect: (id: string, departamento: string) => void
  onSoltarPessoa: (arrastada: PessoaArrastada, destino: string, antesDeId: string | null) => void
  onSoltarDepto: (departamento: string, colDestino: number, antesDe: string | null) => void
  deptoControles?: DeptoControles
  // Arrastar (pessoa ou departamento) é exclusivo do perfil MASTER — mesmo
  // gate de podeEditar/isMaster usado no resto da tela (ver ContatoModal).
  isMaster: boolean
}) {
  return (
    <div
      className="group/depto bg-surface border border-border border-l-4 border-l-accent rounded-[14px] overflow-hidden"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault()
        if (!isMaster) return
        const item = lerItemArrastado(e)
        if (item?.tipo === 'depto') {
          e.stopPropagation()
          if (deptoControles && item.departamento !== departamento) {
            onSoltarDepto(item.departamento, deptoControles.colIdx, departamento)
          }
        }
      }}
    >
      <div
        draggable={isMaster && !!deptoControles}
        onDragStart={e => {
          if (!isMaster || !deptoControles) return
          e.dataTransfer.effectAllowed = 'move'
          e.dataTransfer.setData('text/plain', JSON.stringify({ tipo: 'depto', departamento }))
        }}
        className={`flex items-center gap-[8px] px-[16px] py-[11px] border-b border-border bg-tile-bg ${isMaster && deptoControles ? 'cursor-grab active:cursor-grabbing' : ''}`}
      >
        <Building2 size={14} strokeWidth={1.9} className="text-accent flex-shrink-0" />
        <h4 className="m-0 flex-1 min-w-0 font-archivo font-semibold text-[12px] tracking-[0.04em] uppercase text-ink truncate">
          {departamento}
        </h4>
      </div>
      <div
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          if (!isMaster) return
          const item = lerItemArrastado(e)
          if (item?.tipo === 'pessoa') onSoltarPessoa(item, departamento, null)
        }}
      >
        {pessoasVisiveis.map(pessoa => (
          <div
            key={pessoa.id}
            draggable={isMaster}
            onDragStart={e => {
              if (!isMaster) return
              e.dataTransfer.effectAllowed = 'move'
              e.dataTransfer.setData('text/plain', JSON.stringify({ tipo: 'pessoa', id: pessoa.id, origem: departamento }))
            }}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              if (!isMaster) return
              const item = lerItemArrastado(e)
              if (item?.tipo === 'pessoa') {
                e.stopPropagation()
                if (item.id !== pessoa.id) onSoltarPessoa(item, departamento, pessoa.id)
              }
            }}
            className={`group/pessoa flex items-center gap-[8px] px-[16px] py-[10px] border-b border-border last:border-b-0 hover:bg-tile-bg transition-colors duration-150 ${isMaster ? 'cursor-grab active:cursor-grabbing' : ''}`}
          >
            {isMaster && (
              <GripVertical size={13} strokeWidth={2} className="flex-shrink-0 text-text-faint opacity-0 group-hover/pessoa:opacity-100 transition-opacity duration-150" />
            )}
            <button
              onClick={() => onSelect(pessoa.id, departamento)}
              className="flex-1 min-w-0 flex items-center gap-[10px] border-none bg-transparent cursor-pointer text-left p-0"
            >
              <AvatarPessoa pessoa={pessoa} size={28} textSize={10.5} />
              <span className="flex-1 min-w-0 font-hanken font-medium text-[13px] text-ink truncate">{pessoa.nome}</span>
            </button>
            <span className="flex-shrink-0 font-hanken font-semibold text-[12.5px] text-ink tabular-nums">{pessoa.ramal}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RamaisPage({ onBack, isMaster }: Props) {
  const [query, setQuery] = useState('')
  const [selectedRef, setSelectedRef] = useState<{ id: string; departamento: string } | null>(null)
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
  const buscando = q.length > 0

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

  const selectedPessoa = selectedRef ? dados.pessoas[selectedRef.id] : null

  // Solta um departamento arrastado numa coluna (a que já estava ou outra) —
  // entra antes de `antesDe` (soltou em cima de outro card) ou no fim da
  // coluna (soltou no espaço vazio).
  const moverDeptoParaPosicao = (departamento: string, colDestino: number, antesDe: string | null) => {
    setLayout(prev => {
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

  // Solta uma pessoa arrastada numa nova posição: reordena dentro do mesmo
  // departamento, ou muda de departamento — em ambos os casos, entra antes de
  // `antesDeId` (soltou em cima de alguém) ou no fim da lista (soltou no
  // espaço vazio do card).
  const moverPessoaParaPosicao = (arrastada: PessoaArrastada, destino: string, antesDeId: string | null) => {
    const { id, origem } = arrastada
    setDados(prev => {
      const origemSemId = (prev.porDepto[origem] ?? []).filter(x => x !== id)
      const baseDestino = origem === destino ? origemSemId : (prev.porDepto[destino] ?? [])
      const idxAlvo = antesDeId ? baseDestino.indexOf(antesDeId) : -1
      const destinoComId = idxAlvo === -1
        ? [...baseDestino, id]
        : [...baseDestino.slice(0, idxAlvo), id, ...baseDestino.slice(idxAlvo)]

      if (origem === destino) {
        return { ...prev, porDepto: { ...prev.porDepto, [destino]: destinoComId } }
      }
      return { ...prev, porDepto: { ...prev.porDepto, [origem]: origemSemId, [destino]: destinoComId } }
    })
  }

  const adicionarPessoa = (nome: string, ramal: string, departamento: string, email: string, foto: string) => {
    const id = `novo-${Date.now()}-${Math.round(Math.random() * 1e6)}`
    setDados(prev => ({
      pessoas: { ...prev.pessoas, [id]: { id, nome, ramal, email: email || undefined, foto: foto || undefined } },
      porDepto: { ...prev.porDepto, [departamento]: [...(prev.porDepto[departamento] ?? []), id] },
    }))
  }

  // Só perfil MASTER pode editar (ver ContatoModal/podeEditar) — colaboradores
  // comuns só visualizam. Reaproveita o mesmo `isMaster` do botão Painel
  // Administrativo/Sidebar (ver App.tsx). O departamento (agora editável
  // dentro do próprio popup) é tratado à parte, já que não é um campo em
  // `pessoas` — é implícito via `porDepto`.
  const editarPessoa = (id: string, origem: string, patch: SalvarPessoaPatch) => {
    if (!isMaster) return
    const { departamento: destino, ...dadosPessoa } = patch
    setDados(prev => {
      const pessoas = { ...prev.pessoas, [id]: { ...prev.pessoas[id], ...dadosPessoa } }
      if (destino === origem) return { ...prev, pessoas }
      return {
        pessoas,
        porDepto: {
          ...prev.porDepto,
          [origem]: (prev.porDepto[origem] ?? []).filter(x => x !== id),
          [destino]: [...(prev.porDepto[destino] ?? []), id],
        },
      }
    })
    setSelectedRef(prev => (prev && prev.id === id ? { id, departamento: destino } : prev))
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
          {isMaster && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex-shrink-0 inline-flex items-center gap-[6px] font-hanken font-semibold text-[13px] text-white bg-accent border-none rounded-[10px] px-[14px] py-[10px] cursor-pointer hover:brightness-95 transition-[filter] duration-150"
            >
              <Plus size={15} strokeWidth={2.2} />
              Adicionar Colaborador
            </button>
          )}
        </div>
      </div>

      {/* Departamentos — organização controlada pelo usuário; durante uma busca,
          vira uma grade centralizada com só quem deu match (evita ficar
          deslocado pra esquerda quando sobra coluna vazia). */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-[24px] py-[20px]" style={{ scrollbarWidth: 'none' }}>
        <div className="max-w-[1000px] mx-auto">
          {!temResultado ? (
            <div className="flex flex-col items-center justify-center gap-[12px] py-[80px] text-center text-text-faint">
              <Phone size={44} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">Nenhum ramal encontrado</span>
            </div>
          ) : buscando ? (
            <div className="flex flex-wrap justify-center gap-[16px]">
              {layout.flat().map(departamento => {
                const pessoasVisiveis = pessoasFiltradasPorDepto[departamento] ?? []
                if (pessoasVisiveis.length === 0) return null
                return (
                  <div key={departamento} className="w-[300px] flex-shrink-0">
                    <DepartamentoCard
                      departamento={departamento}
                      pessoasVisiveis={pessoasVisiveis}
                      onSelect={(id, departamento) => setSelectedRef({ id, departamento })}
                      onSoltarPessoa={moverPessoaParaPosicao}
                      onSoltarDepto={() => {}}
                      isMaster={isMaster}
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
                    if (!isMaster) return
                    const item = lerItemArrastado(e)
                    if (item?.tipo === 'depto') moverDeptoParaPosicao(item.departamento, colIdx, null)
                  }}
                >
                  {col.map(departamento => {
                    const pessoasVisiveis = pessoasFiltradasPorDepto[departamento] ?? []
                    if (pessoasVisiveis.length === 0) return null
                    return (
                      <DepartamentoCard
                        key={departamento}
                        departamento={departamento}
                        pessoasVisiveis={pessoasVisiveis}
                        onSelect={(id, departamento) => setSelectedRef({ id, departamento })}
                        onSoltarPessoa={moverPessoaParaPosicao}
                        onSoltarDepto={moverDeptoParaPosicao}
                        deptoControles={{ colIdx }}
                        isMaster={isMaster}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedRef && selectedPessoa && (
        <ContatoModal
          pessoa={selectedPessoa}
          departamento={selectedRef.departamento}
          departamentosAtuais={departamentosAtuais}
          podeEditar={isMaster}
          onClose={() => setSelectedRef(null)}
          onSave={(patch) => editarPessoa(selectedRef.id, selectedRef.departamento, patch)}
        />
      )}
      {showAdd && isMaster && (
        <AdicionarColaboradorModal
          departamentos={departamentosAtuais}
          onClose={() => setShowAdd(false)}
          onAdd={adicionarPessoa}
        />
      )}
    </div>
  )
}
