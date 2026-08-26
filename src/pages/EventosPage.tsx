// Tela de Eventos do HUB — mesmo esqueleto da biblioteca de Comunicados
// (DocumentLibrary): topo com Voltar/título/ação, lista lateral de mini
// cards com filtro, painel de detalhe à direita. Visualizar (qualquer um com
// o app) vê e confirma presença; Gerenciar cadastra, edita e exclui.
import {
  ArrowLeft, ArrowRight, Calendar, CalendarDays, Check, ChevronDown, Loader2,
  MapPin, Pencil, Plus, Trash2, Upload, X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Evento } from '../types'
import type { AuthUser } from '../services/auth'
import {
  createEvento, deleteEvento, fetchEventos, setRsvp, updateEvento,
  type EventoInput,
} from '../services/eventos'
import { formatarInicio } from '../utils/eventoData'

const PAGE_SIZE = 10

interface Props {
  initialId?: number
  onBack: () => void
  user: AuthUser
  /** Reflete confirmação/edição de volta no banner da home (estado do Hub). */
  onEventosChange?: (list: Evento[]) => void
}

export function EventosPage({ initialId, onBack, user, onEventosChange }: Props) {
  const canManage = user.apps['eventos']?.includes('manage') ?? false

  const [eventos, setEventos] = useState<Evento[] | null>(null)
  const [selectedId, setSelectedId] = useState<number | undefined>(initialId)
  const [searchText, setSearchText] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [modal, setModal] = useState<'novo' | Evento | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  useEffect(() => {
    fetchEventos().then(list => setEventos(list ?? []))
  }, [])

  const atualizar = (updater: (prev: Evento[]) => Evento[]) => {
    setEventos(prev => {
      const next = updater(prev ?? [])
      onEventosChange?.(next)
      return next
    })
  }

  const selected = (eventos ?? []).find(e => e.id === selectedId) ?? (eventos ?? [])[0]

  const filtered = useMemo(() => {
    const q = searchText.trim().toLowerCase()
    return (eventos ?? []).filter(e =>
      !q || e.title.toLowerCase().includes(q) || e.tipo.toLowerCase().includes(q))
  }, [eventos, searchText])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = filtered.length > visibleCount

  const handleRsvp = async (ev: Evento) => {
    const confirmar = !ev.confirmado
    // Otimista — reverte se a API recusar (mesmo padrão dos favoritos).
    atualizar(prev => prev.map(e => e.id === ev.id ? { ...e, confirmado: confirmar } : e))
    const updated = await setRsvp(ev.id, confirmar)
    if (updated) atualizar(prev => prev.map(e => e.id === updated.id ? updated : e))
    else atualizar(prev => prev.map(e => e.id === ev.id ? { ...e, confirmado: ev.confirmado } : e))
  }

  const handleSubmit = async (input: EventoInput) => {
    setSaving(true)
    setSaveError(null)
    const result = modal === 'novo'
      ? await createEvento(input)
      : modal ? await updateEvento(modal.id, input) : null
    setSaving(false)
    if (!result) {
      setSaveError('Não foi possível salvar o evento. Tente novamente.')
      return
    }
    atualizar(prev => modal === 'novo'
      ? [result, ...prev]
      : prev.map(e => e.id === result.id ? result : e))
    setSelectedId(result.id)
    setModal(null)
  }

  const handleDelete = async () => {
    if (!selected) return
    if (!window.confirm(`Excluir "${selected.title}"? Esta ação não pode ser desfeita.`)) return
    setDeleting(true)
    setActionError(null)
    const ok = await deleteEvento(selected.id)
    setDeleting(false)
    if (!ok) {
      setActionError('Não foi possível excluir. Verifique sua permissão.')
      return
    }
    atualizar(prev => prev.filter(e => e.id !== selected.id))
    setSelectedId(undefined)
  }

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
        <span className="font-archivo font-semibold text-[20px] text-ink">Eventos</span>

        {canManage && (
          <div className="ml-auto flex items-center gap-[10px]">
            {actionError && (
              <span className="font-hanken text-[12px] text-red-600">{actionError}</span>
            )}
            <button
              onClick={() => { setSaveError(null); setModal('novo') }}
              className="
                inline-flex items-center gap-[6px] px-[14px] py-[8px] rounded-[9px]
                border-none bg-accent text-white cursor-pointer
                font-hanken font-medium text-[13px]
                hover:brightness-95 transition-[filter] duration-150
              "
            >
              <Plus size={15} strokeWidth={2.2} />
              Novo evento
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Lista lateral de mini cards */}
        <aside className="flex flex-col flex-shrink-0 border-r border-border" style={{ width: '280px' }}>
          <div className="px-[16px] pt-[14px] pb-[12px] border-b border-border flex-shrink-0">
            <div className="flex items-center justify-between mb-[8px]">
              <span className="font-archivo font-semibold text-[11px] tracking-[0.08em] uppercase text-label">
                Filtro
              </span>
              {searchText && (
                <button
                  onClick={() => { setSearchText(''); setVisibleCount(PAGE_SIZE) }}
                  className="inline-flex items-center gap-[3px] border-none bg-transparent cursor-pointer font-hanken text-[11px] text-accent p-0"
                >
                  <X size={11} strokeWidth={2} />
                  Limpar
                </button>
              )}
            </div>
            <input
              type="text"
              placeholder="Buscar por título ou tipo"
              value={searchText}
              onChange={e => { setSearchText(e.target.value); setVisibleCount(PAGE_SIZE) }}
              className="w-full border border-border rounded-[8px] px-[10px] py-[7px] font-hanken text-[12px] text-ink bg-bg-app outline-none focus:border-accent"
            />
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
            {eventos === null && (
              <div className="px-[16px] py-[24px] text-center font-hanken text-[13px] text-text-faint">
                Carregando...
              </div>
            )}
            {eventos !== null && visible.length === 0 && (
              <div className="px-[16px] py-[24px] text-center font-hanken text-[13px] text-text-faint">
                Nenhum evento cadastrado.
              </div>
            )}
            {visible.map(ev => (
              <button
                key={ev.id}
                onClick={() => setSelectedId(ev.id)}
                className={`
                  w-full text-left px-[16px] py-[14px] border-none cursor-pointer transition-colors duration-150
                  flex items-start gap-[12px] border-b border-border
                  ${selected?.id === ev.id ? 'bg-[rgba(179,28,28,0.06)]' : 'bg-transparent hover:bg-tile-bg'}
                `}
              >
                {/* Thumb da capa (ou bloco da marca) — mini card */}
                <div className="flex-shrink-0 w-[52px] h-[40px] rounded-[8px] overflow-hidden mt-[1px]">
                  {ev.coverUrl ? (
                    <img src={ev.coverUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/85" style={{ background: 'linear-gradient(135deg, #B31C1C, #7d1414)' }}>
                      <CalendarDays size={16} strokeWidth={1.6} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-archivo font-semibold text-[10.5px] tracking-[0.04em] uppercase mb-[2px]"
                    style={{ color: selected?.id === ev.id ? '#B31C1C' : 'var(--color-ink)' }}
                  >
                    {ev.tipo}
                  </div>
                  <div
                    className="font-hanken font-medium text-[13px] leading-[1.35] mb-[4px] line-clamp-2"
                    style={{ color: selected?.id === ev.id ? '#B31C1C' : 'var(--color-ink)' }}
                  >
                    {ev.title}
                  </div>
                  <div className="inline-flex items-center gap-[4px] font-hanken text-[11px] text-text-faint">
                    <Calendar size={10} strokeWidth={1.8} />
                    {formatarInicio(ev.inicioISO)}
                  </div>
                </div>
                {selected?.id === ev.id && (
                  <div className="flex-shrink-0 w-[3px] self-stretch rounded-full bg-accent -mr-[16px]" />
                )}
              </button>
            ))}

            {hasMore && (
              <button
                onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                className="w-full flex items-center justify-center gap-[6px] px-[16px] py-[13px] border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-accent hover:bg-tile-bg transition-colors duration-150"
              >
                <ChevronDown size={15} strokeWidth={2} />
                Ver mais {Math.min(PAGE_SIZE, filtered.length - visibleCount)}
              </button>
            )}
          </div>
        </aside>

        {/* Detalhe do evento */}
        <div className="flex-1 relative overflow-y-auto bg-[#F5F3F0]">
          {selected ? (
            <div className="max-w-[720px] mx-auto px-[32px] py-[28px]">
              <div className="bg-surface border border-border rounded-[16px] overflow-hidden">
                {selected.coverUrl && (
                  <img src={selected.coverUrl} alt="" className="w-full h-[260px] object-cover" />
                )}
                <div className="px-[28px] py-[24px]">
                  <div className="flex items-center gap-[12px] mb-[12px] flex-wrap">
                    <span className="font-archivo font-semibold text-[10.5px] leading-none tracking-[0.12em] uppercase text-accent bg-[rgba(179,28,28,0.10)] px-[10px] py-[5px] rounded-[20px]">
                      {selected.tipo}
                    </span>
                    <span className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12.5px] text-text-faint">
                      <Calendar size={14} strokeWidth={1.7} />
                      {formatarInicio(selected.inicioISO)}
                    </span>
                    {selected.local && (
                      <span className="inline-flex items-center gap-[6px] font-hanken font-medium text-[12.5px] text-text-faint">
                        <MapPin size={14} strokeWidth={1.7} />
                        {selected.local}
                      </span>
                    )}
                  </div>
                  <h2 className="m-0 font-archivo font-semibold text-[22px] leading-[1.25] text-ink">
                    {selected.title}
                  </h2>
                  {selected.desc && (
                    <p className="mt-[12px] mb-0 font-hanken text-[14px] leading-[1.6] text-ink-soft whitespace-pre-line">
                      {selected.desc}
                    </p>
                  )}

                  {selected.rsvpEnabled && (
                    <button
                      onClick={() => handleRsvp(selected)}
                      className={`
                        mt-[20px] inline-flex items-center gap-[9px]
                        rounded-[11px] px-[20px] py-[12px]
                        font-hanken font-semibold text-[14px] cursor-pointer
                        transition-all duration-150 ease-out
                        ${selected.confirmado
                          ? 'bg-surface text-ink border border-border-2 hover:border-border-hover'
                          : 'bg-accent text-white border-none hover:brightness-[0.93] hover:-translate-y-[1px]'}
                      `}
                    >
                      {selected.confirmado
                        ? <><Check size={17} strokeWidth={2} /> Presença confirmada</>
                        : <>Confirmar presença<ArrowRight size={17} strokeWidth={1.7} /></>}
                    </button>
                  )}
                </div>
              </div>

              {canManage && (
                <div className="absolute top-[16px] right-[16px] flex items-center gap-[8px]">
                  <button
                    onClick={() => { setSaveError(null); setModal(selected) }}
                    title="Editar evento"
                    className="
                      w-[38px] h-[38px] rounded-[10px]
                      bg-accent border border-accent shadow-card-hover
                      flex items-center justify-center cursor-pointer text-white
                      hover:brightness-[0.93] hover:-translate-y-[1px]
                      transition-all duration-150
                    "
                  >
                    <Pencil size={17} strokeWidth={1.8} />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    title="Excluir evento"
                    className="
                      w-[38px] h-[38px] rounded-[10px]
                      bg-accent border border-accent shadow-card-hover
                      flex items-center justify-center text-white cursor-pointer
                      hover:brightness-[0.93] hover:-translate-y-[1px]
                      disabled:opacity-60 disabled:cursor-default disabled:hover:translate-y-0
                      transition-all duration-150
                    "
                  >
                    {deleting ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} strokeWidth={1.8} />}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-[12px] text-text-faint">
              <CalendarDays size={48} strokeWidth={1.2} />
              <span className="font-hanken text-[14px]">
                {eventos === null ? 'Carregando...' : 'Nenhum evento cadastrado'}
              </span>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <EventoModal
          evento={modal === 'novo' ? null : modal}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
          submitting={saving}
          error={saveError}
        />
      )}
    </div>
  )
}

interface EventoModalProps {
  /** null = novo evento; preenchido = edição. */
  evento: Evento | null
  onClose: () => void
  onSubmit: (input: EventoInput) => Promise<void>
  submitting: boolean
  error: string | null
}

/** "2026-08-29T18:30:00-03:00" -> "2026-08-29T18:30" (input datetime-local). */
function toLocalInput(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function EventoModal({ evento, onClose, onSubmit, submitting, error }: EventoModalProps) {
  const [tipo, setTipo] = useState(evento?.tipo ?? '')
  const [titulo, setTitulo] = useState(evento?.title ?? '')
  const [descricao, setDescricao] = useState(evento?.desc ?? '')
  const [inicio, setInicio] = useState(evento ? toLocalInput(evento.inicioISO) : '')
  const [local, setLocal] = useState(evento?.local ?? '')
  const [rsvpEnabled, setRsvpEnabled] = useState(evento?.rsvpEnabled ?? true)
  const [capa, setCapa] = useState<File | null>(null)
  const [capaPreview, setCapaPreview] = useState<string | null>(evento?.coverUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const podeEnviar = tipo.trim() !== '' && titulo.trim() !== '' && inicio !== '' && !submitting

  const handleCapa = (file: File | null) => {
    setCapa(file)
    if (file) setCapaPreview(URL.createObjectURL(file))
  }

  const handleSubmit = () => {
    if (!podeEnviar) return
    onSubmit({
      tipo: tipo.trim(), titulo: titulo.trim(), descricao: descricao.trim(),
      inicioISO: inicio, local: local.trim(), rsvpEnabled, capa,
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[16px]"
      onClick={onClose}
    >
      <div
        className="bg-surface rounded-[16px] w-full max-w-[480px] shadow-card-hover max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-border">
          <span className="font-archivo font-semibold text-[16px] text-ink">
            {evento ? 'Editar evento' : 'Novo evento'}
          </span>
          <button
            onClick={onClose}
            className="border-none bg-transparent cursor-pointer text-text-muted hover:text-ink p-0 flex items-center"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="px-[24px] py-[20px] flex flex-col gap-[14px]">
          <div className="flex gap-[12px]">
            <label className="flex-1 flex flex-col gap-[6px]">
              <span className="font-archivo font-semibold text-[11px] tracking-[0.06em] uppercase text-label">
                Tipo
              </span>
              <input
                type="text"
                value={tipo}
                onChange={e => setTipo(e.target.value)}
                placeholder="Ex.: Confraternização"
                className="border border-border rounded-[9px] px-[12px] py-[9px] font-hanken text-[13px] text-ink outline-none focus:border-accent"
              />
            </label>
            <label className="flex-1 flex flex-col gap-[6px]">
              <span className="font-archivo font-semibold text-[11px] tracking-[0.06em] uppercase text-label">
                Data e hora
              </span>
              <input
                type="datetime-local"
                value={inicio}
                onChange={e => setInicio(e.target.value)}
                className="border border-border rounded-[9px] px-[12px] py-[9px] font-hanken text-[13px] text-ink outline-none focus:border-accent"
              />
            </label>
          </div>

          <label className="flex flex-col gap-[6px]">
            <span className="font-archivo font-semibold text-[11px] tracking-[0.06em] uppercase text-label">
              Título
            </span>
            <input
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Título do evento"
              className="border border-border rounded-[9px] px-[12px] py-[9px] font-hanken text-[13px] text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-[6px]">
            <span className="font-archivo font-semibold text-[11px] tracking-[0.06em] uppercase text-label">
              Local
            </span>
            <input
              type="text"
              value={local}
              onChange={e => setLocal(e.target.value)}
              placeholder="Ex.: Espaço da matriz"
              className="border border-border rounded-[9px] px-[12px] py-[9px] font-hanken text-[13px] text-ink outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-[6px]">
            <span className="font-archivo font-semibold text-[11px] tracking-[0.06em] uppercase text-label">
              Descrição
            </span>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              placeholder="Detalhes do evento (opcional)"
              className="border border-border rounded-[9px] px-[12px] py-[9px] font-hanken text-[13px] text-ink outline-none focus:border-accent resize-y"
            />
          </label>

          <label className="flex flex-col gap-[6px]">
            <span className="font-archivo font-semibold text-[11px] tracking-[0.06em] uppercase text-label">
              Foto de capa
            </span>
            {capaPreview && (
              <img src={capaPreview} alt="" className="w-full h-[140px] object-cover rounded-[9px]" />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="
                border border-dashed border-border rounded-[9px] px-[12px] py-[14px]
                flex items-center gap-[10px] cursor-pointer bg-bg-app
                hover:border-accent transition-colors duration-150
              "
            >
              <Upload size={16} strokeWidth={1.8} className="text-text-muted flex-shrink-0" />
              <span className="font-hanken text-[13px] text-text-muted truncate">
                {capa ? capa.name : capaPreview ? 'Trocar imagem (PNG, JPG ou WEBP)' : 'Selecionar imagem (PNG, JPG ou WEBP, até 2MB)'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={e => handleCapa(e.target.files?.[0] ?? null)}
            />
          </label>

          <label className="flex items-center gap-[10px] cursor-pointer">
            <input
              type="checkbox"
              checked={rsvpEnabled}
              onChange={e => setRsvpEnabled(e.target.checked)}
              className="w-[16px] h-[16px] accent-[#B31C1C] cursor-pointer"
            />
            <span className="font-hanken text-[13px] text-ink">
              Permitir confirmação de presença (RSVP)
            </span>
          </label>

          {error && (
            <span className="font-hanken text-[12px] text-red-600">{error}</span>
          )}
        </div>

        <div className="flex items-center justify-end gap-[10px] px-[24px] py-[16px] border-t border-border">
          <button
            onClick={onClose}
            className="border-none bg-transparent cursor-pointer font-hanken font-medium text-[13px] text-text-muted px-[14px] py-[9px]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!podeEnviar}
            className="
              inline-flex items-center gap-[6px] border-none rounded-[9px] px-[16px] py-[9px]
              bg-accent text-white font-hanken font-semibold text-[13px] cursor-pointer
              disabled:opacity-50 disabled:cursor-default hover:brightness-95 transition-[filter] duration-150
            "
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : null}
            {submitting ? 'Salvando...' : evento ? 'Salvar alterações' : 'Publicar evento'}
          </button>
        </div>
      </div>
    </div>
  )
}
