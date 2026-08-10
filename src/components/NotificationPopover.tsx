import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, Package, Mail, FileText, DoorOpen, CalendarClock, Bike, X } from 'lucide-react'
import type { Notificacao } from '../services/notificacoes'

const MAX_VISIVEIS = 5

// Prefixo antes do ponto no `tipo` indicaria a origem (hoje só "recepcao.");
// mapeamos pelo tipo completo pra um ícone mais específico e caímos no
// genérico (Bell) pra qualquer tipo que ainda não conhecemos.
const ICON_BY_TIPO: Record<string, React.ElementType> = {
  'recepcao.encomenda_recebida': Package,
  'recepcao.correspondencia_recebida': Mail,
  'recepcao.documento_recebido': FileText,
  'recepcao.reserva_sala': DoorOpen,
  'recepcao.reserva_espaco': CalendarClock,
  'recepcao.motoboy_solicitado': Bike,
}

function formatRelativo(iso: string): string {
  const diffMin = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diffMin < 1) return 'agora'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH}h`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `há ${diffD}d`
  return new Date(iso).toLocaleDateString('pt-BR')
}

interface Props {
  notifications: Notificacao[]
  onMarcarTodasLidas: () => void
  onSelect: (n: Notificacao) => void
  onClose: () => void
}

function NotificationRow({ n, onSelect }: { n: Notificacao; onSelect: (n: Notificacao) => void }) {
  const unread = n.lida_em === null
  const Icon = ICON_BY_TIPO[n.tipo] ?? Bell
  return (
    <button
      onClick={() => onSelect(n)}
      className="w-full flex items-start gap-[12px] px-[18px] py-[12px] cursor-pointer border-none bg-transparent text-left hover:bg-[#F9F8F6] transition-colors duration-150"
    >
      <div className={`flex-shrink-0 w-[30px] h-[30px] rounded-full flex items-center justify-center ${unread ? 'bg-[rgba(174,58,35,0.10)] text-accent' : 'bg-tile-bg text-text-faint'}`}>
        <Icon size={15} strokeWidth={1.8} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-hanken text-[13px] leading-[1.35] ${unread ? 'font-medium text-ink' : 'font-normal text-text-muted'}`}>
          {n.titulo}
        </div>
        <div className="font-hanken text-[12px] text-text-muted mt-[2px] line-clamp-2">
          {n.mensagem}
        </div>
        <div className="font-hanken text-[11px] text-text-faint mt-[4px]">
          {formatRelativo(n.criado_em)}
        </div>
      </div>
      {unread && <div className="flex-shrink-0 mt-[6px] w-[8px] h-[8px] rounded-full bg-accent" />}
    </button>
  )
}

function TodasNotificacoesModal({ notifications, onSelect, onClose }: {
  notifications: Notificacao[]
  onSelect: (n: Notificacao) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-[16px]" onClick={onClose}>
      <div
        className="bg-surface rounded-[16px] w-full max-w-[440px] max-h-[70vh] flex flex-col shadow-card-hover"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-border flex-shrink-0">
          <span className="font-archivo font-semibold text-[16px] text-ink">Todas as notificações</span>
          <button
            onClick={onClose}
            className="border-none bg-transparent cursor-pointer text-text-muted hover:text-ink p-0 flex items-center"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {notifications.map(n => (
            <NotificationRow key={n.id} n={n} onSelect={onSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function NotificationPopover({ notifications, onMarcarTodasLidas, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const unreadCount = notifications.filter(n => n.lida_em === null).length
  const visiveis = notifications.slice(0, MAX_VISIVEIS)
  const temMais = notifications.length > MAX_VISIVEIS

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+10px)] z-50 animate-ex-float"
      style={{
        width: '340px',
        background: '#fff',
        border: '1px solid #EAE7E2',
        borderRadius: '16px',
        boxShadow: '0 16px 40px -10px rgba(38,37,36,0.18)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-[18px] pt-[16px] pb-[12px] border-b border-border">
        <div className="flex items-center gap-[8px]">
          <span className="font-archivo font-semibold text-[14px] text-ink">Notificações</span>
          {unreadCount > 0 && (
            <span className="font-hanken font-semibold text-[11px] text-accent bg-[rgba(179,28,28,0.10)] px-[7px] py-[2px] rounded-full">
              {unreadCount} novas
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarcarTodasLidas}
            className="inline-flex items-center gap-[5px] font-hanken text-[12px] text-text-muted hover:text-accent transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            <CheckCheck size={13} strokeWidth={2} />
            Marcar todas
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col py-[6px]">
        {visiveis.length === 0 && (
          <div className="flex flex-col items-center gap-[8px] py-[28px] text-text-faint">
            <Bell size={28} strokeWidth={1.4} />
            <span className="font-hanken text-[13px]">Nenhuma notificação</span>
          </div>
        )}
        {visiveis.map(n => (
          <NotificationRow key={n.id} n={n} onSelect={onSelect} />
        ))}
      </div>

      {/* Footer */}
      {temMais && (
        <div className="border-t border-border px-[18px] py-[12px]">
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-center font-hanken font-medium text-[13px] text-accent hover:text-[#8e1616] transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            Ver todas as notificações
          </button>
        </div>
      )}

      {showAll && (
        <TodasNotificacoesModal
          notifications={notifications}
          onSelect={onSelect}
          onClose={() => setShowAll(false)}
        />
      )}
    </div>
  )
}
