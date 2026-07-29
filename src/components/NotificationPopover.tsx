import { useEffect, useRef, useState } from 'react'
import { Bell, CheckCheck, X } from 'lucide-react'

export interface NotificationItem {
  id: number
  title: string
  time: string
  color: string
}

const MAX_VISIVEIS = 5

interface Props {
  notifications: NotificationItem[]
  lidos: number[]
  onMarcarTodasLidas: () => void
  onRemover: (id: number) => void
  onClose: () => void
}

function NotificationRow({ n, unread, onRemover }: { n: NotificationItem; unread: boolean; onRemover: (id: number) => void }) {
  return (
    <div className="group flex items-start gap-[12px] px-[18px] py-[12px] cursor-pointer hover:bg-[#F9F8F6] transition-colors duration-150">
      <div className="flex-shrink-0 mt-[3px]">
        <div
          className="w-[8px] h-[8px] rounded-full mt-[1px]"
          style={{ background: unread ? n.color : 'transparent', border: unread ? 'none' : '1.5px solid #D6D1C9' }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-hanken text-[13px] leading-[1.35] ${unread ? 'font-medium text-ink' : 'font-normal text-text-muted'}`}>
          {n.title}
        </div>
        <div className="font-hanken text-[11px] text-text-faint mt-[4px]">
          {n.time}
        </div>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onRemover(n.id) }}
        title="Remover notificação"
        className="flex-shrink-0 inline-flex items-center justify-center w-[22px] h-[22px] rounded-[6px] border-none bg-transparent cursor-pointer text-text-faint opacity-0 group-hover:opacity-100 hover:text-accent hover:bg-tile-bg transition-all duration-150"
      >
        <X size={13} strokeWidth={2} />
      </button>
    </div>
  )
}

function TodasNotificacoesModal({ notifications, lidos, onRemover, onClose }: {
  notifications: NotificationItem[]
  lidos: number[]
  onRemover: (id: number) => void
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
            <NotificationRow key={n.id} n={n} unread={!lidos.includes(n.id)} onRemover={onRemover} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function NotificationPopover({ notifications, lidos, onMarcarTodasLidas, onRemover, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    setTimeout(() => document.addEventListener('mousedown', handler), 0)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const unreadCount = notifications.filter(n => !lidos.includes(n.id)).length
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
            <span className="font-hanken font-semibold text-[11px] text-accent bg-[rgba(174,58,35,0.10)] px-[7px] py-[2px] rounded-full">
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
          <NotificationRow key={n.id} n={n} unread={!lidos.includes(n.id)} onRemover={onRemover} />
        ))}
      </div>

      {/* Footer */}
      {temMais && (
        <div className="border-t border-border px-[18px] py-[12px]">
          <button
            onClick={() => setShowAll(true)}
            className="w-full text-center font-hanken font-medium text-[13px] text-accent hover:text-[#8a2e1b] transition-colors duration-150 border-none bg-transparent cursor-pointer"
          >
            Ver todas as notificações
          </button>
        </div>
      )}

      {showAll && (
        <TodasNotificacoesModal
          notifications={notifications}
          lidos={lidos}
          onRemover={onRemover}
          onClose={() => setShowAll(false)}
        />
      )}
    </div>
  )
}
